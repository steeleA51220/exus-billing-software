
/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - DESKTOP BILLING SOFTWARE
 * Electron Main Process  |  src/main/main.js
 * ============================================================================
 * Shop  : ஸ்ரீ குமரன் ஏஜென்சிஸ் (Sri Kumaran Agencies)
 * Addr  : 69, கடைவீதி, முசிறி (TK), திருச்சி (Dt) - 621211
 * ============================================================================
 */

'use strict';

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs   = require('fs');
const db   = require('./db');

let mainWindow  = null;
let printWindow = null;
let isDev       = true; // set properly inside createWindow(), after app is ready

// ── Global error logger ───────────────────────────────────────────────────────
// Without this, exceptions before the window opens exit silently on Windows.
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception in main process:', err);
  setTimeout(() => process.exit(1), 500);
});

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled promise rejection in main process:', reason);
});

// ── Window factory ────────────────────────────────────────────────────────────
function createWindow() {
  isDev = !app.isPackaged;

  const iconPath  = path.join(__dirname, '../../assets/icons/icon.ico');
  const iconOpts  = fs.existsSync(iconPath) ? { icon: iconPath } : {};

  mainWindow = new BrowserWindow({
    width:    1366,
    height:   860,
    minWidth: 1024,
    minHeight: 700,
    title: 'Nexus Billing Software',
    ...iconOpts,
    show: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          false,
      spellcheck:       false
    }
  });

  mainWindow.setMenuBarVisibility(false);

  const htmlPath = path.join(__dirname, '../renderer/index.html');
  mainWindow.loadFile(htmlPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      // mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Renderer] did-finish-load fired successfully!');
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[Renderer] Process gone:', details.reason, 'code:', details.exitCode);
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('[Renderer] Failed to load:', errorCode, errorDescription);
  });
}

// ── IPC Handlers ─────────────────────────────────────────────────────────────
function registerIpcHandlers() {
  // Standardised response envelope: { success, data } or { success: false, error }
  const handleSafe = (channel, fn) => {
    ipcMain.handle(channel, async (_event, ...args) => {
      try {
        const result = await fn(...args);
        return { success: true, data: result };
      } catch (err) {
        console.error(`[IPC Error] ${channel}:`, err.message);
        return { success: false, error: err.message || 'Internal error' };
      }
    });
  };

  // ── Auth & Settings ────────────────────────────────────────────────────────
  handleSafe('auth:verifyPin', (pin) => db.verifyPin(pin));
  handleSafe('auth:updatePin', ({ oldPin, newPin }) => db.updatePin(oldPin, newPin));
  handleSafe('auth:registerShop', (data) => db.registerShop(data));

  handleSafe('settings:get',    ()         => db.getShopSettings());
  handleSafe('settings:update', (settings) => db.updateShopSettings(settings));

  handleSafe('settings:selectLogo', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'கடை லோகோ தேர்ந்தெடுக்கவும் (Select Shop Logo)',
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }],
      properties: ['openFile']
    });
    if (canceled || !filePaths.length) return null;

    const sourceFile = filePaths[0];
    const ext        = path.extname(sourceFile);
    const targetDir  = path.join(app.getPath('userData'), 'uploads');
    fs.mkdirSync(targetDir, { recursive: true });
    const targetPath = path.join(targetDir, `logo_${Date.now()}${ext}`);
    fs.copyFileSync(sourceFile, targetPath);
    db.updateShopSettings({ logo_path: targetPath });
    return targetPath;
  });

  handleSafe('settings:backup', async () => {
    const today = new Date().toISOString().split('T')[0];
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'தரவுத்தள காப்புப்பிரதி சேமிக்கவும் (Save Database Backup)',
      defaultPath: `SriKumaran_Agri_Backup_${today}.db`,
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }]
    });
    if (canceled || !filePath) return null;
    await db.backupDatabase(filePath);
    return filePath;
  });

  handleSafe('settings:restore', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'காப்புப்பிரதி கோப்பை தேர்ந்தெடுக்கவும் (Select Backup File)',
      filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
      properties: ['openFile']
    });
    if (canceled || !filePaths.length) return false;

    const backupFile   = filePaths[0];
    const currentDbPath = path.join(app.getPath('userData'), 'sri_kumaran_agri.db');
    db.closeDatabase();
    fs.copyFileSync(backupFile, currentDbPath);
    db.initDatabase(currentDbPath);
    return true;
  });

  // ── Dashboard ──────────────────────────────────────────────────────────────
  handleSafe('dashboard:getStats', () => db.getDashboardStats());

  // ── Products ───────────────────────────────────────────────────────────────
  handleSafe('products:getAll',     ({ category = null, onlyLowStock = false } = {}) =>
    db.getAllProducts(category, onlyLowStock));
  handleSafe('products:search',     ({ query = '', category = null, onlyActive = true } = {}) =>
    db.searchProducts(query, category, onlyActive));
  handleSafe('products:getById',    (id)                      => db.getProductById(id));
  handleSafe('products:create',     (productData)             => db.createProduct(productData));
  handleSafe('products:update',     ({ id, productData })     => db.updateProduct(id, productData));
  handleSafe('products:bulkImport', (items)                   => db.bulkImportProducts(items));

  // ── Customers ──────────────────────────────────────────────────────────────
  handleSafe('customers:search',        (query)             => db.searchCustomers(query));
  handleSafe('customers:getById',       (id)                => db.getCustomerById(id));
  handleSafe('customers:create',        (customerData)      => db.createCustomer(customerData));
  handleSafe('customers:update',        ({ id, customerData }) => db.updateCustomer(id, customerData));
  handleSafe('customers:getLedger',     (customerId)        => db.getCustomerLedger(customerId));
  handleSafe('customers:recordPayment', (paymentData)       => db.recordCustomerPayment(paymentData));

  // ── Billing ────────────────────────────────────────────────────────────────
  handleSafe('billing:getNextBillNumber', ()                       => db.generateNextBillNumber());
  handleSafe('billing:create',            ({ billData, items })    => db.createBill(billData, items));
  handleSafe('billing:getById',           (id)                     => db.getBillById(id));
  handleSafe('billing:getByNumber',       (billNo)                 => db.getBillByNumber(billNo));
  handleSafe('billing:getList',           ({ startDate, endDate, customerId } = {}) =>
    db.getBillsList(startDate, endDate, customerId));

  // ── Purchases ──────────────────────────────────────────────────────────────
  handleSafe('purchases:create',         ({ purchaseData, items }) => db.createPurchase(purchaseData, items));
  handleSafe('purchases:getById',        (id)                      => db.getPurchaseById(id));
  handleSafe('purchases:getList',        ({ startDate, endDate } = {}) => db.getPurchasesList(startDate, endDate));
  handleSafe('purchases:getSuppliers',   ()                        => db.getSuppliers());
  handleSafe('purchases:createSupplier', (supplierData)            => db.createSupplier(supplierData));

  // ── Reports ────────────────────────────────────────────────────────────────
  handleSafe('reports:getSalesDayBook',       ({ startDate, endDate })     => db.getSalesDayBook(startDate, endDate));
  handleSafe('reports:getGstSummary',         ({ startDate, endDate })     => db.getGstSummary(startDate, endDate));
  handleSafe('reports:getStockReport',        ({ category } = {})          => db.getStockReport(category));
  handleSafe('reports:getCustomerOutstanding', ()                           => db.getCustomerOutstanding());
  handleSafe('reports:getAgriStatement',      ({ category, startDate, endDate }) =>
    db.getAgriDepartmentStatement(category, startDate, endDate));

  // ── Print & PDF ────────────────────────────────────────────────────────────
  handleSafe('print:printInvoice', async ({ htmlContent, printerType = 'A4', silent = false }) => {
    if (printWindow) { printWindow.destroy(); printWindow = null; }

    printWindow = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true }
    });

    const isThermal = printerType === 'thermal';
    const pageCss   = isThermal
      ? `@page { size: 80mm auto; margin: 2mm; } body { width: 76mm; font-family: monospace; }`
      : `@page { size: A4 portrait; margin: 10mm; } body { font-family: sans-serif; }`;

    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${pageCss}</style></head><body>${htmlContent}</body></html>`;
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`);

    return new Promise((resolve, reject) => {
      printWindow.webContents.print(
        { silent, printBackground: true, pageSize: isThermal ? { width: 80000, height: 297000 } : 'A4' },
        (success, errorType) => {
          if (printWindow) { printWindow.destroy(); printWindow = null; }
          if (!success && errorType !== 'cancelled') reject(new Error(errorType));
          else resolve({ success: true, printed: success });
        }
      );
    });
  });

  handleSafe('print:savePdf', async ({ htmlContent, defaultFilename, isLandscape = false }) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'PDF சேமிக்கவும் (Save PDF Report)',
      defaultPath: defaultFilename || 'Report.pdf',
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
    });
    if (canceled || !filePath) return null;

    const worker  = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true }
    });
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      @page { size: A4 ${isLandscape ? 'landscape' : 'portrait'}; margin: 8mm; }
      body { font-family: 'Noto Sans Tamil','Nirmala UI',sans-serif; margin:0; padding:0; color:#111; }
    </style></head><body>${htmlContent}</body></html>`;

    await worker.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`);
    const pdfBuffer = await worker.webContents.printToPDF({ printBackground: true, landscape: isLandscape, pageSize: 'A4' });
    worker.destroy();
    fs.writeFileSync(filePath, pdfBuffer);
    return filePath;
  });

  // ── App Info ───────────────────────────────────────────────────────────────
  handleSafe('app:getInfo', () => ({
    appName:      'Nexus Billing Software',
    version:      app.getVersion(),
    developer:    'SNK TECH Team',
    copyright:    '© 2026 SNK TECH',
    userDataPath: app.getPath('userData'),
    dbPath:       path.join(app.getPath('userData'), 'sri_kumaran_agri.db'),
    platform:     process.platform,
    arch:         process.arch
  }));
}

// ── App Lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  const userDataPath = app.getPath('userData');
  const dbPath       = path.join(userDataPath, 'sri_kumaran_agri.db');
  console.log(`[Database] Initializing SQLite DB at: ${dbPath}`);

  try {
    db.initDatabase(dbPath);
  } catch (err) {
    console.error('[FATAL] Database init failed:', err);
    process.exit(1);
  }

  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on('child-process-gone', (_event, details) => {
    if (details.type === 'GPU') return; // GPU crashes are non-fatal and common
    console.error('[Child Process Gone]', details.type, details.reason);
  });
});

app.on('window-all-closed', () => {
  db.closeDatabase();
  if (process.platform !== 'darwin') app.quit();
});

/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - DESKTOP BILLING SOFTWARE
 * Electron Preload Script (Secure IPC Bridge)
 * File: src/main/preload.js
 * ============================================================================
 * Shop: ஸ்ரீ குமரன் ஏஜென்சிஸ் (Sri Kumaran Agencies)
 * Location: 69, கடைவீதி, முசிறி (TK), திருச்சி (Dt) - 621211
 *
 * Security:
 * - contextIsolation = true
 * - nodeIntegration = false
 * - Exposes safe, validated 'window.api' bridge to the renderer
 * ============================================================================
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Helper to call IPC channels with automatic error unwrapping
 */
async function invokeChannel(channel, ...args) {
  const response = await ipcRenderer.invoke(channel, ...args);
  if (!response) {
    throw new Error('சேவையகத்திலிருந்து பதில் இல்லை (No response from main process)');
  }
  if (!response.success) {
    throw new Error(response.error || 'தெரியாத பிழை (Unknown error occurred)');
  }
  return response.data;
}

// Expose safe API to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Authentication & Security
  auth: {
    verifyPin: (pin) => invokeChannel('auth:verifyPin', pin),
    updatePin: (oldPin, newPin) => invokeChannel('auth:updatePin', { oldPin, newPin }),
    registerShop: (data) => invokeChannel('auth:registerShop', data)
  },

  // Shop Settings & System
  settings: {
    get: () => invokeChannel('settings:get'),
    update: (settings) => invokeChannel('settings:update', settings),
    selectLogo: () => invokeChannel('settings:selectLogo'),
    backup: () => invokeChannel('settings:backup'),
    restore: () => invokeChannel('settings:restore')
  },

  // Dashboard Stats
  dashboard: {
    getStats: () => invokeChannel('dashboard:getStats')
  },

  // Products & Stock Management
  products: {
    getAll: (filters) => invokeChannel('products:getAll', filters),
    search: (params) => invokeChannel('products:search', params),
    getById: (id) => invokeChannel('products:getById', id),
    create: (productData) => invokeChannel('products:create', productData),
    update: (id, productData) => invokeChannel('products:update', { id, productData }),
    bulkImport: (items) => invokeChannel('products:bulkImport', items)
  },

  // Customers & Accounts Ledger
  customers: {
    search: (query) => invokeChannel('customers:search', query),
    getById: (id) => invokeChannel('customers:getById', id),
    create: (customerData) => invokeChannel('customers:create', customerData),
    update: (id, customerData) => invokeChannel('customers:update', { id, customerData }),
    getLedger: (customerId) => invokeChannel('customers:getLedger', customerId),
    recordPayment: (paymentData) => invokeChannel('customers:recordPayment', paymentData)
  },

  // Billing (Counter Point-of-Sale)
  billing: {
    getNextBillNumber: () => invokeChannel('billing:getNextBillNumber'),
    create: (billData, items) => invokeChannel('billing:create', { billData, items }),
    getById: (id) => invokeChannel('billing:getById', id),
    getByNumber: (billNo) => invokeChannel('billing:getByNumber', billNo),
    getList: (filters) => invokeChannel('billing:getList', filters)
  },

  // Purchases (Stock Inward)
  purchases: {
    create: (purchaseData, items) => invokeChannel('purchases:create', { purchaseData, items }),
    getById: (id) => invokeChannel('purchases:getById', id),
    getList: (filters) => invokeChannel('purchases:getList', filters),
    getSuppliers: () => invokeChannel('purchases:getSuppliers'),
    createSupplier: (supplierData) => invokeChannel('purchases:createSupplier', supplierData)
  },

  // Business & Regulatory Reports
  reports: {
    getSalesDayBook: (filters) => invokeChannel('reports:getSalesDayBook', filters),
    getGstSummary: (filters) => invokeChannel('reports:getGstSummary', filters),
    getStockReport: (filters) => invokeChannel('reports:getStockReport', filters),
    getCustomerOutstanding: () => invokeChannel('reports:getCustomerOutstanding'),
    getAgriStatement: (params) => invokeChannel('reports:getAgriStatement', params)
  },

  // Printing & PDF Generation
  print: {
    printInvoice: (options) => invokeChannel('print:printInvoice', options),
    savePdf: (options) => invokeChannel('print:savePdf', options)
  },

  // App Metadata
  app: {
    getInfo: () => invokeChannel('app:getInfo')
  }
});

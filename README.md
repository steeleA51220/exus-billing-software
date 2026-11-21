# ஸ்ரீ குமரன் ஏஜென்சிஸ் — Desktop Billing Software

**Sri Kumaran Agencies | Agri Inputs Billing & Stock Management**

> விதை, பூச்சிமருந்து, உரம் வியாபாரம்  
> 69, கடைவீதி, முசிறி (TK), திருச்சி (Dt) - 621211

---

## 🌟 Features

| Module | Description |
|--------|-------------|
| 🔐 PIN Login | PBKDF2-hashed 4-digit PIN, secure local auth |
| 📊 Dashboard | Today's sales, collection, dues, low-stock alerts, top-5 pesticides |
| 🧾 Billing (POS) | Fast counter billing, autocomplete, GST engine, A4 + 80mm thermal |
| 📦 Products | CRUD, CSV bulk import, category-wise GST defaults, low-stock filter |
| 👥 Customers | Ledger, outstanding, payment recording, opening balance |
| 🚚 Purchases | Supplier inward, auto stock update, purchase history |
| 📈 Reports | Sales day book, GSTR-1 summary, stock valuation, customer outstanding |
| 🏛️ Agri Dept Statement | 3 statutory statements (Pesticide/Seed/Fertilizer) in Tamil, PDF export |
| ⚙️ Settings | Shop details, logo, backup/restore, thermal vs A4 default |

---

## 🖥️ Prerequisites

### 1. Node.js (REQUIRED)

Download and install **Node.js v20 LTS** from:  
👉 **https://nodejs.org/en/download** (choose "Windows Installer (.msi)")

After installation, verify in PowerShell:

```powershell
node --version   # Should show v20.x.x
npm --version    # Should show 10.x.x
```

### 2. Visual Studio Build Tools (for native module compilation)

`better-sqlite3` requires a native C++ build.

**Option A — Automatic (recommended):**
```powershell
npm install --global --production windows-build-tools
```

**Option B — Manual:**  
Download [Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/visual-cpp-build-tools/)  
During install, select: **"Desktop development with C++"**

---

## 🚀 First-Time Setup

Open **PowerShell** (or Windows Terminal) and run:

```powershell
# 1. Navigate to the project folder
cd "C:\Users\ELCOT\.gemini\antigravity\scratch\sri-kumaran-billing"

# 2. Install all dependencies
npm install

# 3. Rebuild better-sqlite3 native module for Electron
npm run rebuild
```

> ⚠️ **Step 3 is critical.** `better-sqlite3` is a native Node.js addon — it must be
> rebuilt specifically for Electron's Node.js ABI version. Skipping this step causes
> the app to crash on startup with a "NODE_MODULE_VERSION mismatch" error.

---

## ▶️ Running in Development Mode

```powershell
npm start
```

This launches the Electron app in development mode with DevTools available (press `F12`).

**Default login PIN: `1234`**  
Change it immediately via **Settings → Security → Change PIN**.

---

## 🏗️ Building the Windows Installer

```powershell
npm run dist
```

Output: `dist\Sri Kumaran Agencies-Setup-1.0.0.exe`

This is a full **NSIS Windows installer** that:
- Lets the user choose installation directory
- Creates Desktop and Start Menu shortcuts ("Sri Kumaran Agencies Billing")
- Launches the app after installation finishes

> Build time: ~2–5 minutes depending on machine speed.  
> Output file size: ~90–130 MB (Electron bundled).

### Build for local testing only (no installer, faster):
```powershell
npm run pack
```
Output: `dist\win-unpacked\Sri Kumaran Agencies.exe` — run directly, no install needed.

---

## 📂 Data & File Locations

| Item | Location |
|------|----------|
| SQLite database | `%APPDATA%\sri-kumaran-billing\sri_kumaran_agri.db` |
| App logs | `%APPDATA%\sri-kumaran-billing\logs\` |
| Installed app | `%LOCALAPPDATA%\Programs\Sri Kumaran Agencies\` (default) |

**To open the data folder quickly:**  
Press `Win + R` → type `%APPDATA%\sri-kumaran-billing` → Enter

---

## 🌐 Tamil Font (Optional but Recommended)

The app uses **Nirmala UI** (built into Windows) as the Tamil font fallback, so it works out of the box.

For crisper Tamil rendering, add **Noto Sans Tamil**:

1. Download from Google Fonts: https://fonts.google.com/noto/specimen/Noto+Sans+Tamil
2. Extract `NotoSansTamil-Regular.ttf` from the ZIP
3. Place it at: `assets\fonts\NotoSansTamil-Regular.ttf`
4. Restart the app — Tamil text will now use Noto Sans Tamil everywhere

---

## 🖼️ App Icon (Optional)

A placeholder icon location is at `assets\icons\icon.ico`.

To use a custom icon:
1. Create or download a 256×256 `.ico` file
2. Place it at `assets\icons\icon.ico`
3. Rebuild (`npm run dist`) to include the new icon in the installer

---

## ⌨️ Keyboard Shortcuts (Billing Counter)

| Key | Action |
|-----|--------|
| `F2` | New bill |
| `F4` | Focus product search |
| `Enter` | Add selected product to bill |
| `F9` | Save & Print bill |
| `Escape` | Cancel / Close modal |

---

## 🏛️ Agri Department Statement — How to Use

The Agriculture Department requires periodic stock movement statements in a prescribed format.

**To generate:**
1. Go to **Reports** page → **அரசு அறிக்கை** (Agri Dept Statement) tab
2. Select **Category** (Pesticide / Seed / Fertilizer)
3. Enter **Start Date** and **End Date**
4. Click **"பூச்சிமருந்து அறிக்கை"** / **"விதை அறிக்கை"** / **"உரம் அறிக்கை"**
5. A **Save As** dialog opens → save the PDF

**What the statement shows (per product):**

| Column | Tamil | Calculation |
|--------|-------|-------------|
| Opening stock | ஆரம்ப இருப்பு | Stock at the START of the period |
| Received | வரவு | Purchases + return-ins during period |
| Total | மொத்தம் | Opening + Received |
| Sold | விற்பனை | Sales + return-outs during period |
| Balance | மீதி இருப்பு | Total − Sold |

> Opening stock is calculated as: `products.opening_stock` + all signed transactions **before** the start date.  
> This ensures correctness regardless of which date range you choose.

---

## 💾 Backup & Restore

### Backup (recommended: daily)
1. Go to **Settings** → **தரவு பாதுகாப்பு** (Data Backup)
2. Click **"தரவு காப்புப் பிரதி"** (Backup)
3. Choose a destination folder (USB drive, external HDD, network share)
4. File is saved as `sri_kumaran_backup_YYYY-MM-DD.db`

### Restore
1. Go to **Settings** → **தரவு பாதுகாப்பு**
2. Click **"மீட்டெடு"** (Restore)
3. Select a `.db` backup file
4. App restarts automatically with the restored data

> ⚠️ Restoring overwrites ALL current data. Make a fresh backup first!

---

## 🧾 Bill Number Format

Bills are numbered: **`SK/YYYY-YY/NNNN`**

Example: `SK/2025-26/0001`, `SK/2025-26/0002` … `SK/2025-26/9999`

- **SK** = prefix (configurable in Settings)
- **2025-26** = financial year (Apr 2025 → Mar 2026)
- **0001** = 4-digit series, resets to `0001` each new financial year

**To start a new financial year:**  
Settings → Bill Settings → Update Financial Year → series resets automatically.

---

## 📋 GST Defaults by Category

| Category | Default GST | HSN Range |
|----------|-------------|-----------|
| Pesticide (பூச்சிமருந்து) | 18% | 3808 |
| Seed (விதை) | 0% (exempt) | 1209 |
| Fertilizer (உரம்) | 5% | 3102–3105 |

You can override the GST rate per individual product in the Products page.

---

## 🏗️ Project Structure

```
sri-kumaran-billing/
├── package.json              ← npm config + electron-builder NSIS config
├── .gitignore
├── README.md
├── assets/
│   ├── fonts/
│   │   └── NotoSansTamil-Regular.ttf   ← place here (download separately)
│   ├── icons/
│   │   └── icon.ico                     ← app icon
│   └── images/
├── build/                    ← electron-builder resources
└── src/
    ├── main/
    │   ├── main.js           ← Electron main process, window, IPC handlers
    │   ├── preload.js        ← contextBridge → window.api
    │   └── db.js             ← SQLite schema, all CRUD functions
    └── renderer/
        ├── index.html        ← All pages (SPA, section-based routing)
        ├── css/
        │   ├── main.css      ← Dark theme, Tamil fonts, layout
        │   ├── print-a4.css  ← A4 invoice print styles
        │   └── print-thermal.css  ← 80mm thermal receipt styles
        └── js/
            ├── stubs.js      ← Defensive no-ops (loads first)
            ├── app.js        ← Router, keyboard shortcuts, global nav
            ├── auth.js       ← PIN screen, PBKDF2 auth
            ├── dashboard.js  ← Stats, SVG chart, low-stock alerts
            ├── billing.js    ← POS billing, GST engine, print/PDF
            ├── products.js   ← Product CRUD, CSV import
            ├── customers.js  ← Customer ledger, payment recording
            ├── purchases.js  ← Stock inward, supplier directory
            ├── reports.js    ← 5 report types + 3 agri statements
            └── settings.js   ← Shop config, backup/restore, PIN change
```

---

## 🔧 Troubleshooting

### "NODE_MODULE_VERSION mismatch" on startup
```powershell
npm run rebuild
```
This recompiles `better-sqlite3` for the installed Electron version.

### Tamil text shows as boxes/question marks
- Ensure Windows has **Nirmala UI** installed (it's built in on Windows 10/11)
- Or place `NotoSansTamil-Regular.ttf` in `assets/fonts/`

### App window is blank / white screen
- Press `F12` to open DevTools → check Console tab for errors
- Run `npm start` in PowerShell to see Node.js-side error messages

### Bill PDF shows blank Tamil text
- jsPDF requires the Tamil font to be embedded as Base64
- In `reports.js`, the font is embedded via `doc.addFileToVFS()` / `doc.addFont()`
- If the font file is missing, PDF Tamil text falls back to ASCII — this is expected

### "Cannot find module 'better-sqlite3'"
```powershell
npm install
npm run rebuild
```

### electron-builder fails with "icon not found"
- Create or place a valid `256×256` ICO file at `assets/icons/icon.ico`
- Or temporarily remove the `"icon"` line from `package.json` → `build.win`

---

## 👨‍💻 Developer

**Developed by:** Sri Kumaran Tech  
**Version:** 1.0.0  
**Platform:** Windows 10/11 (x64)  
**Tech Stack:** Electron 29 · Node.js 20 LTS · better-sqlite3 · Vanilla JS · jsPDF

---

## 📜 License

ISC License — Private use for Sri Kumaran Agencies, Musiri.

---

*ஸ்ரீ குமரன் ஏஜென்சிஸ் — 69, கடைவீதி, முசிறி, திருச்சி — 621211*

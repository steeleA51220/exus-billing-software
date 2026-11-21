# 🏪 Nexus Billing Software

**Nexus Billing Software** is a fully offline, desktop-based billing and inventory management application built specifically for agricultural retail shops (dealers of seeds, pesticides, and fertilizers). 

Developed by **SNK TECH Team**, this software aims to replace manual ledger bookkeeping with a fast, secure, and GST-compliant digital solution.

---

## ✨ Key Features

*   **Fast Counter Billing:** Lightning-fast product search, barcode support, and quick checkout.
*   **Automated GST Calculation:** Auto-calculates GST based on categories (Pesticide: 18%, Fertilizer: 5%, Seed: 0%).
*   **Multi-Language Support:** Switch dynamically between Tamil, English, and Bilingual (Tamil + English) UI.
*   **Agri Department Statements:** One-click PDF generation for Pesticides, Seeds, and Fertilizers with exact Tamil headers and stock movement (Opening, Received, Sold, Closing).
*   **Inventory Management:** Real-time stock tracking, low-stock alerts, and stock inward (purchases) logging.
*   **Customer Ledger:** Track farmer dues, credit payments, and payment history.
*   **100% Offline & Secure:** Uses local SQLite database. Zero internet required, ensuring complete data privacy.
*   **Print Options:** Supports both A4 standard invoices and 80mm thermal printer receipts.

---

## 🛠️ Tech Stack

*   **Framework:** [Electron.js](https://www.electronjs.org/) (Desktop Application)
*   **Backend:** Node.js
*   **Database:** [SQLite](https://www.sqlite.org/) (via `better-sqlite3`)
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript
*   **PDF Generation:** Electron `printToPDF`

---

## 📸 Screenshots

*(Note: Add your app screenshots here)*

| Dashboard | Billing Screen |
| :---: | :---: |
| *Add dashboard screenshot here* | *Add billing screenshot here* |

| Add Product | Agri Statement PDF |
| :---: | :---: |
| *Add product form screenshot here* | *Add PDF screenshot here* |

---

## 🚀 Installation & Setup (For Developers)

To run this project locally on your machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/steeleA51220/exus-billing-software.git

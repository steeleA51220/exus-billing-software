/**
 * stubs.js — Defensive no-op stubs loaded BEFORE all other modules.
 * Prevents "undefined is not a function" crashes during keyboard-shortcut
 * handling if a module has not yet registered its handler.
 *
 * Each stub is replaced by the real implementation when the respective
 * module initialises (they overwrite the same namespace key).
 */

window.Billing = window.Billing || {
  startNewBill: function () { console.warn('[stub] Billing.startNewBill called before billing.js loaded'); },
  focusProductSearch: function () { console.warn('[stub] Billing.focusProductSearch called before billing.js loaded'); },
  saveAndPrint: function () { console.warn('[stub] Billing.saveAndPrint called before billing.js loaded'); },
  saveBill: function () { console.warn('[stub] Billing.saveBill called before billing.js loaded'); },
};

window.Products = window.Products || {
  openAddModal: function () { console.warn('[stub] Products.openAddModal called before products.js loaded'); },
};

window.Customers = window.Customers || {
  openAddModal: function () { console.warn('[stub] Customers.openAddModal called before customers.js loaded'); },
};

window.Purchases = window.Purchases || {
  openAddModal: function () { console.warn('[stub] Purchases.openAddModal called before purchases.js loaded'); },
};

window.Reports = window.Reports || {
  generateAgriStatement: function () { console.warn('[stub] Reports.generateAgriStatement called before reports.js loaded'); },
};

window.Dashboard = window.Dashboard || {
  load: function () { console.warn('[stub] Dashboard.load called before dashboard.js loaded'); },
};

window.Settings = window.Settings || {
  load: function () { console.warn('[stub] Settings.load called before settings.js loaded'); },
};

window.i18n = window.i18n || {
  t: function (k, f) { return f || k; },
  setLanguage: function () {},
  currentLang: 'ta_en'
};

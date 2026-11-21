/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - AGRI BILLING SOFTWARE
 * Core Application Manager & SPA Router
 * File: src/renderer/js/app.js
 * ============================================================================
 */

window.App = {
  currentView: 'dashboard',
  shopSettings: null,

  init() {
    this.bindNavigation();
    this.bindKeyboardShortcuts();
    this.startLiveClock();
    this.loadInitialSettings();

    // Re-render title on language changes
    window.addEventListener('languageChanged', () => {
      this.updatePageTitle();
    });
  },

  updatePageTitle() {
    const titleKeys = {
      dashboard: 'nav.dashboard',
      billing: 'nav.billing',
      products: 'nav.products',
      customers: 'nav.customers',
      purchases: 'nav.purchases',
      reports: 'nav.reports',
      settings: 'nav.settings'
    };
    const key = titleKeys[this.currentView];
    const titleEl = document.getElementById('page-title');
    if (titleEl && key) {
      if (window.i18n) {
        titleEl.textContent = window.i18n.t(key);
      }
    }
  },

  /**
   * SPA View Navigation
   */
  navigateTo(viewName) {
    const containers = document.querySelectorAll('.view-container');
    containers.forEach(c => c.classList.remove('active'));

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('active'));

    const targetContainer = document.getElementById(`view-${viewName}`);
    const targetLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);

    if (targetContainer) {
      targetContainer.classList.add('active');
      this.currentView = viewName;
    }

    if (targetLink) {
      targetLink.classList.add('active');
    }

    // Update Header Title dynamically via i18n
    this.updatePageTitle();

    // Trigger view-specific refreshes
    if (viewName === 'dashboard' && window.Dashboard) {
      window.Dashboard.load();
    } else if (viewName === 'settings' && window.Settings) {
      window.Settings.load();
    } else if (viewName === 'billing' && window.Billing) {
      window.Billing.initScreen();
    } else if (viewName === 'products' && window.Products) {
      window.Products.load();
    } else if (viewName === 'customers' && window.Customers) {
      window.Customers.load();
    } else if (viewName === 'purchases' && window.Purchases) {
      window.Purchases.load();
    } else if (viewName === 'reports' && window.Reports) {
      window.Reports.load();
    }
  },

  bindNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const view = link.getAttribute('data-view');
        if (view) {
          this.navigateTo(view);
        }
      });
    });

    // Quick Action button handlers
    const quickBill = document.getElementById('quick-btn-new-bill');
    if (quickBill) {
      quickBill.addEventListener('click', () => this.navigateTo('billing'));
    }

    const quickPurchase = document.getElementById('quick-btn-new-purchase');
    if (quickPurchase) {
      quickPurchase.addEventListener('click', () => this.navigateTo('purchases'));
    }

    const quickStmt = document.getElementById('quick-btn-agri-stmt');
    if (quickStmt) {
      quickStmt.addEventListener('click', () => this.navigateTo('reports'));
    }
  },

  /**
   * Global Keyboard Shortcuts for Counter Speed
   */
  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept shortcuts when lock screen is open
      const lockOverlay = document.getElementById('lock-overlay');
      if (lockOverlay && lockOverlay.style.display !== 'none') return;

      // F2: New Bill
      if (e.key === 'F2') {
        e.preventDefault();
        this.navigateTo('billing');
      }

      // F3: Products
      if (e.key === 'F3') {
        e.preventDefault();
        this.navigateTo('products');
      }

      // F4: Search Product (if in billing)
      if (e.key === 'F4') {
        e.preventDefault();
        if (this.currentView !== 'billing') {
          this.navigateTo('billing');
        }
        const searchInput = document.getElementById('bill-product-search');
        if (searchInput) searchInput.focus();
      }

      // F9: Save & Print Bill
      if (e.key === 'F9') {
        e.preventDefault();
        if (this.currentView === 'billing' && window.Billing && window.Billing.saveAndPrint) {
          window.Billing.saveAndPrint();
        }
      }
    });
  },

  /**
   * Header Live Clock
   */
  startLiveClock() {
    const clockEl = document.getElementById('live-clock');
    const update = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('en-IN', { hour12: true });
      }
    };
    update();
    setInterval(update, 1000);
  },

  /**
   * Load initial Shop profile into headers & badges
   */
  async loadInitialSettings() {
    try {
      const settings = await window.api.settings.get();
      const setupOverlay = document.getElementById('setup-overlay');
      const lockOverlay = document.getElementById('lock-overlay');

      // First-Time Setup Check
      if (!settings || !settings.is_setup_done) {
        if (setupOverlay) setupOverlay.style.display = 'flex';
        if (lockOverlay) lockOverlay.style.display = 'none';
      } else {
        if (setupOverlay) setupOverlay.style.display = 'none';
      }

      if (settings) {
        this.shopSettings = settings;
        
        const shopNameEl = document.getElementById('sidebar-shop-name');
        if (shopNameEl && settings.shop_name) shopNameEl.textContent = settings.shop_name;

        const taglineEl = document.getElementById('sidebar-tagline');
        if (taglineEl && settings.tagline) taglineEl.textContent = settings.tagline;

        const gstinEl = document.getElementById('sidebar-gstin');
        if (gstinEl && settings.gstin) gstinEl.textContent = `GSTIN: ${settings.gstin}`;

        const fyBadge = document.getElementById('header-fy-badge');
        if (fyBadge && settings.financial_year) fyBadge.textContent = `FY: ${settings.financial_year}`;
      }

      // Load app & database path
      const appInfo = await window.api.app.getInfo();
      if (appInfo) {
        const dbPathEl = document.getElementById('app-db-path');
        if (dbPathEl) dbPathEl.textContent = `DB: ${appInfo.dbPath}`;
      }
    } catch (err) {
      console.error('Failed to load initial settings:', err);
    }
  },

  /**
   * Utility: Format currency to Indian standard (₹ 1,23,456.00)
   */
  formatINR(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  /**
   * Toast notification helper
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };
    toast.innerHTML = `<span>${iconMap[type] || 'ℹ️'}</span><span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});

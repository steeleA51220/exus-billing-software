/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - AGRI BILLING SOFTWARE
 * Settings View Controller
 * File: src/renderer/js/settings.js
 * ============================================================================
 */

window.Settings = {
  currentSettings: null,

  init() {
    this.bindEvents();
  },

  async load() {
    try {
      const settings = await window.api.settings.get();
      if (!settings) return;

      this.currentSettings = settings;
      this.populateForm(settings);
    } catch (err) {
      console.error('Failed to load settings:', err);
      window.App.showToast('அமைப்புகளை ஏற்றுவதில் தோல்வி (Failed to load settings)', 'error');
    }
  },

  populateForm(settings) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('setting-shop-name', settings.shop_name);
    setVal('setting-tagline', settings.tagline);
    setVal('setting-address', settings.address);
    setVal('setting-gstin', settings.gstin);
    setVal('setting-phone', settings.phone);
    setVal('setting-bill-prefix', settings.bill_prefix);
    setVal('setting-financial-year', settings.financial_year);

    // Printer Type
    this.setPrinterSelection(settings.default_printer_type || 'A4');

    // Language Option Selection
    const activeLang = window.i18n ? window.i18n.currentLang : (localStorage.getItem('nexus_language') || 'ta_en');
    document.querySelectorAll('.lang-option').forEach(opt => {
      if (opt.getAttribute('data-lang') === activeLang) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });

    // Logo Preview
    if (settings.logo_path) {
      this.displayLogo(settings.logo_path);
    }
  },

  setPrinterSelection(type) {
    const optA4 = document.getElementById('opt-printer-a4');
    const optThermal = document.getElementById('opt-printer-thermal');

    if (type === 'thermal') {
      optA4.classList.remove('selected');
      optThermal.classList.add('selected');
    } else {
      optThermal.classList.remove('selected');
      optA4.classList.add('selected');
    }
  },

  displayLogo(logoPath) {
    const imgEl = document.getElementById('logo-img-preview');
    const placeholder = document.getElementById('logo-placeholder-text');
    if (imgEl && placeholder) {
      imgEl.src = `file://${logoPath}?t=${Date.now()}`;
      imgEl.style.display = 'block';
      placeholder.style.display = 'none';
    }
  },

  bindEvents() {
    // Printer Option Clicks
    const optA4 = document.getElementById('opt-printer-a4');
    const optThermal = document.getElementById('opt-printer-thermal');
    if (optA4 && optThermal) {
      optA4.addEventListener('click', () => this.setPrinterSelection('A4'));
      optThermal.addEventListener('click', () => this.setPrinterSelection('thermal'));
    }

    // Save Shop Settings Form
    const formSettings = document.getElementById('form-shop-settings');
    if (formSettings) {
      formSettings.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveShopSettings();
      });
    }

    // Logo Selection
    const btnSelectLogo = document.getElementById('btn-select-logo');
    if (btnSelectLogo) {
      btnSelectLogo.addEventListener('click', async () => {
        try {
          const logoPath = await window.api.settings.selectLogo();
          if (logoPath) {
            this.displayLogo(logoPath);
            window.App.showToast('லோகோ வெற்றிகரமாக பதிவேற்றப்பட்டது!', 'success');
          }
        } catch (err) {
          console.error('Logo upload error:', err);
          window.App.showToast('லோகோ பதிவேற்றுவதில் பிழை: ' + err.message, 'error');
        }
      });
    }

    // Change PIN Form
    const formPin = document.getElementById('form-change-pin');
    if (formPin) {
      formPin.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.changePin();
      });
    }

    // Backup Database Button
    const btnBackup = document.getElementById('btn-backup-db');
    if (btnBackup) {
      btnBackup.addEventListener('click', async () => {
        try {
          const dest = await window.api.settings.backup();
          if (dest) {
            window.App.showToast(`காப்புப்பிரதி சேமிக்கப்பட்டது: ${dest}`, 'success');
          }
        } catch (err) {
          console.error('Backup error:', err);
          window.App.showToast('காப்புப்பிரதி எடுப்பதில் பிழை: ' + err.message, 'error');
        }
      });
    }

    // Restore Database Button
    const btnRestore = document.getElementById('btn-restore-db');
    if (btnRestore) {
      btnRestore.addEventListener('click', async () => {
        const confirmRestore = confirm(
          'எச்சரிக்கை: காப்புப்பிரதியை மீட்டெடுப்பது தற்போதைய தகவல்களை மாற்றியமைக்கும். நிச்சயமாக தொடர விரும்புகிறீர்களா?\n\n(Warning: Restoring will overwrite existing data. Continue?)'
        );
        if (!confirmRestore) return;

        try {
          const success = await window.api.settings.restore();
          if (success) {
            window.App.showToast('தரவுத்தளம் வெற்றிகரமாக மீட்டெடுக்கப்பட்டது!', 'success');
            await this.load();
            await window.App.loadInitialSettings();
          }
        } catch (err) {
          console.error('Restore error:', err);
          window.App.showToast('மீட்டெடுப்பதில் பிழை: ' + err.message, 'error');
        }
      });
    }

    // About Software Modal Triggers
    const btnAbout = document.getElementById('btn-open-about-modal');
    if (btnAbout) {
      btnAbout.addEventListener('click', () => {
        const modal = document.getElementById('modal-about');
        if (modal) modal.classList.add('active');
      });
    }

    document.querySelectorAll('#modal-about .modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('modal-about');
        if (modal) modal.classList.remove('active');
      });
    });

    // 3-Way Language Selection Toggle
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const lang = opt.getAttribute('data-lang');
        if (lang && window.i18n) {
          window.i18n.setLanguage(lang);
          const msg = lang === 'en' ? 'Language switched to English Only' :
                      lang === 'ta' ? 'மொழி தமிழுக்கு மாற்றப்பட்டது (Tamil Only)' :
                      'மொழி தமிழ் + English-க்கு மாற்றப்பட்டது (Bilingual)';
          window.App.showToast(msg, 'success');
        }
      });
    });
  },

  async saveShopSettings() {
    try {
      const getVal = (id) => document.getElementById(id).value.trim();

      const selectedPrinterEl = document.querySelector('.printer-option.selected');
      const defaultPrinter = selectedPrinterEl ? selectedPrinterEl.getAttribute('data-type') : 'A4';

      const payload = {
        shop_name: getVal('setting-shop-name'),
        tagline: getVal('setting-tagline'),
        address: getVal('setting-address'),
        gstin: getVal('setting-gstin'),
        phone: getVal('setting-phone'),
        bill_prefix: getVal('setting-bill-prefix'),
        financial_year: getVal('setting-financial-year'),
        default_printer_type: defaultPrinter
      };

      const updated = await window.api.settings.update(payload);
      this.currentSettings = updated;
      await window.App.loadInitialSettings();
      window.App.showToast('கடை அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!', 'success');
    } catch (err) {
      console.error('Save settings error:', err);
      window.App.showToast('அமைப்புகளை சேமிப்பதில் பிழை: ' + err.message, 'error');
    }
  },

  async changePin() {
    const curPin = document.getElementById('pin-current').value.trim();
    const newPin = document.getElementById('pin-new').value.trim();
    const confirmPin = document.getElementById('pin-confirm').value.trim();

    if (newPin.length < 4) {
      window.App.showToast('புதிய PIN குறைந்தது 4 இலக்கங்கள் இருக்க வேண்டும்!', 'error');
      return;
    }

    if (newPin !== confirmPin) {
      window.App.showToast('புதிய PIN மற்றும் உறுதிப்படுத்தல் பொருந்தவில்லை!', 'error');
      return;
    }

    try {
      await window.api.auth.updatePin(curPin, newPin);
      window.App.showToast('பாதுகாப்பு PIN வெற்றிகரமாக மாற்றப்பட்டது!', 'success');
      document.getElementById('form-change-pin').reset();
    } catch (err) {
      console.error('Change PIN error:', err);
      window.App.showToast(err.message, 'error');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.Settings.init();
});

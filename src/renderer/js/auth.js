/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - AGRI BILLING SOFTWARE
 * Authentication & PIN Lock Module
 * File: src/renderer/js/auth.js
 * ============================================================================
 */

window.Auth = {
  currentPin: '',
  maxPinLength: 4,

  init() {
    this.bindEvents();
    this.updateDots();
  },

  bindEvents() {
    // Keypad button clicks
    document.querySelectorAll('.key-btn[data-key]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        this.appendDigit(key);
      });
    });

    // Clear and Backspace buttons
    const clearBtn = document.getElementById('btn-pin-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearPin());
    }

    const backspaceBtn = document.getElementById('btn-pin-backspace');
    if (backspaceBtn) {
      backspaceBtn.addEventListener('click', () => this.backspace());
    }

    // Physical Keyboard Input
    window.addEventListener('keydown', (e) => {
      const lockOverlay = document.getElementById('lock-overlay');
      if (!lockOverlay || lockOverlay.style.display === 'none') return;

      if (e.key >= '0' && e.key <= '9') {
        this.appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        this.backspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        this.clearPin();
      }
    });

    // Top Header Lock Screen Button
    const lockBtn = document.getElementById('btn-lock-screen');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => this.lock());
    }

    // First-Time Setup: Register Shop Form
    const formSetup = document.getElementById('form-register-shop');
    if (formSetup) {
      formSetup.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitRegistration();
      });
    }
  },

  async submitRegistration() {
    const shopName = document.getElementById('setup-shop-name').value.trim();
    const address = document.getElementById('setup-shop-address').value.trim();
    const phone = document.getElementById('setup-shop-phone').value.trim();
    const gstin = document.getElementById('setup-shop-gstin').value.trim();
    const pin = document.getElementById('setup-pin').value.trim();
    const confirmPin = document.getElementById('setup-pin-confirm').value.trim();

    if (!shopName) {
      window.App.showToast('கடை பெயரை உள்ளிடவும் (Enter shop name)', 'error');
      return;
    }
    if (!address) {
      window.App.showToast('முகவரியை உள்ளிடவும் (Enter address)', 'error');
      return;
    }
    if (!phone) {
      window.App.showToast('தொலைபேசி எண்ணை உள்ளிடவும் (Enter phone number)', 'error');
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      window.App.showToast('PIN எண் சரியாக 4 இலக்கங்கள் இருக்க வேண்டும் (PIN must be exactly 4 digits)', 'error');
      return;
    }
    if (pin !== confirmPin) {
      window.App.showToast('PIN எண்கள் பொருந்தவில்லை (PIN confirmation does not match)', 'error');
      return;
    }

    try {
      const updated = await window.api.auth.registerShop({
        shop_name: shopName,
        address: address,
        phone: phone,
        gstin: gstin,
        pin: pin
      });

      window.App.shopSettings = updated;
      const shopNameEl = document.getElementById('sidebar-shop-name');
      if (shopNameEl) shopNameEl.textContent = updated.shop_name;

      // Hide Register Shop overlay, Show PIN Lock screen
      const setupOverlay = document.getElementById('setup-overlay');
      if (setupOverlay) setupOverlay.style.display = 'none';

      const lockOverlay = document.getElementById('lock-overlay');
      if (lockOverlay) lockOverlay.style.display = 'flex';

      this.clearPin();
      window.App.showToast('கடை பதிவு முடிந்தது! உள்நுழைய உங்கள் புதிய PIN-ஐ உள்ளிடவும்.', 'success');
    } catch (err) {
      console.error('Shop registration error:', err);
      window.App.showToast('பதிவு செய்வதில் பிழை: ' + err.message, 'error');
    }
  },

  appendDigit(digit) {
    if (this.currentPin.length < this.maxPinLength) {
      this.currentPin += digit;
      this.updateDots();

      // Automatically verify when 4 digits are entered
      if (this.currentPin.length === this.maxPinLength) {
        setTimeout(() => this.submitPin(), 100);
      }
    }
  },

  backspace() {
    if (this.currentPin.length > 0) {
      this.currentPin = this.currentPin.slice(0, -1);
      this.updateDots();
    }
  },

  clearPin() {
    this.currentPin = '';
    this.updateDots();
  },

  updateDots() {
    for (let i = 0; i < this.maxPinLength; i++) {
      const dot = document.getElementById(`dot-${i}`);
      if (dot) {
        if (i < this.currentPin.length) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      }
    }
  },

  async submitPin() {
    try {
      const isValid = await window.api.auth.verifyPin(this.currentPin);
      if (isValid) {
        this.unlock();
      } else {
        this.showError();
      }
    } catch (err) {
      console.error('PIN verification error:', err);
      this.showError();
    }
  },

  unlock() {
    const lockOverlay = document.getElementById('lock-overlay');
    if (lockOverlay) {
      lockOverlay.style.display = 'none';
    }
    this.clearPin();
    window.App.showToast('வணக்கம்! உள்நுழைவு வெற்றிகரமானது.', 'success');

    // Trigger dashboard refresh
    if (window.Dashboard) {
      window.Dashboard.load();
    }
  },

  lock() {
    const lockOverlay = document.getElementById('lock-overlay');
    if (lockOverlay) {
      lockOverlay.style.display = 'flex';
    }
    this.clearPin();
  },

  showError() {
    window.App.showToast('தவறான PIN! மீண்டும் முயற்சிக்கவும். (Incorrect PIN)', 'error');
    
    // Shake animation
    const lockCard = document.querySelector('.lock-card');
    if (lockCard) {
      lockCard.style.animation = 'shake 0.3s ease-in-out';
      setTimeout(() => {
        lockCard.style.animation = '';
      }, 300);
    }
    
    this.clearPin();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.Auth.init();
});

/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - AGRI BILLING SOFTWARE
 * Counter Billing (POS) View Controller & Print Engine
 * File: src/renderer/js/billing.js
 * ============================================================================
 */

window.Billing = {
  currentBillNo: '',
  financialYear: '',
  selectedCustomer: {
    id: 1,
    name: 'பொது வாடிக்கையாளர் (Walk-in)',
    phone: '',
    village: 'முசிறி',
    gstin: '',
    due: 0
  },
  selectedProduct: null,
  lineItems: [],
  printerType: 'A4',

  init() {
    this.bindEvents();
  },

  async initScreen() {
    await this.resetBill();
    // Focus on product search input when arriving on billing screen
    setTimeout(() => {
      const pSearch = document.getElementById('bill-product-search');
      if (pSearch) pSearch.focus();
    }, 150);
  },

  async resetBill() {
    try {
      const nextInfo = await window.api.billing.getNextBillNumber();
      this.currentBillNo = nextInfo.billNo;
      this.financialYear = nextInfo.fy;

      const badge = document.getElementById('bill-no-badge');
      if (badge) badge.textContent = this.currentBillNo;

      // Default date = today
      const dateInput = document.getElementById('bill-date');
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }

      // Default Customer = Walk-in
      this.setCustomer({
        id: 1,
        name: 'பொது வாடிக்கையாளர் (Walk-in)',
        phone: '',
        village: 'முசிறி',
        gstin: '',
        current_balance: 0
      });

      // Clear Product Bar
      this.clearProductBar();

      // Clear Line Items
      this.lineItems = [];
      this.renderTable();
      this.recalculateTotals();

      // Reset payment mode
      document.getElementById('bill-payment-mode').value = 'cash';
      document.getElementById('bill-notes').value = '';

      // Set default printer choice from shop settings
      const settings = window.App.shopSettings;
      if (settings && settings.default_printer_type) {
        this.setPrinterChoice(settings.default_printer_type);
      }
    } catch (err) {
      console.error('Failed to reset bill:', err);
    }
  },

  setCustomer(cust) {
    this.selectedCustomer = cust;
    const searchInput = document.getElementById('bill-customer-search');
    const hiddenId = document.getElementById('bill-customer-id');
    const dueBadge = document.getElementById('bill-cust-due-badge');

    if (searchInput) searchInput.value = cust.name;
    if (hiddenId) hiddenId.value = cust.id;

    if (dueBadge) {
      if ((cust.current_balance || 0) > 0) {
        dueBadge.textContent = `முந்தைய பாக்கி: ${window.App.formatINR(cust.current_balance)}`;
        dueBadge.style.display = 'inline-block';
      } else {
        dueBadge.style.display = 'none';
      }
    }

    const dropdown = document.getElementById('bill-customer-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  },

  clearProductBar() {
    this.selectedProduct = null;
    document.getElementById('bill-product-search').value = '';
    document.getElementById('bill-selected-prod-id').value = '';
    document.getElementById('bill-item-qty').value = '1';
    document.getElementById('bill-item-rate').value = '0.00';
    document.getElementById('bill-item-disc').value = '0.00';
    document.getElementById('bill-item-gst').value = '18%';

    const stockBadge = document.getElementById('selected-prod-stock-badge');
    if (stockBadge) stockBadge.style.display = 'none';

    const dropdown = document.getElementById('bill-product-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  },

  bindEvents() {
    // -------------------------------------------------------------
    // Customer Autocomplete Search
    // -------------------------------------------------------------
    let custTimeout = null;
    const custSearch = document.getElementById('bill-customer-search');
    const custDropdown = document.getElementById('bill-customer-dropdown');

    if (custSearch) {
      custSearch.addEventListener('input', () => {
        clearTimeout(custTimeout);
        custTimeout = setTimeout(async () => {
          const q = custSearch.value.trim();
          if (q.length === 0) {
            custDropdown.style.display = 'none';
            return;
          }

          const list = await window.api.customers.search(q);
          if (!list || list.length === 0) {
            custDropdown.innerHTML = '<div style="padding: 8px; color: var(--text-dim); font-size: 11px;">வாடிக்கையாளர் கிடைக்கவில்லை</div>';
            custDropdown.style.display = 'block';
            return;
          }

          let html = '';
          list.forEach(c => {
            html += `
              <div class="cust-drop-item" data-id="${c.id}" style="padding: 8px 10px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div style="font-weight: 600; color: #fff;">${c.name}</div>
                <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between;">
                  <span>${c.phone || '-'} | ${c.village || '-'}</span>
                  ${(c.current_balance || 0) > 0 ? `<span style="color: var(--danger);">பாக்கி: ${window.App.formatINR(c.current_balance)}</span>` : ''}
                </div>
              </div>
            `;
          });

          custDropdown.innerHTML = html;
          custDropdown.style.display = 'block';

          custDropdown.querySelectorAll('.cust-drop-item').forEach(el => {
            el.addEventListener('click', () => {
              const id = Number(el.getAttribute('data-id'));
              const selected = list.find(x => x.id === id);
              if (selected) {
                this.setCustomer(selected);
              }
            });
          });
        }, 150);
      });

      // Clear customer selection if cleared
      custSearch.addEventListener('blur', () => {
        setTimeout(() => {
          if (custDropdown) custDropdown.style.display = 'none';
        }, 200);
      });
    }

    // -------------------------------------------------------------
    // Product Autocomplete Search
    // -------------------------------------------------------------
    let prodTimeout = null;
    const prodSearch = document.getElementById('bill-product-search');
    const prodDropdown = document.getElementById('bill-product-dropdown');

    if (prodSearch) {
      prodSearch.addEventListener('input', () => {
        clearTimeout(prodTimeout);
        prodTimeout = setTimeout(async () => {
          const q = prodSearch.value.trim();
          if (q.length === 0) {
            prodDropdown.style.display = 'none';
            return;
          }

          const results = await window.api.products.search({ query: q, onlyActive: true });
          if (!results || results.length === 0) {
            prodDropdown.innerHTML = '<div style="padding: 10px; color: var(--text-dim); font-size: 11px;">பொருட்கள் எதுவும் கிடைக்கவில்லை</div>';
            prodDropdown.style.display = 'block';
            return;
          }

          let html = '';
          results.forEach(p => {
            const isLow = p.current_stock <= p.reorder_level;
            const stockColor = isLow ? 'var(--danger)' : 'var(--primary)';
            const displayName = p.tamil_name ? `${p.tamil_name} (${p.name})` : p.name;

            html += `
              <div class="prod-drop-item" data-id="${p.id}" style="padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 600; color: #fff; font-size: 13px;">${displayName}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">
                    அளவு: ${p.size || '-'} | GST: ${p.gst_rate}% | HSN: ${p.hsn_code || '-'}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-family: var(--font-mono); font-weight: 700; color: #fff;">${window.App.formatINR(p.selling_price)}</div>
                  <div style="font-size: 11px; color: ${stockColor};">இருப்பு: ${p.current_stock} ${p.unit}</div>
                </div>
              </div>
            `;
          });

          prodDropdown.innerHTML = html;
          prodDropdown.style.display = 'block';

          prodDropdown.querySelectorAll('.prod-drop-item').forEach(el => {
            el.addEventListener('click', () => {
              const id = Number(el.getAttribute('data-id'));
              const selected = results.find(x => x.id === id);
              if (selected) {
                this.selectProduct(selected);
              }
            });
          });
        }, 120);
      });

      // Pressing Enter on Product Search if exact match or single result
      prodSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const firstItem = prodDropdown.querySelector('.prod-drop-item');
          if (firstItem) {
            firstItem.click();
          }
        }
      });
    }

    // -------------------------------------------------------------
    // Add Item Inputs (Enter key adds item)
    // -------------------------------------------------------------
    const qtyInput = document.getElementById('bill-item-qty');
    const rateInput = document.getElementById('bill-item-rate');
    const discInput = document.getElementById('bill-item-disc');
    const btnAdd = document.getElementById('btn-add-bill-item');

    const handleAdd = () => this.addLineItem();

    if (btnAdd) btnAdd.addEventListener('click', handleAdd);

    [qtyInput, rateInput, discInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        });
      }
    });

    // -------------------------------------------------------------
    // Payment Mode & Paid Amount calculations
    // -------------------------------------------------------------
    const payMode = document.getElementById('bill-payment-mode');
    const paidInput = document.getElementById('bill-paid-amount');

    if (payMode) {
      payMode.addEventListener('change', () => {
        if (payMode.value === 'credit') {
          // If customer is walk-in (ID 1), warn that credit requires registered farmer account
          if (this.selectedCustomer.id === 1) {
            window.App.showToast('எச்சரிக்கை: பொது வாடிக்கையாளருக்கு கடன் வழங்க முடியாது! தயவுசெய்து விவசாயி பெயரை தேர்வு செய்யவும்.', 'error');
            payMode.value = 'cash';
            return;
          }
          paidInput.value = '0.00';
        } else {
          // Cash, UPI, Card defaults to grand total
          paidInput.value = this.getGrandTotalValue().toFixed(2);
        }
        this.recalculateDue();
      });
    }

    if (paidInput) {
      paidInput.addEventListener('input', () => this.recalculateDue());
    }

    // -------------------------------------------------------------
    // Printer Option Toggles
    // -------------------------------------------------------------
    const optA4 = document.getElementById('bill-print-opt-a4');
    const optThermal = document.getElementById('bill-print-opt-thermal');

    if (optA4 && optThermal) {
      optA4.addEventListener('click', () => this.setPrinterChoice('A4'));
      optThermal.addEventListener('click', () => this.setPrinterChoice('thermal'));
    }

    // -------------------------------------------------------------
    // Action Buttons
    // -------------------------------------------------------------
    const btnSavePrint = document.getElementById('btn-save-print-bill');
    if (btnSavePrint) {
      btnSavePrint.addEventListener('click', () => this.saveAndPrint());
    }

    const btnSave = document.getElementById('btn-save-bill');
    if (btnSave) {
      btnSave.addEventListener('click', () => this.saveBill(false));
    }

    const btnReset = document.getElementById('btn-reset-bill');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('பில்லை முழுமையாக அழிக்க விரும்புகிறீர்களா? (Clear bill?)')) {
          this.resetBill();
        }
      });
    }
  },

  setPrinterChoice(type) {
    this.printerType = type;
    const optA4 = document.getElementById('bill-print-opt-a4');
    const optThermal = document.getElementById('bill-print-opt-thermal');

    if (type === 'thermal') {
      optA4.classList.remove('selected');
      optThermal.classList.add('selected');
    } else {
      optThermal.classList.remove('selected');
      optA4.classList.add('selected');
    }
  },

  selectProduct(p) {
    this.selectedProduct = p;
    document.getElementById('bill-selected-prod-id').value = p.id;
    document.getElementById('bill-product-search').value = p.tamil_name ? `${p.tamil_name} (${p.name})` : p.name;
    document.getElementById('bill-item-rate').value = Number(p.selling_price).toFixed(2);
    document.getElementById('bill-item-gst').value = `${p.gst_rate}%`;

    const stockBadge = document.getElementById('selected-prod-stock-badge');
    if (stockBadge) {
      stockBadge.textContent = `இருப்பு: ${p.current_stock} ${p.unit}`;
      stockBadge.className = p.current_stock <= p.reorder_level ? 'badge badge-danger' : 'badge badge-success';
      stockBadge.style.display = 'inline-block';
    }

    document.getElementById('bill-product-dropdown').style.display = 'none';

    // Focus Qty input for fast touch
    const qtyInput = document.getElementById('bill-item-qty');
    if (qtyInput) {
      qtyInput.focus();
      qtyInput.select();
    }
  },

  addLineItem() {
    if (!this.selectedProduct) {
      window.App.showToast('பொருளை முதலில் தேர்ந்தெடுக்கவும்! (Select a product first)', 'error');
      document.getElementById('bill-product-search').focus();
      return;
    }

    const p = this.selectedProduct;
    const qty = Number(document.getElementById('bill-item-qty').value) || 0;
    const rate = Number(document.getElementById('bill-item-rate').value) || 0;
    const discount = Number(document.getElementById('bill-item-disc').value) || 0;

    if (qty <= 0) {
      window.App.showToast('அளவு 0-ஐ விட அதிகமாக இருக்க வேண்டும்!', 'error');
      document.getElementById('bill-item-qty').focus();
      return;
    }

    // Check stock warning / override
    if (qty > p.current_stock) {
      const confirmed = confirm(
        `⚠️ இருப்பு எச்சரிக்கை!\n\n${p.name} - நடப்பு இருப்பு: ${p.current_stock} ${p.unit}.\nநீங்கள் கோரிய அளவு: ${qty} ${p.unit}.\n\nஇருப்பை மீறி விற்பனை செய்ய விரும்புகிறீர்களா? (Override stock and proceed?)`
      );
      if (!confirmed) return;
    }

    // Calculate line GST
    const gross = qty * rate;
    const taxable = Math.max(gross - discount, 0);
    const gstRate = Number(p.gst_rate) || 0;
    const cgst = (taxable * (gstRate / 2)) / 100;
    const sgst = (taxable * (gstRate / 2)) / 100;
    const amount = taxable + cgst + sgst;

    // Check if product already exists in line items
    const existingIndex = this.lineItems.findIndex(x => x.product_id === p.id);
    if (existingIndex >= 0) {
      this.lineItems[existingIndex] = {
        product_id: p.id,
        name: p.name,
        tamil_name: p.tamil_name || '',
        size: p.size || '',
        unit: p.unit || 'NOS',
        hsn_code: p.hsn_code || '',
        qty,
        rate,
        discount,
        gst_rate: gstRate,
        taxable,
        cgst,
        sgst,
        amount
      };
    } else {
      this.lineItems.push({
        product_id: p.id,
        name: p.name,
        tamil_name: p.tamil_name || '',
        size: p.size || '',
        unit: p.unit || 'NOS',
        hsn_code: p.hsn_code || '',
        qty,
        rate,
        discount,
        gst_rate: gstRate,
        taxable,
        cgst,
        sgst,
        amount
      });
    }

    this.renderTable();
    this.recalculateTotals();
    this.clearProductBar();

    // Focus back on product search for continuous counter billing
    document.getElementById('bill-product-search').focus();
  },

  removeLineItem(index) {
    this.lineItems.splice(index, 1);
    this.renderTable();
    this.recalculateTotals();
  },

  renderTable() {
    const tbody = document.getElementById('bill-items-tbody');
    if (!tbody) return;

    if (this.lineItems.length === 0) {
      tbody.innerHTML = `
        <tr id="bill-empty-row">
          <td colspan="12" style="text-align: center; color: var(--text-dim); padding: 40px;">
            பில்லில் பொருட்கள் எதுவும் சேர்க்கப்படவில்லை.<br>
            <span style="font-size: 11px;">[F4] அழுத்தி மருந்துகள் / விதைகளை எளிதாக சேர்க்கலாம்.</span>
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    this.lineItems.forEach((item, index) => {
      const displayName = item.tamil_name ? `${item.tamil_name} (${item.name})` : item.name;

      html += `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${displayName}</strong></td>
          <td>${item.size || '-'}</td>
          <td><code style="font-size: 10px;">${item.hsn_code || '-'}</code></td>
          <td style="text-align: right; font-weight: 700;">${item.qty} ${item.unit}</td>
          <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(item.rate)}</td>
          <td style="text-align: right; font-family: var(--font-mono);">${item.discount > 0 ? window.App.formatINR(item.discount) : '-'}</td>
          <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(item.taxable)}</td>
          <td style="text-align: right; font-family: var(--font-mono); font-size: 11px;">${window.App.formatINR(item.cgst)}</td>
          <td style="text-align: right; font-family: var(--font-mono); font-size: 11px;">${window.App.formatINR(item.sgst)}</td>
          <td style="text-align: right; font-family: var(--font-mono); font-weight: 700; color: #fff;">${window.App.formatINR(item.amount)}</td>
          <td style="text-align: center;">
            <button class="btn btn-outline btn-delete-item" data-index="${index}" style="padding: 2px 6px; color: var(--danger); border-color: transparent;">
              🗑️
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Attach delete handlers
    tbody.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'));
        this.removeLineItem(idx);
      });
    });
  },

  recalculateTotals() {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;

    for (const item of this.lineItems) {
      subtotal += item.taxable;
      cgst += item.cgst;
      sgst += item.sgst;
    }

    const exactTotal = subtotal + cgst + sgst;
    const roundedTotal = Math.round(exactTotal);
    const roundOff = roundedTotal - exactTotal;

    document.getElementById('bill-subtotal').textContent = window.App.formatINR(subtotal);
    document.getElementById('bill-cgst').textContent = window.App.formatINR(cgst);
    document.getElementById('bill-sgst').textContent = window.App.formatINR(sgst);
    document.getElementById('bill-round-off').textContent = (roundOff >= 0 ? '+' : '') + roundOff.toFixed(2);
    document.getElementById('bill-grand-total').textContent = window.App.formatINR(roundedTotal);

    // Number to words in Indian Rupees
    const words = this.numberToIndianWords(roundedTotal);
    document.getElementById('bill-total-words').textContent = words ? `${words} மட்டும் (Rupees Only)` : 'பூஜ்ஜியம் ரூபாய் மட்டும்';

    // Auto-update paid amount if not in credit mode
    const payMode = document.getElementById('bill-payment-mode').value;
    const paidInput = document.getElementById('bill-paid-amount');
    if (payMode !== 'credit') {
      paidInput.value = roundedTotal.toFixed(2);
    }
    this.recalculateDue();
  },

  getGrandTotalValue() {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    for (const item of this.lineItems) {
      subtotal += item.taxable;
      cgst += item.cgst;
      sgst += item.sgst;
    }
    return Math.round(subtotal + cgst + sgst);
  },

  recalculateDue() {
    const total = this.getGrandTotalValue();
    const paid = Number(document.getElementById('bill-paid-amount').value) || 0;
    const due = Math.max(total - paid, 0);

    const dueEl = document.getElementById('bill-due-amount');
    if (dueEl) {
      dueEl.textContent = window.App.formatINR(due);
      dueEl.style.color = due > 0 ? 'var(--danger)' : 'var(--primary)';
    }
  },

  async saveAndPrint() {
    await this.saveBill(true);
  },

  async saveBill(shouldPrint = false) {
    if (this.lineItems.length === 0) {
      window.App.showToast('பில்லில் குறைந்தபட்சம் ஒரு பொருள் இருக்க வேண்டும்! (Add at least one item)', 'error');
      return;
    }

    const subtotal = this.lineItems.reduce((s, i) => s + i.taxable, 0);
    const cgst = this.lineItems.reduce((s, i) => s + i.cgst, 0);
    const sgst = this.lineItems.reduce((s, i) => s + i.sgst, 0);
    const exactTotal = subtotal + cgst + sgst;
    const total = Math.round(exactTotal);
    const roundOff = total - exactTotal;

    const paid = Number(document.getElementById('bill-paid-amount').value) || 0;
    const due = Math.max(total - paid, 0);
    const paymentMode = document.getElementById('bill-payment-mode').value;
    const notes = document.getElementById('bill-notes').value.trim();
    const date = document.getElementById('bill-date').value;

    // Check credit validation
    if (due > 0 && this.selectedCustomer.id === 1) {
      window.App.showToast('பொது வாடிக்கையாளருக்கு கடன் பில் போட முடியாது! தயவுசெய்து விவசாயி பெயரை தேர்வு செய்யவும்.', 'error');
      return;
    }

    const billData = {
      bill_no: this.currentBillNo,
      customer_id: this.selectedCustomer.id,
      date,
      subtotal,
      cgst,
      sgst,
      round_off: roundOff,
      total,
      paid,
      due,
      payment_mode: paymentMode,
      notes
    };

    try {
      const savedBill = await window.api.billing.create(billData, this.lineItems);
      window.App.showToast(`பில் எண் ${savedBill.bill_no} வெற்றிகரமாக சேமிக்கப்பட்டது!`, 'success');

      // Trigger Print if requested
      if (shouldPrint) {
        await this.printBill(savedBill, this.printerType);
      }

      // Reset bill for next customer
      await this.resetBill();

      // Refresh Dashboard stats in background
      if (window.Dashboard) {
        window.Dashboard.load();
      }
    } catch (err) {
      console.error('Bill save error:', err);
      window.App.showToast('பில் சேமிப்பதில் பிழை: ' + err.message, 'error');
    }
  },

  /**
   * Print Invoice Generator (A4 Standard GST or 80mm Thermal Receipt)
   */
  async printBill(bill, printerType = 'A4') {
    const shop = window.App.shopSettings || (await window.api.settings.get());
    const isThermal = printerType === 'thermal';

    let printHtml = '';
    if (isThermal) {
      printHtml = this.generateThermalHtml(bill, shop);
    } else {
      printHtml = this.generateA4Html(bill, shop);
    }

    try {
      await window.api.print.printInvoice({
        htmlContent: printHtml,
        printerType,
        silent: false
      });
    } catch (err) {
      console.error('Print failed:', err);
      window.App.showToast('பிரிண்ட் செய்வதில் பிழை: ' + err.message, 'error');
    }
  },

  generateA4Html(bill, shop) {
    const items = bill.items || this.lineItems;
    const totalWords = this.numberToIndianWords(bill.total);

    // Group items by GST rate for tax summary slab table
    const rateMap = {};
    items.forEach(i => {
      const r = i.gst_rate;
      if (!rateMap[r]) {
        rateMap[r] = { taxable: 0, cgst: 0, sgst: 0, totalTax: 0 };
      }
      rateMap[r].taxable += i.taxable;
      rateMap[r].cgst += i.cgst;
      rateMap[r].sgst += i.sgst;
      rateMap[r].totalTax += (i.cgst + i.sgst);
    });

    let itemsHtml = '';
    items.forEach((item, index) => {
      const pName = item.product_tamil_name || item.tamil_name || item.product_name || item.name;
      const engSub = (item.product_name || item.name) !== pName ? `<div style="font-size: 9px; color: #444;">${item.product_name || item.name}</div>` : '';

      itemsHtml += `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td><strong>${pName}</strong>${engSub}</td>
          <td style="text-align: center;">${item.size || '-'}</td>
          <td style="text-align: center;">${item.hsn_code || '-'}</td>
          <td style="text-align: right; font-weight: bold;">${item.qty} ${item.unit || ''}</td>
          <td style="text-align: right;">${item.rate.toFixed(2)}</td>
          <td style="text-align: right;">${item.discount > 0 ? item.discount.toFixed(2) : '-'}</td>
          <td style="text-align: right;">${item.taxable.toFixed(2)}</td>
          <td style="text-align: right;">${item.cgst.toFixed(2)} (${(item.gst_rate / 2)}%)</td>
          <td style="text-align: right;">${item.sgst.toFixed(2)} (${(item.gst_rate / 2)}%)</td>
          <td style="text-align: right; font-weight: bold;">${item.amount.toFixed(2)}</td>
        </tr>
      `;
    });

    let taxSlabHtml = '';
    Object.keys(rateMap).sort((a,b)=>Number(a)-Number(b)).forEach(rate => {
      const data = rateMap[rate];
      taxSlabHtml += `
        <tr>
          <td>GST ${rate}%</td>
          <td>₹${data.taxable.toFixed(2)}</td>
          <td>₹${data.cgst.toFixed(2)} (${(rate/2)}%)</td>
          <td>₹${data.sgst.toFixed(2)} (${(rate/2)}%)</td>
          <td style="font-weight: bold;">₹${data.totalTax.toFixed(2)}</td>
        </tr>
      `;
    });

    return `
      <div class="a4-invoice">
        <div class="a4-header">
          <div class="a4-shop-title">${shop.shop_name}</div>
          <div class="a4-shop-tagline">${shop.tagline || ''}</div>
          <div class="a4-shop-address">${shop.address || ''}</div>
          <div style="font-weight: bold; margin-top: 3px;">
            GSTIN: ${shop.gstin || '-'} | போன்: ${shop.phone || '-'}
          </div>
          <div style="margin-top: 4px; font-weight: bold; font-size: 13px; text-decoration: underline;">
            வரி விலைப்பட்டியல் (TAX INVOICE)
          </div>
        </div>

        <div class="a4-meta-row">
          <div class="a4-meta-left">
            <div class="a4-meta-item"><span class="a4-meta-label">பில் எண் (Invoice No):</span> <strong>${bill.bill_no}</strong></div>
            <div class="a4-meta-item"><span class="a4-meta-label">தேதி (Date):</span> <strong>${bill.date}</strong></div>
            <div class="a4-meta-item"><span class="a4-meta-label">செலுத்தும் முறை:</span> ${bill.payment_mode.toUpperCase()}</div>
          </div>
          <div class="a4-meta-right">
            <div class="a4-meta-item"><span class="a4-meta-label">வாடிக்கையாளர்:</span> <strong>${bill.customer_name || this.selectedCustomer.name}</strong></div>
            <div class="a4-meta-item"><span class="a4-meta-label">தொலைபேசி:</span> ${bill.customer_phone || this.selectedCustomer.phone || '-'}</div>
            <div class="a4-meta-item"><span class="a4-meta-label">கிராமம் / முகவரி:</span> ${bill.customer_address || this.selectedCustomer.village || '-'}</div>
            ${this.selectedCustomer.gstin ? `<div class="a4-meta-item"><span class="a4-meta-label">GSTIN:</span> ${this.selectedCustomer.gstin}</div>` : ''}
          </div>
        </div>

        <table class="a4-items-table">
          <thead>
            <tr>
              <th style="width: 25px;">வ.எண்</th>
              <th>மருந்து / விதை பெயர்</th>
              <th style="width: 50px;">அளவு</th>
              <th style="width: 45px;">HSN</th>
              <th style="width: 50px;">எண்ணிக்கை</th>
              <th style="width: 55px;">விலை ₹</th>
              <th style="width: 45px;">தள்ளுபடி</th>
              <th style="width: 65px;">வரி மதிப்பு ₹</th>
              <th style="width: 65px;">CGST</th>
              <th style="width: 65px;">SGST</th>
              <th style="width: 70px;">மொத்தம் ₹</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="a4-totals-row">
          <div class="a4-words-box">
            <div style="font-weight: bold; margin-bottom: 4px;">தொகை எழுத்தால் (Amount in Words):</div>
            <div style="font-size: 11px; font-weight: 600;">${totalWords} மட்டும் (Rupees Only)</div>
            ${bill.notes ? `<div style="margin-top: 8px; font-size: 10px; color: #555;">குறிப்பு: ${bill.notes}</div>` : ''}
          </div>

          <div class="a4-calc-box">
            <div class="a4-calc-line"><span>வரிக்குரிய மதிப்பு (Taxable):</span> <span>₹${bill.subtotal.toFixed(2)}</span></div>
            <div class="a4-calc-line"><span>CGST மத்திய வரி:</span> <span>₹${bill.cgst.toFixed(2)}</span></div>
            <div class="a4-calc-line"><span>SGST மாநில வரி:</span> <span>₹${bill.sgst.toFixed(2)}</span></div>
            <div class="a4-calc-line"><span>சில்லறை மாற்றம் (Round-off):</span> <span>${(bill.round_off >= 0 ? '+' : '') + bill.round_off.toFixed(2)}</span></div>
            <div class="a4-grand-total-line">
              <span>நிகர மொத்தம் (Grand Total):</span>
              <span>₹${bill.total.toFixed(2)}</span>
            </div>
            <div class="a4-calc-line" style="margin-top: 4px; font-size: 10px; color: #333;">
              <span>செலுத்தியது (Paid): ₹${bill.paid.toFixed(2)}</span>
              ${bill.due > 0 ? `<span style="font-weight: bold; color: #b91c1c;">பாக்கி (Due): ₹${bill.due.toFixed(2)}</span>` : '<span style="color: #047857;">முழுவதும் செலுத்தப்பட்டது</span>'}
            </div>
          </div>
        </div>

        <div class="a4-tax-summary">
          <div style="font-weight: bold; font-size: 10px; margin-bottom: 4px;">வரி விவர அட்டவணை (Tax Slab Summary):</div>
          <table class="a4-tax-table">
            <thead>
              <tr style="background: #f1f5f9;">
                <th>வரி விகிதம்</th>
                <th>வரிக்குரிய தொகை</th>
                <th>மத்திய வரி (CGST)</th>
                <th>மாநில வரி (SGST)</th>
                <th>மொத்த வரி தொகை</th>
              </tr>
            </thead>
            <tbody>
              ${taxSlabHtml}
            </tbody>
          </table>
        </div>

        <div class="a4-footer">
          <div class="a4-terms">
            <div>விதிமுறைகள்:</div>
            <div>1. விற்கப்பட்ட பொருட்கள் திரும்ப பெறப்பட மாட்டாது.</div>
            <div>2. தரம் மற்றும் முளைப்புத்திறனுக்கு உற்பத்தி நிறுவனமே பொறுப்பு.</div>
            <div style="margin-top: 6px; font-style: italic;">நன்றி! மீண்டும் வருக! (Thank you, Visit Again!)</div>
          </div>
          <div class="a4-sign">
            ${shop.shop_name} சார்பாக<br>
            அங்கீகரிக்கப்பட்ட கையொப்பம்
          </div>
        </div>
      </div>
    `;
  },

  generateThermalHtml(bill, shop) {
    const items = bill.items || this.lineItems;

    let itemsHtml = '';
    items.forEach((item, index) => {
      const pName = (item.product_tamil_name || item.tamil_name || item.product_name || item.name).substring(0, 22);
      itemsHtml += `
        <tr>
          <td colspan="3"><strong>${index + 1}. ${pName} (${item.size || ''})</strong></td>
        </tr>
        <tr>
          <td>${item.qty} ${item.unit || ''} x ₹${item.rate.toFixed(2)}</td>
          <td style="text-align: center;">${item.gst_rate}%</td>
          <td style="text-align: right; font-weight: bold;">₹${item.amount.toFixed(2)}</td>
        </tr>
      `;
    });

    return `
      <div class="thermal-receipt">
        <div class="thermal-center">
          <div class="thermal-title">${shop.shop_name}</div>
          <div class="thermal-sub">${shop.tagline || ''}</div>
          <div class="thermal-sub">${shop.address || ''}</div>
          <div class="thermal-sub">GSTIN: ${shop.gstin || '-'} | Ph: ${shop.phone || '-'}</div>
          <div class="thermal-divider"></div>
          <div style="font-weight: bold;">வரி விலைப்பட்டியல் (TAX INVOICE)</div>
        </div>

        <div class="thermal-divider"></div>
        <div class="thermal-row"><span>பில்: <strong>${bill.bill_no}</strong></span> <span>தேதி: ${bill.date}</span></div>
        <div class="thermal-row"><span>வாடிக்கையாளர்:</span> <strong>${bill.customer_name || this.selectedCustomer.name}</strong></div>
        ${this.selectedCustomer.phone ? `<div class="thermal-row"><span>போன்:</span> <span>${this.selectedCustomer.phone}</span></div>` : ''}
        <div class="thermal-divider"></div>

        <table class="thermal-table">
          <thead>
            <tr>
              <th>பொருள் / அளவு x விலை</th>
              <th style="text-align: center;">வரி</th>
              <th style="text-align: right;">தொகை</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="thermal-divider"></div>
        <div class="thermal-row"><span>வரிக்குரியது (Taxable):</span> <span>₹${bill.subtotal.toFixed(2)}</span></div>
        <div class="thermal-row"><span>CGST:</span> <span>₹${bill.cgst.toFixed(2)}</span></div>
        <div class="thermal-row"><span>SGST:</span> <span>₹${bill.sgst.toFixed(2)}</span></div>
        <div class="thermal-row"><span>சில்லறை மாற்றம்:</span> <span>${(bill.round_off >= 0 ? '+' : '') + bill.round_off.toFixed(2)}</span></div>
        <div class="thermal-divider-double"></div>
        <div class="thermal-row thermal-total">
          <span>நிகர மொத்தம்:</span>
          <span>₹${bill.total.toFixed(2)}</span>
        </div>
        <div class="thermal-divider-double"></div>
        <div class="thermal-row"><span>செலுத்தியது: ₹${bill.paid.toFixed(2)}</span> <span>முறை: ${bill.payment_mode.toUpperCase()}</span></div>
        ${bill.due > 0 ? `<div class="thermal-row" style="font-weight: bold;"><span>பாக்கி (Due):</span> <span>₹${bill.due.toFixed(2)}</span></div>` : ''}

        <div class="thermal-divider"></div>
        <div class="thermal-center" style="font-size: 10px; margin-top: 6px;">
          <div>சரக்கு திரும்ப பெறப்பட மாட்டாது.</div>
          <div style="font-weight: bold; margin-top: 4px;">நன்றி! மீண்டும் வருக!</div>
        </div>
      </div>
    `;
  },

  /**
   * Helper: Convert number to Indian currency words
   */
  numberToIndianWords(num) {
    const a = ['', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது', 'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதிமூன்று', 'பதினான்கு', 'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது'];
    const b = ['', '', 'இருபது', 'முப்பது', 'நாற்பது', 'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு'];

    const engA = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const engB = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    num = Math.floor(Number(num) || 0);
    if (num === 0) return 'Zero';

    function convertGroup(n) {
      let str = '';
      if (n >= 100) {
        str += engA[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += engB[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += engA[n] + ' ';
      }
      return str.trim();
    }

    let words = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;

    if (crore > 0) words += convertGroup(crore) + ' Crore ';
    if (lakh > 0) words += convertGroup(lakh) + ' Lakh ';
    if (thousand > 0) words += convertGroup(thousand) + ' Thousand ';
    if (num > 0) words += convertGroup(num);

    return words.trim();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.Billing.init();
});

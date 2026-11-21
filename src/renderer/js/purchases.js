/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - AGRI BILLING SOFTWARE
 * Purchases (Stock Inward) View Controller
 * File: src/renderer/js/purchases.js
 * ============================================================================
 */

window.Purchases = {
  purchasesList: [],
  suppliersList: [],
  inwardLineItems: [],
  selectedInwardProduct: null,

  init() {
    this.bindEvents();
  },

  async load() {
    try {
      const searchVal = document.getElementById('purchase-search-input').value.trim();
      const start = document.getElementById('purchase-filter-start').value || null;
      const end = document.getElementById('purchase-filter-end').value || null;

      const list = await window.api.purchases.getList({ startDate: start, endDate: end });
      let filtered = list || [];

      if (searchVal.length > 0) {
        const q = searchVal.toLowerCase();
        filtered = filtered.filter(p =>
          (p.bill_no && p.bill_no.toLowerCase().includes(q)) ||
          (p.supplier_name && p.supplier_name.toLowerCase().includes(q))
        );
      }

      this.purchasesList = filtered;
      this.renderTable(filtered);
    } catch (err) {
      console.error('Failed to load purchases:', err);
      window.App.showToast('கொள்முதல் பட்டியலை ஏற்றுவதில் பிழை: ' + err.message, 'error');
    }
  },

  renderTable(purchases) {
    const tbody = document.getElementById('purchases-tbody');
    const badge = document.getElementById('purchases-count-badge');
    if (!tbody) return;

    if (badge) badge.textContent = `${purchases.length} பதிவுகள்`;

    if (!purchases || purchases.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; color: var(--text-dim); padding: 30px;">
            கொள்முதல் பதிவுகள் எதுவும் இல்லை (No purchases recorded)
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    purchases.forEach((p, index) => {
      const isDue = (p.due || 0) > 0;
      const dueBadge = isDue
        ? `<span class="badge badge-danger" style="font-family: var(--font-mono);">${window.App.formatINR(p.due)}</span>`
        : `<span class="badge badge-success" style="font-family: var(--font-mono);">₹0.00</span>`;

      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${p.date}</td>
          <td><strong style="font-family: var(--font-mono);">${p.bill_no}</strong></td>
          <td><strong>${p.supplier_name || '-'}</strong></td>
          <td><span style="font-family: var(--font-mono);">${p.supplier_phone || '-'}</span></td>
          <td style="text-align: right; font-family: var(--font-mono); font-weight: 700; color: var(--primary);">
            ${window.App.formatINR(p.total)}
          </td>
          <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(p.paid)}</td>
          <td style="text-align: right;">${dueBadge}</td>
          <td><span style="font-size: 11px; color: var(--text-muted);">${p.notes || '-'}</span></td>
          <td style="text-align: center;">
            <button class="btn btn-outline btn-view-purchase" data-id="${p.id}" style="padding: 4px 8px; font-size: 11px;">
              👁️ பார்வை
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    tbody.querySelectorAll('.btn-view-purchase').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        this.openPurchaseDetailModal(id);
      });
    });
  },

  bindEvents() {
    // Search input
    const searchInp = document.getElementById('purchase-search-input');
    if (searchInp) {
      searchInp.addEventListener('input', () => this.load());
    }

    // Filter button
    const btnFilter = document.getElementById('btn-filter-purchases');
    if (btnFilter) {
      btnFilter.addEventListener('click', () => this.load());
    }

    // Open Suppliers Modal
    const btnSupp = document.getElementById('btn-open-suppliers-modal');
    if (btnSupp) {
      btnSupp.addEventListener('click', () => this.openSuppliersModal());
    }

    // Open Purchase Modal
    const btnPur = document.getElementById('btn-open-purchase-modal');
    if (btnPur) {
      btnPur.addEventListener('click', () => this.openPurchaseModal());
    }

    // Quick Add Supplier button in Purchase Modal
    const btnQuickSupp = document.getElementById('btn-quick-add-supplier');
    if (btnQuickSupp) {
      btnQuickSupp.addEventListener('click', () => {
        this.openSuppliersModal();
      });
    }

    // Save Supplier Form Submit
    const formAddSupp = document.getElementById('form-add-supplier');
    if (formAddSupp) {
      formAddSupp.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveSupplier();
      });
    }

    // Product Search inside Purchase Modal
    let purProdTimeout = null;
    const purProdSearch = document.getElementById('pur-prod-search');
    const purProdDropdown = document.getElementById('pur-prod-dropdown');

    if (purProdSearch) {
      purProdSearch.addEventListener('input', () => {
        clearTimeout(purProdTimeout);
        purProdTimeout = setTimeout(async () => {
          const q = purProdSearch.value.trim();
          if (q.length === 0) {
            purProdDropdown.style.display = 'none';
            return;
          }

          const results = await window.api.products.search({ query: q, onlyActive: false });
          if (!results || results.length === 0) {
            purProdDropdown.innerHTML = '<div style="padding: 8px; color: var(--text-dim); font-size: 11px;">பொருட்கள் கிடைக்கவில்லை</div>';
            purProdDropdown.style.display = 'block';
            return;
          }

          let html = '';
          results.forEach(p => {
            const displayName = p.tamil_name ? `${p.tamil_name} (${p.name})` : p.name;
            html += `
              <div class="pur-drop-item" data-id="${p.id}" style="padding: 8px 10px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; color: #fff;">${displayName}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${p.size || ''} | GST: ${p.gst_rate}%</div>
                </div>
                <div style="text-align: right; font-size: 11px; color: var(--text-dim);">
                  <div>விலை: ₹${p.purchase_price}</div>
                  <div>இருப்பு: ${p.current_stock}</div>
                </div>
              </div>
            `;
          });

          purProdDropdown.innerHTML = html;
          purProdDropdown.style.display = 'block';

          purProdDropdown.querySelectorAll('.pur-drop-item').forEach(el => {
            el.addEventListener('click', () => {
              const id = Number(el.getAttribute('data-id'));
              const selected = results.find(x => x.id === id);
              if (selected) {
                this.selectInwardProduct(selected);
              }
            });
          });
        }, 120);
      });
    }

    // Add Inward Item Button
    const btnAddInward = document.getElementById('btn-add-purchase-item');
    if (btnAddInward) {
      btnAddInward.addEventListener('click', () => this.addInwardItem());
    }

    // Paid amount input -> recalculate Due
    const paidInput = document.getElementById('pur-paid-amount');
    if (paidInput) {
      paidInput.addEventListener('input', () => this.recalculateInwardTotals());
    }

    // Save Purchase Button
    const btnSavePur = document.getElementById('btn-save-purchase');
    if (btnSavePur) {
      btnSavePur.addEventListener('click', () => this.savePurchase());
    }
  },

  selectInwardProduct(p) {
    this.selectedInwardProduct = p;
    document.getElementById('pur-selected-prod-id').value = p.id;
    document.getElementById('pur-prod-search').value = p.tamil_name ? `${p.tamil_name} (${p.name})` : p.name;
    document.getElementById('pur-item-rate').value = p.purchase_price || '0.00';
    document.getElementById('pur-item-gst').value = p.gst_rate || '18';
    document.getElementById('pur-prod-dropdown').style.display = 'none';

    document.getElementById('pur-item-qty').focus();
    document.getElementById('pur-item-qty').select();
  },

  addInwardItem() {
    if (!this.selectedInwardProduct) {
      window.App.showToast('பொருளை முதலில் தேர்ந்தெடுக்கவும்!', 'error');
      document.getElementById('pur-prod-search').focus();
      return;
    }

    const p = this.selectedInwardProduct;
    const qty = Number(document.getElementById('pur-item-qty').value) || 0;
    const rate = Number(document.getElementById('pur-item-rate').value) || 0;
    const gstRate = Number(document.getElementById('pur-item-gst').value) || 0;

    if (qty <= 0) {
      window.App.showToast('வரவு அளவு 0-ஐ விட அதிகமாக இருக்க வேண்டும்!', 'error');
      return;
    }

    const amount = qty * rate;

    this.inwardLineItems.push({
      product_id: p.id,
      name: p.name,
      tamil_name: p.tamil_name || '',
      size: p.size || '',
      unit: p.unit || 'NOS',
      qty,
      rate,
      gst_rate: gstRate,
      amount
    });

    this.renderInwardTable();
    this.recalculateInwardTotals();

    // Clear product inputs
    this.selectedInwardProduct = null;
    document.getElementById('pur-prod-search').value = '';
    document.getElementById('pur-selected-prod-id').value = '';
    document.getElementById('pur-item-qty').value = '10';
    document.getElementById('pur-item-rate').value = '0.00';
    document.getElementById('pur-prod-search').focus();
  },

  removeInwardItem(index) {
    this.inwardLineItems.splice(index, 1);
    this.renderInwardTable();
    this.recalculateInwardTotals();
  },

  renderInwardTable() {
    const tbody = document.getElementById('pur-items-tbody');
    if (!tbody) return;

    if (this.inwardLineItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-dim); padding: 25px;">
            பொருட்கள் எதுவும் சேர்க்கப்படவில்லை (Add inward products above)
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    this.inwardLineItems.forEach((item, index) => {
      const displayName = item.tamil_name ? `${item.tamil_name} (${item.name})` : item.name;
      html += `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${displayName}</strong></td>
          <td>${item.size || '-'}</td>
          <td style="text-align: right; font-weight: 700; color: var(--primary);">${item.qty} ${item.unit}</td>
          <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(item.rate)}</td>
          <td style="text-align: right;">${item.gst_rate}%</td>
          <td style="text-align: right; font-family: var(--font-mono); font-weight: 700;">${window.App.formatINR(item.amount)}</td>
          <td style="text-align: center;">
            <button class="btn btn-outline btn-del-inward" data-index="${index}" style="padding: 2px 6px; color: var(--danger); border-color: transparent;">
              🗑️
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    tbody.querySelectorAll('.btn-del-inward').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-index'));
        this.removeInwardItem(idx);
      });
    });
  },

  recalculateInwardTotals() {
    const total = this.inwardLineItems.reduce((sum, item) => sum + item.amount, 0);
    const paid = Number(document.getElementById('pur-paid-amount').value) || 0;
    const due = Math.max(total - paid, 0);

    document.getElementById('pur-total-display').value = window.App.formatINR(total);
    document.getElementById('pur-due-display').value = window.App.formatINR(due);
  },

  async openPurchaseModal() {
    this.inwardLineItems = [];
    this.selectedInwardProduct = null;
    this.renderInwardTable();

    document.getElementById('pur-bill-no').value = '';
    document.getElementById('pur-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('pur-paid-amount').value = '0.00';
    document.getElementById('pur-notes').value = '';
    document.getElementById('pur-total-display').value = '₹0.00';
    document.getElementById('pur-due-display').value = '₹0.00';

    await this.loadSuppliersDropdown();
    this.openModal('modal-purchase');
  },

  async loadSuppliersDropdown() {
    try {
      const suppliers = await window.api.purchases.getSuppliers();
      this.suppliersList = suppliers || [];

      const select = document.getElementById('pur-supplier-select');
      if (!select) return;

      select.innerHTML = '<option value="">சப்ளையரை தேர்வு செய்யவும்...</option>';
      this.suppliersList.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.name} (${s.phone || 'Ph: -'})</option>`;
      });
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  },

  async savePurchase() {
    const supplierId = document.getElementById('pur-supplier-select').value;
    const billNo = document.getElementById('pur-bill-no').value.trim();
    const date = document.getElementById('pur-date').value;
    const paid = Number(document.getElementById('pur-paid-amount').value) || 0;
    const notes = document.getElementById('pur-notes').value.trim();

    if (!supplierId) {
      window.App.showToast('சப்ளையரை தேர்வு செய்யவும்!', 'error');
      return;
    }

    if (!billNo) {
      window.App.showToast('சப்ளையர் பில் எண்ணை உள்ளிடவும்!', 'error');
      document.getElementById('pur-bill-no').focus();
      return;
    }

    if (this.inwardLineItems.length === 0) {
      window.App.showToast('குறைந்தது ஒரு பொருளாவது சேர்க்க வேண்டும்!', 'error');
      return;
    }

    const total = this.inwardLineItems.reduce((sum, item) => sum + item.amount, 0);
    const due = Math.max(total - paid, 0);

    const purchaseData = {
      supplier_id: Number(supplierId),
      bill_no: billNo,
      date,
      total,
      paid,
      due,
      notes
    };

    try {
      await window.api.purchases.create(purchaseData, this.inwardLineItems);
      window.App.showToast('சரக்கு கொள்முதல் வெற்றிகரமாக பதியப்பட்டு இருப்பு உயர்த்தப்பட்டது!', 'success');
      this.closeModal('modal-purchase');

      await this.load();

      // Refresh Products inventory view & Dashboard metrics
      if (window.Products) window.Products.load();
      if (window.Dashboard) window.Dashboard.load();
    } catch (err) {
      console.error('Save purchase error:', err);
      window.App.showToast('கொள்முதலை சேமிப்பதில் பிழை: ' + err.message, 'error');
    }
  },

  async openSuppliersModal() {
    await this.loadSuppliersTable();
    this.openModal('modal-suppliers');
  },

  async loadSuppliersTable() {
    try {
      const suppliers = await window.api.purchases.getSuppliers();
      const tbody = document.getElementById('suppliers-tbody');
      if (!tbody) return;

      if (!suppliers || suppliers.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-dim); padding: 20px;">
              சப்ளையர்கள் எதுவும் இல்லை (No suppliers found)
            </td>
          </tr>
        `;
        return;
      }

      let html = '';
      suppliers.forEach((s, idx) => {
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.phone || '-'}</td>
            <td><code>${s.gstin || '-'}</code></td>
            <td>${s.address || '-'}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  },

  async saveSupplier() {
    const getVal = (id) => document.getElementById(id).value.trim();
    const name = getVal('supp-name');
    const phone = getVal('supp-phone');
    const gstin = getVal('supp-gstin');
    const address = getVal('supp-address');

    if (!name) {
      window.App.showToast('சப்ளையர் பெயர் தேவை!', 'error');
      return;
    }

    try {
      await window.api.purchases.createSupplier({ name, phone, gstin, address });
      window.App.showToast('புதிய சப்ளையர் வெற்றிகரமாக சேர்க்கப்பட்டார்!', 'success');
      document.getElementById('form-add-supplier').reset();

      await this.loadSuppliersTable();
      await this.loadSuppliersDropdown();
    } catch (err) {
      console.error('Save supplier error:', err);
      window.App.showToast('சேமிப்பதில் பிழை: ' + err.message, 'error');
    }
  },

  async openPurchaseDetailModal(purchaseId) {
    try {
      const p = await window.api.purchases.getById(purchaseId);
      if (!p) return;

      document.getElementById('pur-detail-title').textContent = `📥 கொள்முதல் பில் #${p.bill_no}`;
      document.getElementById('pur-detail-supplier').textContent = p.supplier_name || 'தெரியாத சப்ளையர்';
      document.getElementById('pur-detail-meta').textContent =
        `தேதி: ${p.date} | தொலைபேசி: ${p.supplier_phone || '-'} | GSTIN: ${p.supplier_gstin || '-'}`;
      document.getElementById('pur-detail-total').textContent = window.App.formatINR(p.total);

      const tbody = document.getElementById('pur-detail-tbody');
      let html = '';
      (p.items || []).forEach((item, idx) => {
        const dName = item.product_tamil_name ? `${item.product_tamil_name} (${item.product_name})` : item.product_name;
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${dName}</strong></td>
            <td>${item.size || '-'}</td>
            <td style="text-align: right; font-weight: 700; color: var(--primary);">${item.qty} ${item.unit || ''}</td>
            <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(item.rate)}</td>
            <td style="text-align: right;">${item.gst_rate}%</td>
            <td style="text-align: right; font-family: var(--font-mono); font-weight: 700;">${window.App.formatINR(item.amount)}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;

      this.openModal('modal-purchase-detail');
    } catch (err) {
      console.error('Failed to load purchase details:', err);
      window.App.showToast('கொள்முதல் விவரங்களை பெறுவதில் பிழை: ' + err.message, 'error');
    }
  },

  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.Purchases.init();
});

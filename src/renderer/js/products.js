/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - AGRI BILLING SOFTWARE
 * Products & Stock Management View Controller
 * File: src/renderer/js/products.js
 * ============================================================================
 */

window.Products = {
  productsList: [],
  parsedCsvItems: [],

  init() {
    this.bindEvents();
  },

  async load() {
    try {
      const searchVal = document.getElementById('product-search-input').value.trim();
      const catVal = document.getElementById('product-category-filter').value;
      const lowStockVal = document.getElementById('product-low-stock-filter').checked;

      let products;
      if (searchVal.length > 0) {
        products = await window.api.products.search({
          query: searchVal,
          category: catVal || null,
          onlyActive: false
        });
        if (lowStockVal) {
          products = products.filter(p => p.current_stock <= p.reorder_level);
        }
      } else {
        products = await window.api.products.getAll({
          category: catVal || null,
          onlyLowStock: lowStockVal
        });
      }

      this.productsList = products || [];
      this.renderTable(this.productsList);
    } catch (err) {
      console.error('Failed to load products:', err);
      window.App.showToast('பொருட்கள் பட்டியலை ஏற்றுவதில் பிழை: ' + err.message, 'error');
    }
  },

  renderTable(products) {
    const tbody = document.getElementById('products-tbody');
    const badge = document.getElementById('products-count-badge');
    if (!tbody) return;

    if (badge) {
      badge.textContent = `${products.length} பொருட்கள்`;
    }

    if (!products || products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; color: var(--text-dim); padding: 30px;">
            பொருட்கள் எதுவும் கிடைக்கவில்லை (No matching products found)
          </td>
        </tr>
      `;
      return;
    }

    const catBadgeMap = {
      pesticide: '<span class="badge badge-success">பூச்சிமருந்து</span>',
      seed: '<span class="badge badge-warning">விதை</span>',
      fertilizer: '<span class="badge badge-info">உரம்</span>'
    };

    let html = '';
    products.forEach((p, index) => {
      const isLowStock = p.current_stock <= p.reorder_level;
      const stockBadge = isLowStock
        ? `<span class="badge badge-danger">⚠️ ${p.current_stock} ${p.unit}</span>`
        : `<span class="badge badge-success">${p.current_stock} ${p.unit}</span>`;

      const statusBadge = p.active
        ? '<span style="color: var(--primary); font-size: 11px;">● இயக்கத்தில்</span>'
        : '<span style="color: var(--text-dim); font-size: 11px;">○ முடக்கப்பட்டது</span>';

      const displayName = p.tamil_name
        ? `<strong>${p.tamil_name}</strong><div style="font-size: 11px; color: var(--text-muted);">${p.name}</div>`
        : `<strong>${p.name}</strong>`;

      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${displayName}</td>
          <td>${p.size || '-'}</td>
          <td>${catBadgeMap[p.category] || p.category}</td>
          <td><code style="font-size: 11px;">${p.hsn_code || '-'}</code></td>
          <td>${p.gst_rate}%</td>
          <td style="font-family: var(--font-mono);">${window.App.formatINR(p.purchase_price)}</td>
          <td style="font-family: var(--font-mono); font-weight: 600; color: #fff;">${window.App.formatINR(p.selling_price)}</td>
          <td>${stockBadge}</td>
          <td>${statusBadge}</td>
          <td style="text-align: center;">
            <button class="btn btn-outline btn-edit-product" data-id="${p.id}" style="padding: 4px 8px; font-size: 12px;">
              ✏️ திருத்து
            </button>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Attach edit button listeners
    tbody.querySelectorAll('.btn-edit-product').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        this.openEditModal(id);
      });
    });
  },

  bindEvents() {
    // Search with debounce
    let searchTimeout = null;
    const searchInput = document.getElementById('product-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.load(), 200);
      });
    }

    // Category filter
    const catFilter = document.getElementById('product-category-filter');
    if (catFilter) {
      catFilter.addEventListener('change', () => this.load());
    }

    // Low stock filter toggle
    const lowStockFilter = document.getElementById('product-low-stock-filter');
    if (lowStockFilter) {
      lowStockFilter.addEventListener('change', () => this.load());
    }

    // Open Add Product Modal
    const btnAdd = document.getElementById('btn-open-add-product-modal');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this.openAddModal());
    }

    // Category Change in Add/Edit Form -> Auto set default GST rate
    const prodCategory = document.getElementById('prod-category');
    if (prodCategory) {
      prodCategory.addEventListener('change', () => {
        const cat = prodCategory.value;
        const gstInput = document.getElementById('prod-gst-rate');
        const hsnInput = document.getElementById('prod-hsn');
        if (cat === 'pesticide') {
          gstInput.value = 18;
          if (!hsnInput.value) hsnInput.value = '3808';
        } else if (cat === 'seed') {
          gstInput.value = 0; // Exempt
          if (!hsnInput.value) hsnInput.value = '1209';
        } else if (cat === 'fertilizer') {
          gstInput.value = 5;
          if (!hsnInput.value) hsnInput.value = '3102';
        }
      });
    }

    // Product Form Submit
    const formProduct = document.getElementById('form-product');
    if (formProduct) {
      formProduct.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveProduct();
      });
    }

    // Bulk CSV Modal
    const btnCsvModal = document.getElementById('btn-open-csv-modal');
    if (btnCsvModal) {
      btnCsvModal.addEventListener('click', () => {
        this.openModal('modal-csv-import');
        document.getElementById('csv-file-input').value = '';
        document.getElementById('csv-preview-container').style.display = 'none';
        document.getElementById('btn-submit-csv-import').disabled = true;
        this.parsedCsvItems = [];
      });
    }

    // CSV File Chooser
    const csvFileInput = document.getElementById('csv-file-input');
    if (csvFileInput) {
      csvFileInput.addEventListener('change', (e) => this.handleCsvFile(e));
    }

    // CSV Submit Button
    const btnSubmitCsv = document.getElementById('btn-submit-csv-import');
    if (btnSubmitCsv) {
      btnSubmitCsv.addEventListener('click', async () => this.submitCsvImport());
    }

    // Global Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        if (modalId) this.closeModal(modalId);
      });
    });
  },

  openAddModal() {
    document.getElementById('form-product').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-product-title').textContent = 'புதிய பொருள் சேர்க்க (Add Product)';
    document.getElementById('group-opening-stock').style.display = 'block';
    
    // Set default category & GST
    document.getElementById('prod-category').value = 'pesticide';
    document.getElementById('prod-gst-rate').value = 18;
    document.getElementById('prod-hsn').value = '3808';
    document.getElementById('prod-active').checked = true;

    this.openModal('modal-product');
  },

  async openEditModal(productId) {
    try {
      const p = await window.api.products.getById(productId);
      if (!p) return;

      document.getElementById('form-product').reset();
      document.getElementById('prod-id').value = p.id;
      document.getElementById('modal-product-title').textContent = 'பொருளை திருத்த (Edit Product)';
      
      document.getElementById('prod-category').value = p.category;
      document.getElementById('prod-gst-rate').value = p.gst_rate;
      document.getElementById('prod-name').value = p.name;
      document.getElementById('prod-tamil-name').value = p.tamil_name || '';
      document.getElementById('prod-size').value = p.size || '';
      document.getElementById('prod-unit').value = p.unit || 'NOS';
      document.getElementById('prod-hsn').value = p.hsn_code || '';
      document.getElementById('prod-purchase-price').value = p.purchase_price;
      document.getElementById('prod-selling-price').value = p.selling_price;
      document.getElementById('prod-reorder-level').value = p.reorder_level;
      document.getElementById('prod-active').checked = Boolean(p.active);

      // Hide opening stock during edit (stock changes must occur via purchases, sales, or stock adjustments)
      document.getElementById('group-opening-stock').style.display = 'none';

      this.openModal('modal-product');
    } catch (err) {
      console.error('Failed to get product details:', err);
      window.App.showToast('பொருள் விவரங்களை பெறுவதில் பிழை: ' + err.message, 'error');
    }
  },

  async saveProduct() {
    const getVal = (id) => document.getElementById(id).value.trim();
    const id = document.getElementById('prod-id').value;

    const payload = {
      name: getVal('prod-name'),
      tamil_name: getVal('prod-tamil-name'),
      size: getVal('prod-size'),
      category: getVal('prod-category'),
      hsn_code: getVal('prod-hsn'),
      gst_rate: Number(getVal('prod-gst-rate')) || 0,
      purchase_price: Number(getVal('prod-purchase-price')) || 0,
      selling_price: Number(getVal('prod-selling-price')) || 0,
      unit: getVal('prod-unit'),
      reorder_level: Number(getVal('prod-reorder-level')) || 5,
      active: document.getElementById('prod-active').checked
    };

    try {
      if (id) {
        // Update
        await window.api.products.update(Number(id), payload);
        window.App.showToast('பொருள் விவரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!', 'success');
      } else {
        // Create (with opening stock)
        payload.opening_stock = Number(getVal('prod-opening-stock')) || 0;
        await window.api.products.create(payload);
        window.App.showToast('புதிய பொருள் வெற்றிகரமாக சேர்க்கப்பட்டது!', 'success');
      }

      this.closeModal('modal-product');
      await this.load();
    } catch (err) {
      console.error('Save product error:', err);
      window.App.showToast('சேமிப்பதில் பிழை: ' + err.message, 'error');
    }
  },

  /**
   * Handle CSV File Selection & Client-Side Parse
   */
  handleCsvFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const items = this.parseCsvText(text);
        this.parsedCsvItems = items;

        if (items.length === 0) {
          window.App.showToast('CSV கோப்பில் சரியான தரவுகள் எதுவும் இல்லை!', 'error');
          return;
        }

        // Render preview
        const previewContainer = document.getElementById('csv-preview-container');
        const previewCount = document.getElementById('csv-preview-count');
        const previewTbody = document.getElementById('csv-preview-tbody');
        const submitBtn = document.getElementById('btn-submit-csv-import');

        previewCount.textContent = items.length;
        let html = '';
        items.slice(0, 50).forEach(item => {
          html += `
            <tr>
              <td>${item.name}</td>
              <td>${item.tamil_name || '-'}</td>
              <td>${item.size || '-'}</td>
              <td>${item.category}</td>
              <td>₹${item.selling_price}</td>
              <td>${item.opening_stock} ${item.unit}</td>
            </tr>
          `;
        });

        previewTbody.innerHTML = html;
        previewContainer.style.display = 'block';
        submitBtn.disabled = false;
      } catch (err) {
        console.error('CSV parse error:', err);
        window.App.showToast('CSV கோப்பை வாசிப்பதில் பிழை: ' + err.message, 'error');
      }
    };
    reader.readAsText(file, 'utf-8');
  },

  parseCsvText(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const items = [];

    for (let i = 1; i < lines.length; i++) {
      // Split with quotes handling
      const tokens = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
      if (tokens.length < headers.length) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = tokens[idx];
      });

      if (!row.name || !row.category) continue;

      let cat = (row.category || '').toLowerCase();
      if (!['pesticide', 'seed', 'fertilizer'].includes(cat)) {
        cat = 'pesticide';
      }

      items.push({
        name: row.name,
        tamil_name: row.tamil_name || '',
        size: row.size || '',
        category: cat,
        hsn_code: row.hsn_code || '',
        gst_rate: Number(row.gst_rate) >= 0 ? Number(row.gst_rate) : (cat === 'pesticide' ? 18 : cat === 'fertilizer' ? 5 : 0),
        purchase_price: Number(row.purchase_price) || 0,
        selling_price: Number(row.selling_price) || 0,
        opening_stock: Number(row.opening_stock) || 0,
        unit: row.unit || 'NOS',
        reorder_level: Number(row.reorder_level) || 5,
        active: 1
      });
    }

    return items;
  },

  async submitCsvImport() {
    if (!this.parsedCsvItems || this.parsedCsvItems.length === 0) return;

    try {
      const res = await window.api.products.bulkImport(this.parsedCsvItems);
      window.App.showToast(`${res.importedCount} பொருட்கள் வெற்றிகரமாக இறக்குமதி செய்யப்பட்டன!`, 'success');
      this.closeModal('modal-csv-import');
      await this.load();
    } catch (err) {
      console.error('Import error:', err);
      window.App.showToast('இறக்குமதியில் பிழை: ' + err.message, 'error');
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
  window.Products.init();
});

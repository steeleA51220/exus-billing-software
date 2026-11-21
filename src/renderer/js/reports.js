/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - AGRI BILLING SOFTWARE
 * Reports & Agri Department Statutory Statements View Controller
 * File: src/renderer/js/reports.js
 * ============================================================================
 */

window.Reports = {
  currentTab: 'agri',
  cachedAgriStatement: null,

  init() {
    this.bindEvents();
    this.setDefaultDates();
  },

  load() {
    this.setDefaultDates();
    if (this.currentTab === 'agri') {
      this.loadAgriStatement();
    } else if (this.currentTab === 'daybook') {
      this.loadSalesDayBook();
    } else if (this.currentTab === 'gst') {
      this.loadGstSummary();
    } else if (this.currentTab === 'stock') {
      this.loadStockReport();
    } else if (this.currentTab === 'outstanding') {
      this.loadOutstandingReport();
    }
  },

  setDefaultDates() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // First day of current month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayStr = firstDay.toISOString().split('T')[0];

    const setIfEmpty = (id, val) => {
      const el = document.getElementById(id);
      if (el && !el.value) el.value = val;
    };

    // Agri Statement dates
    setIfEmpty('agri-start-date', firstDayStr);
    setIfEmpty('agri-end-date', todayStr);

    // Daybook dates
    setIfEmpty('daybook-start-date', firstDayStr);
    setIfEmpty('daybook-end-date', todayStr);

    // GST dates
    setIfEmpty('gst-start-date', firstDayStr);
    setIfEmpty('gst-end-date', todayStr);
  },

  bindEvents() {
    // Sub-tab Navigation
    document.querySelectorAll('.rpt-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Agri Statement View & Export
    const btnViewAgri = document.getElementById('btn-view-agri-stmt');
    if (btnViewAgri) {
      btnViewAgri.addEventListener('click', () => this.loadAgriStatement());
    }

    const btnExportAgri = document.getElementById('btn-export-agri-pdf');
    if (btnExportAgri) {
      btnExportAgri.addEventListener('click', () => this.exportAgriStatementPdf());
    }

    // 3 Category Quick Buttons
    document.querySelectorAll('.btn-agri-quick').forEach(btn => {
      btn.addEventListener('click', async () => {
        const cat = btn.getAttribute('data-cat');
        document.getElementById('agri-category-select').value = cat;
        await this.loadAgriStatement();
        await this.exportAgriStatementPdf();
      });
    });

    // Daybook Load
    const btnLoadDb = document.getElementById('btn-load-daybook');
    if (btnLoadDb) {
      btnLoadDb.addEventListener('click', () => this.loadSalesDayBook());
    }

    // GST Load
    const btnLoadGst = document.getElementById('btn-load-gst');
    if (btnLoadGst) {
      btnLoadGst.addEventListener('click', () => this.loadGstSummary());
    }

    // Stock Report Load & Filter
    const btnLoadStock = document.getElementById('btn-load-stock-report');
    if (btnLoadStock) {
      btnLoadStock.addEventListener('click', () => this.loadStockReport());
    }
    const stockCat = document.getElementById('stock-category-select');
    if (stockCat) {
      stockCat.addEventListener('change', () => this.loadStockReport());
    }
  },

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update buttons
    document.querySelectorAll('.rpt-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.className = 'btn btn-primary rpt-tab-btn';
      } else {
        btn.className = 'btn btn-outline rpt-tab-btn';
      }
    });

    // Update panes
    document.querySelectorAll('.rpt-tab-pane').forEach(pane => {
      pane.style.display = 'none';
      pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`pane-${tabName}`);
    if (targetPane) {
      targetPane.style.display = 'block';
      targetPane.classList.add('active');
    }

    this.load();
  },

  // ==========================================================================
  // 1. AGRI DEPARTMENT STATEMENT (CRITICAL SECTION 6)
  // ==========================================================================
  async loadAgriStatement() {
    const category = document.getElementById('agri-category-select').value;
    const startDate = document.getElementById('agri-start-date').value;
    const endDate = document.getElementById('agri-end-date').value;

    if (!startDate || !endDate) {
      window.App.showToast('ஆரம்ப மற்றும் முடிவு தேதியை தேர்வு செய்யவும்!', 'error');
      return;
    }

    try {
      const stmt = await window.api.reports.getAgriStatement({ category, startDate, endDate });
      this.cachedAgriStatement = stmt;
      this.renderAgriPreview(stmt);
    } catch (err) {
      console.error('Failed to load agri statement:', err);
      window.App.showToast('வேளாண் துறை அறிக்கை எடுப்பதில் பிழை: ' + err.message, 'error');
    }
  },

  renderAgriPreview(stmt) {
    const shop = stmt.shop || {};
    const shopEl = document.getElementById('agri-prev-shop');
    const taglineEl = document.getElementById('agri-prev-tagline');
    const addressEl = document.getElementById('agri-prev-address');
    const titleEl = document.getElementById('agri-prev-title');
    const startEl = document.getElementById('agri-prev-start');
    const endEl = document.getElementById('agri-prev-end');
    const colNameEl = document.getElementById('agri-col-prod-name');
    const tbody = document.getElementById('agri-preview-tbody');

    if (shopEl && shop.shop_name) shopEl.textContent = shop.shop_name;
    if (taglineEl && shop.tagline) taglineEl.textContent = shop.tagline;
    if (addressEl && shop.address) addressEl.textContent = shop.address;
    if (titleEl) titleEl.textContent = stmt.categoryTitle;
    if (startEl) startEl.textContent = stmt.startDate;
    if (endEl) endEl.textContent = stmt.endDate;

    // Header label by category
    const catColMap = {
      pesticide: 'மருந்தின் பெயர் (Pesticide)',
      seed: 'விதையின் பெயர் (Seed)',
      fertilizer: 'உரத்தின் பெயர் (Fertilizer)'
    };
    if (colNameEl) colNameEl.textContent = catColMap[stmt.category] || 'பொருளின் பெயர்';

    if (!stmt.rows || stmt.rows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: #888; padding: 25px;">
            தேர்ந்தெடுக்கப்பட்ட காலத்தில் எந்த இயக்கமும் இல்லை (No stock movement in this period)
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    stmt.rows.forEach(r => {
      const displayName = r.tamil_name ? `${r.tamil_name} (${r.name})` : r.name;
      html += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="border-right: 1px solid #000; padding: 6px; text-align: center;">${r.sno}</td>
          <td style="border-right: 1px solid #000; padding: 6px; text-align: center;">${r.size || '-'}</td>
          <td style="border-right: 1px solid #000; padding: 6px 8px; text-align: left;"><strong>${displayName}</strong></td>
          <td style="border-right: 1px solid #000; padding: 6px; text-align: right; font-family: var(--font-mono);">${r.opening} ${r.unit}</td>
          <td style="border-right: 1px solid #000; padding: 6px; text-align: right; font-family: var(--font-mono); color: #047857;">${r.received}</td>
          <td style="border-right: 1px solid #000; padding: 6px; text-align: right; font-family: var(--font-mono); font-weight: bold;">${r.total}</td>
          <td style="border-right: 1px solid #000; padding: 6px; text-align: right; font-family: var(--font-mono); color: #b91c1c;">${r.sold}</td>
          <td style="padding: 6px; text-align: right; font-family: var(--font-mono); font-weight: bold; background: #f8fafc;">${r.balance} ${r.unit}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  },

  async exportAgriStatementPdf() {
    if (!this.cachedAgriStatement) {
      await this.loadAgriStatement();
    }
    const stmt = this.cachedAgriStatement;
    if (!stmt) return;

    const htmlContent = this.generateAgriPdfHtml(stmt);
    const filename = `Agri_${stmt.category}_${stmt.startDate}_to_${stmt.endDate}.pdf`;

    try {
      const savedPath = await window.api.print.savePdf({
        htmlContent,
        defaultFilename: filename,
        isLandscape: true // A4 Landscape is ideal for the 8 wide columns
      });

      if (savedPath) {
        window.App.showToast(`அறிக்கை PDF ஆக சேமிக்கப்பட்டது: ${savedPath}`, 'success');
      }
    } catch (err) {
      console.error('PDF export error:', err);
      window.App.showToast('PDF சேமிப்பதில் பிழை: ' + err.message, 'error');
    }
  },

  generateAgriPdfHtml(stmt) {
    const shop = stmt.shop || {};
    const catColMap = {
      pesticide: 'மருந்தின் பெயர்',
      seed: 'விதையின் பெயர்',
      fertilizer: 'உரத்தின் பெயர்'
    };
    const colHeader = catColMap[stmt.category] || 'பொருளின் பெயர்';

    let rowsHtml = '';
    (stmt.rows || []).forEach(r => {
      const dName = r.tamil_name ? `${r.tamil_name} (${r.name})` : r.name;
      rowsHtml += `
        <tr>
          <td style="border: 1px solid #000; padding: 5px; text-align: center;">${r.sno}</td>
          <td style="border: 1px solid #000; padding: 5px; text-align: center;">${r.size || '-'}</td>
          <td style="border: 1px solid #000; padding: 5px 8px; text-align: left;"><strong>${dName}</strong></td>
          <td style="border: 1px solid #000; padding: 5px; text-align: right;">${r.opening} ${r.unit}</td>
          <td style="border: 1px solid #000; padding: 5px; text-align: right;">${r.received}</td>
          <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">${r.total}</td>
          <td style="border: 1px solid #000; padding: 5px; text-align: right;">${r.sold}</td>
          <td style="border: 1px solid #000; padding: 5px; text-align: right; font-weight: bold;">${r.balance} ${r.unit}</td>
        </tr>
      `;
    });

    return `
      <div style="font-family: 'Noto Sans Tamil', 'Nirmala UI', Arial, sans-serif; padding: 12px; color: #000;">
        <!-- Header exact format -->
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 20px; font-weight: bold;">${shop.shop_name || 'ஸ்ரீ குமரன் ஏஜென்சிஸ்'}</div>
          <div style="font-size: 13px; font-weight: 600; margin: 2px 0;">${shop.tagline || 'விதை, பூச்சிமருந்து, உரம் வியாபாரம்'}</div>
          <div style="font-size: 11.5px;">${shop.address || '69, கடைவீதி, முசிறி (TK), திருச்சி (Dt)-621211.'}</div>
          <div style="font-size: 14px; font-weight: bold; margin-top: 8px; text-decoration: underline;">
            ${stmt.categoryTitle}
          </div>
        </div>

        <!-- Date Range -->
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 10px;">
          <div>ஆரம்ப தேதி: ${stmt.startDate}</div>
          <div>முடிவு தேதி: ${stmt.endDate}</div>
        </div>

        <!-- Table exact 8 columns -->
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; border: 1.5px solid #000;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="border: 1px solid #000; padding: 6px; text-align: center; width: 40px;">வ.எண்</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; width: 65px;">அளவு</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: left;">${colHeader}</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: right; width: 85px;">ஆரம்ப இருப்பு</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: right; width: 65px;">வரவு</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: right; width: 85px;">மொத்தம்</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: right; width: 65px;">விற்பனை</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: right; width: 85px;">மீதி இருப்பு</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- Signatory Line -->
        <div style="display: flex; justify-content: flex-end; margin-top: 45px; padding-right: 20px;">
          <div style="text-align: center; width: 220px; border-top: 1px dashed #000; padding-top: 6px; font-size: 12px; font-weight: bold;">
            உரிமையாளர் கையொப்பம்<br>(Proprietor Signature)
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // 2. SALES DAY BOOK
  // ==========================================================================
  async loadSalesDayBook() {
    const startDate = document.getElementById('daybook-start-date').value;
    const endDate = document.getElementById('daybook-end-date').value;

    try {
      const data = await window.api.reports.getSalesDayBook({ startDate, endDate });
      if (!data) return;

      const { bills, summary } = data;

      document.getElementById('db-stat-sales').textContent = window.App.formatINR(summary.grand_total);
      document.getElementById('db-stat-paid').textContent = window.App.formatINR(summary.total_paid);
      document.getElementById('db-stat-due').textContent = window.App.formatINR(summary.total_due);
      document.getElementById('db-stat-bills').textContent = summary.total_bills || 0;

      const tbody = document.getElementById('daybook-tbody');
      if (!bills || bills.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--text-dim); padding: 30px;">பரிவர்த்தனைகள் எதுவும் இல்லை</td></tr>';
        return;
      }

      let html = '';
      bills.forEach(b => {
        html += `
          <tr>
            <td>${b.date}</td>
            <td><strong style="font-family: var(--font-mono);">${b.bill_no}</strong></td>
            <td>${b.customer_name || 'பொது வாடிக்கையாளர்'}</td>
            <td><span class="badge badge-info">${b.payment_mode.toUpperCase()}</span></td>
            <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(b.subtotal)}</td>
            <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(b.cgst)}</td>
            <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(b.sgst)}</td>
            <td style="text-align: right; font-family: var(--font-mono); font-weight: 700; color: #fff;">${window.App.formatINR(b.total)}</td>
            <td style="text-align: right; font-family: var(--font-mono); color: var(--primary);">${window.App.formatINR(b.paid)}</td>
            <td style="text-align: right; font-family: var(--font-mono); color: ${b.due > 0 ? 'var(--danger)' : 'var(--text-muted)'};">${window.App.formatINR(b.due)}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (err) {
      console.error('Daybook error:', err);
    }
  },

  // ==========================================================================
  // 3. GST SUMMARY (GSTR-1)
  // ==========================================================================
  async loadGstSummary() {
    const startDate = document.getElementById('gst-start-date').value;
    const endDate = document.getElementById('gst-end-date').value;

    try {
      const data = await window.api.reports.getGstSummary({ startDate, endDate });
      if (!data) return;

      const tbody = document.getElementById('gst-tbody');
      if (!data.rateWise || data.rateWise.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 30px;">விற்பனை பதிவுகள் இல்லை</td></tr>';
        return;
      }

      let html = '';
      data.rateWise.forEach(r => {
        const totalTax = (r.total_cgst || 0) + (r.total_sgst || 0);
        html += `
          <tr>
            <td><span class="badge badge-info" style="font-size: 13px;">GST ${r.gst_rate}%</span></td>
            <td style="text-align: right; font-family: var(--font-mono); font-weight: 600;">${window.App.formatINR(r.taxable_amount)}</td>
            <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(r.total_cgst)}</td>
            <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(r.total_sgst)}</td>
            <td style="text-align: right; font-family: var(--font-mono); font-weight: 700; color: var(--warning);">${window.App.formatINR(totalTax)}</td>
            <td style="text-align: right; font-family: var(--font-mono); font-weight: 700; color: var(--primary);">${window.App.formatINR(r.total_amount)}</td>
            <td style="text-align: center; font-family: var(--font-mono);">${r.invoice_count}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (err) {
      console.error('GST summary error:', err);
    }
  },

  // ==========================================================================
  // 4. STOCK INVENTORY REPORT
  // ==========================================================================
  async loadStockReport() {
    const cat = document.getElementById('stock-category-select').value || null;

    try {
      const data = await window.api.reports.getStockReport({ category: cat });
      if (!data) return;

      document.getElementById('stock-total-cost').textContent = window.App.formatINR(data.totalPurchaseValue);
      document.getElementById('stock-total-retail').textContent = window.App.formatINR(data.totalSellingValue);

      const tbody = document.getElementById('stock-rpt-tbody');
      if (!data.products || data.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-dim); padding: 30px;">பொருட்கள் எதுவும் இல்லை</td></tr>';
        return;
      }

      let html = '';
      data.products.forEach((p, idx) => {
        const dName = p.tamil_name ? `${p.tamil_name} (${p.name})` : p.name;
        const isLow = p.current_stock <= p.reorder_level;
        const stockBadge = isLow
          ? `<span class="badge badge-danger">⚠️ ${p.current_stock} ${p.unit}</span>`
          : `<span class="badge badge-success">${p.current_stock} ${p.unit}</span>`;

        html += `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${dName}</strong></td>
            <td>${p.size || '-'}</td>
            <td><span class="badge badge-info">${p.category}</span></td>
            <td style="text-align: right;">${stockBadge}</td>
            <td style="text-align: right; font-family: var(--font-mono);">${window.App.formatINR(p.purchase_price)}</td>
            <td style="text-align: right; font-family: var(--font-mono); font-weight: 600;">${window.App.formatINR(p.selling_price)}</td>
            <td style="text-align: right; font-family: var(--font-mono); color: var(--primary);">${window.App.formatINR(p.purchase_value)}</td>
            <td style="text-align: right; font-family: var(--font-mono); color: #38bdf8;">${window.App.formatINR(p.selling_value)}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (err) {
      console.error('Stock report error:', err);
    }
  },

  // ==========================================================================
  // 5. CUSTOMER OUTSTANDING REPORT
  // ==========================================================================
  async loadOutstandingReport() {
    try {
      const data = await window.api.reports.getCustomerOutstanding();
      if (!data) return;

      document.getElementById('cust-total-outstanding').textContent = window.App.formatINR(data.totalOutstanding);

      const tbody = document.getElementById('outstanding-tbody');
      if (!data.customers || data.customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-dim); padding: 30px;">நிலுவையில் பாக்கி உள்ள வாடிக்கையாளர்கள் யாரும் இல்லை (No outstanding dues)</td></tr>';
        return;
      }

      let html = '';
      data.customers.forEach((c, idx) => {
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${c.name}</strong></td>
            <td><span style="font-family: var(--font-mono);">${c.phone || '-'}</span></td>
            <td>${c.village || '-'}</td>
            <td><span style="font-size: 11px; color: var(--text-muted);">${c.address || '-'}</span></td>
            <td><code>${c.gstin || '-'}</code></td>
            <td style="text-align: right; font-family: var(--font-mono); font-weight: 700; color: var(--danger); font-size: 14px;">
              ${window.App.formatINR(c.current_balance)}
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } catch (err) {
      console.error('Outstanding report error:', err);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.Reports.init();
});

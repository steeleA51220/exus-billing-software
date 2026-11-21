/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - AGRI BILLING SOFTWARE
 * Dashboard View Controller
 * File: src/renderer/js/dashboard.js
 * ============================================================================
 */

window.Dashboard = {
  async load() {
    try {
      const stats = await window.api.dashboard.getStats();
      if (!stats) return;

      this.renderKPIs(stats);
      this.renderSalesChart(stats.dailySales || []);
      this.renderLowStock(stats.lowStockProducts || []);
      this.renderTopPesticides(stats.topPesticides || []);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    }
  },

  renderKPIs(stats) {
    const elSales = document.getElementById('stat-today-sales');
    if (elSales) elSales.textContent = window.App.formatINR(stats.todaySales);

    const elCol = document.getElementById('stat-today-collection');
    if (elCol) elCol.textContent = window.App.formatINR(stats.todayCollection);

    const elDue = document.getElementById('stat-today-due');
    if (elDue) elDue.textContent = window.App.formatINR(stats.todayDue);

    const elMonth = document.getElementById('stat-month-sales');
    if (elMonth) elMonth.textContent = window.App.formatINR(stats.monthSales);

    // Current month name
    const monthNameEl = document.getElementById('chart-month-name');
    if (monthNameEl) {
      const now = new Date();
      monthNameEl.textContent = now.toLocaleDateString('ta-IN', { month: 'long', year: 'numeric' });
    }
  },

  /**
   * Render dynamic SVG/HTML Bar Chart for month's daily sales
   */
  renderSalesChart(dailySales) {
    const container = document.getElementById('sales-chart-container');
    if (!container) return;

    if (!dailySales || dailySales.length === 0) {
      container.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-dim);">
          இந்த மாதத்திற்கான விற்பனை பதிவுகள் ஏதுமில்லை (No sales recorded this month yet)
        </div>
      `;
      return;
    }

    const maxSales = Math.max(...dailySales.map(d => d.total), 1000);
    let html = '';

    dailySales.forEach(item => {
      const dayNum = item.date.split('-')[2];
      const pct = Math.min(Math.max((item.total / maxSales) * 100, 6), 100);
      const formattedAmt = window.App.formatINR(item.total);

      html += `
        <div class="chart-bar-col" title="${item.date}: ${formattedAmt}">
          <div class="chart-bar" style="height: ${pct}%;"></div>
          <span class="chart-label">${dayNum}</span>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  /**
   * Render Low Stock Alert Table
   */
  renderLowStock(products) {
    const tbody = document.getElementById('low-stock-tbody');
    const badge = document.getElementById('low-stock-count-badge');
    if (!tbody) return;

    if (badge) {
      badge.textContent = `${products.length} பொருட்கள்`;
      if (products.length > 0) {
        badge.className = 'badge badge-danger';
      } else {
        badge.className = 'badge badge-success';
      }
    }

    if (!products || products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--text-dim); padding: 20px;">
            ✅ அனைத்து பொருட்களும் போதுமான அளவில் உள்ளன (All stocks adequate)
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    products.forEach(p => {
      const displayName = p.tamil_name ? `${p.tamil_name} (${p.name})` : p.name;
      rowsHtml += `
        <tr>
          <td><strong>${displayName}</strong></td>
          <td>${p.size || '-'}</td>
          <td>
            <span class="badge badge-danger">${p.current_stock} ${p.unit || ''}</span>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  },

  /**
   * Render Top 5 Selling Pesticides this Month
   */
  renderTopPesticides(pesticides) {
    const tbody = document.getElementById('top-pesticides-tbody');
    if (!tbody) return;

    if (!pesticides || pesticides.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-dim); padding: 20px;">
            இந்த மாதம் பூச்சிமருந்து விற்பனை விவரங்கள் பதிவாகவில்லை (No pesticide sales this month)
          </td>
        </tr>
      `;
      return;
    }

    let rowsHtml = '';
    pesticides.forEach((item, index) => {
      const displayName = item.tamil_name ? `${item.tamil_name} (${item.name})` : item.name;
      rowsHtml += `
        <tr>
          <td>#${index + 1}</td>
          <td><strong>${displayName}</strong></td>
          <td>${item.size || '-'}</td>
          <td><span class="badge badge-info">${item.total_qty}</span></td>
          <td style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">
            ${window.App.formatINR(item.total_amount)}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rowsHtml;
  }
};

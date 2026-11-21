/**
 * ============================================================================
 * SRI KUMARAN AGENCIES - AGRI BILLING SOFTWARE
 * Customers & Ledger View Controller
 * File: src/renderer/js/customers.js
 * ============================================================================
 */

window.Customers = {
  customersList: [],

  init() {
    this.bindEvents();
  },

  async load() {
    try {
      const searchVal = document.getElementById('customer-search-input').value.trim();
      const customers = await window.api.customers.search(searchVal);
      this.customersList = customers || [];
      this.renderTable(this.customersList);
    } catch (err) {
      console.error('Failed to load customers:', err);
      window.App.showToast('வாடிக்கையாளர் பட்டியலை ஏற்றுவதில் பிழை: ' + err.message, 'error');
    }
  },

  renderTable(customers) {
    const tbody = document.getElementById('customers-tbody');
    const badge = document.getElementById('customers-count-badge');
    if (!tbody) return;

    if (badge) {
      badge.textContent = `${customers.length} நபர்கள்`;
    }

    if (!customers || customers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-dim); padding: 30px;">
            வாடிக்கையாளர்கள் யாரும் கிடைக்கவில்லை (No matching customer records found)
          </td>
        </tr>
      `;
      return;
    }

    let html = '';
    customers.forEach((c, index) => {
      const isDue = (c.current_balance || 0) > 0;
      const balanceBadge = isDue
        ? `<span class="badge badge-danger" style="font-size: 13px; font-family: var(--font-mono);">${window.App.formatINR(c.current_balance)}</span>`
        : `<span class="badge badge-success" style="font-size: 12px; font-family: var(--font-mono);">₹0.00</span>`;

      html += `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${c.name}</strong></td>
          <td><span style="font-family: var(--font-mono);">${c.phone || '-'}</span></td>
          <td>${c.village || '-'}</td>
          <td><span style="font-size: 12px; color: var(--text-muted);">${c.address || '-'}</span></td>
          <td><code style="font-size: 11px;">${c.gstin || '-'}</code></td>
          <td style="font-family: var(--font-mono);">${window.App.formatINR(c.opening_balance)}</td>
          <td>${balanceBadge}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 6px; justify-content: center;">
              <button class="btn btn-outline btn-ledger" data-id="${c.id}" style="padding: 4px 8px; font-size: 11px;" title="கணக்கு ஏடு">
                📜 ஏடு
              </button>
              ${c.id > 1 ? `
                <button class="btn btn-outline btn-pay" data-id="${c.id}" style="padding: 4px 8px; font-size: 11px; color: var(--primary);" title="வரவு வைக்க">
                  💵 வரவு
                </button>
                <button class="btn btn-outline btn-edit-customer" data-id="${c.id}" style="padding: 4px 8px; font-size: 11px;" title="திருத்த">
                  ✏️
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Attach button handlers
    tbody.querySelectorAll('.btn-ledger').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        this.openLedgerModal(id);
      });
    });

    tbody.querySelectorAll('.btn-pay').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        this.openPaymentModal(id);
      });
    });

    tbody.querySelectorAll('.btn-edit-customer').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        this.openEditModal(id);
      });
    });
  },

  bindEvents() {
    // Search input with debounce
    let timeout = null;
    const searchInput = document.getElementById('customer-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.load(), 200);
      });
    }

    // Open Add Customer
    const btnAdd = document.getElementById('btn-open-add-customer-modal');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => this.openAddModal());
    }

    // Customer Form Submit
    const formCust = document.getElementById('form-customer');
    if (formCust) {
      formCust.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveCustomer();
      });
    }

    // Payment Form Submit
    const formPay = document.getElementById('form-customer-payment');
    if (formPay) {
      formPay.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitPayment();
      });
    }
  },

  openAddModal() {
    document.getElementById('form-customer').reset();
    document.getElementById('cust-id').value = '';
    document.getElementById('modal-customer-title').textContent = 'புதிய வாடிக்கையாளர் சேர்க்க (Add Customer)';
    document.getElementById('group-cust-opening').style.display = 'block';
    this.openModal('modal-customer');
  },

  async openEditModal(customerId) {
    try {
      const c = await window.api.customers.getById(customerId);
      if (!c) return;

      document.getElementById('form-customer').reset();
      document.getElementById('cust-id').value = c.id;
      document.getElementById('modal-customer-title').textContent = 'வாடிக்கையாளர் திருத்த (Edit Customer)';

      document.getElementById('cust-name').value = c.name;
      document.getElementById('cust-phone').value = c.phone || '';
      document.getElementById('cust-village').value = c.village || '';
      document.getElementById('cust-address').value = c.address || '';
      document.getElementById('cust-gstin').value = c.gstin || '';

      document.getElementById('group-cust-opening').style.display = 'none';

      this.openModal('modal-customer');
    } catch (err) {
      console.error('Failed to get customer:', err);
      window.App.showToast('விவரங்களை பெறுவதில் பிழை: ' + err.message, 'error');
    }
  },

  async saveCustomer() {
    const getVal = (id) => document.getElementById(id).value.trim();
    const id = document.getElementById('cust-id').value;

    const payload = {
      name: getVal('cust-name'),
      phone: getVal('cust-phone'),
      village: getVal('cust-village'),
      address: getVal('cust-address'),
      gstin: getVal('cust-gstin')
    };

    try {
      if (id) {
        await window.api.customers.update(Number(id), payload);
        window.App.showToast('வாடிக்கையாளர் விவரங்கள் புதுப்பிக்கப்பட்டன!', 'success');
      } else {
        payload.opening_balance = Number(getVal('cust-opening-bal')) || 0;
        await window.api.customers.create(payload);
        window.App.showToast('புதிய வாடிக்கையாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்!', 'success');
      }

      this.closeModal('modal-customer');
      await this.load();
    } catch (err) {
      console.error('Save customer error:', err);
      window.App.showToast('சேமிப்பதில் பிழை: ' + err.message, 'error');
    }
  },

  async openPaymentModal(customerId) {
    try {
      const c = await window.api.customers.getById(customerId);
      if (!c) return;

      document.getElementById('form-customer-payment').reset();
      document.getElementById('pay-customer-id').value = c.id;
      document.getElementById('pay-customer-name').textContent = `${c.name} (${c.village || 'முசிறி'})`;
      document.getElementById('pay-customer-due').textContent = window.App.formatINR(c.current_balance);

      const today = new Date().toISOString().split('T')[0];
      document.getElementById('pay-date').value = today;

      // Suggest remaining balance as payment amount
      document.getElementById('pay-amount').value = c.current_balance > 0 ? c.current_balance : '';

      this.openModal('modal-customer-payment');
    } catch (err) {
      console.error('Failed to prepare payment modal:', err);
      window.App.showToast('பிழை: ' + err.message, 'error');
    }
  },

  async submitPayment() {
    const getVal = (id) => document.getElementById(id).value.trim();
    const customerId = Number(document.getElementById('pay-customer-id').value);
    const amount = Number(getVal('pay-amount')) || 0;
    const date = getVal('pay-date');
    const mode = getVal('pay-mode');
    const notes = getVal('pay-notes');

    if (amount <= 0) {
      window.App.showToast('செலுத்தும் தொகை 0-ஐ விட அதிகமாக இருக்க வேண்டும்!', 'error');
      return;
    }

    try {
      await window.api.customers.recordPayment({
        customer_id: customerId,
        amount,
        date,
        payment_mode: mode,
        notes
      });

      window.App.showToast('பாக்கி தொகை வரவு வைக்கப்பட்டது!', 'success');
      this.closeModal('modal-customer-payment');
      await this.load();

      // Refresh dashboard stats if payment made today
      if (window.Dashboard) {
        window.Dashboard.load();
      }
    } catch (err) {
      console.error('Record payment error:', err);
      window.App.showToast('வரவு பதிய முடியவில்லை: ' + err.message, 'error');
    }
  },

  /**
   * Open Detailed Customer Ledger Statement
   */
  async openLedgerModal(customerId) {
    try {
      const data = await window.api.customers.getLedger(customerId);
      if (!data) return;

      const { customer, bills, payments } = data;

      document.getElementById('ledger-cust-name').textContent = customer.name;
      document.getElementById('ledger-cust-contact').textContent =
        `போன்: ${customer.phone || '-'} | ஊர்: ${customer.village || '-'} | GSTIN: ${customer.gstin || '-'}`;
      document.getElementById('ledger-cust-balance').textContent = window.App.formatINR(customer.current_balance);

      // Merge bills and payments into a chronological list
      const txns = [];

      // Initial opening balance
      if (customer.opening_balance > 0) {
        txns.push({
          date: customer.created_at ? customer.created_at.split(' ')[0] : '',
          type: 'opening',
          typeLabel: 'துவக்க பாக்கி',
          ref: 'OPENING',
          billTotal: customer.opening_balance,
          paid: 0,
          due: customer.opening_balance,
          notes: 'ஆரம்ப கணக்கு பாக்கி'
        });
      }

      // Add bills
      (bills || []).forEach(b => {
        txns.push({
          date: b.date,
          type: 'bill',
          typeLabel: 'பில் விற்பனை',
          ref: b.bill_no,
          billTotal: b.total,
          paid: b.paid,
          due: b.due,
          notes: b.notes || (b.payment_mode === 'credit' ? 'முழு கடன்' : `பணம் செலுத்தியது: ${window.App.formatINR(b.paid)}`)
        });
      });

      // Add payments
      (payments || []).forEach(p => {
        txns.push({
          date: p.date,
          type: 'payment',
          typeLabel: 'பாக்கி வரவு',
          ref: `PAY-#${p.id}`,
          billTotal: 0,
          paid: p.amount,
          due: -p.amount,
          notes: `${p.payment_mode.toUpperCase()} ${p.notes ? '| ' + p.notes : ''}`
        });
      });

      // Sort by date ascending
      txns.sort((a, b) => (a.date > b.date ? 1 : -1));

      const tbody = document.getElementById('ledger-tbody');
      if (txns.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; color: var(--text-dim); padding: 20px;">
              இந்த வாடிக்கையாளருக்கு எந்த பரிவர்த்தனை பதிவுகளும் இல்லை (No transactions)
            </td>
          </tr>
        `;
      } else {
        let rowsHtml = '';
        txns.forEach(t => {
          const typeBadge = t.type === 'bill'
            ? '<span class="badge badge-warning">பில் விற்பனை</span>'
            : t.type === 'payment'
            ? '<span class="badge badge-success">பாக்கி வரவு</span>'
            : '<span class="badge badge-info">துவக்க இருப்பு</span>';

          rowsHtml += `
            <tr>
              <td>${t.date}</td>
              <td>${typeBadge}</td>
              <td><strong style="font-family: var(--font-mono);">${t.ref}</strong></td>
              <td style="font-family: var(--font-mono);">${t.billTotal > 0 ? window.App.formatINR(t.billTotal) : '-'}</td>
              <td style="font-family: var(--font-mono); color: var(--primary);">${t.paid > 0 ? window.App.formatINR(t.paid) : '-'}</td>
              <td style="font-family: var(--font-mono); color: ${t.due > 0 ? 'var(--danger)' : 'var(--text-main)'};">
                ${window.App.formatINR(t.due)}
              </td>
              <td style="font-size: 12px; color: var(--text-muted);">${t.notes || '-'}</td>
            </tr>
          `;
        });
        tbody.innerHTML = rowsHtml;
      }

      this.openModal('modal-customer-ledger');
    } catch (err) {
      console.error('Failed to load customer ledger:', err);
      window.App.showToast('கணக்கு ஏடு விவரங்களை பெற முடியவில்லை: ' + err.message, 'error');
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
  window.Customers.init();
});

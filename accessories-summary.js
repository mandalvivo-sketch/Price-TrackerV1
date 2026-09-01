(function () {
  'use strict';

  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const formatMoney = (value) => money.format(Number(value) || 0);

  const els = {
    statusDot: document.getElementById('statusDot'),
    statusLabel: document.getElementById('statusLabel'),
    appIcon: document.getElementById('appIcon'),
    brandSummaryBody: document.getElementById('brandSummaryBody'),
    refresh: document.getElementById('btnRefresh')
  };

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value || '';
    return div.innerHTML;
  }

  function updateStatus() {
    const live = window.dbService && window.dbService.isLive;
    els.statusDot.className = `status-dot${live ? ' live' : ''}`;
    els.statusLabel.textContent = live ? 'Supabase Connected' : 'Local Database';
  }

  async function loadSummary() {
    const rows = JSON.parse(localStorage.getItem('mpt_local_accessory_stock') || '[]');
    const totals = rows.reduce((acc, item) => {
      const qty = Number(item.qty || 0);
      const landing = Number(item.landing_price || 0);
      const selling = Number(item.selling_price || 0);
      const mrp = Number(item.mrp || 0);

      acc.items += 1;
      acc.qty += qty;
      acc.landing += landing;
      acc.selling += selling;
      acc.mrp += mrp;
      return acc;
    }, { items: 0, qty: 0, landing: 0, selling: 0, mrp: 0 });

    const byBrand = new Map();
    rows.forEach((item) => {
      const brand = item.brand || 'Unknown';
      if (!byBrand.has(brand)) {
        byBrand.set(brand, { brand, items: 0, qty: 0, landing: 0, selling: 0, mrp: 0 });
      }
      const row = byBrand.get(brand);
      row.items += 1;
      row.qty += Number(item.qty || 0);
      row.landing += Number(item.landing_price || 0);
      row.selling += Number(item.selling_price || 0);
      row.mrp += Number(item.mrp || 0);
    });

    const sortedBrands = Array.from(byBrand.values()).sort((a, b) => b.landing - a.landing);

    els.brandSummaryBody.innerHTML = sortedBrands.map((row) => {
      const perPc = row.qty > 0 ? row.landing / row.qty : 0;
      return `
        <tr>
          <td><span class="tiny-badge">${escapeHtml(row.brand)}</span></td>
          <td>${row.items}</td>
          <td>${row.qty}</td>
          <td class="money">${formatMoney(row.landing)}</td>
          <td class="money">${formatMoney(perPc)}</td>
          <td class="money">${formatMoney(row.selling)}</td>
          <td class="money">${formatMoney(row.mrp)}</td>
          <td>
            <button type="button" class="btn btn-danger btn-sm" data-action="delete-brand" data-brand="${escapeHtml(row.brand)}">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    els.brandSummaryBody.querySelectorAll('[data-action="delete-brand"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const brand = button.getAttribute('data-brand');
        if (!brand) return;

        const confirmed = window.confirm(`Delete accessory brand "${brand}" and related stock entries?`);
        if (!confirmed) return;

        try {
          if (window.dbService && typeof window.dbService.deleteAccessoryBrand === 'function') {
            await window.dbService.deleteAccessoryBrand(brand);
          }
          await refreshData();
        } catch (error) {
          console.error('Accessory brand delete failed:', error);
          window.alert(error.message || 'Unable to delete accessory brand.');
        }
      });
    });
  }

  async function refreshData() {
    try {
      if (window.dbService) {
        const [brands, types, stock] = await Promise.all([
          window.dbService.fetchAccessoryBrands(),
          window.dbService.fetchAccessoryTypes(),
          window.dbService.fetchAccessoryStock()
        ]);
        localStorage.setItem('mpt_local_accessory_brands', JSON.stringify(brands || []));
        localStorage.setItem('mpt_local_accessory_types', JSON.stringify(types || []));
        localStorage.setItem('mpt_local_accessory_stock', JSON.stringify(stock || []));
      }
      await loadSummary();
    } catch (error) {
      console.error('Accessory summary failed:', error);
      els.brandSummaryBody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:var(--text-muted);">Unable to load accessory summary.</td></tr>`;
    }
  }

  els.appIcon.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  els.refresh.addEventListener('click', refreshData);
  updateStatus();
  refreshData();
}());

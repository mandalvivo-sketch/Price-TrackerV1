(function () {
  'use strict';

  const money = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  const formatMoney = (value) => money.format(Number(value) || 0);

  const els = {
    statusDot: document.getElementById('statusDot'),
    statusLabel: document.getElementById('statusLabel'),
    refresh: document.getElementById('btnRefreshSalesReport'),
    search: document.getElementById('salesReportSearch'),
    metricGrid: document.getElementById('salesMetricGrid'),
    body: document.getElementById('salesReportBody'),
    empty: document.getElementById('salesEmptyState')
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

  function getSalesRows() {
    const query = (els.search.value || '').trim().toLowerCase();
    const source = JSON.parse(localStorage.getItem('mpt_local_sold_imeis') || '[]');
    if (!query) return source;

    return source.filter((item) => {
      const text = [
        item.brand,
        item.model,
        item.variant,
        item.imei,
        item.remarks
      ].join(' ').toLowerCase();
      return text.includes(query);
    });
  }

  async function loadSales() {
    try {
      const sales = await window.dbService.fetchSales();
      const rows = sales || [];
      const filtered = rows.filter((item) => {
        const query = (els.search.value || '').trim().toLowerCase();
        if (!query) return true;
        const text = [item.brand, item.model, item.variant, item.imei, item.remarks].join(' ').toLowerCase();
        return text.includes(query);
      });

      const totals = filtered.reduce((acc, item) => {
        acc.units += 1;
        acc.entryDp += Number(item.entry_dp || 0);
        acc.mop += Number(item.mop || 0);
        acc.mrp += Number(item.mrp || 0);
        return acc;
      }, { units: 0, entryDp: 0, mop: 0, mrp: 0 });

      els.metricGrid.innerHTML = [
        ['Sold Units', totals.units, 'blue'],
        ['Entry DP', formatMoney(totals.entryDp), 'orange'],
        ['Sold MOP', formatMoney(totals.mop), 'green'],
        ['MRP', formatMoney(totals.mrp), 'purple']
      ].map(([label, value, color]) => `
        <article class="metric-card ${color}">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `).join('');

      if (!filtered.length) {
        els.body.innerHTML = '';
        els.empty.classList.remove('hidden');
        return;
      }

      els.empty.classList.add('hidden');
      els.body.innerHTML = filtered.map((item) => {
        const soldAt = item.sold_at ? new Date(item.sold_at).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '—';

        return `
          <tr>
            <td>${escapeHtml(soldAt)}</td>
            <td><span class="report-brand">${escapeHtml(item.brand || 'Unknown')}</span></td>
            <td>${escapeHtml(item.model || '—')}</td>
            <td>${escapeHtml(item.variant || 'Standard')}</td>
            <td><span class="report-imei">${escapeHtml(item.imei || '—')}</span></td>
            <td class="money-neutral">${formatMoney(item.entry_dp || 0)}</td>
            <td class="money-positive">${formatMoney(item.mop || 0)}</td>
            <td class="money-neutral">${formatMoney(item.mrp || 0)}</td>
            <td>${escapeHtml(item.remarks || '—')}</td>
            <td>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button class="btn btn-secondary btn-sm" data-action="restore-stock" data-imei="${escapeHtml(item.imei || '')}">Restore</button>
                <button class="btn btn-danger btn-sm" data-action="delete-sold" data-imei="${escapeHtml(item.imei || '')}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      els.body.querySelectorAll('[data-action]').forEach((button) => {
        button.addEventListener('click', async () => {
          const action = button.getAttribute('data-action');
          const imei = button.getAttribute('data-imei');
          const rowItem = filtered.find(item => String(item.imei || '').toLowerCase() === String(imei || '').toLowerCase());

          if (!rowItem) return;

          if (action === 'restore-stock') {
            const confirmed = window.confirm(`Restore IMEI ${rowItem.imei} back to active stock? This will add it again to the stock list.`);
            if (!confirmed) return;

            try {
              await window.dbService.restoreSoldImeiToStock(rowItem);
              alert(`IMEI ${rowItem.imei} restored to stock.`);
              await loadSales();
            } catch (error) {
              alert(error.message || 'Restore failed.');
            }
            return;
          }

          if (action === 'delete-sold') {
            const confirmed = window.confirm(`Delete sold record for IMEI ${rowItem.imei}? This removes only the sold history entry, not the active stock.`);
            if (!confirmed) return;

            try {
              await window.dbService.deleteSoldImeiRecord(rowItem);
              alert(`Sold record for IMEI ${rowItem.imei} deleted.`);
              await loadSales();
            } catch (error) {
              alert(error.message || 'Delete failed.');
            }
          }
        });
      });
    } catch (error) {
      console.error('Sales report load failed:', error);
      els.empty.classList.remove('hidden');
      els.empty.textContent = 'Unable to load sales data. Please check your database connection.';
    }
  }

  updateStatus();
  els.refresh.addEventListener('click', loadSales);
  els.search.addEventListener('input', loadSales);
  loadSales();
}());

(function () {
  'use strict';

  const body = document.getElementById('accessoryPriceListBody');
  const refresh = document.getElementById('btnRefreshAccessoryPrices');
  const statusDot = document.getElementById('statusDot');
  const statusLabel = document.getElementById('statusLabel');
  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  let loadId = 0;

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = value == null ? '' : String(value);
    return node.innerHTML;
  }

  function render(items) {
    if (!items.length) {
      body.innerHTML = '<tr><td colspan="5" class="price-list-message">No accessory items found.</td></tr>';
      return;
    }
    body.innerHTML = items.map(item => `<tr>
      <td>${escapeHtml(item.brand || '')}</td>
      <td>${escapeHtml(item.item_type || '')}</td>
      <td class="right">${money.format(Number(item.landing_price_per_pc) || 0)}</td>
      <td class="right">${money.format(Number(item.selling_price) || 0)}</td>
      <td class="right">${money.format(Number(item.mrp) || 0)}</td>
    </tr>`).join('');
  }

  async function loadPrices() {
    const currentLoad = ++loadId;
    refresh.disabled = true;
    refresh.textContent = 'Loading…';
    try {
      const cached = JSON.parse(localStorage.getItem('mpt_local_accessory_stock') || '[]');
      render(cached);
      const items = await window.dbService.fetchAccessoryStock();
      if (currentLoad === loadId) render(items);
    } catch (error) {
      console.error('Could not load accessory prices:', error);
      body.innerHTML = '<tr><td colspan="5" class="price-list-message">Could not load prices. Please refresh.</td></tr>';
    } finally {
      if (currentLoad === loadId) {
        const live = Boolean(window.dbService && window.dbService.isLive);
        statusDot.className = `status-dot${live ? ' live' : ''}`;
        statusLabel.textContent = live ? 'Supabase Connected' : 'Local Database';
        refresh.disabled = false;
        refresh.textContent = '↻ Refresh';
      }
    }
  }

  refresh.addEventListener('click', loadPrices);
  loadPrices();
}());

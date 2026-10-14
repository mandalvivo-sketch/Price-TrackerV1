(function () {
  'use strict';

  const body = document.getElementById('priceListBody');
  const refreshButton = document.getElementById('btnRefreshPrices');
  const statusDot = document.getElementById('statusDot');
  const statusLabel = document.getElementById('statusLabel');
  const formatMoney = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  });

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = value == null ? '' : String(value);
    return node.innerHTML;
  }

  function updateStatus() {
    const live = Boolean(window.dbService && window.dbService.isLive);
    statusDot.className = `status-dot${live ? ' live' : ''}`;
    statusLabel.textContent = live ? 'Supabase Connected' : 'Local Database';
  }

  function showProducts(products) {
    if (!products.length) {
      body.innerHTML = '<tr><td colspan="5" class="price-list-message">No products found.</td></tr>';
      return;
    }
    body.innerHTML = products.map(product => `<tr>
      <td>${escapeHtml(product.brand || '')}</td>
      <td>${escapeHtml(product.model || '')}</td>
      <td class="right">${formatMoney.format(Number(product.current_dp ?? product.dp) || 0)}</td>
      <td class="right">${formatMoney.format(Number(product.current_mop ?? product.mop) || 0)}</td>
      <td class="right">${formatMoney.format(Number(product.current_mrp ?? product.mrp) || 0)}</td>
    </tr>`).join('');
  }

  async function loadPrices() {
    refreshButton.disabled = true;
    refreshButton.textContent = 'Loading…';
    try {
      const cached = await window.dbService.fetchProducts('', 'ALL', true);
      showProducts(cached);
      const products = await window.dbService.fetchProducts('', 'ALL');
      showProducts(products);
    } catch (error) {
      console.error('Could not load price list:', error);
      body.innerHTML = '<tr><td colspan="5" class="price-list-message">Could not load prices. Please refresh.</td></tr>';
    } finally {
      updateStatus();
      refreshButton.disabled = false;
      refreshButton.textContent = '↻ Refresh';
    }
  }

  updateStatus();
  refreshButton.addEventListener('click', loadPrices);
  loadPrices();
}());

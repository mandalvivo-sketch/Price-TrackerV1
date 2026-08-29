(function () {
  'use strict';

  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const formatMoney = (value) => money.format(Number(value) || 0);
  const els = {
    statusDot: document.getElementById('statusDot'), statusLabel: document.getElementById('statusLabel'),
    metricGrid: document.getElementById('metricGrid'), companyGrid: document.getElementById('companyGrid'),
    stockTableBody: document.getElementById('stockTableBody'), summaryEmpty: document.getElementById('summaryEmpty'),
    refresh: document.getElementById('btnRefreshSummary')
  };

  function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value || ''; return div.innerHTML; }
  function updateStatus() {
    const live = window.dbService && window.dbService.isLive;
    els.statusDot.className = `status-dot${live ? ' live' : ''}`;
    els.statusLabel.textContent = live ? 'Supabase Connected' : 'Local Database';
  }
  function addValue(target, product, imei) {
    target.stock += 1;
    target.dp += Number(imei.dp ?? product.current_dp) || 0;
    target.mop += Number(imei.mop ?? product.current_mop) || 0;
    target.mrp += Number(imei.mrp ?? product.current_mrp) || 0;
  }
  async function render() {
    els.refresh.disabled = true;
    els.refresh.textContent = 'Loading…';
    try {
      const [products, imeis] = await Promise.all([window.dbService.fetchProducts('', 'ALL'), window.dbService.fetchAllImeis()]);
      const productMap = new Map(products.map(product => [String(product.id), product]));
      const productTotals = new Map(products.map(product => [String(product.id), { product, stock: 0, dp: 0, mop: 0, mrp: 0 }]));
      const companies = new Map();
      imeis.forEach(imei => {
        const product = productMap.get(String(imei.product_id));
        if (!product) return;
        const productTotal = productTotals.get(String(product.id));
        addValue(productTotal, product, imei);
        const brand = product.brand || 'Unspecified';
        if (!companies.has(brand)) companies.set(brand, { brand, variants: new Set(), stock: 0, dp: 0, mop: 0, mrp: 0 });
        const company = companies.get(brand);
        company.variants.add(String(product.id));
        addValue(company, product, imei);
      });
      const totals = Array.from(companies.values()).reduce((total, company) => ({ stock: total.stock + company.stock, dp: total.dp + company.dp, mop: total.mop + company.mop, mrp: total.mrp + company.mrp }), { stock: 0, dp: 0, mop: 0, mrp: 0 });
      els.metricGrid.innerHTML = [
        ['IMEI Stock', totals.stock, 'blue'], ['Companies', companies.size, 'purple'], ['Invested (DP)', formatMoney(totals.dp), 'orange'], ['Potential MOP', formatMoney(totals.mop), 'green'], ['Potential Margin', formatMoney(totals.mop - totals.dp), 'pink']
      ].map(([label, value, color]) => `<article class="metric-card ${color}"><span>${label}</span><strong>${value}</strong></article>`).join('');
      els.companyGrid.innerHTML = Array.from(companies.values()).sort((a, b) => b.dp - a.dp).map(company => `<article class="company-card"><div class="company-card-header"><span class="brand-badge">${escapeHtml(company.brand)}</span><span class="stock-chip">${company.stock} IMEIs</span></div><div class="company-stats"><div><span>Variants</span><strong>${company.variants.size}</strong></div><div><span>Invested</span><strong class="dp-text">${formatMoney(company.dp)}</strong></div><div><span>MOP Total</span><strong class="mop-text">${formatMoney(company.mop)}</strong></div><div><span>Margin</span><strong class="margin-text">${formatMoney(company.mop - company.dp)}</strong></div></div></article>`).join('');
      const stockRows = Array.from(productTotals.values()).filter(item => item.stock > 0).sort((a, b) => a.product.brand.localeCompare(b.product.brand) || a.product.model.localeCompare(b.product.model));
      els.stockTableBody.innerHTML = stockRows.map(({ product, stock, dp, mop, mrp }) => `<tr><td data-label="Model"><span class="brand-badge">${escapeHtml(product.brand)}</span><strong>${escapeHtml(product.model)}</strong></td><td data-label="Variant">${escapeHtml(product.variant || 'Standard')}${product.color ? `<small>${escapeHtml(product.color)}</small>` : ''}</td><td class="right" data-label="IMEI Stock"><span class="stock-chip">${stock}</span></td><td class="right dp-text" data-label="Invested (DP)">${formatMoney(dp)}</td><td class="right mop-text" data-label="MOP Total">${formatMoney(mop)}</td><td class="right mrp-text" data-label="MRP Total">${formatMoney(mrp)}</td></tr>`).join('');
      els.summaryEmpty.classList.toggle('hidden', stockRows.length > 0);
    } catch (error) {
      console.error('Could not load summary:', error);
      els.summaryEmpty.classList.remove('hidden');
      els.summaryEmpty.querySelector('.empty-title').textContent = 'Could not load summary';
    } finally { els.refresh.disabled = false; els.refresh.textContent = '↻ Refresh'; }
  }
  updateStatus();
  els.refresh.addEventListener('click', render);
  render();
}());

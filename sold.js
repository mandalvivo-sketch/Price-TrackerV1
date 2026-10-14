(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const form = $('saleForm');
  const imeiInput = $('saleImei');
  const details = $('saleDetails');
  const list = $('salesList');
  const overlay = $('saleScannerOverlay');
  let found = null;
  let scanner = null;

  const money = value => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(Number(value) || 0);
  const esc = value => {
    const element = document.createElement('div');
    element.textContent = value || '';
    return element.innerHTML;
  };

  function status() {
    const live = window.dbService && window.dbService.isLive;
    $('statusDot').className = 'status-dot' + (live ? ' live' : '');
    $('statusLabel').textContent = live ? 'Supabase Connected' : 'Offline / Local View';
  }

  async function loadProductImeis() {
    const productId = new URLSearchParams(window.location.search).get('productId');
    if (!productId) return;
    try {
      const [product, imeis] = await Promise.all([
        window.dbService.getProductById(productId),
        window.dbService.fetchImeis(productId)
      ]);
      if (!product) throw new Error('Product was not found.');

      const selector = document.createElement('div');
      selector.className = 'form-group';
      selector.innerHTML = `<label class="form-label" for="productImeiSelect">Choose IMEI from ${esc(product.brand)} ${esc(product.model)} · ${esc(product.variant || 'Standard')}</label>
        <select class="form-select" id="productImeiSelect"><option value="">-- Select in-stock IMEI --</option>${imeis.map(unit => `<option value="${esc(unit.imei)}">${esc(unit.imei)}</option>`).join('')}</select>`;
      form.insertBefore(selector, form.firstChild);
      const select = $('productImeiSelect');
      select.addEventListener('change', () => {
        imeiInput.value = select.value;
        details.classList.add('hidden');
        found = null;
      });
      if (!imeis.length) {
        select.disabled = true;
        const note = document.createElement('p');
        note.className = 'scanner-hint';
        note.textContent = 'There are no IMEIs in stock for this product.';
        selector.appendChild(note);
      }
    } catch (error) {
      const note = document.createElement('p');
      note.className = 'scanner-hint';
      note.textContent = error.message || 'Could not load this product’s IMEIs.';
      form.insertBefore(note, form.firstChild);
    }
  }

  async function lookup() {
    try {
      found = await window.dbService.findImeiForSale(imeiInput.value);
      if (!found) {
        details.classList.remove('hidden');
        details.innerHTML = '<p style="color:var(--danger);font-weight:700">IMEI not found in current stock.</p>';
        return;
      }
      const product = found.product;
      if (!product) throw new Error('IMEI was found, but its product details are unavailable.');
      details.classList.remove('hidden');
      details.innerHTML = `<div class="sale-product">${esc(product.brand)} ${esc(product.model)} <span class="variant-tag">${esc(product.variant || 'Standard')}</span><div class="sale-entry">Entry DP: ${money(found.entry_dp)}</div></div>
        <div class="sale-prices"><div><label>Entry DP (saved)</label><input class="form-input" value="${Number(found.entry_dp) || 0}" disabled></div>
        <div><label>Sell MOP</label><input class="form-input" id="saleMop" type="number" value="${Number(product.current_mop) || 0}" min="0"></div>
        <div><label>MRP</label><input class="form-input" id="saleMrp" type="number" value="${Number(product.current_mrp) || 0}" min="0"></div></div>
        <div style="margin-top:10px"><label class="form-label" for="saleRemarks">Remarks</label><input class="form-input" id="saleRemarks" placeholder="Optional sale remark"></div>
        <div class="sale-actions"><button class="btn btn-primary" id="btnSaveSale" type="button">Save sale and remove IMEI</button></div>`;
      $('btnSaveSale').addEventListener('click', save);
    } catch (error) {
      details.classList.remove('hidden');
      details.innerHTML = `<p style="color:var(--danger)">${esc(error.message || 'Lookup failed')}</p>`;
    }
  }

  async function save() {
    if (!navigator.onLine) {
      alert('Please connect to the internet to save a sale.');
      return;
    }
    if (!found) return;
    const mop = Number($('saleMop').value);
    const mrp = Number($('saleMrp').value);
    if (!Number.isFinite(mop) || !Number.isFinite(mrp)) {
      alert('Enter valid MOP and MRP');
      return;
    }
    if (!confirm(`Mark IMEI ${found.unit.imei} as sold? This removes it from stock.`)) return;
    try {
      const soldImei = found.unit.imei;
      await window.dbService.saveSaleAndRemoveImei({
        ...found, mop, mrp, remarks: $('saleRemarks').value.trim()
      });
      details.classList.add('hidden');
      imeiInput.value = '';
      found = null;
      const select = $('productImeiSelect');
      if (select) {
        const soldValue = soldImei;
        select.querySelectorAll('option').forEach(option => {
          if (option.value === soldValue) option.remove();
        });
        select.value = '';
        if (select.options.length <= 1) select.disabled = true;
      }
      alert('Sale saved and IMEI removed from stock.');
      loadSales();
    } catch (error) {
      alert('Sale failed: ' + (error.message || error));
    }
  }

  async function loadSales() {
    try {
      const sales = await window.dbService.fetchSales();
      list.innerHTML = sales.length ? sales.map(sale => `<article class="sale-item"><div class="sale-item-head"><span>${esc(sale.brand)} ${esc(sale.model)} · ${esc(sale.imei)}</span><span>${new Date(sale.sold_at).toLocaleDateString('en-IN')}</span></div>
        <div class="sale-item-meta"><span class="variant-tag">${esc(sale.variant || 'Standard')}</span>${sale.remarks ? ' · ' + esc(sale.remarks) : ''}</div>
        <div class="sale-amounts"><span class="dp">DP ${money(sale.entry_dp)}</span><span class="mop">MOP ${money(sale.mop)}</span><span class="mrp">MRP ${money(sale.mrp)}</span></div></article>`).join('') : '<p class="scanner-hint">No sales recorded yet.</p>';
    } catch (_) {
      list.innerHTML = '<p class="scanner-hint">Sales history requires an online connection.</p>';
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    lookup();
  });

  $('btnScanSale').addEventListener('click', async () => {
    if (!window.Html5Qrcode) {
      alert('Scanner library is not available');
      return;
    }
    overlay.classList.add('active');
    scanner = scanner || new Html5Qrcode('saleReader', { formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128] });
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras.length) throw new Error('No camera was found.');
      await scanner.start(cameras[0].id, { fps: 18, qrbox: { width: 280, height: 120 } }, async text => {
        imeiInput.value = text.replace(/[^0-9a-zA-Z]/g, '');
        await scanner.stop();
        overlay.classList.remove('active');
        lookup();
      });
    } catch (error) {
      alert('Camera error: ' + (error.message || error));
      overlay.classList.remove('active');
    }
  });

  $('btnCloseSaleScanner').addEventListener('click', async () => {
    if (scanner && scanner.isScanning) await scanner.stop();
    overlay.classList.remove('active');
  });

  status();
  loadProductImeis();
  loadSales();
  const imeiToSell = new URLSearchParams(window.location.search).get('imei');
  if (imeiToSell) {
    imeiInput.value = imeiToSell;
    lookup();
  }
}());

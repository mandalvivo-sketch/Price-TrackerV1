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
    appIcon: document.getElementById('appIcon'),
    accessoryForm: document.getElementById('accessoryForm'),
    accessoryItemId: document.getElementById('accessoryItemId'),
    accessoryBrandSelect: document.getElementById('accessoryBrandSelect'),
    accessoryTypeSelect: document.getElementById('accessoryTypeSelect'),
    accessorySerialInput: document.getElementById('accessorySerialInput'),
    accessoryQtyInput: document.getElementById('accessoryQtyInput'),
    accessoryLandingInput: document.getElementById('accessoryLandingInput'),
    accessoryPerPcInput: document.getElementById('accessoryPerPcInput'),
    accessorySellingInput: document.getElementById('accessorySellingInput'),
    accessoryMrpInput: document.getElementById('accessoryMrpInput'),
    accessoryNotesInput: document.getElementById('accessoryNotesInput'),
    accessoryTableBody: document.getElementById('accessoryTableBody'),
    accessorySearch: document.getElementById('accessorySearch'),
    brandMasterList: document.getElementById('brandMasterList'),
    typeMasterList: document.getElementById('typeMasterList'),
    btnResetForm: document.getElementById('btnResetForm'),
    btnCancelAccessoryEdit: document.getElementById('btnCancelAccessoryEdit'),
    btnAddAccessoryBrand: document.getElementById('btnAddAccessoryBrand'),
    btnAddAccessoryType: document.getElementById('btnAddAccessoryType'),
    btnAddBrandMaster: document.getElementById('btnAddBrandMaster'),
    btnAddTypeMaster: document.getElementById('btnAddTypeMaster')
  };

  function updateStatus() {
    const live = window.dbService && window.dbService.isLive;
    els.statusDot.className = `status-dot${live ? ' live' : ''}`;
    els.statusLabel.textContent = live ? 'Supabase Connected' : 'Local Database';
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
  }

  function getBrandOptions() {
    return JSON.parse(localStorage.getItem('mpt_local_accessory_brands') || '[]');
  }

  function getTypeOptions() {
    return JSON.parse(localStorage.getItem('mpt_local_accessory_types') || '[]');
  }

  function persistBrandOptions(brands) {
    localStorage.setItem('mpt_local_accessory_brands', JSON.stringify(brands));
  }

  function persistTypeOptions(types) {
    localStorage.setItem('mpt_local_accessory_types', JSON.stringify(types));
  }

  function renderSelectOptions() {
    const brands = getBrandOptions();
    const types = getTypeOptions();

    els.accessoryBrandSelect.innerHTML = '<option value="">-- Select Brand --</option>' + brands.map((brand) =>
      `<option value="${escapeHtml(brand.name || '')}">${escapeHtml(brand.name || '')}</option>`
    ).join('');

    els.accessoryTypeSelect.innerHTML = '<option value="">-- Select Type --</option>' + types.map((type) =>
      `<option value="${escapeHtml(type.name || '')}">${escapeHtml(type.name || '')}</option>`
    ).join('');
  }

  function renderMasterLists() {
    const brands = getBrandOptions();
    const types = getTypeOptions();

    els.brandMasterList.innerHTML = brands.length
      ? brands.map((brand) => `
        <span class="master-chip">
          <span>${escapeHtml(brand.name || 'Untitled')}</span>
          <button class="chip-action" type="button" data-brand-action="edit" data-brand-name="${escapeHtml(brand.name || '')}" title="Edit brand">✎</button>
          <button class="chip-action" type="button" data-brand-action="delete" data-brand-name="${escapeHtml(brand.name || '')}" title="Delete brand">✕</button>
        </span>
      `).join('')
      : '<span style="color: var(--text-muted); font-size: 12px;">No brands added yet.</span>';

    els.typeMasterList.innerHTML = types.length
      ? types.map((type) => `
        <span class="master-chip">
          <span>${escapeHtml(type.name || 'Untitled')}</span>
          <button class="chip-action" type="button" data-type-action="edit" data-type-name="${escapeHtml(type.name || '')}" title="Edit type">✎</button>
          <button class="chip-action" type="button" data-type-action="delete" data-type-name="${escapeHtml(type.name || '')}" title="Delete type">✕</button>
        </span>
      `).join('')
      : '<span style="color: var(--text-muted); font-size: 12px;">No types added yet.</span>';

    els.brandMasterList.querySelectorAll('[data-brand-action]').forEach((button) => {
      button.addEventListener('click', () => handleBrandMasterAction(button.getAttribute('data-brand-action'), button.getAttribute('data-brand-name')));
    });

    els.typeMasterList.querySelectorAll('[data-type-action]').forEach((button) => {
      button.addEventListener('click', () => handleTypeMasterAction(button.getAttribute('data-type-action'), button.getAttribute('data-type-name')));
    });
  }

  async function saveBrandList(brands) {
    persistBrandOptions(brands);
    renderSelectOptions();
    renderMasterLists();
    if (window.dbService && typeof window.dbService.fetchAccessoryBrands === 'function') {
      try {
        await window.dbService.fetchAccessoryBrands();
      } catch (_) {}
    }
  }

  async function saveTypeList(types) {
    persistTypeOptions(types);
    renderSelectOptions();
    renderMasterLists();
    if (window.dbService && typeof window.dbService.fetchAccessoryTypes === 'function') {
      try {
        await window.dbService.fetchAccessoryTypes();
      } catch (_) {}
    }
  }

  async function handleBrandMasterAction(action, value) {
    const brandName = decodeHtml(value || '');
    if (!brandName) return;

    if (action === 'edit') {
      const newName = window.prompt('Edit accessory brand name:', brandName);
      if (newName === null) return;
      const trimmed = newName.trim();
      if (!trimmed) {
        showAlert('Brand name cannot be empty.');
        return;
      }

      try {
        await window.dbService.updateAccessoryBrand(brandName, trimmed);
        await loadAccessoryData();
        showAlert('Brand updated successfully.');
      } catch (error) {
        showAlert(error.message || 'Brand update failed.');
      }
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm(`Delete brand "${brandName}"? This will remove it from the master list.`);
      if (!confirmed) return;

      try {
        await window.dbService.deleteAccessoryBrand(brandName);
        await loadAccessoryData();
        showAlert('Brand deleted.');
      } catch (error) {
        showAlert(error.message || 'Brand delete failed.');
      }
    }
  }

  async function handleTypeMasterAction(action, value) {
    const typeName = decodeHtml(value || '');
    if (!typeName) return;

    if (action === 'edit') {
      const newName = window.prompt('Edit accessory type name:', typeName);
      if (newName === null) return;
      const trimmed = newName.trim();
      if (!trimmed) {
        showAlert('Type name cannot be empty.');
        return;
      }

      try {
        await window.dbService.updateAccessoryType(typeName, trimmed);
        await loadAccessoryData();
        showAlert('Type updated successfully.');
      } catch (error) {
        showAlert(error.message || 'Type update failed.');
      }
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm(`Delete type "${typeName}"? This will remove it from the master list.`);
      if (!confirmed) return;

      try {
        await window.dbService.deleteAccessoryType(typeName);
        await loadAccessoryData();
        showAlert('Type deleted.');
      } catch (error) {
        showAlert(error.message || 'Type delete failed.');
      }
    }
  }

  function decodeHtml(value) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value || '';
    return textarea.value;
  }

  function calculatePerPcLanding() {
    const landing = Number(els.accessoryLandingInput.value || 0);
    const qty = Number(els.accessoryQtyInput.value || 1);
    if (!qty || qty <= 0) {
      els.accessoryPerPcInput.value = 0;
      return;
    }
    els.accessoryPerPcInput.value = (landing / qty).toFixed(2);
  }

  function fillAccessoryForm(item) {
    if (!item) {
      els.accessoryItemId.value = '';
      els.accessoryBrandSelect.value = '';
      els.accessoryTypeSelect.value = '';
      els.accessorySerialInput.value = '';
      els.accessoryQtyInput.value = 1;
      els.accessoryLandingInput.value = '';
      els.accessoryPerPcInput.value = '';
      els.accessorySellingInput.value = '';
      els.accessoryMrpInput.value = '';
      els.accessoryNotesInput.value = '';
      return;
    }

    els.accessoryItemId.value = item.id || '';
    els.accessoryBrandSelect.value = item.brand || '';
    els.accessoryTypeSelect.value = item.item_type || '';
    els.accessorySerialInput.value = item.serial_no || '';
    els.accessoryQtyInput.value = item.qty || 1;
    els.accessoryLandingInput.value = item.landing_price || 0;
    els.accessoryPerPcInput.value = item.landing_price_per_pc || 0;
    els.accessorySellingInput.value = item.selling_price || 0;
    els.accessoryMrpInput.value = item.mrp || 0;
    els.accessoryNotesInput.value = item.notes || '';
  }

  async function loadAccessoryData() {
    try {
      const [brands, types, items] = await Promise.all([
        window.dbService.fetchAccessoryBrands(),
        window.dbService.fetchAccessoryTypes(),
        window.dbService.fetchAccessoryStock()
      ]);

      localStorage.setItem('mpt_local_accessory_brands', JSON.stringify(brands || []));
      localStorage.setItem('mpt_local_accessory_types', JSON.stringify(types || []));
      localStorage.setItem('mpt_local_accessory_stock', JSON.stringify(items || []));

      renderSelectOptions();
      renderMasterLists();
      renderAccessoryTable();
    } catch (error) {
      console.error('Accessory load failed:', error);
      showAlert(error.message || 'Could not load accessory data');
    }
  }

  function showAlert(message) {
    window.alert(message);
  }

  function renderAccessoryTable() {
    const query = (els.accessorySearch.value || '').trim().toLowerCase();
    const rows = JSON.parse(localStorage.getItem('mpt_local_accessory_stock') || '[]');
    const filtered = rows.filter((row) => {
      if (!query) return true;
      const data = [row.brand, row.item_type, row.serial_no, row.notes].join(' ').toLowerCase();
      return data.includes(query);
    });

    if (!filtered.length) {
      els.accessoryTableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center; color:var(--text-muted); padding:22px;">No accessory stock found.</td>
        </tr>
      `;
      return;
    }

    els.accessoryTableBody.innerHTML = filtered.map((row) => `
      <tr>
        <td><span class="accessory-badge" style="background:${getAccessoryBrandColor(row.brand)};">${escapeHtml(row.brand || '—')}</span></td>
        <td>${escapeHtml(row.item_type || '—')}</td>
        <td>${escapeHtml(row.serial_no || '—')}</td>
        <td>${escapeHtml(String(row.qty || 0))}</td>
        <td class="money rp">${formatMoney(row.landing_price || 0)}</td>
        <td class="money green">${formatMoney(row.landing_price_per_pc || 0)}</td>
        <td class="money green">${formatMoney(row.selling_price || 0)}</td>
        <td class="money">${formatMoney(row.mrp || 0)}</td>
        <td>${escapeHtml(row.notes || '—')}</td>
        <td>
          <div class="stack-compact">
            <button type="button" class="btn btn-secondary btn-sm" data-action="edit" data-id="${escapeHtml(row.id || '')}">Edit</button>
            <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${escapeHtml(row.id || '')}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    els.accessoryTableBody.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', async () => {
        const action = button.getAttribute('data-action');
        const id = button.getAttribute('data-id');
        const item = filtered.find(row => String(row.id) === String(id));
        if (!item) return;

        if (action === 'edit') {
          fillAccessoryForm(item);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        if (action === 'delete') {
          const confirmed = window.confirm(`Delete accessory record for ${item.brand} - ${item.item_type}?`);
          if (!confirmed) return;
          try {
            await window.dbService.deleteAccessoryItem(item.id);
            await loadAccessoryData();
            showAlert('Accessory item deleted.');
          } catch (error) {
            showAlert(error.message || 'Delete failed.');
          }
        }
      });
    });
  }

  function getAccessoryBrandColor(name) {
    const map = {
      vivo: '#2563eb',
      samsung: '#1d4ed8',
      oppo: '#f97316',
      oneplus: '#0f766e',
      realme: '#ec4899',
      xiaomi: '#ef4444',
      anker: '#f59e0b',
      apple: '#8b5cf6'
    };
    return map[String(name || '').trim().toLowerCase()] || '#4f46e5';
  }

  async function handleAccessorySubmit(event) {
    event.preventDefault();

    const item = {
      id: els.accessoryItemId.value || undefined,
      brand: els.accessoryBrandSelect.value,
      item_type: els.accessoryTypeSelect.value,
      serial_no: els.accessorySerialInput.value.trim(),
      qty: Number(els.accessoryQtyInput.value || 1),
      landing_price: Number(els.accessoryLandingInput.value || 0),
      landing_price_per_pc: Number(els.accessoryPerPcInput.value || 0),
      selling_price: Number(els.accessorySellingInput.value || 0),
      mrp: Number(els.accessoryMrpInput.value || 0),
      notes: els.accessoryNotesInput.value.trim()
    };

    try {
      await window.dbService.saveAccessoryItem(item);
      fillAccessoryForm(null);
      await loadAccessoryData();
      showAlert('Accessory stock saved successfully.');
    } catch (error) {
      showAlert(error.message || 'Unable to save accessory data.');
    }
  }

  async function addBrandQuick() {
    const name = window.prompt('Enter accessory brand name:');
    if (!name || !name.trim()) return;
    const trimmed = name.trim();

    try {
      if (window.dbService && typeof window.dbService.addAccessoryBrand === 'function') {
        await window.dbService.addAccessoryBrand(trimmed);
      }

      const brands = getBrandOptions();
      if (!brands.some((item) => String(item.name).toLowerCase() === trimmed.toLowerCase())) {
        brands.push({ id: 'acc-brand-' + Math.random().toString(36).slice(2, 9), name: trimmed, created_at: new Date().toISOString() });
        persistBrandOptions(brands);
      }

      renderSelectOptions();
      renderMasterLists();
      showAlert('Accessory brand added.');
    } catch (error) {
      showAlert(error.message || 'Brand add failed.');
    }
  }

  async function addTypeQuick() {
    const name = window.prompt('Enter accessory type:');
    if (!name || !name.trim()) return;
    const trimmed = name.trim();

    try {
      if (window.dbService && typeof window.dbService.addAccessoryType === 'function') {
        await window.dbService.addAccessoryType(trimmed);
      }

      const types = getTypeOptions();
      if (!types.some((item) => String(item.name).toLowerCase() === trimmed.toLowerCase())) {
        types.push({ id: 'acc-type-' + Math.random().toString(36).slice(2, 9), name: trimmed, created_at: new Date().toISOString() });
        persistTypeOptions(types);
      }

      renderSelectOptions();
      renderMasterLists();
      showAlert('Accessory type added.');
    } catch (error) {
      showAlert(error.message || 'Type add failed.');
    }
  }

  function bindEvents() {
    els.appIcon.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    els.accessoryQtyInput.addEventListener('input', calculatePerPcLanding);
    els.accessoryLandingInput.addEventListener('input', calculatePerPcLanding);
    els.accessoryForm.addEventListener('submit', handleAccessorySubmit);
    els.btnResetForm.addEventListener('click', () => fillAccessoryForm(null));
    els.btnCancelAccessoryEdit.addEventListener('click', () => fillAccessoryForm(null));
    els.accessorySearch.addEventListener('input', renderAccessoryTable);
    els.btnAddAccessoryBrand.addEventListener('click', addBrandQuick);
    els.btnAddAccessoryType.addEventListener('click', addTypeQuick);
    els.btnAddBrandMaster.addEventListener('click', addBrandQuick);
    els.btnAddTypeMaster.addEventListener('click', addTypeQuick);
  }

  async function init() {
    updateStatus();
    bindEvents();
    renderSelectOptions();
    renderMasterLists();
    await loadAccessoryData();
    calculatePerPcLanding();
  }

  init();
}());

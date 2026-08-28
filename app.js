/**
 * Mobile Price Tracker - Application Logic (Vanilla JavaScript)
 * High-performance, mobile-optimized event handling, real-time filtering,
 * modal workflows, price history comparator, and IMEI camera barcode scanner.
 */

(function () {
  'use strict';

  // State
  let state = {
    products: [],
    brands: [],
    selectedBrand: 'ALL',
    searchQuery: '',
    currentHistoryProductId: null,
    currentImeiProductId: null,
    productToDeleteId: null,
    html5QrCode: null,
    currentCameraIndex: 0,
    availableCameras: [],
    isScanning: false,
    isProcessingScan: false,
    scannerTarget: 'imeiModal', // 'imeiModal' | 'productForm'
    draggedBrandName: null
  };

  // DOM Elements Cache
  const el = {
    statusDot: document.getElementById('statusDot'),
    statusLabel: document.getElementById('statusLabel'),
    searchInput: document.getElementById('searchInput'),
    btnSearchClear: document.getElementById('btnSearchClear'),
    brandPillsContainer: document.getElementById('brandPillsContainer'),
    summaryCount: document.getElementById('summaryCount'),
    productListContainer: document.getElementById('productListContainer'),
    desktopTableBody: document.getElementById('desktopTableBody'),
    emptyState: document.getElementById('emptyState'),
    fabAddProduct: document.getElementById('fabAddProduct'),
    btnOpenAddModal: document.getElementById('btnOpenAddModal'),
    btnEmptyAdd: document.getElementById('btnEmptyAdd'),

    // Product Modal
    productModalOverlay: document.getElementById('productModalOverlay'),
    productModalTitle: document.getElementById('productModalTitle'),
    btnCloseProductModal: document.getElementById('btnCloseProductModal'),
    btnCancelProduct: document.getElementById('btnCancelProduct'),
    productForm: document.getElementById('productForm'),
    editProductId: document.getElementById('editProductId'),
    productBrandSelect: document.getElementById('productBrandSelect'),
    btnInlineAddBrand: document.getElementById('btnInlineAddBrand'),
    productModelInput: document.getElementById('productModelInput'),
    productVariantInput: document.getElementById('productVariantInput'),
    productColorInput: document.getElementById('productColorInput'),
    productDpInput: document.getElementById('productDpInput'),
    productMopInput: document.getElementById('productMopInput'),
    productMrpInput: document.getElementById('productMrpInput'),
    productImeiFieldGroup: document.getElementById('productImeiFieldGroup'),
    productImeiInput: document.getElementById('productImeiInput'),
    btnProductScanImei: document.getElementById('btnProductScanImei'),
    productImeiValidationMsg: document.getElementById('productImeiValidationMsg'),
    editPriceNote: document.getElementById('editPriceNote'),

    // History Modal
    historyModalOverlay: document.getElementById('historyModalOverlay'),
    historyModalTitle: document.getElementById('historyModalTitle'),
    historyModalSubtitle: document.getElementById('historyModalSubtitle'),
    btnClearAllHistory: document.getElementById('btnClearAllHistory'),
    btnCloseHistoryModal: document.getElementById('btnCloseHistoryModal'),
    btnCloseHistoryFooter: document.getElementById('btnCloseHistoryFooter'),
    historyTimelineContainer: document.getElementById('historyTimelineContainer'),
    historyEmptyState: document.getElementById('historyEmptyState'),

    // IMEI Modal
    editingImeiId: document.getElementById('editingImeiId'),
    editingOldImei: document.getElementById('editingOldImei'),
    imeiFormTitle: document.getElementById('imeiFormTitle'),
    btnCancelEditImei: document.getElementById('btnCancelEditImei'),
    imeiDpInput: document.getElementById('imeiDpInput'),
    imeiMopInput: document.getElementById('imeiMopInput'),
    imeiMrpInput: document.getElementById('imeiMrpInput'),
    imeiNotesInput: document.getElementById('imeiNotesInput'),
    btnResetImeiPriceToDefault: document.getElementById('btnResetImeiPriceToDefault'),
    imeiModalOverlay: document.getElementById('imeiModalOverlay'),
    imeiModalSubtitle: document.getElementById('imeiModalSubtitle'),
    btnCloseImeiModal: document.getElementById('btnCloseImeiModal'),
    btnCloseImeiFooter: document.getElementById('btnCloseImeiFooter'),
    imeiAddForm: document.getElementById('imeiAddForm'),
    imeiInput: document.getElementById('imeiInput'),
    btnAddImeiBtn: document.getElementById('btnAddImeiBtn'),
    btnLaunchScanner: document.getElementById('btnLaunchScanner'),
    imeiValidationMsg: document.getElementById('imeiValidationMsg'),
    imeiListCountLabel: document.getElementById('imeiListCountLabel'),
    imeiItemsList: document.getElementById('imeiItemsList'),

    // Scanner Modal
    scannerModalOverlay: document.getElementById('scannerModalOverlay'),
    btnCloseScannerModal: document.getElementById('btnCloseScannerModal'),
    btnStopScanner: document.getElementById('btnStopScanner'),
    btnSwitchCamera: document.getElementById('btnSwitchCamera'),

    // Brand Modal
    brandModalOverlay: document.getElementById('brandModalOverlay'),
    brandForm: document.getElementById('brandForm'),
    newBrandNameInput: document.getElementById('newBrandNameInput'),
    deleteBrandSelect: document.getElementById('deleteBrandSelect'),
    btnDeleteBrand: document.getElementById('btnDeleteBrand'),
    btnCloseBrandModal: document.getElementById('btnCloseBrandModal'),
    btnCancelBrand: document.getElementById('btnCancelBrand'),

    // Delete Confirm Modal
    deleteModalOverlay: document.getElementById('deleteModalOverlay'),
    deleteProductDetails: document.getElementById('deleteProductDetails'),
    btnCloseDeleteModal: document.getElementById('btnCloseDeleteModal'),
    btnCancelDelete: document.getElementById('btnCancelDelete'),
    btnConfirmDelete: document.getElementById('btnConfirmDelete'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // Currency Formatter
  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  function formatCurrency(val) {
    if (val === undefined || val === null || isNaN(val)) return '₹0';
    return currencyFormatter.format(Number(val));
  }

  // Date Formatter
  function formatDateTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timePart = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${datePart}, ${timePart}`;
  }

  function formatDateOnly(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // Toast Notification Manager
  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  // Update Status Tag (Supabase Live vs Local Storage)
  function updateConnectionStatus() {
    if (window.dbService && window.dbService.isLive) {
      el.statusDot.className = 'status-dot live';
      el.statusLabel.textContent = 'Supabase Connected';
      el.statusLabel.style.color = '#047857';
    } else {
      el.statusDot.className = 'status-dot';
      el.statusLabel.textContent = 'Local Database';
      el.statusLabel.style.color = '#64748b';
    }
  }

  // ================= DATA LOADING & RENDERING ================= //

  async function loadBrands() {
    try {
      const brands = await window.dbService.fetchBrands();
      state.brands = brands;
      renderBrandPills();
      renderBrandSelectOptions();
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  }

  function renderBrandPills() {
    // Keep 'All' pill, append distinct brand pills
    const allPill = `<button class="brand-pill ${state.selectedBrand === 'ALL' ? 'active' : ''}" data-brand="ALL" id="pillBrandAll">All Brands</button>`;
    const pillsHtml = state.brands.map(b => {
      const active = state.selectedBrand === b.name ? 'active' : '';
      return `<button class="brand-pill ${active}" data-brand="${escapeHtml(b.name)}" draggable="true" title="Drag to reorder">${escapeHtml(b.name)}</button>`;
    }).join('');

    el.brandPillsContainer.innerHTML = allPill + pillsHtml;

    // Attach click events
    el.brandPillsContainer.querySelectorAll('.brand-pill').forEach(pill => {
      if (pill.dataset.brand !== 'ALL') {
        pill.addEventListener('dragstart', () => {
          state.draggedBrandName = pill.dataset.brand;
          pill.classList.add('dragging');
        });
        pill.addEventListener('dragend', () => {
          state.draggedBrandName = null;
          pill.classList.remove('dragging');
        });
        pill.addEventListener('dragover', event => event.preventDefault());
        pill.addEventListener('drop', event => {
          event.preventDefault();
          const targetBrandName = pill.dataset.brand;
          if (!state.draggedBrandName || state.draggedBrandName === targetBrandName) return;
          const draggedIndex = state.brands.findIndex(brand => brand.name === state.draggedBrandName);
          const targetIndex = state.brands.findIndex(brand => brand.name === targetBrandName);
          const [draggedBrand] = state.brands.splice(draggedIndex, 1);
          state.brands.splice(draggedIndex < targetIndex ? targetIndex - 1 : targetIndex, 0, draggedBrand);
          window.dbService.saveBrandOrder(state.brands);
          renderBrandPills();
          renderBrandSelectOptions();
          renderDeleteBrandOptions();
        });
      }
      pill.addEventListener('click', () => {
        const brand = pill.getAttribute('data-brand');
        if (state.selectedBrand !== brand) {
          state.selectedBrand = brand;
          renderBrandPills();
          loadProducts();
        }
      });
    });
  }

  function renderBrandSelectOptions(selectedName = '') {
    const defaultOption = '<option value="">-- Select Brand --</option>';
    const optionsHtml = state.brands.map(b => {
      const isSelected = (selectedName && selectedName.toLowerCase() === b.name.toLowerCase()) ? 'selected' : '';
      return `<option value="${escapeHtml(b.name)}" ${isSelected}>${escapeHtml(b.name)}</option>`;
    }).join('');
    el.productBrandSelect.innerHTML = defaultOption + optionsHtml;
  }

  async function loadProducts() {
    try {
      const products = await window.dbService.fetchProducts(state.searchQuery, state.selectedBrand);
      state.products = products;
      renderProducts();
    } catch (err) {
      console.error('Error loading products:', err);
      showToast('Failed to load products: ' + err.message, 'error');
    }
  }

  function renderProducts() {
    const count = state.products.length;
    el.summaryCount.textContent = `Showing ${count} ${count === 1 ? 'Mobile' : 'Mobiles'}`;

    if (count === 0) {
      el.productListContainer.innerHTML = '';
      el.desktopTableBody.innerHTML = '';
      el.emptyState.classList.remove('hidden');
      return;
    }

    el.emptyState.classList.add('hidden');

    // 1. Render Mobile Compact Card View
    const cardsHtml = state.products.map(p => {
      return `
        <article class="product-card" data-id="${p.id}" id="prodCard-${p.id}">
          <div class="card-header-row">
            <div class="card-title-group">
              <span class="brand-badge">${escapeHtml(p.brand)}</span>
              <span class="model-name">${escapeHtml(p.model)}</span>
              ${p.variant ? `<span class="variant-tag">${escapeHtml(p.variant)}</span>` : ''}
              ${p.color ? `<span class="color-tag">${escapeHtml(p.color)}</span>` : ''}
            </div>
            <div class="card-actions-quick">
              <button class="action-btn history-btn" data-action="history" data-id="${p.id}" title="View Price History">
                📊 History
              </button>
            </div>
          </div>

          <div class="price-grid">
            <div class="price-item clickable-price" data-action="quick-edit" data-id="${p.id}" data-field="dp" title="Click to edit DP">
              <span class="price-label">DP ✏️</span>
              <span class="price-val dp">${formatCurrency(p.current_dp)}</span>
            </div>
            <div class="price-item clickable-price" data-action="quick-edit" data-id="${p.id}" data-field="mop" title="Click to edit MOP">
              <span class="price-label">MOP ✏️</span>
              <span class="price-val mop">${formatCurrency(p.current_mop)}</span>
            </div>
            <div class="price-item clickable-price" data-action="quick-edit" data-id="${p.id}" data-field="mrp" title="Click to edit MRP">
              <span class="price-label">MRP ✏️</span>
              <span class="price-val mrp">${formatCurrency(p.current_mrp)}</span>
            </div>
          </div>

          <div class="card-footer-row">
            <button class="imei-badge-btn" data-action="imei" data-id="${p.id}" title="Manage IMEIs">
              <span>IMEIs</span>
              <span class="imei-count">${p.imei_count || 0}</span>
            </button>

            <div class="card-actions">
              <button class="action-btn" data-action="edit" data-id="${p.id}" title="Edit Product / Update Price">
                ✏️ Edit
              </button>
              <button class="action-btn delete-btn" data-action="delete" data-id="${p.id}" title="Delete Product">
                🗑️ Delete
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    el.productListContainer.innerHTML = cardsHtml;

    // 2. Render Desktop Table Rows
    const tableRowsHtml = state.products.map(p => {
      return `
        <tr data-id="${p.id}">
          <td>
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="brand-badge">${escapeHtml(p.brand)}</span>
              <strong style="font-size:15px;">${escapeHtml(p.model)}</strong>
            </div>
          </td>
          <td>${p.variant ? `<span class="variant-tag">${escapeHtml(p.variant)}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
          <td>${p.color ? escapeHtml(p.color) : '<span style="color:var(--text-muted);">-</span>'}</td>
          <td class="text-right price-cell clickable-price" data-action="quick-edit" data-id="${p.id}" data-field="dp" style="color:var(--dp-color);" title="Click to edit DP">${formatCurrency(p.current_dp)}</td>
          <td class="text-right price-cell clickable-price" data-action="quick-edit" data-id="${p.id}" data-field="mop" style="color:var(--mop-color);" title="Click to edit MOP">${formatCurrency(p.current_mop)}</td>
          <td class="text-right price-cell clickable-price" data-action="quick-edit" data-id="${p.id}" data-field="mrp" style="color:var(--mrp-color);" title="Click to edit MRP">${formatCurrency(p.current_mrp)}</td>
          <td class="text-center">
            <button class="imei-badge-btn" data-action="imei" data-id="${p.id}">
              <span>IMEIs</span>
              <span class="imei-count">${p.imei_count || 0}</span>
            </button>
          </td>
          <td class="text-right">
            <div style="display:inline-flex; gap:4px;">
              <button class="action-btn history-btn" data-action="history" data-id="${p.id}">
                📊 History
              </button>
              <button class="action-btn" data-action="edit" data-id="${p.id}">
                ✏️ Edit
              </button>
              <button class="action-btn delete-btn" data-action="delete" data-id="${p.id}">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    el.desktopTableBody.innerHTML = tableRowsHtml;
  }

  // Delegated Event Handlers for Product List & Table Actions
  function setupProductActionHandlers() {
    const handleAction = (e) => {
      const targetBtn = e.target.closest('[data-action]');
      if (!targetBtn) return;
      const action = targetBtn.getAttribute('data-action');
      const productId = targetBtn.getAttribute('data-id');

      if (action === 'edit') {
        openEditProductModal(productId);
      } else if (action === 'quick-edit') {
        const field = targetBtn.getAttribute('data-field');
        openEditProductModal(productId, field);
      } else if (action === 'delete') {
        openDeleteModal(productId);
      } else if (action === 'history') {
        openHistoryModal(productId);
      } else if (action === 'imei') {
        openImeiModal(productId);
      }
    };

    el.productListContainer.addEventListener('click', handleAction);
    el.desktopTableBody.addEventListener('click', handleAction);
  }

  // ================= MODAL MANAGERS ================= //

  function openAddProductModal() {
    el.productForm.reset();
    el.editProductId.value = '';
    el.productModalTitle.textContent = 'Add Mobile Product';
    el.editPriceNote.classList.add('hidden');
    
    // Show and reset IMEI field for new product creation
    el.productImeiFieldGroup.classList.remove('hidden');
    el.productImeiInput.value = '';
    el.productImeiValidationMsg.className = 'scanner-hint hidden';
    el.productImeiValidationMsg.textContent = '';

    renderBrandSelectOptions();
    el.productModalOverlay.classList.add('active');
    setTimeout(() => {
      if (el.productBrandSelect) el.productBrandSelect.focus();
    }, 100);
  }

  async function openEditProductModal(productId, focusField = null) {
    const product = state.products.find(p => p.id === productId) || await window.dbService.getProductById(productId);
    if (!product) return;

    el.editProductId.value = product.id;
    el.productModalTitle.textContent = `Edit Mobile - ${product.brand} ${product.model}`;
    renderBrandSelectOptions(product.brand);
    el.productModelInput.value = product.model;
    el.productVariantInput.value = product.variant || '';
    el.productColorInput.value = product.color || '';
    el.productDpInput.value = product.current_dp;
    el.productMopInput.value = product.current_mop;
    el.productMrpInput.value = product.current_mrp;
    el.editPriceNote.classList.remove('hidden');

    // Hide initial IMEI input in edit mode (IMEIs are managed via dedicated IMEI modal)
    el.productImeiFieldGroup.classList.add('hidden');
    el.productImeiInput.value = '';

    el.productModalOverlay.classList.add('active');

    // Focus requested field or DP by default
    setTimeout(() => {
      if (focusField === 'dp' && el.productDpInput) {
        el.productDpInput.focus();
        el.productDpInput.select();
      } else if (focusField === 'mop' && el.productMopInput) {
        el.productMopInput.focus();
        el.productMopInput.select();
      } else if (focusField === 'mrp' && el.productMrpInput) {
        el.productMrpInput.focus();
        el.productMrpInput.select();
      } else if (el.productDpInput) {
        el.productDpInput.focus();
        el.productDpInput.select();
      }
    }, 100);
  }

  function closeProductModal() {
    el.productModalOverlay.classList.remove('active');
  }

  // Product Form Submission (Add / Update Price Logic with Unique IMEI verification)
  async function handleProductFormSubmit(e) {
    e.preventDefault();
    const isEdit = Boolean(el.editProductId.value);
    const brand = el.productBrandSelect.value;
    const model = el.productModelInput.value;
    const variant = el.productVariantInput.value;
    const color = el.productColorInput.value;
    const dp = Number(el.productDpInput.value);
    const mop = Number(el.productMopInput.value);
    const mrp = Number(el.productMrpInput.value);
    const imei = el.productImeiInput ? el.productImeiInput.value.trim() : '';

    if (!brand || !model || isNaN(dp) || isNaN(mop) || isNaN(mrp)) {
      showToast('Please fill all required fields properly', 'error');
      return;
    }

    // If an IMEI was provided when adding product, check uniqueness upfront
    if (!isEdit && imei) {
      try {
        const existing = await window.dbService.checkImeiExists(imei);
        if (existing) {
          const prodInfo = existing.product
            ? `${existing.product.brand} ${existing.product.model}`
            : 'another product';
          el.productImeiValidationMsg.className = 'scanner-hint';
          el.productImeiValidationMsg.style.color = 'var(--danger)';
          el.productImeiValidationMsg.textContent = `❌ IMEI "${imei}" already exists in the system (Assigned to ${prodInfo}). IMEI must be unique!`;
          showToast(`IMEI already exists (${prodInfo})`, 'error');
          el.productImeiInput.focus();
          return;
        }
      } catch (checkErr) {
        console.warn('IMEI check warning:', checkErr);
      }
    }

    const payload = {
      brand,
      model,
      variant,
      color,
      current_dp: dp,
      current_mop: mop,
      current_mrp: mrp,
      imei: !isEdit ? imei : undefined
    };

    try {
      if (isEdit) {
        const editId = el.editProductId.value;
        const result = await window.dbService.updateProduct(editId, payload);

        // Immediately update state and re-render dashboard UI without waiting for re-fetch
        const existingIdx = state.products.findIndex(p => String(p.id) === String(editId));
        if (existingIdx !== -1) {
          state.products[existingIdx] = {
            ...state.products[existingIdx],
            ...(result.product || {}),
            current_dp: dp,
            current_mop: mop,
            current_mrp: mrp,
            brand,
            model,
            variant,
            color,
            updated_at: result.product?.updated_at || new Date().toISOString()
          };
        }
        renderProducts();

        if (result.priceChanged) {
          showToast(`Prices updated! Previous price & date logged in history.`, 'success');
          // If history modal is currently open for this product, refresh timeline immediately
          if (state.currentHistoryProductId === editId && el.historyModalOverlay.classList.contains('active')) {
            const historyRecords = await window.dbService.fetchPriceHistory(editId);
            renderPriceHistory(historyRecords);
          }
        } else {
          showToast(`Product updated successfully.`, 'info');
        }
      } else {
        const newProduct = await window.dbService.addProduct(payload);
        if (newProduct) {
          state.products.unshift(newProduct);
          renderProducts();
        }
        const imeiMsg = imei ? ` with IMEI (${imei})` : '';
        showToast(`Added ${brand} ${model}${imeiMsg} to price list!`, 'success');
      }

      closeProductModal();
      await loadProducts();
      await loadBrands();
    } catch (err) {
      console.error('Save product error:', err);
      if (err.isDuplicate) {
        el.productImeiValidationMsg.className = 'scanner-hint';
        el.productImeiValidationMsg.style.color = 'var(--danger)';
        el.productImeiValidationMsg.textContent = `❌ ${err.message}`;
      }
      showToast(err.message || 'Failed to save product', 'error');
    }
  }

  // ================= PRICE HISTORY MODAL ================= //

  async function openHistoryModal(productId) {
    state.currentHistoryProductId = productId;
    const product = state.products.find(p => p.id === productId) || await window.dbService.getProductById(productId);
    if (!product) return;

    el.historyModalTitle.textContent = `Price History`;
    el.historyModalSubtitle.textContent = `${product.brand} ${product.model} ${product.variant ? `(${product.variant})` : ''} • Current: DP ${formatCurrency(product.current_dp)} | MOP ${formatCurrency(product.current_mop)} | MRP ${formatCurrency(product.current_mrp)}`;

    try {
      const historyRecords = await window.dbService.fetchPriceHistory(productId);
      renderPriceHistory(historyRecords);
      el.historyModalOverlay.classList.add('active');
    } catch (err) {
      console.error('History load error:', err);
      showToast('Failed to load price history: ' + err.message, 'error');
    }
  }

  function renderPriceHistory(records) {
    if (!records || records.length === 0) {
      el.historyTimelineContainer.innerHTML = '';
      el.historyEmptyState.classList.remove('hidden');
      if (el.btnClearAllHistory) el.btnClearAllHistory.classList.add('hidden');
      return;
    }

    el.historyEmptyState.classList.add('hidden');
    if (el.btnClearAllHistory) el.btnClearAllHistory.classList.remove('hidden');

    const html = records.map(rec => {
      // DP shift
      const dpChanged = rec.old_dp !== rec.new_dp;
      const dpClass = rec.new_dp > rec.old_dp ? 'up' : 'down';
      const dpHtml = dpChanged
        ? `<div class="history-shift">
             <span class="old-price">${formatCurrency(rec.old_dp)}</span>
             <span class="arrow">→</span>
             <span class="new-price ${dpClass}">${formatCurrency(rec.new_dp)}</span>
           </div>`
        : `<span class="history-no-change">No Change (${formatCurrency(rec.new_dp)})</span>`;

      // MOP shift
      const mopChanged = rec.old_mop !== rec.new_mop;
      const mopClass = rec.new_mop > rec.old_mop ? 'up' : 'down';
      const mopHtml = mopChanged
        ? `<div class="history-shift">
             <span class="old-price">${formatCurrency(rec.old_mop)}</span>
             <span class="arrow">→</span>
             <span class="new-price ${mopClass}">${formatCurrency(rec.new_mop)}</span>
           </div>`
        : `<span class="history-no-change">No Change (${formatCurrency(rec.new_mop)})</span>`;

      // MRP shift
      const mrpChanged = rec.old_mrp !== rec.new_mrp;
      const mrpClass = rec.new_mrp > rec.old_mrp ? 'up' : 'down';
      const mrpHtml = mrpChanged
        ? `<div class="history-shift">
             <span class="old-price">${formatCurrency(rec.old_mrp)}</span>
             <span class="arrow">→</span>
             <span class="new-price ${mrpClass}">${formatCurrency(rec.new_mrp)}</span>
           </div>`
        : `<span class="history-no-change">No Change (${formatCurrency(rec.new_mrp)})</span>`;

      return `
        <div class="history-card" data-id="${rec.id}">
          <div class="history-header">
            <span class="history-date">📅 ${formatDateTime(rec.changed_at)}</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11px; font-weight:700; color:var(--text-muted); background:var(--bg-card-hover); padding:2px 6px; border-radius:4px;">PRICE LOG</span>
              <button type="button" class="history-delete-btn" data-history-id="${rec.id}" title="Delete this price history record" style="background:none; border:none; cursor:pointer; color:var(--danger); font-size:13px; padding:2px 4px; border-radius:4px; opacity:0.85;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.85'">
                🗑️ Delete
              </button>
            </div>
          </div>

          <div class="history-price-row">
            <span class="history-label" style="color:var(--dp-color);">DP:</span>
            ${dpHtml}
          </div>

          <div class="history-price-row">
            <span class="history-label" style="color:var(--mop-color);">MOP:</span>
            ${mopHtml}
          </div>

          <div class="history-price-row">
            <span class="history-label" style="color:var(--mrp-color);">MRP:</span>
            ${mrpHtml}
          </div>
        </div>
      `;
    }).join('');

    el.historyTimelineContainer.innerHTML = html;

    // Attach click listeners for individual history record deletion
    el.historyTimelineContainer.querySelectorAll('.history-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const histId = btn.getAttribute('data-history-id');
        if (!histId) return;

        if (confirm('Delete this price history record?')) {
          try {
            await window.dbService.deletePriceHistory(histId);
            showToast('Price history record deleted', 'info');
            if (state.currentHistoryProductId) {
              const updated = await window.dbService.fetchPriceHistory(state.currentHistoryProductId);
              renderPriceHistory(updated);
            }
          } catch (err) {
            console.error('Delete history error:', err);
            showToast('Failed to delete history: ' + err.message, 'error');
          }
        }
      });
    });
  }

  function closeHistoryModal() {
    el.historyModalOverlay.classList.remove('active');
    state.currentHistoryProductId = null;
  }

  // ================= IMEI MANAGEMENT (EDIT, MODIFY, DELETE, COPY) ================= //

  function resetImeiForm() {
    if (el.editingImeiId) el.editingImeiId.value = '';
    if (el.editingOldImei) el.editingOldImei.value = '';
    if (el.imeiFormTitle) el.imeiFormTitle.innerHTML = `Add New IMEI (15 Digits / Barcode) <span style="color:var(--danger)">*</span>`;
    if (el.btnAddImeiBtn) el.btnAddImeiBtn.textContent = '+ Save IMEI';
    if (el.btnCancelEditImei) el.btnCancelEditImei.classList.add('hidden');
    if (el.imeiInput) el.imeiInput.value = '';
    if (el.imeiNotesInput) el.imeiNotesInput.value = '';
    if (el.imeiValidationMsg) {
      el.imeiValidationMsg.className = 'scanner-hint hidden';
      el.imeiValidationMsg.textContent = '';
    }

    // Auto-fill price overrides from current product's base price
    handleResetImeiPriceToDefault();

    // Remove editing highlights from list items
    if (el.imeiItemsList) {
      el.imeiItemsList.querySelectorAll('.imei-item').forEach(item => item.classList.remove('editing-now'));
    }
  }

  function handleResetImeiPriceToDefault() {
    if (!state.currentImeiProductId) return;
    const product = state.products.find(p => p.id === state.currentImeiProductId);
    if (!product) return;

    if (el.imeiDpInput) el.imeiDpInput.value = product.current_dp !== undefined ? product.current_dp : '';
    if (el.imeiMopInput) el.imeiMopInput.value = product.current_mop !== undefined ? product.current_mop : '';
    if (el.imeiMrpInput) el.imeiMrpInput.value = product.current_mrp !== undefined ? product.current_mrp : '';
  }

  function startEditImei(imeiRecord) {
    if (!imeiRecord) return;
    if (el.editingImeiId) el.editingImeiId.value = imeiRecord.id;
    if (el.editingOldImei) el.editingOldImei.value = imeiRecord.imei;
    if (el.imeiFormTitle) el.imeiFormTitle.innerHTML = `✏️ Modify IMEI <span class="font-mono">(${escapeHtml(imeiRecord.imei)})</span>`;
    if (el.btnAddImeiBtn) el.btnAddImeiBtn.textContent = '💾 Update IMEI';
    if (el.btnCancelEditImei) el.btnCancelEditImei.classList.remove('hidden');

    if (el.imeiInput) {
      el.imeiInput.value = imeiRecord.imei;
      el.imeiInput.focus();
    }

    const product = state.products.find(p => p.id === state.currentImeiProductId);
    if (el.imeiDpInput) el.imeiDpInput.value = imeiRecord.dp !== null && imeiRecord.dp !== undefined ? imeiRecord.dp : (product?.current_dp || '');
    if (el.imeiMopInput) el.imeiMopInput.value = imeiRecord.mop !== null && imeiRecord.mop !== undefined ? imeiRecord.mop : (product?.current_mop || '');
    if (el.imeiMrpInput) el.imeiMrpInput.value = imeiRecord.mrp !== null && imeiRecord.mrp !== undefined ? imeiRecord.mrp : (product?.current_mrp || '');
    if (el.imeiNotesInput) el.imeiNotesInput.value = imeiRecord.notes || '';

    if (el.imeiValidationMsg) {
      el.imeiValidationMsg.className = 'scanner-hint hidden';
      el.imeiValidationMsg.textContent = '';
    }

    // Highlight row in list
    if (el.imeiItemsList) {
      el.imeiItemsList.querySelectorAll('.imei-item').forEach(item => {
        if (item.getAttribute('data-id') === imeiRecord.id) {
          item.classList.add('editing-now');
        } else {
          item.classList.remove('editing-now');
        }
      });
    }

    // Scroll form to top
    if (el.imeiAddForm) {
      el.imeiAddForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  async function openImeiModal(productId) {
    state.currentImeiProductId = productId;
    const product = state.products.find(p => p.id === productId) || await window.dbService.getProductById(productId);
    if (!product) return;

    el.imeiModalSubtitle.textContent = `${product.brand} ${product.model} ${product.variant ? `(${product.variant})` : ''} • Base MOP: ${formatCurrency(product.current_mop)}`;
    resetImeiForm();

    await loadImeisForCurrentProduct();
    el.imeiModalOverlay.classList.add('active');
  }

  async function loadImeisForCurrentProduct() {
    if (!state.currentImeiProductId) return;
    try {
      const imeis = await window.dbService.fetchImeis(state.currentImeiProductId);
      const product = state.products.find(p => p.id === state.currentImeiProductId);
      el.imeiListCountLabel.textContent = `Stored IMEIs (${imeis.length})`;

      if (imeis.length === 0) {
        el.imeiItemsList.innerHTML = `
          <div style="text-align:center; padding:24px 16px; color:var(--text-muted); font-size:13px; background:#f8fafc; border-radius:var(--radius-md); border:1px dashed var(--border-color);">
            <div style="font-size:24px; margin-bottom:4px;">📱</div>
            <div style="font-weight:600;">No IMEIs recorded for this mobile yet.</div>
            <div style="font-size:12px; margin-top:2px;">Scan the box barcode or type the 15-digit number above to add units.</div>
          </div>
        `;
        return;
      }

      const activeEditId = el.editingImeiId ? el.editingImeiId.value : '';

      el.imeiItemsList.innerHTML = imeis.map(i => {
        const isEditing = i.id === activeEditId;
        const dpVal = i.dp !== null && i.dp !== undefined ? i.dp : (product ? product.current_dp : null);
        const mopVal = i.mop !== null && i.mop !== undefined ? i.mop : (product ? product.current_mop : null);
        const mrpVal = i.mrp !== null && i.mrp !== undefined ? i.mrp : (product ? product.current_mrp : null);

        const customPriceBadge = (i.dp !== null && i.dp !== undefined) || (i.mop !== null && i.mop !== undefined) || (i.mrp !== null && i.mrp !== undefined)
          ? `<span style="font-size:10px; font-weight:700; color:var(--primary); background:rgba(37,99,235,0.08); padding:1px 5px; border-radius:3px;">Custom Price</span>`
          : '';

        const noteBadge = i.notes
          ? `<span class="imei-notes-tag" title="Note: ${escapeHtml(i.notes)}">📝 ${escapeHtml(i.notes)}</span>`
          : '';

        return `
          <div class="imei-item ${isEditing ? 'editing-now' : ''}" data-id="${i.id}">
            <div class="imei-item-header">
              <div class="imei-title-group">
                <span class="imei-number">${escapeHtml(i.imei)}</span>
                <button type="button" class="imei-copy-btn" data-imei="${escapeHtml(i.imei)}" title="Copy IMEI">
                  📋 Copy
                </button>
                ${customPriceBadge}
              </div>
              <div class="imei-actions-group">
                <button type="button" class="imei-btn-action edit" data-edit-id="${i.id}" title="Edit / Modify IMEI">
                  ✏️ Edit
                </button>
                <button type="button" class="imei-btn-action delete" data-delete-id="${i.id}" data-imei="${escapeHtml(i.imei)}" title="Delete IMEI">
                  🗑️
                </button>
              </div>
            </div>

            <div class="imei-price-pill-row">
              <span class="imei-price-tag dp">DP: ${dpVal !== null ? formatCurrency(dpVal) : '—'}</span>
              <span class="imei-price-tag mop">MOP: ${mopVal !== null ? formatCurrency(mopVal) : '—'}</span>
              <span class="imei-price-tag mrp">MRP: ${mrpVal !== null ? formatCurrency(mrpVal) : '—'}</span>
              ${noteBadge}
              <span class="imei-meta" style="margin-left:auto;">${formatDateOnly(i.updated_at || i.created_at)}</span>
            </div>
          </div>
        `;
      }).join('');

      // Attach Edit handlers
      el.imeiItemsList.querySelectorAll('.imei-btn-action.edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-edit-id');
          const targetRecord = imeis.find(item => item.id === id);
          if (targetRecord) {
            startEditImei(targetRecord);
          }
        });
      });

      // Attach Delete handlers
      el.imeiItemsList.querySelectorAll('.imei-btn-action.delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-delete-id');
          const imeiNum = btn.getAttribute('data-imei');
          if (confirm(`Are you sure you want to delete IMEI "${imeiNum}"?`)) {
            try {
              await window.dbService.deleteImei(id, imeiNum);
              showToast(`IMEI ${imeiNum} deleted`, 'info');
              if (el.editingImeiId && el.editingImeiId.value === id) {
                resetImeiForm();
              }
              await loadImeisForCurrentProduct();
              await loadProducts(); // Refresh badge counter on main table
            } catch (err) {
              console.error('Delete IMEI error:', err);
              showToast('Failed to delete IMEI: ' + err.message, 'error');
            }
          }
        });
      });

      // Attach Copy handlers
      el.imeiItemsList.querySelectorAll('.imei-copy-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const text = btn.getAttribute('data-imei');
          if (text) {
            try {
              await navigator.clipboard.writeText(text);
              showToast(`Copied IMEI ${text} to clipboard!`, 'info');
            } catch (copyErr) {
              // Fallback
              const tempInput = document.createElement('input');
              tempInput.value = text;
              document.body.appendChild(tempInput);
              tempInput.select();
              document.execCommand('copy');
              document.body.removeChild(tempInput);
              showToast(`Copied IMEI ${text}!`, 'info');
            }
          }
        });
      });

    } catch (err) {
      console.error('Error loading IMEIs:', err);
      showToast('Failed to load IMEIs: ' + err.message, 'error');
    }
  }

  async function handleAddOrUpdateImei(e) {
    if (e) e.preventDefault();
    const editingId = el.editingImeiId ? el.editingImeiId.value.trim() : '';
    const oldImei = el.editingOldImei ? el.editingOldImei.value.trim() : '';
    const imeiVal = el.imeiInput.value.trim();
    
    if (!imeiVal) {
      el.imeiValidationMsg.className = 'scanner-hint';
      el.imeiValidationMsg.style.color = 'var(--danger)';
      el.imeiValidationMsg.textContent = 'Please enter or scan an IMEI number.';
      el.imeiInput.focus();
      return;
    }

    const dpVal = el.imeiDpInput && el.imeiDpInput.value !== '' ? Number(el.imeiDpInput.value) : null;
    const mopVal = el.imeiMopInput && el.imeiMopInput.value !== '' ? Number(el.imeiMopInput.value) : null;
    const mrpVal = el.imeiMrpInput && el.imeiMrpInput.value !== '' ? Number(el.imeiMrpInput.value) : null;
    const notesVal = el.imeiNotesInput ? el.imeiNotesInput.value.trim() : '';

    const payload = {
      imei: imeiVal,
      dp: dpVal,
      mop: mopVal,
      mrp: mrpVal,
      notes: notesVal
    };

    try {
      if (editingId || oldImei) {
        // Update existing IMEI
        await window.dbService.updateImei(editingId, payload, oldImei);
        showToast(`IMEI "${imeiVal}" updated successfully!`, 'success');
      } else {
        // Add new IMEI
        await window.dbService.addImei(state.currentImeiProductId, payload);
        showToast(`IMEI "${imeiVal}" added successfully!`, 'success');
      }

      resetImeiForm();
      await loadImeisForCurrentProduct();
      await loadProducts(); // Update imei count badge on main table
    } catch (err) {
      console.error('Save IMEI error:', err);
      el.imeiValidationMsg.className = 'scanner-hint';
      el.imeiValidationMsg.style.color = 'var(--danger)';
      el.imeiValidationMsg.textContent = `❌ ${err.message || 'Failed to save IMEI'}`;
      showToast(err.message || 'IMEI Error', 'error');
    }
  }

  function closeImeiModal() {
    el.imeiModalOverlay.classList.remove('active');
    resetImeiForm();
    state.currentImeiProductId = null;
  }

  // Camera Barcode / QR Scanner Lifecycle
  async function launchCameraScanner(target = 'imeiModal') {
    state.scannerTarget = target;

    if (!window.Html5Qrcode) {
      showToast('Barcode scanner library is loading, please try again.', 'error');
      return;
    }

    // Browsers only expose the camera on HTTPS sites (localhost is also
    // allowed for development). This avoids an unhelpful camera error on a
    // website served over plain HTTP.
    if (!window.isSecureContext) {
      showToast('Camera scanning requires HTTPS. Open this website using HTTPS and try again.', 'error');
      return;
    }

    el.scannerModalOverlay.classList.add('active');

    try {
      if (!state.html5QrCode) {
        // IMEI labels use Code 128. Limiting the decoder to that format makes
        // detection faster and avoids mistaking label text for another code type.
        state.html5QrCode = new window.Html5Qrcode("reader", {
          formatsToSupport: [window.Html5QrcodeSupportedFormats.CODE_128]
        });
      }

      const devices = await window.Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        throw new Error('No camera found on this device');
      }

      state.availableCameras = devices;
      // Prefer back camera if available
      const backCamIndex = devices.findIndex(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
      state.currentCameraIndex = backCamIndex !== -1 ? backCamIndex : 0;

      await startCameraStream(devices[state.currentCameraIndex].id);
    } catch (err) {
      console.error('Camera launch error:', err);
      showToast('Camera error: ' + getCameraErrorMessage(err), 'error');
      stopCameraScanner();
    }
  }

  function getCameraErrorMessage(err) {
    // html5-qrcode may reject with a plain string instead of an Error object.
    if (err && typeof err.message === 'string' && err.message.trim()) return err.message;
    if (typeof err === 'string' && err.trim()) return err;
    if (err && typeof err.name === 'string' && err.name) return err.name;
    return 'Unable to start the camera. Please allow camera access and try again.';
  }

  async function startCameraStream(cameraId) {
    if (state.isScanning && state.html5QrCode) {
      await state.html5QrCode.stop();
      state.isScanning = false;
    }

    const config = {
      fps: 20,
      // Code 128 is a wide, linear barcode, so use a wide scan region instead
      // of the square region that is intended mainly for QR codes.
      qrbox: (viewfinderWidth) => {
        const width = Math.floor(viewfinderWidth * 0.9);
        return { width, height: Math.max(80, Math.min(140, Math.floor(width * 0.38))) };
      },
      aspectRatio: 4 / 3
    };

    await state.html5QrCode.start(
      // Passing the detected camera ID directly works across modern browsers;
      // autofocus is applied after the stream has started when supported.
      cameraId,
      config,
      (decodedText) => {
        onBarcodeScanned(decodedText);
      },
      (errorMessage) => {
        // Continuous frame errors are normal while seeking barcode
      }
    );
    state.isScanning = true;
    await enableContinuousFocus();
  }

  async function enableContinuousFocus() {
    // Focus controls are hardware/browser dependent. Request continuous focus
    // only when the active camera reports that it supports the mode.
    if (!state.html5QrCode || !state.html5QrCode.getRunningTrackCapabilities || !state.html5QrCode.applyVideoConstraints) return;

    try {
      const capabilities = state.html5QrCode.getRunningTrackCapabilities();
      const focusModes = capabilities && capabilities.focusMode;
      if (!Array.isArray(focusModes) || !focusModes.includes('continuous')) return;

      await state.html5QrCode.applyVideoConstraints({
        advanced: [{ focusMode: 'continuous' }]
      });
    } catch (err) {
      // Autofocus is optional; scanning should still work on cameras that
      // expose capabilities but reject focus constraints.
      console.info('Continuous autofocus is unavailable on this camera.', err);
    }
  }

  async function onBarcodeScanned(scannedCode) {
    if (state.isProcessingScan) return;

    // Clean string (keep alphanumeric digits)
    const cleaned = scannedCode.replace(/[^0-9a-zA-Z]/g, '').trim();
    if (!cleaned) return;
    state.isProcessingScan = true;

    // Optional haptic vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    stopCameraScanner();

    if (state.scannerTarget === 'productForm') {
      if (el.productImeiInput) {
        el.productImeiInput.value = cleaned;
        showToast(`Scanned IMEI: ${cleaned}`, 'success');

        // Verify uniqueness on scan
        try {
          const existing = await window.dbService.checkImeiExists(cleaned);
          if (existing) {
            const prodInfo = existing.product
              ? `${existing.product.brand} ${existing.product.model}`
              : 'another product';
            el.productImeiValidationMsg.className = 'scanner-hint';
            el.productImeiValidationMsg.style.color = 'var(--danger)';
            el.productImeiValidationMsg.textContent = `❌ Warning: IMEI "${cleaned}" is already assigned to ${prodInfo}!`;
            showToast(`Duplicate IMEI detected! (${prodInfo})`, 'error');
          } else {
            el.productImeiValidationMsg.className = 'scanner-hint';
            el.productImeiValidationMsg.style.color = 'var(--success)';
            el.productImeiValidationMsg.textContent = `✓ Unique IMEI verified (${cleaned})`;
          }
        } catch (e) {
          console.warn(e);
        }
      }
    } else {
      // Default: IMEI modal
      el.imeiInput.value = cleaned;
      showToast(`Scanned: ${cleaned}`, 'success');

      // Auto-trigger add
      handleAddImei();
    }
  }

  async function switchCamera() {
    if (!state.availableCameras || state.availableCameras.length <= 1) {
      showToast('Only one camera is detected on this device', 'info');
      return;
    }
    state.currentCameraIndex = (state.currentCameraIndex + 1) % state.availableCameras.length;
    try {
      await startCameraStream(state.availableCameras[state.currentCameraIndex].id);
    } catch (err) {
      console.error('Camera switch error:', err);
      showToast('Camera error: ' + getCameraErrorMessage(err), 'error');
      stopCameraScanner();
    }
  }

  async function stopCameraScanner() {
    if (state.html5QrCode && state.isScanning) {
      try {
        await state.html5QrCode.stop();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      state.isScanning = false;
    }
    state.isProcessingScan = false;
    el.scannerModalOverlay.classList.remove('active');
  }

  // ================= BRAND MANAGEMENT ================= //

  function openBrandModal() {
    el.brandForm.reset();
    renderDeleteBrandOptions();
    el.brandModalOverlay.classList.add('active');
  }

  function renderDeleteBrandOptions() {
    const options = state.brands.map(brand => `<option value="${escapeHtml(brand.name)}">${escapeHtml(brand.name)}</option>`).join('');
    el.deleteBrandSelect.innerHTML = '<option value="">-- Select Brand --</option>' + options;
  }

  function closeBrandModal() {
    el.brandModalOverlay.classList.remove('active');
  }

  async function handleBrandFormSubmit(e) {
    e.preventDefault();
    const name = el.newBrandNameInput.value.trim();
    if (!name) return;

    try {
      const created = await window.dbService.addBrand(name);
      showToast(`Brand "${created.name}" added!`, 'success');
      closeBrandModal();
      await loadBrands();
      // Select the newly added brand in the product modal
      el.productBrandSelect.value = created.name;
    } catch (err) {
      showToast(err.message || 'Failed to add brand', 'error');
    }
  }

  async function handleDeleteBrand() {
    const name = el.deleteBrandSelect.value;
    if (!name) {
      showToast('Select a brand to delete', 'error');
      return;
    }

    if (!confirm(`Delete the brand "${name}"?`)) return;

    try {
      await window.dbService.deleteBrand(name);
      showToast(`Brand "${name}" deleted`, 'success');
      await loadBrands();
      renderDeleteBrandOptions();
    } catch (err) {
      showToast(err.message || 'Failed to delete brand', 'error');
    }
  }

  // ================= DELETE MODAL ================= //

  async function openDeleteModal(productId) {
    state.productToDeleteId = productId;
    const product = state.products.find(p => p.id === productId) || await window.dbService.getProductById(productId);
    if (!product) return;

    el.deleteProductDetails.textContent = `${product.brand} ${product.model} ${product.variant ? `(${product.variant})` : ''} - DP: ${formatCurrency(product.current_dp)}`;
    el.deleteModalOverlay.classList.add('active');
  }

  function closeDeleteModal() {
    el.deleteModalOverlay.classList.remove('active');
    state.productToDeleteId = null;
  }

  async function handleConfirmDelete() {
    if (!state.productToDeleteId) return;
    try {
      await window.dbService.deleteProduct(state.productToDeleteId);
      showToast('Product and associated data deleted.', 'info');
      closeDeleteModal();
      await loadProducts();
    } catch (err) {
      showToast('Failed to delete product: ' + err.message, 'error');
    }
  }

  // ================= UTILITY & LISTENERS ================= //

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Search input debouncer
  let searchDebounceTimer = null;
  function handleSearchInput(e) {
    const val = e.target.value;
    state.searchQuery = val;
    el.btnSearchClear.classList.toggle('visible', Boolean(val));

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      loadProducts();
    }, 250);
  }

  function handleSearchClear() {
    el.searchInput.value = '';
    state.searchQuery = '';
    el.btnSearchClear.classList.remove('visible');
    loadProducts();
    el.searchInput.focus();
  }

  // Bind All Event Listeners
  function bindEvents() {
    // Search
    el.searchInput.addEventListener('input', handleSearchInput);
    el.btnSearchClear.addEventListener('click', handleSearchClear);

    // Add Product Modal Triggers
    el.btnOpenAddModal.addEventListener('click', openAddProductModal);
    el.fabAddProduct.addEventListener('click', openAddProductModal);
    el.btnEmptyAdd.addEventListener('click', openAddProductModal);
    el.btnCloseProductModal.addEventListener('click', closeProductModal);
    el.btnCancelProduct.addEventListener('click', closeProductModal);
    el.productForm.addEventListener('submit', handleProductFormSubmit);
    el.btnInlineAddBrand.addEventListener('click', openBrandModal);
    
    // Scanner trigger for product form IMEI field
    if (el.btnProductScanImei) {
      el.btnProductScanImei.addEventListener('click', () => launchCameraScanner('productForm'));
    }

    // Real-time IMEI validation on blur / input in product form
    if (el.productImeiInput) {
      el.productImeiInput.addEventListener('blur', async () => {
        const val = el.productImeiInput.value.trim();
        if (!val) {
          el.productImeiValidationMsg.className = 'scanner-hint hidden';
          el.productImeiValidationMsg.textContent = '';
          return;
        }
        try {
          const existing = await window.dbService.checkImeiExists(val);
          if (existing) {
            const prodInfo = existing.product
              ? `${existing.product.brand} ${existing.product.model}`
              : 'another product';
            el.productImeiValidationMsg.className = 'scanner-hint';
            el.productImeiValidationMsg.style.color = 'var(--danger)';
            el.productImeiValidationMsg.textContent = `❌ IMEI already exists (Assigned to ${prodInfo})`;
          } else {
            el.productImeiValidationMsg.className = 'scanner-hint';
            el.productImeiValidationMsg.style.color = 'var(--success)';
            el.productImeiValidationMsg.textContent = `✓ Unique IMEI available`;
          }
        } catch (e) {
          console.warn('IMEI check error:', e);
        }
      });
    }

    // History Modal Triggers
    el.btnCloseHistoryModal.addEventListener('click', closeHistoryModal);
    el.btnCloseHistoryFooter.addEventListener('click', closeHistoryModal);
    if (el.btnClearAllHistory) {
      el.btnClearAllHistory.addEventListener('click', async () => {
        if (!state.currentHistoryProductId) return;
        if (confirm('Are you sure you want to CLEAR ALL price history records for this product?')) {
          try {
            await window.dbService.clearPriceHistory(state.currentHistoryProductId);
            showToast('All price history records cleared', 'info');
            const updated = await window.dbService.fetchPriceHistory(state.currentHistoryProductId);
            renderPriceHistory(updated);
          } catch (err) {
            console.error('Clear history error:', err);
            showToast('Failed to clear price history: ' + err.message, 'error');
          }
        }
      });
    }

    // IMEI Modal Triggers
    el.btnCloseImeiModal.addEventListener('click', closeImeiModal);
    el.btnCloseImeiFooter.addEventListener('click', closeImeiModal);
    el.imeiAddForm.addEventListener('submit', handleAddOrUpdateImei);
    if (el.btnCancelEditImei) {
      el.btnCancelEditImei.addEventListener('click', resetImeiForm);
    }
    if (el.btnResetImeiPriceToDefault) {
      el.btnResetImeiPriceToDefault.addEventListener('click', handleResetImeiPriceToDefault);
    }
    el.btnLaunchScanner.addEventListener('click', () => launchCameraScanner('imeiModal'));

    // Scanner Modal Triggers
    el.btnCloseScannerModal.addEventListener('click', stopCameraScanner);
    el.btnStopScanner.addEventListener('click', stopCameraScanner);
    el.btnSwitchCamera.addEventListener('click', switchCamera);

    // Brand Modal Triggers
    el.btnCloseBrandModal.addEventListener('click', closeBrandModal);
    el.btnCancelBrand.addEventListener('click', closeBrandModal);
    el.brandForm.addEventListener('submit', handleBrandFormSubmit);
    el.btnDeleteBrand.addEventListener('click', handleDeleteBrand);

    // Delete Modal Triggers
    el.btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
    el.btnCancelDelete.addEventListener('click', closeDeleteModal);
    el.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

    // Click outside modal card to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          if (overlay === el.scannerModalOverlay) {
            stopCameraScanner();
          } else {
            overlay.classList.remove('active');
          }
        }
      });
    });

    // Keyboard Escape to close open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.scannerModalOverlay.classList.contains('active')) {
          stopCameraScanner();
        } else {
          document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
      }
    });

    // Product item click handlers (edit, delete, history, imeis)
    setupProductActionHandlers();
  }

  // App Initialization
  async function init() {
    bindEvents();
    try {
      await window.dbService.verifyConnection();
    } catch (err) {
      console.warn('Supabase startup check failed, using local database:', err);
    }
    updateConnectionStatus();
    await loadBrands();
    await loadProducts();
  }

  // Boot up when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

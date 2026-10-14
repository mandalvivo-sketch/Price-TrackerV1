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
    entryPrices: {},
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
  let productLoadSequence = 0;
  let priceListLoadSequence = 0;
  let modelSuggestionSequence = 0;

  // DOM Elements Cache
  const el = {
    statusDot: document.getElementById('statusDot'),
    statusLabel: document.getElementById('statusLabel'),
    searchInput: document.getElementById('searchInput'),
    btnSearchClear: document.getElementById('btnSearchClear'),
    btnSearchScan: document.getElementById('btnSearchScan'),
    searchScanResult: document.getElementById('searchScanResult'),
    brandPillsContainer: document.getElementById('brandPillsContainer'),
    summaryCount: document.getElementById('summaryCount'),
    productListContainer: document.getElementById('productListContainer'),
    desktopTableBody: document.getElementById('desktopTableBody'),
    emptyState: document.getElementById('emptyState'),
    fabAddProduct: document.getElementById('fabAddProduct'),
    btnHeaderPriceList: document.getElementById('btnHeaderPriceList'),
    btnEmptyAdd: document.getElementById('btnEmptyAdd'),
    offlineNotice: document.getElementById('offlineNotice'),
    appIcon: document.getElementById('appIcon'),
    btnCloseMenu: document.getElementById('btnCloseMenu'),
    sideMenu: document.getElementById('sideMenu'),
    sideMenuOverlay: document.getElementById('sideMenuOverlay'),
    headerActions: document.getElementById('headerActions'),
    headerTitle: document.querySelector('#titleText h1'),
    searchBoxWrap: document.getElementById('searchBoxWrap'),
    searchScanResult: document.getElementById('searchScanResult'),
    brandFiltersWrapper: document.getElementById('brandFiltersWrapper'),
    summaryBar: document.getElementById('summaryBar'),
    dashboardMainView: document.getElementById('dashboardMainView'),
    priceListMainView: document.getElementById('priceListMainView'),
    btnOpenPriceList: document.getElementById('btnOpenPriceList'),
    btnRefreshPrices: document.getElementById('btnRefreshPrices'),
    btnBackToDashboard: document.getElementById('btnBackToDashboard'),
    priceListBody: document.getElementById('priceListBody'),
    btnExportBackup: document.getElementById('btnExportBackup'),
    btnSyncLocal: document.getElementById('btnSyncLocal'),
    btnRestoreBackup: document.getElementById('btnRestoreBackup'),
    backupFileInput: document.getElementById('backupFileInput'),
    btnOpenBrandModal: document.getElementById('btnOpenBrandModal'),

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
    brandColorPicker: document.getElementById('brandColorPicker'),
    btnUpdateBrandColor: document.getElementById('btnUpdateBrandColor'),
    deleteBrandSelectSecondary: document.getElementById('deleteBrandSelectSecondary'),
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

  function getBrandBadgeStyle(brandName) {
    const brand = state.brands.find(item => String(item.name || '').toLowerCase() === String(brandName || '').toLowerCase());
    const color = brand && brand.color ? brand.color : '#2563eb';
    return `background:${color}; color:#ffffff; border:1px solid ${color};`;
  }

  function renderBrandPills() {
    // Keep 'All' pill, append distinct brand pills
    const allPill = `<button class="brand-pill ${state.selectedBrand === 'ALL' ? 'active' : ''}" data-brand="ALL" id="pillBrandAll">All Brands</button>`;
    const pillsHtml = state.brands.map(b => {
      const active = state.selectedBrand === b.name ? 'active' : '';
      const style = `style="${getBrandBadgeStyle(b.name)}"`;
      return `<button class="brand-pill ${active}" data-brand="${escapeHtml(b.name)}" draggable="true" title="Drag to reorder" ${style}>${escapeHtml(b.name)}</button>`;
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
      pill.addEventListener('click', async () => {
        const brand = pill.getAttribute('data-brand');
        if (state.selectedBrand !== brand) {
          state.selectedBrand = brand;
          renderBrandPills();
          // Filter the local cache first so the tap responds without waiting on
          // the network. The request token prevents an older response winning.
          await loadProducts(true);
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

  async function refreshProductModelOptions(brandName = el.productBrandSelect.value) {
    const requestId = ++modelSuggestionSequence;
    const brand = String(brandName || '').trim();
    const models = new Map();
    const addModels = products => {
      (products || []).forEach(product => {
        if (String(product.brand || '').toLowerCase() !== brand.toLowerCase()) return;
        const model = String(product.model || '').trim();
        if (model && !models.has(model.toLowerCase())) models.set(model.toLowerCase(), model);
      });
    };

    if (brand) {
      addModels(state.products);
      const currentModel = String(el.productModelInput.value || '').trim();
      if (currentModel) models.set(currentModel.toLowerCase(), currentModel);
      renderProductModelOptions(models);
      try {
        const products = await window.dbService.fetchProducts('', brand);
        if (requestId !== modelSuggestionSequence || brand.toLowerCase() !== el.productBrandSelect.value.toLowerCase()) return;
        addModels(products);
      } catch (error) {
        // Keep local suggestions available if the online lookup fails.
      }
    }
    if (requestId === modelSuggestionSequence) renderProductModelOptions(models);
  }

  function renderProductModelOptions(models) {
    const datalist = document.getElementById('productModelOptions');
    if (!datalist) return;
    datalist.innerHTML = [...models.values()]
      .sort((a, b) => a.localeCompare(b))
      .map(model => `<option value="${escapeHtml(model)}"></option>`)
      .join('');
  }

  async function loadProducts(localOnly = false) {
    const loadSequence = ++productLoadSequence;
    try {
      const products = await window.dbService.fetchProducts(state.searchQuery, state.selectedBrand, localOnly);
      if (loadSequence !== productLoadSequence) return;
      state.products = products;
      renderProducts();
      // Price history is supplementary to the list; don't make the brand
      // result wait for this additional round trip.
      const productIds = products.map(product => product.id);
      const [entryPrices, imeiCounts] = await Promise.all([
        window.dbService.fetchInitialPrices(productIds, localOnly),
        typeof window.dbService.fetchImeiCounts === 'function'
          ? window.dbService.fetchImeiCounts(productIds, localOnly)
          : Promise.resolve({})
      ]);
      if (loadSequence !== productLoadSequence) return;
      state.entryPrices = entryPrices;
      products.forEach(product => {
        product.imei_count = imeiCounts[product.id] || 0;
      });
      renderProducts();
    } catch (err) {
      console.error('Error loading products:', err);
      showToast('Failed to load products: ' + err.message, 'error');
    }
  }

  function renderProducts() {
    const count = state.products.length;
    const groups = Array.from(state.products.reduce((map, product) => {
      const key = `${product.brand || ''}::${product.model || ''}`.toLowerCase();
      if (!map.has(key)) map.set(key, { brand: product.brand, model: product.model, products: [] });
      map.get(key).products.push(product);
      return map;
    }, new Map()).values());
    el.summaryCount.textContent = `Showing ${groups.length} ${groups.length === 1 ? 'Model' : 'Models'} · ${count} ${count === 1 ? 'Variant' : 'Variants'}`;

    if (count === 0) {
      el.productListContainer.innerHTML = '';
      el.desktopTableBody.innerHTML = '';
      el.emptyState.classList.remove('hidden');
      return;
    }

    el.emptyState.classList.add('hidden');

    const entryPrice = (p, field) => {
      const entry = state.entryPrices[String(p.id)];
      const current = Number(p[`current_${field}`]);
      const first = Number(entry?.[field]);
      if (!entry || !Number.isFinite(first) || first === current) return '';
      return `<span class="price-entry ${field}">Entry: ${formatCurrency(first)}</span>`;
    };

    const variantCard = (p) => `
      <article class="product-card variant-product-card" data-id="${p.id}" id="prodCard-${p.id}">
        <div class="card-header-row"><div class="card-title-group">
          <span class="variant-tag">${escapeHtml(p.variant || 'Standard')}</span>
          ${p.color ? `<span class="color-tag">${escapeHtml(p.color)}</span>` : ''}
        </div><button class="action-btn history-btn" data-action="history" data-id="${p.id}">📊 History</button></div>
        <div class="price-grid">
          <div class="price-item clickable-price" data-action="quick-edit" data-id="${p.id}" data-field="dp"><span class="price-label">DP</span><span class="price-val dp">${formatCurrency(p.current_dp)}</span>${entryPrice(p, 'dp')}</div>
          <div class="price-item clickable-price" data-action="quick-edit" data-id="${p.id}" data-field="mop"><span class="price-label">MOP</span><span class="price-val mop">${formatCurrency(p.current_mop)}</span>${entryPrice(p, 'mop')}</div>
          <div class="price-item clickable-price" data-action="quick-edit" data-id="${p.id}" data-field="mrp"><span class="price-label">MRP</span><span class="price-val mrp">${formatCurrency(p.current_mrp)}</span>${entryPrice(p, 'mrp')}</div>
        </div>
        <div class="card-footer-row"><button class="imei-badge-btn" data-action="imei" data-id="${p.id}" title="View IMEIs for this variant"><span>View IMEIs</span><span class="imei-count">${p.imei_count || 0}</span></button>
          <div class="card-actions"><button class="action-btn" data-action="edit" data-id="${p.id}">✏️ Edit</button><button class="action-btn delete-btn" data-action="delete" data-id="${p.id}">🗑️ Delete</button></div>
        </div>
      </article>`;

    // One dashboard entry per model. Opening it reveals its variants; the
    // "View IMEIs" action then opens the existing unit-wise IMEI manager.
    const cardsHtml = groups.map(group => {
      const imeiCount = group.products.reduce((total, p) => total + Number(p.imei_count || 0), 0);
      const badgeStyle = getBrandBadgeStyle(group.brand);
      return `<details class="model-drilldown"><summary><span><span class="brand-badge" style="${badgeStyle}">${escapeHtml(group.brand)}</span> <span class="model-name">${escapeHtml(group.model)}</span></span><span class="model-summary-count">${group.products.length} ${group.products.length === 1 ? 'variant' : 'variants'} · ${imeiCount} IMEIs</span></summary><div class="variant-list">${group.products.map(variantCard).join('')}</div></details>`;
    }).join('');

    el.productListContainer.innerHTML = cardsHtml;

    // Desktop uses the same model → variant → IMEI drill-down inside one table cell.
    const tableRowsHtml = groups.map(group => {
      const badgeStyle = getBrandBadgeStyle(group.brand);
      return `<tr><td colspan="8" class="model-drilldown-cell"><details class="model-drilldown"><summary><span><span class="brand-badge" style="${badgeStyle}">${escapeHtml(group.brand)}</span> <span class="model-name">${escapeHtml(group.model)}</span></span><span class="model-summary-count">${group.products.length} ${group.products.length === 1 ? 'variant' : 'variants'}</span></summary><div class="variant-list">${group.products.map(variantCard).join('')}</div></details></td></tr>`;
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
    refreshProductModelOptions('');
    el.productModalOverlay.classList.add('active');
    setTimeout(() => {
      if (el.productBrandSelect) el.productBrandSelect.focus();
    }, 100);
  }

  async function openEditProductModal(productId, focusField = null) {
    const product = state.products.find(p => p.id === productId) || await window.dbService.getProductById(productId);
    if (!product) return;

    el.editProductId.value = product.id;
    el.productModalTitle.innerHTML = `Edit Mobile - ${escapeHtml(product.brand)} ${escapeHtml(product.model)} <span class="variant-tag">${escapeHtml(product.variant || 'Standard')}</span>`;
    renderBrandSelectOptions(product.brand);
    el.productModelInput.value = product.model;
    refreshProductModelOptions(product.brand);
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
    if (!requireOnlineForWrite()) return;
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
    el.historyModalSubtitle.innerHTML = `${escapeHtml(product.brand)} ${escapeHtml(product.model)} <span class="variant-tag">${escapeHtml(product.variant || 'Standard')}</span> • Current: DP ${formatCurrency(product.current_dp)} | MOP ${formatCurrency(product.current_mop)} | MRP ${formatCurrency(product.current_mrp)}`;

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
        if (!requireOnlineForWrite()) return;
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

    el.imeiModalSubtitle.innerHTML = `${escapeHtml(product.brand)} ${escapeHtml(product.model)} <span class="variant-tag">${escapeHtml(product.variant || 'Standard')}</span> • Base MOP: ${formatCurrency(product.current_mop)}`;
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
                <button type="button" class="imei-sell-btn" data-imei="${escapeHtml(i.imei)}" title="Record sale for this IMEI">💰 Sell</button>
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
          if (!requireOnlineForWrite()) return;
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
      el.imeiItemsList.querySelectorAll('.imei-sell-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const imei = btn.getAttribute('data-imei');
          if (imei) window.location.href = `sold.html?imei=${encodeURIComponent(imei)}`;
        });
      });

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
    if (!requireOnlineForWrite()) return;
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

    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    const hasMediaSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    // Browsers only expose the camera on secure origins. localhost is also
    // allowed for development, but direct file:// pages are blocked.
    if (!window.isSecureContext && !isLocalhost) {
      showToast('Camera scanning requires HTTPS or localhost. Open this app through Live Server/localhost and allow camera access.', 'error');
      return;
    }

    if (!hasMediaSupport) {
      showToast('This browser does not support camera access. Try Chrome or Edge on mobile.', 'error');
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
    const errorName = err && typeof err.name === 'string' ? err.name : '';
    const errorMessage = err && typeof err.message === 'string' && err.message.trim() ? err.message : '';

    if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
      return 'Camera permission was blocked. Please tap Allow when the browser asks, then retry.';
    }

    if (errorName === 'NotFoundError') {
      return 'No camera was detected on this device.';
    }

    if (errorName === 'SecurityError') {
      return 'The page is not running in a secure context. Use localhost/HTTPS and allow camera access.';
    }

    if (errorMessage) return errorMessage;
    if (typeof err === 'string' && err.trim()) return err;
    return 'Unable to start the camera. Please allow camera access and try again.';
  }

  async function startCameraStream(cameraId) {

    if (state.isScanning && state.html5QrCode) {
      try {
        await state.html5QrCode.stop();
      } catch (e) {
        console.warn('Previous scanner stop error:', e);
      }

      state.isScanning = false;
    }

    const config = {

      fps: 15,

      // Code 128 is a wide linear barcode

      qrbox: (viewfinderWidth, viewfinderHeight) => {

        const width = Math.floor(viewfinderWidth * 0.92);

        // Keep enough height for a wide barcode

        const height = Math.max(

          100,

          Math.min(

            180,

            Math.floor(width * 0.42)

          )

        );

        return {

          width,

          height

        };

      },

      // Better mobile camera preview

      aspectRatio: 4 / 3,

      // Important for mobile camera

      videoConstraints: {

        deviceId: {

          exact: cameraId

        },

        facingMode: {

          ideal: 'environment'

        },

        width: {

          ideal: 1280

        },

        height: {

          ideal: 720

        },

        advanced: [

          { focusMode: 'continuous' }

        ]

      }

    };

    await state.html5QrCode.start(

      {

        deviceId: {

          exact: cameraId

        }

      },

      config,

      (decodedText) => {

        onBarcodeScanned(decodedText);

      },

      (errorMessage) => {

        // Normal while searching for barcode

      }

    );

    state.isScanning = true;

    // Apply autofocus after the browser has attached the camera track.

    setTimeout(async () => {

      await enableContinuousFocus();

    }, 500);

    // Some mobile browsers accept focus constraints only after startup settles.

    setTimeout(async () => {

      await enableContinuousFocus();

    }, 1500);

  }

  async function enableContinuousFocusLegacy() {

  if (!state.html5QrCode) return;

  if (

    typeof state.html5QrCode.getRunningTrackCapabilities !== 'function' ||

    typeof state.html5QrCode.applyVideoConstraints !== 'function'

  ) {

    return;

  }

  try {

    const capabilities =

      state.html5QrCode.getRunningTrackCapabilities();

    console.log('Camera capabilities:', capabilities);

    const focusModes = capabilities?.focusMode;

    if (

      Array.isArray(focusModes) &&

      focusModes.includes('continuous')

    ) {

      await state.html5QrCode.applyVideoConstraints({

        advanced: [

          {

            focusMode: 'continuous'

          }

        ]

      });

      console.log('Continuous autofocus enabled');

    }

    // Some Android cameras expose zoom.

    // A tiny zoom can sometimes help Code 128 recognition.

    if (

      capabilities?.zoom &&

      typeof capabilities.zoom.min === 'number' &&

      typeof capabilities.zoom.max === 'number'

    ) {

      const minZoom = capabilities.zoom.min;

      const maxZoom = capabilities.zoom.max;

      if (maxZoom > minZoom) {

        const currentZoom =

          typeof capabilities.zoom.min === 'number'

            ? Math.max(minZoom, Math.min(maxZoom, minZoom + 0.05))

            : minZoom;

        try {

          await state.html5QrCode.applyVideoConstraints({

            advanced: [

              {

                focusMode: 'continuous',

                zoom: currentZoom

              }

            ]

          });

        } catch (zoomError) {

          console.info(

            'Zoom constraint unavailable:',

            zoomError

          );

        }

      }

    }

  } catch (err) {

    console.info(

      'Continuous autofocus is unavailable on this camera.',

      err

    );

  }

}

  async function enableContinuousFocus() {
    if (!state.html5QrCode || !state.isScanning) return;

    try {
      const video = document.querySelector('#reader video');
      const track = video?.srcObject?.getVideoTracks?.()[0];
      const capabilities = track?.getCapabilities?.() ||
        (typeof state.html5QrCode.getRunningTrackCapabilities === 'function'
          ? state.html5QrCode.getRunningTrackCapabilities()
          : null);
      const focusModes = capabilities?.focusMode;
      const constraints = { advanced: [{ focusMode: 'continuous' }] };

      if (!Array.isArray(focusModes) || focusModes.includes('continuous')) {
        if (track?.applyConstraints) {
          await track.applyConstraints(constraints);
          return;
        }
        if (typeof state.html5QrCode.applyVideoConstraints === 'function') {
          await state.html5QrCode.applyVideoConstraints(constraints);
          return;
        }
      }

      if (Array.isArray(focusModes) && focusModes.includes('single-shot')) {
        const singleShot = { advanced: [{ focusMode: 'single-shot' }] };
        if (track?.applyConstraints) await track.applyConstraints(singleShot);
        else if (typeof state.html5QrCode.applyVideoConstraints === 'function') {
          await state.html5QrCode.applyVideoConstraints(singleShot);
        }
      }
    } catch (err) {
      console.info('Camera autofocus constraint was not accepted; using browser default focus.', err);
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
    } else if (state.scannerTarget === 'search') {
      el.searchInput.value = cleaned;
      state.searchQuery = cleaned;
      el.btnSearchClear.classList.add('visible');
      showSearchScanResult(cleaned);
      showToast(`Scanned: ${cleaned}`, 'success');
      await loadProducts();
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
    el.deleteBrandSelectSecondary.innerHTML = '<option value="">-- Select Brand --</option>' + options;
    const selectedBrand = el.deleteBrandSelect.value || el.deleteBrandSelectSecondary.value || '';
    if (selectedBrand) {
      const found = state.brands.find(brand => String(brand.name).toLowerCase() === String(selectedBrand).toLowerCase());
      if (found && found.color) {
        el.brandColorPicker.value = found.color;
      }
    } else if (state.brands.length) {
      const first = state.brands[0];
      el.brandColorPicker.value = first.color || '#2563eb';
    }
  }

  function closeBrandModal() {
    el.brandModalOverlay.classList.remove('active');
  }

  async function handleBrandFormSubmit(e) {
    e.preventDefault();
    if (!requireOnlineForWrite()) return;
    const name = el.newBrandNameInput.value.trim();
    const color = (document.getElementById('newBrandColorInput') || {}).value || '#2563eb';
    if (!name) return;

    try {
      const created = await window.dbService.addBrand(name, color);
      showToast(`Brand "${created.name}" added!`, 'success');
      closeBrandModal();
      await loadBrands();
      // Select the newly added brand in the product modal
      el.productBrandSelect.value = created.name;
      refreshProductModelOptions(created.name);
    } catch (err) {
      showToast(err.message || 'Failed to add brand', 'error');
    }
  }

  async function handleUpdateBrandColor() {
    if (!requireOnlineForWrite()) return;
    const name = el.deleteBrandSelect.value || el.deleteBrandSelectSecondary.value;
    if (!name) {
      showToast('Select a brand to edit', 'error');
      return;
    }

    const color = el.brandColorPicker.value;
    if (!confirm(`Update the color for brand "${name}"?`)) return;

    try {
      await window.dbService.updateBrandColor(name, color);
      showToast(`Brand "${name}" color updated`, 'success');
      await loadBrands();
      renderDeleteBrandOptions();
    } catch (err) {
      showToast(err.message || 'Failed to update brand color', 'error');
    }
  }

  async function handleDeleteBrand() {
    if (!requireOnlineForWrite()) return;
    const name = el.deleteBrandSelectSecondary.value || el.deleteBrandSelect.value;
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

    el.deleteProductDetails.innerHTML = `${escapeHtml(product.brand)} ${escapeHtml(product.model)} <span class="variant-tag">${escapeHtml(product.variant || 'Standard')}</span> - DP: ${formatCurrency(product.current_dp)}`;
    el.deleteModalOverlay.classList.add('active');
  }

  function closeDeleteModal() {
    el.deleteModalOverlay.classList.remove('active');
    state.productToDeleteId = null;
  }

  async function handleConfirmDelete() {
    if (!requireOnlineForWrite()) return;
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
    if (!val.trim()) {
      el.searchScanResult.classList.add('hidden');
      el.searchScanResult.innerHTML = '';
    }

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      loadProducts();
    }, 250);
  }

  function handleSearchClear() {
    el.searchInput.value = '';
    state.searchQuery = '';
    el.btnSearchClear.classList.remove('visible');
    el.searchScanResult.classList.add('hidden');
    el.searchScanResult.innerHTML = '';
    loadProducts();
    el.searchInput.focus();
  }

  function showSearchScanResult(code) {
    const cleaned = String(code || '').trim();
    if (!cleaned) {
      el.searchScanResult.classList.add('hidden');
      el.searchScanResult.innerHTML = '';
      return;
    }

    el.searchScanResult.innerHTML = `<span class="search-scan-label">Scanned:</span> <span class="search-scan-value">${escapeHtml(cleaned)}</span>`;
    el.searchScanResult.classList.remove('hidden');
  }

  function requireOnlineForWrite() {
    if (navigator.onLine) return true;
    showToast('Please connect to the internet to save or edit data.', 'error');
    return false;
  }

  function setMenuOpen(isOpen) {
    el.sideMenu.classList.toggle('open', isOpen);
    el.sideMenuOverlay.classList.toggle('open', isOpen);
    el.appIcon.setAttribute('aria-expanded', String(isOpen));
  }

  function setMainView(view) {
    const showPrices = view === 'prices';
    el.dashboardMainView.classList.toggle('hidden', showPrices);
    el.priceListMainView.classList.toggle('hidden', !showPrices);
    el.searchBoxWrap.classList.toggle('hidden', showPrices);
    el.searchScanResult.classList.toggle('hidden', showPrices);
    el.brandFiltersWrapper.classList.toggle('hidden', showPrices);
    el.summaryBar.classList.toggle('hidden', showPrices);
    el.headerActions.classList.toggle('hidden', showPrices);
    el.fabAddProduct.classList.toggle('hidden', showPrices);
    el.headerTitle.textContent = showPrices ? 'Price List' : 'Price Tracker';
    if (showPrices) loadPriceList();
  }

  async function loadPriceList() {
    const loadSequence = ++priceListLoadSequence;
    const formatMoney = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    const escape = value => {
      const node = document.createElement('span');
      node.textContent = value == null ? '' : String(value);
      return node.innerHTML;
    };
    const render = products => {
      if (!products.length) {
        el.priceListBody.innerHTML = '<tr><td colspan="6" class="price-list-message">No products found.</td></tr>';
        return;
      }
      el.priceListBody.innerHTML = products.map(product => `<tr>
        <td>${escape(product.brand || '')}</td><td>${escape(product.model || '')}</td>
        <td><span class="variant-tag">${escape(product.variant || 'Standard')}</span></td>
        <td class="right">${formatMoney.format(Number(product.current_dp ?? product.dp) || 0)}</td>
        <td class="right">${formatMoney.format(Number(product.current_mop ?? product.mop) || 0)}</td>
        <td class="right">${formatMoney.format(Number(product.current_mrp ?? product.mrp) || 0)}</td>
      </tr>`).join('');
    };
    el.btnRefreshPrices.disabled = true;
    el.btnRefreshPrices.textContent = 'Loading…';
    try {
      const cachedProducts = await window.dbService.fetchProducts('', 'ALL', true);
      if (loadSequence !== priceListLoadSequence) return;
      render(cachedProducts);
      const liveProducts = await window.dbService.fetchProducts('', 'ALL');
      if (loadSequence !== priceListLoadSequence) return;
      render(liveProducts);
    } catch (err) {
      if (loadSequence !== priceListLoadSequence) return;
      console.error('Could not load price list:', err);
      el.priceListBody.innerHTML = '<tr><td colspan="6" class="price-list-message">Could not load prices. Please refresh.</td></tr>';
    } finally {
      if (loadSequence === priceListLoadSequence) {
        el.btnRefreshPrices.disabled = false;
        el.btnRefreshPrices.textContent = '↻ Refresh';
      }
    }
  }

  async function exportBackup() {
    try {
      const backup = await window.dbService.createBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `mobile-price-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      showToast('Full backup downloaded', 'success');
      setMenuOpen(false);
    } catch (err) { showToast('Backup failed: ' + (err.message || 'Unknown error'), 'error'); }
  }

  async function syncOnlineData() {
    if (!navigator.onLine) {
      showToast('Please connect to the internet before syncing.', 'error');
      return;
    }
    try {
      await window.dbService.syncOnlineDataToLocal();
      await loadBrands();
      await loadProducts();
      showToast('Online data synced to this device', 'success');
      setMenuOpen(false);
    } catch (err) { showToast('Sync failed: ' + (err.message || 'Check your connection'), 'error'); }
  }

  async function restoreBackupFile(file) {
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (!confirm('Restore this backup? It will replace all current products, brands, IMEIs, and price history.')) return;
      await window.dbService.restoreBackup(backup);
      showToast('Database restored successfully', 'success');
      setMenuOpen(false);
      await loadBrands();
      await loadProducts();
    } catch (err) { showToast('Restore failed: ' + (err.message || 'Invalid backup file'), 'error'); }
    finally { el.backupFileInput.value = ''; }
  }

  // Bind All Event Listeners
  function bindEvents() {
    el.appIcon.addEventListener('click', () => setMenuOpen(true));
    el.btnCloseMenu.addEventListener('click', () => setMenuOpen(false));
    el.sideMenuOverlay.addEventListener('click', () => setMenuOpen(false));
    el.btnOpenBrandModal.addEventListener('click', () => {
      openBrandModal();
      setMenuOpen(false);
    });
    el.btnOpenPriceList.addEventListener('click', () => {
      setMenuOpen(false);
      setMainView('prices');
    });
    el.btnRefreshPrices.addEventListener('click', loadPriceList);
    el.btnBackToDashboard.addEventListener('click', () => setMainView('dashboard'));
    el.btnExportBackup.addEventListener('click', exportBackup);
    el.btnSyncLocal.addEventListener('click', syncOnlineData);
    el.btnRestoreBackup.addEventListener('click', () => el.backupFileInput.click());
    el.backupFileInput.addEventListener('change', () => restoreBackupFile(el.backupFileInput.files[0]));
    // Search
    el.searchInput.addEventListener('input', handleSearchInput);
    el.btnSearchClear.addEventListener('click', handleSearchClear);
    if (el.btnSearchScan) {
      el.btnSearchScan.addEventListener('click', () => launchCameraScanner('search'));
    }

    // Add Product Modal Triggers
    el.btnHeaderPriceList.addEventListener('click', () => setMainView('prices'));
    el.fabAddProduct.addEventListener('click', openAddProductModal);
    el.btnEmptyAdd.addEventListener('click', openAddProductModal);
    el.btnCloseProductModal.addEventListener('click', closeProductModal);
    el.btnCancelProduct.addEventListener('click', closeProductModal);
    el.productForm.addEventListener('submit', handleProductFormSubmit);
    el.productBrandSelect.addEventListener('change', () => refreshProductModelOptions());
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
        if (!requireOnlineForWrite()) return;
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
    el.btnUpdateBrandColor.addEventListener('click', handleUpdateBrandColor);
    el.btnDeleteBrand.addEventListener('click', handleDeleteBrand);
    el.deleteBrandSelect.addEventListener('change', () => {
      const brand = state.brands.find(item => String(item.name).toLowerCase() === String(el.deleteBrandSelect.value || '').toLowerCase());
      if (brand && brand.color) el.brandColorPicker.value = brand.color;
      el.deleteBrandSelectSecondary.value = el.deleteBrandSelect.value;
    });
    el.deleteBrandSelectSecondary.addEventListener('change', () => {
      const brand = state.brands.find(item => String(item.name).toLowerCase() === String(el.deleteBrandSelectSecondary.value || '').toLowerCase());
      if (brand && brand.color) el.brandColorPicker.value = brand.color;
      el.deleteBrandSelect.value = el.deleteBrandSelectSecondary.value;
    });

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
    const updateNetworkNotice = () => el.offlineNotice.classList.toggle('hidden', navigator.onLine);
    updateNetworkNotice();
    window.addEventListener('online', updateNetworkNotice);
    window.addEventListener('offline', updateNetworkNotice);
    updateConnectionStatus();
    // Paint the last known data immediately; refresh from Supabase in parallel.
    try {
      const cachedBrands = JSON.parse(localStorage.getItem('mpt_local_brands') || '[]');
      if (cachedBrands.length) {
        state.brands = cachedBrands;
        renderBrandPills();
        renderBrandSelectOptions();
      }
    } catch (_) {}
    await loadProducts(true);
    await Promise.all([loadBrands(), loadProducts()]);
  }

  // Boot up when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

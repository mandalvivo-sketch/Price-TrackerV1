/**
 * Mobile Price Tracker - Supabase Client & Data Layer
 * Handles database operations with Supabase PostgreSQL and provides an automatic
 * local storage fallback with sample smartphone records until Supabase credentials are configured.
 */

// Default Supabase Configuration keys (Can be configured in code or via UI settings)
const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://ebffesaqgvfaamnmyclv.supabase.co',
  anonKey: 'sb_publishable_BjXEDHxGMGo0vLsOH3IHQA_XQ8rxWeB'
};

// Local storage keys
const STORAGE_KEYS = {
  CONFIG: 'mpt_supabase_config',
  PRODUCTS: 'mpt_local_products',
  PRICE_HISTORY: 'mpt_local_price_history',
  IMEIS: 'mpt_local_imeis',
  BRANDS: 'mpt_local_brands',
  BRAND_ORDER: 'mpt_brand_order'
};

// Initial default brands for quick start
const INITIAL_BRANDS = [
  'Apple',
  'Samsung',
  'vivo',
  'OPPO',
  'OnePlus',
  'realme',
  'Xiaomi',
  'iQOO',
  'Motorola',
  'Nothing',
  'Google Pixel'
];

// Initial sample products for instant preview/demo
const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    brand: 'vivo',
    model: 'X200',
    variant: '12GB / 256GB',
    color: 'Titanium Grey',
    current_dp: 52000,
    current_mop: 54999,
    current_mrp: 59999,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'prod-2',
    brand: 'Samsung',
    model: 'Galaxy S25',
    variant: '12GB / 256GB',
    color: 'Navy Blue',
    current_dp: 68000,
    current_mop: 72999,
    current_mrp: 79999,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'prod-3',
    brand: 'OnePlus',
    model: '13',
    variant: '16GB / 512GB',
    color: 'Midnight Black',
    current_dp: 61500,
    current_mop: 64999,
    current_mrp: 69999,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'prod-4',
    brand: 'realme',
    model: 'GT 7 Pro',
    variant: '12GB / 256GB',
    color: 'Mars Orange',
    current_dp: 47500,
    current_mop: 49999,
    current_mrp: 54999,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'prod-5',
    brand: 'Apple',
    model: 'iPhone 16',
    variant: '128GB',
    color: 'Teal',
    current_dp: 72500,
    current_mop: 76999,
    current_mrp: 79900,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

// Initial sample price history
const INITIAL_PRICE_HISTORY = [
  {
    id: 'hist-1',
    product_id: 'prod-1',
    old_dp: 50000,
    new_dp: 52000,
    old_mop: 52999,
    new_mop: 54999,
    old_mrp: 59999,
    new_mrp: 59999,
    changed_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'hist-2',
    product_id: 'prod-2',
    old_dp: 69500,
    new_dp: 68000,
    old_mop: 74999,
    new_mop: 72999,
    old_mrp: 79999,
    new_mrp: 79999,
    changed_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'hist-3',
    product_id: 'prod-3',
    old_dp: 63000,
    new_dp: 61500,
    old_mop: 66999,
    new_mop: 64999,
    old_mrp: 69999,
    new_mrp: 69999,
    changed_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

// Initial sample IMEIs
const INITIAL_IMEIS = [
  {
    id: 'imei-1',
    product_id: 'prod-1',
    imei: '864209051234567',
    dp: 52000,
    mop: 54999,
    mrp: 59999,
    notes: 'Batch A - Titanium Grey',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'imei-2',
    product_id: 'prod-1',
    imei: '864209059876543',
    dp: 51800,
    mop: 54999,
    mrp: 59999,
    notes: 'Promo stock unit',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'imei-3',
    product_id: 'prod-2',
    imei: '358901234567890',
    dp: 68000,
    mop: 72999,
    mrp: 79999,
    notes: 'Navy Blue retail pack',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString()
  }
];

/**
 * Supabase Data Store Manager
 */
class SupabaseService {
  constructor() {
    this.client = null;
    this.isLive = false;
    this.supportsImeiPriceColumns = null; // null: auto-detect, true: available, false: missing in DB
    this.init();
  }

  isValidUuid(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
           /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  }

  isColumnMissingError(error) {
    if (!error) return false;
    const msg = (error.message || '').toLowerCase();
    const details = (error.details || '').toLowerCase();
    const hint = (error.hint || '').toLowerCase();
    return (
      error.code === '42703' || // Postgres: undefined_column
      error.code === 'PGRST204' ||
      error.code === 'PGRST200' ||
      (msg.includes('column') && msg.includes('does not exist')) ||
      msg.includes('could not find the') ||
      (details.includes('column') && details.includes('does not exist')) ||
      hint.includes('column')
    );
  }

  isNetworkError(error) {
    const message = (error?.message || String(error || '')).toLowerCase();
    return message.includes('failed to fetch') ||
           message.includes('networkerror') ||
           message.includes('network request failed');
  }

  init() {
    const config = this.getConfig();
    if (config.url && config.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(config.url, config.anonKey);
        this.isLive = true;
      } catch (err) {
        console.error('Supabase initialization failed, falling back to local store:', err);
        this.isLive = false;
        this.client = null;
      }
    } else {
      this.isLive = false;
      this.client = null;
    }

    // Seed local storage if empty
    this.seedLocalStorage();
  }

  getConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) return parsed;
      }
    } catch (e) {
      console.warn('Could not read stored Supabase config:', e);
    }
    return DEFAULT_SUPABASE_CONFIG;
  }

  saveConfig(url, anonKey) {
    const config = {
      url: (url || '').trim(),
      anonKey: (anonKey || '').trim()
    };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    this.init();
    return this.isLive;
  }

  seedLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
      localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS.map(name => ({
        id: 'brand-' + Math.random().toString(36).substr(2, 9),
        name,
        created_at: new Date().toISOString()
      }))));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY)) {
      localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(INITIAL_PRICE_HISTORY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.IMEIS)) {
      localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(INITIAL_IMEIS));
    }
  }

  async testConnection(url, anonKey) {
    if (!url || !anonKey) {
      throw new Error('Please provide both Supabase URL and Anon Key');
    }
    if (!window.supabase) {
      throw new Error('Supabase client library is not loaded');
    }
    try {
      const testClient = window.supabase.createClient(url.trim(), anonKey.trim());
      const { data, error } = await testClient.from('products').select('id').limit(1);
      if (error) {
        throw new Error(error.message || 'Failed to query products table');
      }
      return true;
    } catch (err) {
      throw new Error(err.message || 'Connection test failed');
    }
  }

  async verifyConnection() {
    if (!this.isLive || !this.client) {
      return false;
    }

    const { error } = await this.client.from('products').select('id').limit(1);
    if (error) {
      this.isLive = false;
      throw new Error(error.message || 'Could not connect to the products table');
    }

    return true;
  }

  // ================= BRANDS API ================= //

  async fetchBrands() {
    let brands;
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('brands')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) {
          // Sync to local cache
          try {
            localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(data));
          } catch (_) {}
          brands = data;
        }
      } catch (err) {
        console.warn('fetchBrands live query error, using local fallback:', err);
      }
    }

    if (!brands) {
      brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
    }

    let savedOrder = [];
    try {
      savedOrder = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRAND_ORDER) || '[]');
    } catch (_) {}
    const orderMap = new Map(savedOrder.map((name, index) => [name.toLowerCase(), index]));
    return brands.sort((a, b) => {
      const aOrder = orderMap.get(a.name.toLowerCase());
      const bOrder = orderMap.get(b.name.toLowerCase());
      if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
      if (aOrder !== undefined) return -1;
      if (bOrder !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  saveBrandOrder(brands) {
    const order = brands.map(brand => typeof brand === 'string' ? brand : brand.name);
    localStorage.setItem(STORAGE_KEYS.BRAND_ORDER, JSON.stringify(order));
  }

  async addBrand(name) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Brand name cannot be empty');

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('brands')
          .insert([{ name: trimmed }])
          .select()
          .single();
        if (error) {
          if (error.code === '23505') throw new Error(`Brand "${trimmed}" already exists`);
          throw error;
        }
        return data;
      } catch (err) {
        if (err.message && err.message.includes('already exists')) throw err;
        console.warn('addBrand live error, falling back to local:', err);
      }
    }

    // Local fallback
    const brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
    if (brands.some(b => b.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Brand "${trimmed}" already exists`);
    }
    const newBrand = {
      id: 'brand-' + Math.random().toString(36).substr(2, 9),
      name: trimmed,
      created_at: new Date().toISOString()
    };
    brands.push(newBrand);
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
    this.saveBrandOrder(brands);
    return newBrand;
  }

  async deleteBrand(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('Brand name is required');

    if (this.isLive && this.client) {
      const { data: products, error: productsError } = await this.client
        .from('products')
        .select('id')
        .eq('brand', trimmed)
        .limit(1);
      if (productsError) throw new Error(`Could not check brand usage: ${productsError.message}`);
      if (products && products.length > 0) {
        throw new Error(`Cannot delete "${trimmed}" because products still use this brand`);
      }

      const { error } = await this.client
        .from('brands')
        .delete()
        .eq('name', trimmed);
      if (error) throw new Error(`Brand delete failed: ${error.message}`);
    } else {
      const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      if (products.some(product => (product.brand || '').toLowerCase() === trimmed.toLowerCase())) {
        throw new Error(`Cannot delete "${trimmed}" because products still use this brand`);
      }
    }

    const brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
    localStorage.setItem(
      STORAGE_KEYS.BRANDS,
      JSON.stringify(brands.filter(brand => brand.name.toLowerCase() !== trimmed.toLowerCase()))
    );
    this.saveBrandOrder(brands.filter(brand => brand.name.toLowerCase() !== trimmed.toLowerCase()));
    return true;
  }

  // ================= PRODUCTS API ================= //

  async fetchProducts(searchQuery = '', brandFilter = '') {
    if (this.isLive && this.client) {
      try {
        let query = this.client
          .from('products')
          .select('*');

        if (brandFilter && brandFilter !== 'ALL') {
          query = query.eq('brand', brandFilter);
        }

        const { data, error } = await query;
        if (!error && data) {
          let products = data.map(p => ({
            ...p,
            current_dp: Number(p.current_dp !== undefined && p.current_dp !== null ? p.current_dp : (p.dp !== undefined && p.dp !== null ? p.dp : 0)),
            current_mop: Number(p.current_mop !== undefined && p.current_mop !== null ? p.current_mop : (p.mop !== undefined && p.mop !== null ? p.mop : 0)),
            current_mrp: Number(p.current_mrp !== undefined && p.current_mrp !== null ? p.current_mrp : (p.mrp !== undefined && p.mrp !== null ? p.mrp : 0)),
            imei_count: 0
          }));

          // Safely fetch IMEI counts without breaking if table empty or relation missing
          try {
            const { data: allImeis } = await this.client.from('imeis').select('product_id');
            if (allImeis && Array.isArray(allImeis)) {
              const countMap = {};
              allImeis.forEach(i => {
                if (i && i.product_id) {
                  countMap[i.product_id] = (countMap[i.product_id] || 0) + 1;
                }
              });
              products.forEach(p => {
                p.imei_count = countMap[p.id] || 0;
              });
            }
          } catch (cntErr) {
            console.warn('Could not fetch IMEI count:', cntErr);
          }

          // If search query is provided
          if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();

            // Also check if any product matches by IMEI search
            let matchedProductIds = new Set();
            try {
              const { data: matchedImeis } = await this.client
                .from('imeis')
                .select('product_id, imei')
                .ilike('imei', `%${q}%`);
              if (matchedImeis) {
                matchedProductIds = new Set(matchedImeis.map(i => i.product_id));
              }
            } catch (_) {}

            products = products.filter(p => {
              const matchDirect =
                (p.brand && p.brand.toLowerCase().includes(q)) ||
                (p.model && p.model.toLowerCase().includes(q)) ||
                (p.variant && p.variant.toLowerCase().includes(q)) ||
                (p.color && p.color.toLowerCase().includes(q));
              return matchDirect || matchedProductIds.has(p.id);
            });
          }

          // Sort in JavaScript so missing updated_at column never crashes query
          products.sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());

          // Sync fetched products to local storage cache
          if (products.length > 0) {
            try {
              localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            } catch (_) {}
          }

          return products;
        }
      } catch (err) {
        console.warn('Live fetchProducts error, using local fallback:', err);
      }
    }

    // Local fallback
    let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const allImeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');

    products = products.map(p => {
      const count = allImeis.filter(i => String(i.product_id) === String(p.id)).length;
      return {
        ...p,
        current_dp: Number(p.current_dp !== undefined && p.current_dp !== null ? p.current_dp : (p.dp !== undefined && p.dp !== null ? p.dp : 0)),
        current_mop: Number(p.current_mop !== undefined && p.current_mop !== null ? p.current_mop : (p.mop !== undefined && p.mop !== null ? p.mop : 0)),
        current_mrp: Number(p.current_mrp !== undefined && p.current_mrp !== null ? p.current_mrp : (p.mrp !== undefined && p.mrp !== null ? p.mrp : 0)),
        imei_count: count
      };
    });

    if (brandFilter && brandFilter !== 'ALL') {
      products = products.filter(p => p.brand === brandFilter);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchedImeiProductIds = new Set(
        allImeis.filter(i => i.imei && i.imei.toLowerCase().includes(q)).map(i => i.product_id)
      );

      products = products.filter(p => {
        const matchDirect =
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.model && p.model.toLowerCase().includes(q)) ||
          (p.variant && p.variant.toLowerCase().includes(q)) ||
          (p.color && p.color.toLowerCase().includes(q));
        return matchDirect || matchedImeiProductIds.has(p.id);
      });
    }

    // Order by updated_at or created_at descending
    products.sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
    return products;
  }

  async fetchAllImeis() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client.from('imeis').select('*');
        if (!error && Array.isArray(data)) return data;
        if (error) console.warn('fetchAllImeis live error:', error);
      } catch (err) {
        console.warn('fetchAllImeis live query failed:', err);
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
  }

  async createBackup() {
    let brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
    let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    let imeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    let priceHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY) || '[]');
    if (this.isLive && this.client) {
      const [brandResult, productResult, imeiResult, historyResult] = await Promise.all([
        this.client.from('brands').select('*'), this.client.from('products').select('*'),
        this.client.from('imeis').select('*'), this.client.from('price_history').select('*')
      ]);
      if (brandResult.error || productResult.error || imeiResult.error || historyResult.error) throw new Error('Could not read all database tables for backup');
      brands = brandResult.data || []; products = productResult.data || []; imeis = imeiResult.data || []; priceHistory = historyResult.data || [];
    }
    return { app: 'Mobile Price Tracker', version: 1, exported_at: new Date().toISOString(), brands, products, imeis, price_history: priceHistory };
  }

  async syncOnlineDataToLocal() {
    if (!this.isLive || !this.client) throw new Error('Online database is not connected');
    const [brandResult, productResult, imeiResult, historyResult] = await Promise.all([
      this.client.from('brands').select('*'), this.client.from('products').select('*'),
      this.client.from('imeis').select('*'), this.client.from('price_history').select('*')
    ]);
    const failed = [brandResult, productResult, imeiResult, historyResult].find(result => result.error);
    if (failed) throw new Error(failed.error.message || 'Could not download online data');
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brandResult.data || []));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productResult.data || []));
    localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(imeiResult.data || []));
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(historyResult.data || []));
    localStorage.setItem('mpt_last_sync_at', new Date().toISOString());
    return true;
  }

  async restoreBackup(backup) {
    if (!backup || !Array.isArray(backup.brands) || !Array.isArray(backup.products) || !Array.isArray(backup.imeis) || !Array.isArray(backup.price_history)) throw new Error('This is not a valid Mobile Price Tracker backup');
    const data = { brands: backup.brands, products: backup.products, imeis: backup.imeis, priceHistory: backup.price_history };
    if (this.isLive && this.client) {
      const assertOk = (result, action) => { if (result.error) throw new Error(`${action}: ${result.error.message}`); };
      assertOk(await this.client.from('price_history').delete().neq('id', ''), 'Could not clear price history');
      assertOk(await this.client.from('imeis').delete().neq('id', ''), 'Could not clear IMEIs');
      assertOk(await this.client.from('products').delete().neq('id', ''), 'Could not clear products');
      assertOk(await this.client.from('brands').delete().neq('id', ''), 'Could not clear brands');
      if (data.brands.length) assertOk(await this.client.from('brands').insert(data.brands), 'Could not restore brands');
      if (data.products.length) assertOk(await this.client.from('products').insert(data.products), 'Could not restore products');
      if (data.imeis.length) assertOk(await this.client.from('imeis').insert(data.imeis), 'Could not restore IMEIs');
      if (data.priceHistory.length) assertOk(await this.client.from('price_history').insert(data.priceHistory), 'Could not restore price history');
    }
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(data.brands));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
    localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(data.imeis));
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(data.priceHistory));
    return true;
  }

  async findImeiForSale(imei) {
    const code = (imei || '').trim();
    if (!code) return null;
    let unit, product;
    if (this.isLive && this.client) {
      const { data, error } = await this.client.from('imeis').select('*').eq('imei', code).maybeSingle();
      if (error) throw error;
      unit = data;
      if (unit) { const result = await this.client.from('products').select('*').eq('id', unit.product_id).maybeSingle(); if (result.error) throw result.error; product = result.data; }
    } else {
      unit = (JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]')).find(item => item.imei === code);
      if (unit) product = (JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]')).find(item => String(item.id) === String(unit.product_id));
    }
    if (!unit || !product) return null;
    const first = (await this.fetchInitialPrices([product.id]))[String(product.id)] || {};
    return { unit, product: { ...product, current_dp: Number(product.current_dp ?? product.dp ?? 0), current_mop: Number(product.current_mop ?? product.mop ?? 0), current_mrp: Number(product.current_mrp ?? product.mrp ?? 0) }, entry_dp: Number(first.dp ?? product.current_dp ?? product.dp ?? 0) };
  }

  async saveSaleAndRemoveImei(sale) {
    if (!this.isLive || !this.client) throw new Error('Please connect to the online database before saving a sale');
    const { product, unit, entry_dp, mop, mrp, remarks } = sale;
    const priceHistory = await this.fetchPriceHistory(product.id);
    const payload = { product_id: product.id, imei: unit.imei, brand: product.brand, model: product.model, variant: product.variant, color: product.color, entry_dp: Number(entry_dp), mop: Number(mop), mrp: Number(mrp), remarks: remarks || null, price_history: priceHistory, sold_at: new Date().toISOString() };
    const insert = await this.client.from('sales').insert([payload]);
    if (insert.error) throw new Error(insert.error.message);
    const deleted = await this.client.from('imeis').delete().eq('id', unit.id);
    if (deleted.error) throw new Error('Sale saved but IMEI could not be removed: ' + deleted.error.message);
    const remaining = await this.client.from('imeis').select('id').eq('product_id', product.id).limit(1);
    if (remaining.error) throw remaining.error;
    if (!remaining.data || remaining.data.length === 0) {
      const removeProduct = await this.client.from('products').delete().eq('id', product.id);
      if (removeProduct.error) throw removeProduct.error;
    }
    return true;
  }

  async fetchSales() {
    if (!this.isLive || !this.client) return [];
    const { data, error } = await this.client.from('sales').select('*').order('sold_at', { ascending: false }).limit(50);
    if (error) throw error;
    return data || [];
  }

  async getProductById(id) {
    if (!id) return null;

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return {
            ...data,
            current_dp: Number(data.current_dp !== undefined && data.current_dp !== null ? data.current_dp : (data.dp ?? 0)),
            current_mop: Number(data.current_mop !== undefined && data.current_mop !== null ? data.current_mop : (data.mop ?? 0)),
            current_mrp: Number(data.current_mrp !== undefined && data.current_mrp !== null ? data.current_mrp : (data.mrp ?? 0))
          };
        }
      } catch (err) {
        console.warn('getProductById live query error:', err);
      }
    }

    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    return products.find(p => String(p.id) === String(id)) || null;
  }

  async addProduct(productData) {
    const payload = {
      brand: productData.brand.trim(),
      model: productData.model.trim(),
      variant: (productData.variant || '').trim() || null,
      color: (productData.color || '').trim() || null,
      current_dp: Number(productData.current_dp),
      current_mop: Number(productData.current_mop),
      current_mrp: Number(productData.current_mrp)
    };

    const imei = (productData.imei || '').trim();

    // If an IMEI was entered during product creation, verify uniqueness first
    if (imei) {
      const existing = await this.checkImeiExists(imei);
      if (existing) {
        const prodInfo = existing.product
          ? `${existing.product.brand} ${existing.product.model}`
          : 'another product';
        const err = new Error(`IMEI "${imei}" already exists in the database (Assigned to ${prodInfo}). IMEI must be unique.`);
        err.isDuplicate = true;
        throw err;
      }
    }

    let savedProduct = null;

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('products')
          .insert([payload])
          .select()
          .single();
        if (!error && data) {
          savedProduct = data;

          // Keep an immutable entry-price record from the moment the model is
          // added. Later dashboard cards use this to compare the current price.
          try {
            const { error: entryHistoryError } = await this.client.from('price_history').insert([{
              product_id: data.id,
              old_dp: payload.current_dp,
              new_dp: payload.current_dp,
              old_mop: payload.current_mop,
              new_mop: payload.current_mop,
              old_mrp: payload.current_mrp,
              new_mrp: payload.current_mrp,
              changed_at: data.created_at || new Date().toISOString()
            }]);
            if (entryHistoryError) console.warn('Could not save initial price history:', entryHistoryError);
          } catch (historyErr) {
            console.warn('Could not save initial price history:', historyErr);
          }

          // If IMEI provided, attach to this product
          if (imei && data.id) {
            try {
              await this.addImei(data.id, imei);
            } catch (imeiErr) {
              console.error('Failed to attach initial IMEI:', imeiErr);
            }
          }

          // Sync to local cache
          try {
            const localProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
            localProducts.unshift(savedProduct);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(localProducts));
          } catch (_) {}

          return savedProduct;
        }
      } catch (err) {
        console.warn('Live addProduct failed, falling back to local:', err);
      }
    }

    // Local fallback
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const newProduct = {
      id: 'prod-' + Math.random().toString(36).substr(2, 9),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    products.unshift(newProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY) || '[]');
    history.unshift({
      id: 'hist-entry-' + Date.now() + '-' + Math.random().toString(36).substr(2, 7),
      product_id: newProduct.id,
      old_dp: payload.current_dp,
      new_dp: payload.current_dp,
      old_mop: payload.current_mop,
      new_mop: payload.current_mop,
      old_mrp: payload.current_mrp,
      new_mrp: payload.current_mrp,
      changed_at: newProduct.created_at
    });
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(history));

    // Save IMEI if provided
    if (imei) {
      const imeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
      imeis.unshift({
        id: 'imei-' + Math.random().toString(36).substr(2, 9),
        product_id: newProduct.id,
        imei: imei,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(imeis));
    }

    return newProduct;
  }

  /**
   * Updates a product and records price history if DP, MOP, or MRP changed.
   * Completely resilient across live Supabase, column naming variations, and local cache.
   */
  async updateProduct(id, updateData) {
    if (!id) throw new Error('Product ID is required');

    // IMPORTANT: when Supabase is connected, always read the authoritative
    // current price from Supabase. LocalStorage can be stale and was causing
    // dashboard edits to appear briefly and then revert after reload.
    let existing = null;
    if (this.isLive && this.client) {
      const { data, error } = await this.client
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw new Error(`Could not read product before update: ${error.message}`);
      if (!data) throw new Error('Product not found in Supabase');
      existing = data;
    } else {
      const localProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
      existing = localProducts.find(p => String(p.id) === String(id)) || null;
    }

    const newDp = Number(updateData.current_dp);
    const newMop = Number(updateData.current_mop);
    const newMrp = Number(updateData.current_mrp);
    if (![newDp, newMop, newMrp].every(Number.isFinite)) {
      throw new Error('DP, MOP and MRP must be valid numbers');
    }

    const oldDp = Number(existing?.current_dp ?? existing?.dp ?? newDp);
    const oldMop = Number(existing?.current_mop ?? existing?.mop ?? newMop);
    const oldMrp = Number(existing?.current_mrp ?? existing?.mrp ?? newMrp);
    const priceChanged = newDp !== oldDp || newMop !== oldMop || newMrp !== oldMrp;
    const changeTimestamp = new Date().toISOString();

    const fullPayload = {
      brand: (updateData.brand ?? existing?.brand ?? '').trim(),
      model: (updateData.model ?? existing?.model ?? '').trim(),
      variant: (updateData.variant ?? existing?.variant ?? '').trim() || null,
      color: (updateData.color ?? existing?.color ?? '').trim() || null,
      current_dp: newDp,
      current_mop: newMop,
      current_mrp: newMrp,
      updated_at: changeTimestamp
    };

    if (!fullPayload.brand || !fullPayload.model) {
      throw new Error('Brand and Model are required');
    }

    let updatedProductResult;

    if (this.isLive && this.client) {
      // Update the CURRENT price first and verify that Supabase actually
      // returned the updated row. Never silently fall back to LocalStorage.
      const { data, error } = await this.client
        .from('products')
        .update(fullPayload)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) throw new Error(`Price update failed: ${error.message}`);
      if (!data) throw new Error('Price update was not saved. Check Supabase RLS policies.');
      updatedProductResult = data;

      // Only after the current price is confirmed saved, write the history.
      // If history insertion fails, roll the product back so current price
      // and history can never silently get out of sync.
      if (priceChanged) {
        const { error: histError } = await this.client
          .from('price_history')
          .insert([{
            product_id: id,
            old_dp: oldDp,
            new_dp: newDp,
            old_mop: oldMop,
            new_mop: newMop,
            old_mrp: oldMrp,
            new_mrp: newMrp,
            changed_at: changeTimestamp
          }]);

        if (histError) {
          await this.client.from('products').update({
            current_dp: oldDp,
            current_mop: oldMop,
            current_mrp: oldMrp,
            updated_at: existing.updated_at || changeTimestamp
          }).eq('id', id);
          throw new Error(`Price history could not be saved, so the price was rolled back: ${histError.message}`);
        }
      }
    } else {
      // Offline/local mode.
      updatedProductResult = {
        ...existing,
        id,
        ...fullPayload
      };

      if (priceChanged) {
        const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY) || '[]');
        history.unshift({
          id: 'hist-' + Date.now() + '-' + Math.random().toString(36).substr(2, 7),
          product_id: id,
          old_dp: oldDp,
          new_dp: newDp,
          old_mop: oldMop,
          new_mop: newMop,
          old_mrp: oldMrp,
          new_mrp: newMrp,
          changed_at: changeTimestamp
        });
        localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(history));
      }
    }

    const finalProduct = {
      ...existing,
      ...updatedProductResult,
      id,
      brand: fullPayload.brand,
      model: fullPayload.model,
      variant: fullPayload.variant,
      color: fullPayload.color,
      current_dp: Number(updatedProductResult.current_dp ?? newDp),
      current_mop: Number(updatedProductResult.current_mop ?? newMop),
      current_mrp: Number(updatedProductResult.current_mrp ?? newMrp),
      updated_at: updatedProductResult.updated_at || changeTimestamp
    };

    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) products[idx] = { ...products[idx], ...finalProduct };
    else products.unshift(finalProduct);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    return { product: finalProduct, priceChanged };
  }

  async deleteProduct(id) {
    if (!id) throw new Error('Product ID is required');

    if (this.isLive && this.client) {
      const { error } = await this.client
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Product delete failed: ${error.message}`);
      }
    }

    let products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    products = products.filter(p => String(p.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY) || '[]');
    history = history.filter(h => String(h.product_id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(history));

    let imeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    imeis = imeis.filter(i => String(i.product_id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(imeis));

    return true;
  }

  // ================= PRICE HISTORY API ================= //

  // Returns the first recorded (entry) prices for products that have since
  // changed. Products without a price change intentionally have no entry here.
  async fetchInitialPrices(productIds = []) {
    const ids = productIds.filter(Boolean);
    if (!ids.length) return {};

    let records = [];
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('price_history')
          .select('product_id, old_dp, old_mop, old_mrp, changed_at')
          .in('product_id', ids)
          .order('changed_at', { ascending: true });
        if (error) throw error;
        records = data || [];
      } catch (err) {
        console.warn('fetchInitialPrices live error:', err);
      }
    }

    // Include local history as a fallback/cache, while preserving the earliest
    // change for each product.
    const localHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY) || '[]')
      .filter(record => ids.includes(record.product_id));
    records = records.concat(localHistory);
    records.sort((a, b) => new Date(a.changed_at || 0).getTime() - new Date(b.changed_at || 0).getTime());

    return records.reduce((entryPrices, record) => {
      const id = String(record.product_id);
      if (!entryPrices[id]) {
        entryPrices[id] = { dp: record.old_dp, mop: record.old_mop, mrp: record.old_mrp };
      }
      return entryPrices;
    }, {});
  }

  async fetchPriceHistory(productId) {
    if (!productId) return [];

    let deletedIds = [];
    try {
      deletedIds = JSON.parse(localStorage.getItem('mpt_deleted_history_ids') || '[]');
    } catch (_) {}
    const isDeleted = (id) => deletedIds.includes(String(id));

    let liveRecords = [];
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('price_history')
          .select('*')
          .eq('product_id', productId);
        if (!error && data && Array.isArray(data)) {
          liveRecords = data.filter(r => !isDeleted(r.id));
        }
      } catch (err) {
        console.warn('fetchPriceHistory live error:', err);
      }
    }

    // Local storage history
    const localHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY) || '[]');
    const matchingLocal = localHistory.filter(h => String(h.product_id) === String(productId) && !isDeleted(h.id));

    // Merge by id or changed_at
    const combinedMap = new Map();
    liveRecords.forEach(r => combinedMap.set(String(r.id), r));
    matchingLocal.forEach(r => {
      const key = String(r.id);
      if (!combinedMap.has(key)) {
        combinedMap.set(key, r);
      }
    });

    const list = Array.from(combinedMap.values());
    list.sort((a, b) => new Date(b.changed_at || 0).getTime() - new Date(a.changed_at || 0).getTime());
    return list;
  }

  async deletePriceHistory(historyId) {
    if (!historyId) throw new Error('History ID is required');

    if (this.isLive && this.client && this.isValidUuid(String(historyId))) {
      const { error } = await this.client
        .from('price_history')
        .delete()
        .eq('id', historyId);
      if (error) throw new Error(`Could not delete history: ${error.message}`);
    }

    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY) || '[]');
    history = history.filter(h => String(h.id) !== String(historyId));
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(history));

    // Keep a local tombstone only for records that are actually deleted from
    // Supabase, so stale cache data cannot resurrect them.
    try {
      const deletedIds = JSON.parse(localStorage.getItem('mpt_deleted_history_ids') || '[]');
      if (!deletedIds.includes(String(historyId))) deletedIds.push(String(historyId));
      localStorage.setItem('mpt_deleted_history_ids', JSON.stringify(deletedIds));
    } catch (_) {}
    return true;
  }

  async clearPriceHistory(productId) {
    if (!productId) throw new Error('Product ID is required');

    if (this.isLive && this.client) {
      const { error } = await this.client
        .from('price_history')
        .delete()
        .eq('product_id', productId);
      if (error) throw new Error(`Could not clear history: ${error.message}`);
    }

    let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY) || '[]');
    history = history.filter(h => String(h.product_id) !== String(productId));
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(history));
    return true;
  }

  // ================= IMEI API (Full Edit, Modify, and Delete Support) ================= //

  async fetchImeis(productId) {
    if (!productId) return [];

    let liveImeis = null;
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('imeis')
          .select('*')
          .eq('product_id', productId);

        if (!error && data) {
          liveImeis = data;
        }
      } catch (err) {
        console.warn('fetchImeis live query failed, falling back to local:', err);
      }
    }

    // Local fallback and metadata cache merge (dp, mop, mrp, notes)
    const localImeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    const localMap = new Map();
    localImeis.forEach(i => {
      if (i.id) localMap.set(String(i.id), i);
      if (i.imei) localMap.set(String(i.imei), i);
    });

    if (liveImeis && Array.isArray(liveImeis)) {
      const merged = liveImeis.map(liveItem => {
        const local = localMap.get(String(liveItem.id)) || localMap.get(String(liveItem.imei));
        return {
          ...liveItem,
          dp: (liveItem.dp !== undefined && liveItem.dp !== null) ? Number(liveItem.dp) : (local?.dp !== undefined && local?.dp !== null ? Number(local.dp) : null),
          mop: (liveItem.mop !== undefined && liveItem.mop !== null) ? Number(liveItem.mop) : (local?.mop !== undefined && local?.mop !== null ? Number(local.mop) : null),
          mrp: (liveItem.mrp !== undefined && liveItem.mrp !== null) ? Number(liveItem.mrp) : (local?.mrp !== undefined && local?.mrp !== null ? Number(local.mrp) : null),
          notes: (liveItem.notes !== undefined && liveItem.notes !== null) ? liveItem.notes : (local?.notes ?? null),
          updated_at: liveItem.updated_at || local?.updated_at || liveItem.created_at
        };
      });

      merged.sort((a, b) => new Date(b.created_at || b.updated_at || 0).getTime() - new Date(a.created_at || a.updated_at || 0).getTime());
      return merged;
    }

    return localImeis
      .filter(i => String(i.product_id) === String(productId))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }

  async checkImeiExists(imeiNumber, excludeImeiId = null, excludeOldImei = null) {
    const trimmed = (imeiNumber || '').trim();
    if (!trimmed) return null;

    if (this.isLive && this.client) {
      try {
        let query = this.client
          .from('imeis')
          .select('id, imei, product_id')
          .eq('imei', trimmed);

        if (excludeImeiId) {
          query = query.neq('id', excludeImeiId);
        }

        const { data, error } = await query.limit(1);
        if (!error && data && data.length > 0) {
          const match = data[0];
          const isSameRecord = (excludeImeiId && String(match.id) === String(excludeImeiId)) ||
                               (excludeOldImei && String(match.imei).toLowerCase() === String(excludeOldImei).toLowerCase());
          if (!isSameRecord) {
            return {
              id: match.id,
              imei: match.imei,
              product_id: match.product_id
            };
          }
        }
      } catch (err) {
        console.warn('checkImeiExists error:', err);
      }
    }

    // Local fallback
    const imeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    const match = imeis.find(i => {
      if (!i.imei || i.imei.toLowerCase() !== trimmed.toLowerCase()) return false;
      if (excludeImeiId && String(i.id) === String(excludeImeiId)) return false;
      if (excludeOldImei && String(i.imei).toLowerCase() === String(excludeOldImei).toLowerCase()) return false;
      return true;
    });

    if (!match) return null;

    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const prod = products.find(p => String(p.id) === String(match.product_id));
    return {
      id: match.id,
      imei: match.imei,
      product_id: match.product_id,
      dp: match.dp,
      mop: match.mop,
      mrp: match.mrp,
      notes: match.notes,
      product: prod ? {
        id: prod.id,
        brand: prod.brand,
        model: prod.model,
        variant: prod.variant
      } : null
    };
  }

  async addImei(productId, imeiData) {
    const imeiNumber = (typeof imeiData === 'string' ? imeiData : imeiData.imei || '').trim();
    if (!imeiNumber) throw new Error('IMEI number cannot be empty');

    // Duplicate check across the database
    try {
      const existing = await this.checkImeiExists(imeiNumber);
      if (existing) {
        const err = new Error(`IMEI "${imeiNumber}" already exists in the database`);
        err.isDuplicate = true;
        throw err;
      }
    } catch (dupErr) {
      if (dupErr.isDuplicate) throw dupErr;
    }

    const dpVal = (typeof imeiData === 'object' && imeiData.dp !== undefined && imeiData.dp !== null && imeiData.dp !== '') ? Number(imeiData.dp) : null;
    const mopVal = (typeof imeiData === 'object' && imeiData.mop !== undefined && imeiData.mop !== null && imeiData.mop !== '') ? Number(imeiData.mop) : null;
    const mrpVal = (typeof imeiData === 'object' && imeiData.mrp !== undefined && imeiData.mrp !== null && imeiData.mrp !== '') ? Number(imeiData.mrp) : null;
    const notesVal = typeof imeiData === 'object' ? (imeiData.notes || '').trim() || null : null;

    let savedImei = null;

    if (this.isLive && this.client) {
      // 1. Try full payload with price columns if supported
      if (this.supportsImeiPriceColumns !== false) {
        try {
          const payload = {
            product_id: productId,
            imei: imeiNumber,
            dp: dpVal,
            mop: mopVal,
            mrp: mrpVal,
            notes: notesVal
          };

          const { data, error } = await this.client
            .from('imeis')
            .insert([payload])
            .select();

          if (!error && data && data.length > 0) {
            this.supportsImeiPriceColumns = true;
            savedImei = data[0];
          } else if (error && this.isColumnMissingError(error)) {
            this.supportsImeiPriceColumns = false;
          } else if (error && error.code === '23505') {
            const err = new Error('IMEI already exists in the database');
            err.isDuplicate = true;
            throw err;
          }
        } catch (err) {
          if (err.isDuplicate) throw err;
          this.supportsImeiPriceColumns = false;
        }
      }

      // 2. Safe fallback: basic insert with (product_id, imei) only
      if (!savedImei) {
        try {
          const { data, error } = await this.client
            .from('imeis')
            .insert([{ product_id: productId, imei: imeiNumber }])
            .select();

          if (error) {
            if (error.code === '23505') {
              const err = new Error('IMEI already exists in the database');
              err.isDuplicate = true;
              throw err;
            }
            console.warn('Basic insert error in Supabase:', error);
          } else if (data && data[0]) {
            savedImei = data[0];
          }
        } catch (err) {
          if (err.isDuplicate) throw err;
          console.warn('Database add IMEI error:', err);
        }
      }
    }

    // Local fallback & caching
    const fallbackId = savedImei?.id || ('imei-' + Math.random().toString(36).substr(2, 9));
    const newImei = {
      id: fallbackId,
      product_id: productId,
      imei: imeiNumber,
      dp: dpVal,
      mop: mopVal,
      mrp: mrpVal,
      notes: notesVal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(savedImei || {})
    };

    const imeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    imeis.unshift(newImei);
    localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(imeis));

    return newImei;
  }

  async updateImei(imeiId, imeiData, oldImei = null) {
    if (!imeiId && !oldImei) throw new Error('IMEI identifier is required');
    const imeiNumber = (typeof imeiData === 'string' ? imeiData : imeiData.imei || '').trim();
    if (!imeiNumber) throw new Error('IMEI cannot be empty');

    // Duplicate check excluding current record
    try {
      const existing = await this.checkImeiExists(imeiNumber, imeiId, oldImei);
      if (existing) {
        const err = new Error(`IMEI "${imeiNumber}" is already in use by another mobile`);
        err.isDuplicate = true;
        throw err;
      }
    } catch (dupErr) {
      if (dupErr.isDuplicate) throw dupErr;
    }

    const dpVal = (imeiData.dp !== undefined && imeiData.dp !== null && imeiData.dp !== '') ? Number(imeiData.dp) : null;
    const mopVal = (imeiData.mop !== undefined && imeiData.mop !== null && imeiData.mop !== '') ? Number(imeiData.mop) : null;
    const mrpVal = (imeiData.mrp !== undefined && imeiData.mrp !== null && imeiData.mrp !== '') ? Number(imeiData.mrp) : null;
    const notesVal = (imeiData.notes || '').trim() || null;

    let updatedImeiResult = null;

    if (this.isLive && this.client) {
      const fullPayload = {
        imei: imeiNumber,
        dp: dpVal,
        mop: mopVal,
        mrp: mrpVal,
        notes: notesVal,
        updated_at: new Date().toISOString()
      };

      const runUpdate = async (column, value) => {
        try {
          // Do not use .select() after PATCH. It adds a return=representation
          // request and can fail under stricter Supabase RLS policies.
          return await this.client
            .from('imeis')
            .update(fullPayload)
            .eq(column, value);
        } catch (error) {
          if (this.isNetworkError(error)) {
            throw new Error(
              'Cannot reach the Supabase IMEI update API. Check browser/network blocking, VPN, or ad-blocking extensions and try again.'
            );
          }
          throw error;
        }
      };

      // 1. Update by ID first.
      if (imeiId) {
        const res = await runUpdate('id', imeiId);
        if (!res.error) {
          updatedImeiResult = { id: imeiId, ...fullPayload };
          this.supportsImeiPriceColumns = true;
        } else if (this.isColumnMissingError(res.error)) {
          const basicRes = await this.client
            .from('imeis')
            .update({ imei: imeiNumber })
            .eq('id', imeiId);
          if (basicRes.error) throw new Error(`IMEI update failed: ${basicRes.error.message}`);
          updatedImeiResult = { id: imeiId, imei: imeiNumber };
        } else {
          throw new Error(`IMEI update failed: ${res.error.message}`);
        }
      }

      // 2. Fallback to the old IMEI number when no ID was supplied.
      if (!updatedImeiResult && oldImei) {
        const res = await runUpdate('imei', oldImei);
        if (!res.error) {
          updatedImeiResult = { imei: imeiNumber, ...fullPayload };
        } else if (this.isColumnMissingError(res.error)) {
          const basicRes = await this.client
            .from('imeis')
            .update({ imei: imeiNumber })
            .eq('imei', oldImei);
          if (basicRes.error) throw new Error(`IMEI update failed: ${basicRes.error.message}`);
          updatedImeiResult = { imei: imeiNumber };
        } else {
          throw new Error(`IMEI update failed: ${res.error.message}`);
        }
      }

      if (!updatedImeiResult) {
        throw new Error('IMEI update was not saved. Check the IMEI ID and Supabase RLS policies.');
      }
    }

    // Always sync to local storage cache
    const imeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    const idx = imeis.findIndex(i => (imeiId && String(i.id) === String(imeiId)) || (oldImei && String(i.imei) === String(oldImei)));
    const existingLocal = idx !== -1 ? imeis[idx] : {};

    const finalRecord = {
      ...existingLocal,
      ...(updatedImeiResult || {}),
      id: imeiId || existingLocal.id || updatedImeiResult?.id || ('imei-' + Math.random().toString(36).substr(2, 9)),
      imei: imeiNumber,
      dp: dpVal,
      mop: mopVal,
      mrp: mrpVal,
      notes: notesVal,
      updated_at: new Date().toISOString()
    };

    if (idx !== -1) {
      imeis[idx] = finalRecord;
    } else {
      imeis.unshift(finalRecord);
    }
    localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(imeis));
    return finalRecord;
  }

  async deleteImei(imeiId, imeiNumber = null) {
    if (!imeiId && !imeiNumber) return false;

    if (this.isLive && this.client) {
      if (imeiId) {
        const { error } = await this.client
          .from('imeis')
          .delete()
          .eq('id', imeiId);
        if (error) throw new Error(`IMEI delete failed: ${error.message}`);
      }

      // If an ID was not supplied, delete by IMEI number.
      if (!imeiId && imeiNumber) {
        const { error } = await this.client
          .from('imeis')
          .delete()
          .eq('imei', imeiNumber);
        if (error) throw new Error(`IMEI delete failed: ${error.message}`);
      }
    }

    let imeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    imeis = imeis.filter(i => {
      if (imeiId && String(i.id) === String(imeiId)) return false;
      if (imeiNumber && String(i.imei) === String(imeiNumber)) return false;
      return true;
    });
    localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(imeis));
    return true;
  }
}

// Complete Supabase SQL Schema for one-click setup in Supabase SQL Editor
const SUPABASE_SQL_SCHEMA = `-- =========================================================
-- MOBILE PRICE TRACKER - SUPABASE DATABASE SCHEMA (With Full IMEI Support)
-- Run this SQL in your Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- =========================================================

-- 1. Create BRANDS table
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create PRODUCTS table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    color TEXT,
    current_dp NUMERIC NOT NULL,
    current_mop NUMERIC NOT NULL,
    current_mrp NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create PRICE_HISTORY table
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    old_dp NUMERIC,
    new_dp NUMERIC,
    old_mop NUMERIC,
    new_mop NUMERIC,
    old_mrp NUMERIC,
    new_mrp NUMERIC,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create IMEIS table (Unique per unit with individual DP/MOP/MRP and remarks)
CREATE TABLE IF NOT EXISTS public.imeis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    imei TEXT NOT NULL UNIQUE,
    dp NUMERIC,      -- Individual purchase / DP price for this specific IMEI
    mop NUMERIC,     -- Individual MOP for this specific IMEI
    mrp NUMERIC,     -- Individual MRP for this specific IMEI
    notes TEXT,      -- Optional unit note (e.g. "Batch A", "Demo unit", "Grade A")
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Migration query to add columns if table was created previously:
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS dp NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS mop NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS mrp NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 5. Create Indexes for High Performance Search & Filters
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON public.products (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history (product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON public.price_history (changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_imeis_product_id ON public.imeis (product_id);
CREATE INDEX IF NOT EXISTS idx_imeis_number ON public.imeis (imei);

-- 6. Row Level Security (RLS) Policies
-- Enables public read/write access using the anonymous key
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imeis ENABLE ROW LEVEL SECURITY;

-- Brands RLS
CREATE POLICY "Allow all access on brands" ON public.brands
    FOR ALL USING (true) WITH CHECK (true);

-- Products RLS
CREATE POLICY "Allow all access on products" ON public.products
    FOR ALL USING (true) WITH CHECK (true);

-- Price History RLS
CREATE POLICY "Allow all access on price_history" ON public.price_history
    FOR ALL USING (true) WITH CHECK (true);

-- IMEIs RLS
CREATE POLICY "Allow all access on imeis" ON public.imeis
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Seed Initial Popular Smartphone Brands
INSERT INTO public.brands (name) VALUES
    ('Apple'),
    ('Samsung'),
    ('vivo'),
    ('OPPO'),
    ('OnePlus'),
    ('realme'),
    ('Xiaomi'),
    ('iQOO'),
    ('Motorola'),
    ('Nothing'),
    ('Google Pixel')
ON CONFLICT (name) DO NOTHING;
`;

// Migration SQL for updating existing database with unit-level price columns
const SUPABASE_MIGRATION_SQL = `-- Migration: Add unit-specific price columns & remarks to existing IMEIs table
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS dp NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS mop NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS mrp NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
`;

const SUPABASE_SALES_MIGRATION_SQL = `-- Run once in Supabase SQL Editor for the Sold IMEI page
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID, imei TEXT NOT NULL,
  brand TEXT, model TEXT, variant TEXT, color TEXT,
  entry_dp NUMERIC NOT NULL DEFAULT 0, mop NUMERIC NOT NULL DEFAULT 0, mrp NUMERIC NOT NULL DEFAULT 0,
  remarks TEXT, price_history JSONB DEFAULT '[]'::jsonb,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access on sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
`;

// Global instance
window.dbService = new SupabaseService();
window.SUPABASE_SQL_SCHEMA = SUPABASE_SQL_SCHEMA;
window.SUPABASE_MIGRATION_SQL = SUPABASE_MIGRATION_SQL;
window.SUPABASE_SALES_MIGRATION_SQL = SUPABASE_SALES_MIGRATION_SQL;

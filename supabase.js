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
  SOLD_IMEIS: 'mpt_local_sold_imeis',
  SALES: 'mpt_local_sales',
  BRANDS: 'mpt_local_brands',
  BRAND_ORDER: 'mpt_brand_order',
  ACCESSORY_BRANDS: 'mpt_local_accessory_brands',
  ACCESSORY_TYPES: 'mpt_local_accessory_types',
  ACCESSORY_STOCK: 'mpt_local_accessory_stock'
};

// Initial default brands for quick start
const BRAND_COLOR_MAP = {
  apple: '#8b5cf6',
  samsung: '#1d4ed8',
  vivo: '#2563eb',
  oppo: '#f97316',
  oneplus: '#0f766e',
  realme: '#ec4899',
  xiaomi: '#ef4444',
  iqoo: '#14b8a6',
  motorola: '#f59e0b',
  nothing: '#111827',
  'google pixel': '#10b981'
};

const INITIAL_BRANDS = [
  'Apple',
  'Samsung',
  'vivo',
  'OPPO',
  'OnePlus',
  'realme',
  'Xiaomi',
  'iQOO'
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

  async withNetworkRetry(operation, label) {
    let lastNetworkError = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const result = await operation();
        // supabase-js can resolve with { error: TypeError('Failed to fetch') }
        // instead of rejecting the promise. Treat both forms as retryable.
        if (result?.error && this.isNetworkError(result.error)) {
          lastNetworkError = result.error;
        } else {
          return result;
        }
      } catch (error) {
        if (!this.isNetworkError(error)) throw error;
        lastNetworkError = error;
      }

      if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 500));
    }

    const reason = lastNetworkError?.message || 'Fetch failed';
    throw new Error(`${label} request failed after retry (${reason}). Your internet may be working; check browser request blocking and Supabase settings.`);
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
    if (!localStorage.getItem(STORAGE_KEYS.SOLD_IMEIS)) {
      localStorage.setItem(STORAGE_KEYS.SOLD_IMEIS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
      localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(INITIAL_BRANDS.map(name => ({
        id: 'brand-' + Math.random().toString(36).substr(2, 9),
        name,
        color: BRAND_COLOR_MAP[String(name).trim().toLowerCase()] || '#2563eb',
        created_at: new Date().toISOString()
      }))));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCESSORY_BRANDS)) {
      localStorage.setItem(STORAGE_KEYS.ACCESSORY_BRANDS, JSON.stringify([
        { id: 'acc-brand-1', name: 'vivo', created_at: new Date().toISOString() },
        { id: 'acc-brand-2', name: 'Samsung', created_at: new Date().toISOString() },
        { id: 'acc-brand-3', name: 'Anker', created_at: new Date().toISOString() },
        { id: 'acc-brand-4', name: 'Realme', created_at: new Date().toISOString() }
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCESSORY_TYPES)) {
      localStorage.setItem(STORAGE_KEYS.ACCESSORY_TYPES, JSON.stringify([
        { id: 'acc-type-1', name: 'Headphone', created_at: new Date().toISOString() },
        { id: 'acc-type-2', name: 'USB-C Cable', created_at: new Date().toISOString() },
        { id: 'acc-type-3', name: 'Power Bank', created_at: new Date().toISOString() },
        { id: 'acc-type-4', name: 'Charger', created_at: new Date().toISOString() }
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK)) {
      localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify([]));
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

  async addBrand(name, color = '') {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('Brand name cannot be empty');

    const resolvedColor = (color || '').trim() || BRAND_COLOR_MAP[trimmed.toLowerCase()] || '#2563eb';

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('brands')
          .insert([{ name: trimmed, color: resolvedColor }])
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
    if (brands.some(b => String(b.name || '').toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Brand "${trimmed}" already exists`);
    }
    const newBrand = {
      id: 'brand-' + Math.random().toString(36).substr(2, 9),
      name: trimmed,
      color: resolvedColor,
      created_at: new Date().toISOString()
    };
    brands.push(newBrand);
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
    this.saveBrandOrder(brands);
    return newBrand;
  }

  async updateBrandColor(name, color) {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('Brand name is required');

    const resolvedColor = (color || '').trim() || '#2563eb';

    if (this.isLive && this.client) {
      const { error } = await this.client
        .from('brands')
        .update({ color: resolvedColor })
        .eq('name', trimmed);
      if (error) throw new Error(`Could not update brand color: ${error.message}`);
    }

    const brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]');
    const updated = brands.map(brand => {
      if (String(brand.name || '').toLowerCase() === trimmed.toLowerCase()) {
        return { ...brand, color: resolvedColor };
      }
      return brand;
    });
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(updated));
    return true;
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

  // ================= BACKUP & RESTORE API ================= //

  createBackup() {
    const backup = {
      exported_at: new Date().toISOString(),
      app: 'Mobile Price Tracker',
      version: 1,
      products: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]'),
      brands: JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANDS) || '[]'),
      imeis: JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]'),
      price_history: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRICE_HISTORY) || '[]'),
      sold_imeis: JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLD_IMEIS) || '[]'),
      sales: JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]'),
      accessory_brands: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_BRANDS) || '[]'),
      accessory_types: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_TYPES) || '[]'),
      accessory_stock: JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]')
    };

    return backup;
  }

  async restoreBackup(backupData) {
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Invalid backup file');
    }

    const snapshot = backupData.data && typeof backupData.data === 'object' ? backupData.data : backupData;
    const safeArray = (value) => Array.isArray(value) ? value : [];

    const products = safeArray(snapshot.products);
    const brands = safeArray(snapshot.brands);
    const imeis = safeArray(snapshot.imeis);
    const history = safeArray(snapshot.price_history || snapshot.priceHistory);
    const soldImeis = safeArray(snapshot.sold_imeis || snapshot.soldImeis);
    const sales = safeArray(snapshot.sales);
    const accessoryBrands = safeArray(snapshot.accessory_brands || snapshot.accessoryBrands);
    const accessoryTypes = safeArray(snapshot.accessory_types || snapshot.accessoryTypes);
    const accessoryStock = safeArray(snapshot.accessory_stock || snapshot.accessoryStock);

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(brands));
    localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(imeis));
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(history));
    localStorage.setItem(STORAGE_KEYS.SOLD_IMEIS, JSON.stringify(soldImeis));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_BRANDS, JSON.stringify(accessoryBrands));
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_TYPES, JSON.stringify(accessoryTypes));
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(accessoryStock));

    if (brands.length) {
      this.saveBrandOrder(brands);
    }

    if (this.isLive && this.client) {
      try {
        await this.client.from('brands').upsert(brands.length ? brands.map(brand => ({
          id: brand.id,
          name: brand.name,
          color: brand.color || '#2563eb',
          created_at: brand.created_at || new Date().toISOString()
        })) : [], { onConflict: 'id' });

        await this.client.from('products').upsert(products.length ? products.map(product => ({
          id: product.id,
          brand: product.brand,
          model: product.model,
          variant: product.variant,
          color: product.color,
          current_dp: Number(product.current_dp ?? product.dp ?? 0),
          current_mop: Number(product.current_mop ?? product.mop ?? 0),
          current_mrp: Number(product.current_mrp ?? product.mrp ?? 0),
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString()
        })) : [], { onConflict: 'id' });

        await this.client.from('imeis').upsert(imeis.length ? imeis.map(item => ({
          id: item.id,
          product_id: item.product_id,
          imei: item.imei,
          dp: item.dp,
          mop: item.mop,
          mrp: item.mrp,
          notes: item.notes,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        })) : [], { onConflict: 'id' });

        await this.client.from('price_history').upsert(history.length ? history.map(item => ({
          id: item.id,
          product_id: item.product_id,
          old_dp: item.old_dp,
          new_dp: item.new_dp,
          old_mop: item.old_mop,
          new_mop: item.new_mop,
          old_mrp: item.old_mrp,
          new_mrp: item.new_mrp,
          changed_at: item.changed_at || new Date().toISOString()
        })) : [], { onConflict: 'id' });

        await this.client.from('sold_imeis').upsert(soldImeis.length ? soldImeis.map(item => ({
          id: item.id,
          product_id: item.product_id,
          brand: item.brand,
          model: item.model,
          variant: item.variant,
          imei: item.imei,
          entry_dp: item.entry_dp,
          mop: item.mop,
          mrp: item.mrp,
          remarks: item.remarks,
          sold_at: item.sold_at || new Date().toISOString(),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        })) : [], { onConflict: 'id' });

        await this.client.from('accessory_brands').upsert(accessoryBrands.length ? accessoryBrands.map(item => ({
          id: item.id,
          name: item.name,
          created_at: item.created_at || new Date().toISOString()
        })) : [], { onConflict: 'id' });

        await this.client.from('accessory_types').upsert(accessoryTypes.length ? accessoryTypes.map(item => ({
          id: item.id,
          name: item.name,
          created_at: item.created_at || new Date().toISOString()
        })) : [], { onConflict: 'id' });

        await this.client.from('accessory_stock').upsert(accessoryStock.length ? accessoryStock.map(item => ({
          id: item.id,
          brand: item.brand,
          item_type: item.item_type,
          serial_no: item.serial_no,
          landing_price: Number(item.landing_price ?? 0),
          qty: Number(item.qty ?? 1),
          landing_price_per_pc: Number(item.landing_price_per_pc ?? (Number(item.landing_price ?? 0) / Math.max(Number(item.qty) || 1, 1))),
          selling_price: Number(item.selling_price ?? 0),
          mrp: Number(item.mrp ?? 0),
          notes: item.notes,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        })) : [], { onConflict: 'id' });
      } catch (err) {
        console.warn('restoreBackup live sync warning:', err);
      }
    }

    return true;
  }

  async syncOnlineDataToLocal() {
    if (!this.isLive || !this.client) {
      throw new Error('No live Supabase connection available');
    }

    const results = await Promise.all([
      this.client.from('products').select('*'),
      this.client.from('brands').select('*').order('name', { ascending: true }),
      this.client.from('imeis').select('*'),
      this.client.from('price_history').select('*'),
      this.client.from('sold_imeis').select('*').order('sold_at', { ascending: false }),
      this.client.from('accessory_brands').select('*').order('name', { ascending: true }),
      this.client.from('accessory_types').select('*').order('name', { ascending: true }),
      this.client.from('accessory_stock').select('*').order('created_at', { ascending: false })
    ]);

    const safeData = (res) => (res && !res.error && Array.isArray(res.data) ? res.data : []);

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(safeData(results[0])));
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(safeData(results[1])));
    localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(safeData(results[2])));
    localStorage.setItem(STORAGE_KEYS.PRICE_HISTORY, JSON.stringify(safeData(results[3])));
    localStorage.setItem(STORAGE_KEYS.SOLD_IMEIS, JSON.stringify(safeData(results[4])));
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_BRANDS, JSON.stringify(safeData(results[5])));
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_TYPES, JSON.stringify(safeData(results[6])));
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(safeData(results[7])));

    const brands = safeData(results[1]);
    if (brands.length) {
      this.saveBrandOrder(brands);
    }

    return true;
  }

  // ================= ACCESSORY STOCK API ================= //

  async fetchAccessoryBrands() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('accessory_brands')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.ACCESSORY_BRANDS, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('fetchAccessoryBrands live fallback:', err);
      }
    }

    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_BRANDS) || '[]');
  }

  async addAccessoryBrand(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('Accessory brand name is required');

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('accessory_brands')
          .insert([{ name: trimmed }])
          .select()
          .single();
        if (!error && data) return data;
        if (error && error.code === '23505') throw new Error(`Accessory brand "${trimmed}" already exists`);
        if (error) throw error;
      } catch (err) {
        console.warn('addAccessoryBrand live fallback:', err);
      }
    }

    const brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_BRANDS) || '[]');
    if (brands.some(item => String(item.name || '').toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Accessory brand "${trimmed}" already exists`);
    }

    const newBrand = {
      id: 'acc-brand-' + Math.random().toString(36).slice(2, 10),
      name: trimmed,
      created_at: new Date().toISOString()
    };
    brands.push(newBrand);
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_BRANDS, JSON.stringify(brands));
    return newBrand;
  }

  async fetchAccessoryTypes() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('accessory_types')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.ACCESSORY_TYPES, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('fetchAccessoryTypes live fallback:', err);
      }
    }

    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_TYPES) || '[]');
  }

  async addAccessoryType(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('Accessory type is required');

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('accessory_types')
          .insert([{ name: trimmed }])
          .select()
          .single();
        if (!error && data) return data;
        if (error && error.code === '23505') throw new Error(`Accessory type "${trimmed}" already exists`);
        if (error) throw error;
      } catch (err) {
        console.warn('addAccessoryType live fallback:', err);
      }
    }

    const types = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_TYPES) || '[]');
    if (types.some(item => String(item.name || '').toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Accessory type "${trimmed}" already exists`);
    }

    const newType = {
      id: 'acc-type-' + Math.random().toString(36).slice(2, 10),
      name: trimmed,
      created_at: new Date().toISOString()
    };
    types.push(newType);
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_TYPES, JSON.stringify(types));
    return newType;
  }

  async updateAccessoryBrand(oldName, newName) {
    const previous = String(oldName || '').trim();
    const next = String(newName || '').trim();
    if (!previous) throw new Error('Current accessory brand is required');
    if (!next) throw new Error('New accessory brand name is required');

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('accessory_brands')
          .update({ name: next, updated_at: new Date().toISOString() })
          .eq('name', previous)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') throw new Error(`Accessory brand "${next}" already exists`);
          throw error;
        }

        if (this.client && this.client.from) {
          await this.client
            .from('accessory_stock')
            .update({ brand: next })
            .eq('brand', previous);
        }

        const storedBrands = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_BRANDS) || '[]');
        const updatedBrands = storedBrands.map(item =>
          String(item.name || '').toLowerCase() === previous.toLowerCase() ? { ...item, name: next } : item
        );
        localStorage.setItem(STORAGE_KEYS.ACCESSORY_BRANDS, JSON.stringify(updatedBrands));

        const stock = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
        const updatedStock = stock.map(item =>
          String(item.brand || '').toLowerCase() === previous.toLowerCase() ? { ...item, brand: next } : item
        );
        localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(updatedStock));

        return data || { name: next };
      } catch (err) {
        console.warn('updateAccessoryBrand live fallback:', err);
        throw err;
      }
    }

    const brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_BRANDS) || '[]');
    const exists = brands.some(item => String(item.name || '').toLowerCase() === next.toLowerCase() && String(item.name || '').toLowerCase() !== previous.toLowerCase());
    if (exists) throw new Error(`Accessory brand "${next}" already exists`);

    const updatedBrands = brands.map(item =>
      String(item.name || '').toLowerCase() === previous.toLowerCase() ? { ...item, name: next } : item
    );
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_BRANDS, JSON.stringify(updatedBrands));

    const stock = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
    const updatedStock = stock.map(item =>
      String(item.brand || '').toLowerCase() === previous.toLowerCase() ? { ...item, brand: next } : item
    );
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(updatedStock));
    return { name: next };
  }

  async deleteAccessoryBrand(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) throw new Error('Accessory brand is required');

    if (this.isLive && this.client) {
      try {
        const { error } = await this.client
          .from('accessory_brands')
          .delete()
          .eq('name', trimmed);
        if (error) throw error;

        await this.client
          .from('accessory_stock')
          .update({ brand: 'Unknown' })
          .eq('brand', trimmed);
      } catch (err) {
        console.warn('deleteAccessoryBrand live fallback:', err);
        throw err;
      }
    }

    const brands = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_BRANDS) || '[]');
    const filteredBrands = brands.filter(item => String(item.name || '').toLowerCase() !== trimmed.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_BRANDS, JSON.stringify(filteredBrands));

    const stock = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
    const filteredStock = stock.map(item =>
      String(item.brand || '').toLowerCase() === trimmed.toLowerCase() ? { ...item, brand: 'Unknown' } : item
    );
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(filteredStock));
    return true;
  }

  async updateAccessoryType(oldName, newName) {
    const previous = String(oldName || '').trim();
    const next = String(newName || '').trim();
    if (!previous) throw new Error('Current accessory type is required');
    if (!next) throw new Error('New accessory type is required');

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('accessory_types')
          .update({ name: next })
          .eq('name', previous)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') throw new Error(`Accessory type "${next}" already exists`);
          throw error;
        }

        await this.client
          .from('accessory_stock')
          .update({ item_type: next })
          .eq('item_type', previous);

        const storedTypes = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_TYPES) || '[]');
        const updatedTypes = storedTypes.map(item =>
          String(item.name || '').toLowerCase() === previous.toLowerCase() ? { ...item, name: next } : item
        );
        localStorage.setItem(STORAGE_KEYS.ACCESSORY_TYPES, JSON.stringify(updatedTypes));

        const stock = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
        const updatedStock = stock.map(item =>
          String(item.item_type || '').toLowerCase() === previous.toLowerCase() ? { ...item, item_type: next } : item
        );
        localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(updatedStock));

        return data || { name: next };
      } catch (err) {
        console.warn('updateAccessoryType live fallback:', err);
        throw err;
      }
    }

    const types = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_TYPES) || '[]');
    const exists = types.some(item => String(item.name || '').toLowerCase() === next.toLowerCase() && String(item.name || '').toLowerCase() !== previous.toLowerCase());
    if (exists) throw new Error(`Accessory type "${next}" already exists`);

    const updatedTypes = types.map(item =>
      String(item.name || '').toLowerCase() === previous.toLowerCase() ? { ...item, name: next } : item
    );
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_TYPES, JSON.stringify(updatedTypes));

    const stock = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
    const updatedStock = stock.map(item =>
      String(item.item_type || '').toLowerCase() === previous.toLowerCase() ? { ...item, item_type: next } : item
    );
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(updatedStock));
    return { name: next };
  }

  async deleteAccessoryType(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) throw new Error('Accessory type is required');

    if (this.isLive && this.client) {
      try {
        const { error } = await this.client
          .from('accessory_types')
          .delete()
          .eq('name', trimmed);
        if (error) throw error;

        await this.client
          .from('accessory_stock')
          .update({ item_type: 'General' })
          .eq('item_type', trimmed);
      } catch (err) {
        console.warn('deleteAccessoryType live fallback:', err);
        throw err;
      }
    }

    const types = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_TYPES) || '[]');
    const filteredTypes = types.filter(item => String(item.name || '').toLowerCase() !== trimmed.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_TYPES, JSON.stringify(filteredTypes));

    const stock = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
    const filteredStock = stock.map(item =>
      String(item.item_type || '').toLowerCase() === trimmed.toLowerCase() ? { ...item, item_type: 'General' } : item
    );
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(filteredStock));
    return true;
  }

  async fetchAccessoryStock() {
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('accessory_stock')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn('fetchAccessoryStock live fallback:', err);
      }
    }

    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
  }

  async saveAccessoryItem(item) {
    const localId = item && item.id ? item.id : 'acc-item-' + Math.random().toString(36).slice(2, 10);
    const payload = {
      brand: String(item && item.brand ? item.brand : '').trim(),
      item_type: String(item && item.item_type ? item.item_type : '').trim(),
      serial_no: String(item && item.serial_no ? item.serial_no : '').trim(),
      landing_price: Number(item && item.landing_price !== undefined && item.landing_price !== null ? item.landing_price : 0),
      qty: Number(item && item.qty !== undefined && item.qty !== null ? item.qty : 1),
      landing_price_per_pc: Number(item && item.landing_price_per_pc !== undefined && item.landing_price_per_pc !== null ? item.landing_price_per_pc : 0),
      selling_price: Number(item && item.selling_price !== undefined && item.selling_price !== null ? item.selling_price : 0),
      mrp: Number(item && item.mrp !== undefined && item.mrp !== null ? item.mrp : 0),
      notes: String(item && item.notes ? item.notes : '').trim(),
      updated_at: new Date().toISOString()
    };

    if (!payload.brand) throw new Error('Accessory brand is required');
    if (!payload.item_type) throw new Error('Accessory type is required');
    if (!Number.isFinite(payload.qty) || payload.qty < 1) throw new Error('Quantity must be at least 1');
    if (!Number.isFinite(payload.landing_price) || payload.landing_price < 0) throw new Error('Landing price is invalid');
    if (payload.qty > 0 && payload.landing_price_per_pc <= 0) {
      payload.landing_price_per_pc = payload.landing_price / payload.qty;
    }

    let liveSavedData = null;
    let liveSaveSucceeded = false;

    if (this.isLive && this.client) {
      try {
        const hasValidUuid = Boolean(item && item.id && this.isValidUuid(String(item.id)));
        const livePayload = { ...payload };

        if (hasValidUuid) {
          liveSavedData = await this.client
            .from('accessory_stock')
            .update(livePayload)
            .eq('id', item.id)
            .select()
            .single();
        } else {
          liveSavedData = await this.client
            .from('accessory_stock')
            .insert([livePayload])
            .select()
            .single();
        }

        if (liveSavedData && liveSavedData.error) {
          throw liveSavedData.error;
        }

        if (liveSavedData && liveSavedData.data) {
          liveSaveSucceeded = true;
          const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
          const existingIndex = list.findIndex(row => String(row.id) === String(liveSavedData.data.id));
          if (existingIndex >= 0) list[existingIndex] = liveSavedData.data;
          else list.unshift(liveSavedData.data);
          localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(list));
          return { ...liveSavedData.data, savedLive: true, savedLocally: false };
        }
      } catch (err) {
        console.warn('saveAccessoryItem live fallback:', err);
      }
    }

    const localPayload = {
      ...payload,
      id: localId,
      created_at: new Date().toISOString()
    };

    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
    const matchIndex = list.findIndex(row => String(row.id) === String(localId));
    if (matchIndex >= 0) {
      list[matchIndex] = { ...list[matchIndex], ...localPayload };
    } else {
      list.unshift(localPayload);
    }
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(list));
    return { ...localPayload, savedLive: false, savedLocally: true };
  }

  async deleteAccessoryItem(id) {
    if (!id) throw new Error('Accessory item id is required');

    if (this.isLive && this.client) {
      try {
        const { error } = await this.client
          .from('accessory_stock')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn('deleteAccessoryItem live fallback:', err);
      }
    }

    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCESSORY_STOCK) || '[]');
    const filtered = list.filter(row => String(row.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.ACCESSORY_STOCK, JSON.stringify(filtered));
    return true;
  }

  // ================= PRODUCTS API ================= //

  async fetchProducts(searchQuery = '', brandFilter = '', localOnly = false) {
    if (!localOnly && this.isLive && this.client) {
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
            imei_count: Number(p.imei_count || 0)
          }));

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

          // Keep the complete unfiltered list as the offline/instant-filter
          // cache. A brand or search result must never replace that cache.
          if (products.length > 0 && (!brandFilter || brandFilter === 'ALL') && !searchQuery.trim()) {
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

    const imeiCounts = new Map();
    allImeis.forEach(imei => {
      const productId = String(imei.product_id);
      imeiCounts.set(productId, (imeiCounts.get(productId) || 0) + 1);
    });

    products = products.map(p => {
      const count = imeiCounts.get(String(p.id)) || 0;
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

  async fetchImeiCounts(productIds = [], localOnly = false) {
    const ids = [...new Set(productIds.filter(Boolean))];
    const counts = {};
    if (!localOnly && this.isLive && this.client && ids.length) {
      try {
        const { data, error } = await this.client
          .from('imeis')
          .select('product_id')
          .in('product_id', ids);
        if (!error && Array.isArray(data)) {
          data.forEach(row => {
            counts[row.product_id] = (counts[row.product_id] || 0) + 1;
          });
          return counts;
        }
      } catch (err) {
        console.warn('Could not fetch IMEI counts:', err);
      }
    }

    const localImeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    localImeis.forEach(row => {
      if (ids.includes(row.product_id)) counts[row.product_id] = (counts[row.product_id] || 0) + 1;
    });
    return counts;
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
      const { data, error } = await this.withNetworkRetry(
        () => this.client.from('products').select('*').eq('id', id).maybeSingle(),
        'Reading the product'
      );
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
      // Use a POST upsert for edits. This has the same conflict-safe update
      // semantics as PATCH, while following the POST path used by product
      // creation (some local browser/network setups block PATCH requests).
      const { data, error } = await this.withNetworkRetry(
        () => this.client
          .from('products')
          .upsert({ id, ...fullPayload }, { onConflict: 'id' })
          .select('*')
          .maybeSingle(),
        'Price update'
      );

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
  async fetchInitialPrices(productIds = [], localOnly = false) {
    const ids = productIds.filter(Boolean);
    if (!ids.length) return {};

    let records = [];
    if (!localOnly && this.isLive && this.client) {
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

  async findImeiForSale(imeiNumber) {
    const trimmed = (imeiNumber || '').trim();
    if (!trimmed) return null;

    const normalized = trimmed.toLowerCase();

    const soldImeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLD_IMEIS) || '[]');
    const soldAlready = soldImeis.some(item => String(item.imei || '').toLowerCase() === normalized);
    if (soldAlready) {
      return null;
    }

    if (this.isLive && this.client) {
      try {
        const soldQuery = await this.client
          .from('sold_imeis')
          .select('id, imei')
          .eq('imei', trimmed)
          .limit(1);

        if (!soldQuery.error && soldQuery.data && soldQuery.data.length > 0) {
          return null;
        }
      } catch (_) {
        // Ignore sold table check errors and continue stock lookup.
      }

      try {
        const { data, error } = await this.client
          .from('imeis')
          .select('id, imei, product_id, dp, mop, mrp, notes')
          .eq('imei', trimmed)
          .limit(1);

        if (!error && data && data.length > 0) {
          const unit = data[0];
          const { data: productRows, error: productError } = await this.client
            .from('products')
            .select('id, brand, model, variant, current_dp, current_mop, current_mrp')
            .eq('id', unit.product_id)
            .limit(1);

          if (!productError && productRows && productRows.length > 0) {
            const product = productRows[0];
            return {
              unit,
              product,
              entry_dp: unit.dp ?? product.current_dp ?? 0
            };
          }

          return {
            unit,
            product: null,
            entry_dp: unit.dp ?? 0
          };
        }
      } catch (err) {
        console.warn('findImeiForSale live lookup failed:', err);
      }
    }

    const localImeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    const match = localImeis.find(item => String(item.imei || '').toLowerCase() === normalized);
    if (!match) return null;

    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const product = products.find(entry => String(entry.id) === String(match.product_id)) || null;

    return {
      unit: match,
      product,
      entry_dp: match.dp ?? product?.current_dp ?? 0
    };
  }

  async fetchSales() {
    let liveSales = [];
    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('sold_imeis')
          .select('*')
          .order('sold_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          liveSales = data;
        }
      } catch (err) {
        console.warn('fetchSales live query failed:', err);
      }
    }

    const localSales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLD_IMEIS) || '[]');
    const merged = new Map();

    [...liveSales, ...localSales].forEach(item => {
      const key = String(item.id || item.imei || `${item.product_id}-${item.sold_at}`);
      if (!merged.has(key)) {
        merged.set(key, item);
      }
    });

    const sales = Array.from(merged.values()).sort((a, b) => {
      const tA = new Date(a.sold_at || a.created_at || 0).getTime();
      const tB = new Date(b.sold_at || b.created_at || 0).getTime();
      return tB - tA;
    });

    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    return sales;
  }

  async saveSaleAndRemoveImei({ unit, product, entry_dp, mop, mrp, remarks }) {
    if (!unit || !unit.imei) {
      throw new Error('IMEI record is required to save a sale.');
    }

    const imei = String(unit.imei).trim();
    const saleRecord = {
      id: unit.id || ('sold-' + Math.random().toString(36).substr(2, 9)),
      product_id: product?.id || unit.product_id || null,
      brand: product?.brand || unit.brand || '',
      model: product?.model || unit.model || '',
      variant: product?.variant || unit.variant || '',
      imei,
      entry_dp: Number(entry_dp ?? unit.dp ?? product?.current_dp ?? 0),
      mop: Number(mop ?? unit.mop ?? product?.current_mop ?? 0),
      mrp: Number(mrp ?? unit.mrp ?? product?.current_mrp ?? 0),
      remarks: remarks || unit.notes || '',
      sold_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('sold_imeis')
          .insert([saleRecord])
          .select();

        if (error) {
          if (error.code === '23505') {
            throw new Error(`IMEI ${imei} is already recorded as sold.`);
          }
          throw new Error(`Could not save sold IMEI: ${error.message}`);
        }

        if (data && data[0]) {
          Object.assign(saleRecord, data[0]);
        }
      } catch (err) {
        console.warn('saveSaleAndRemoveImei live insert failed:', err);
        if (String(err.message || '').includes('already recorded as sold')) {
          throw err;
        }
      }

      try {
        const deleteResult = await this.client
          .from('imeis')
          .delete()
          .eq('imei', imei);

        if (deleteResult.error) {
          console.warn('Could not remove sold IMEI from stock table:', deleteResult.error);
        }
      } catch (err) {
        console.warn('delete sold IMEI from stock failed:', err);
      }
    }

    const soldImeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLD_IMEIS) || '[]');
    const exists = soldImeis.some(item => String(item.imei || '').toLowerCase() === imei.toLowerCase());
    if (!exists) {
      soldImeis.unshift(saleRecord);
      localStorage.setItem(STORAGE_KEYS.SOLD_IMEIS, JSON.stringify(soldImeis));
    }

    const imeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    const remaining = imeis.filter(item => String(item.imei || '').toLowerCase() !== imei.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(remaining));

    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');
    const salesExists = sales.some(item => String(item.imei || '').toLowerCase() === imei.toLowerCase());
    if (!salesExists) {
      sales.unshift(saleRecord);
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    }

    return saleRecord;
  }

  async restoreSoldImeiToStock(soldRecord) {
    if (!soldRecord || !soldRecord.imei) {
      throw new Error('Sold IMEI is required to restore into stock.');
    }

    const imei = String(soldRecord.imei).trim();
    const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    let productId = soldRecord.product_id || null;

    if (!productId && (soldRecord.brand || soldRecord.model || soldRecord.variant)) {
      const match = products.find(product => {
        return String(product.brand || '').toLowerCase() === String(soldRecord.brand || '').toLowerCase() &&
               String(product.model || '').toLowerCase() === String(soldRecord.model || '').toLowerCase() &&
               String(product.variant || '').toLowerCase() === String(soldRecord.variant || '').toLowerCase();
      });
      if (match) productId = match.id;
    }

    if (!productId) {
      throw new Error('Cannot restore IMEI because the original product was not found.');
    }

    const stockEntry = {
      id: soldRecord.id || ('imei-' + Math.random().toString(36).substr(2, 9)),
      product_id: productId,
      imei,
      dp: Number(soldRecord.entry_dp ?? 0),
      mop: Number(soldRecord.mop ?? 0),
      mrp: Number(soldRecord.mrp ?? 0),
      notes: soldRecord.remarks || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.isLive && this.client) {
      try {
        const { data, error } = await this.client
          .from('imeis')
          .insert([{
            product_id: productId,
            imei,
            dp: stockEntry.dp,
            mop: stockEntry.mop,
            mrp: stockEntry.mrp,
            notes: stockEntry.notes
          }])
          .select();

        if (error) {
          if (error.code === '23505') {
            throw new Error(`IMEI ${imei} already exists in active stock.`);
          }
          throw new Error(`Could not restore IMEI to stock: ${error.message}`);
        }

        if (data && data[0]) {
          Object.assign(stockEntry, data[0]);
        }
      } catch (err) {
        console.warn('restoreSoldImeiToStock live insert failed:', err);
        if (String(err.message || '').includes('already exists in active stock')) {
          throw err;
        }
      }
    }

    const imeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.IMEIS) || '[]');
    const exists = imeis.some(item => String(item.imei || '').toLowerCase() === imei.toLowerCase());
    if (!exists) {
      imeis.unshift(stockEntry);
      localStorage.setItem(STORAGE_KEYS.IMEIS, JSON.stringify(imeis));
    }

    const soldImeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLD_IMEIS) || '[]');
    const keptSold = soldImeis.filter(item => String(item.imei || '').toLowerCase() !== imei.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.SOLD_IMEIS, JSON.stringify(keptSold));

    const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');
    const filteredSales = sales.filter(item => String(item.imei || '').toLowerCase() !== imei.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(filteredSales));

    if (this.isLive && this.client) {
      try {
        const { error } = await this.client
          .from('sold_imeis')
          .delete()
          .eq('imei', imei);
        if (error) {
          console.warn('Could not remove restored IMEI from sold_imeis:', error);
        }
      } catch (err) {
        console.warn('delete restored sold IMEI failed:', err);
      }
    }

    return stockEntry;
  }

  async deleteSoldImeiRecord(soldRecord) {
    if (!soldRecord || !soldRecord.imei) {
      throw new Error('Sold IMEI record is required for deletion.');
    }

    const imei = String(soldRecord.imei).trim();

    if (this.isLive && this.client) {
      try {
        const id = soldRecord.id;
        let res;
        if (id) {
          res = await this.client.from('sold_imeis').delete().eq('id', id);
        }
        if ((!id || res?.error) && imei) {
          res = await this.client.from('sold_imeis').delete().eq('imei', imei);
        }
        if (res && res.error) {
          throw new Error(res.error.message);
        }
      } catch (err) {
        console.warn('deleteSoldImeiRecord live delete failed:', err);
        throw new Error(`Could not delete sold record: ${err.message || 'Unknown error'}`);
      }
    }

    let soldImeis = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLD_IMEIS) || '[]');
    soldImeis = soldImeis.filter(item => String(item.imei || '').toLowerCase() !== imei.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.SOLD_IMEIS, JSON.stringify(soldImeis));

    let sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');
    sales = sales.filter(item => String(item.imei || '').toLowerCase() !== imei.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

    return true;
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
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE IF EXISTS public.brands ADD COLUMN IF NOT EXISTS color TEXT;

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
    dp NUMERIC,
    mop NUMERIC,
    mrp NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Migration query to add columns if table was created previously:
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS dp NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS mop NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS mrp NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 5. Create Sold IMEIs table (for records removed from active stock)
CREATE TABLE IF NOT EXISTS public.sold_imeis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID,
    brand TEXT,
    model TEXT,
    variant TEXT,
    imei TEXT NOT NULL UNIQUE,
    entry_dp NUMERIC,
    mop NUMERIC,
    mrp NUMERIC,
    remarks TEXT,
    sold_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Create accessory brand and type master tables
CREATE TABLE IF NOT EXISTS public.accessory_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.accessory_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.accessory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    item_type TEXT NOT NULL,
    serial_no TEXT,
    landing_price NUMERIC NOT NULL DEFAULT 0,
    qty INTEGER NOT NULL DEFAULT 1,
    landing_price_per_pc NUMERIC NOT NULL DEFAULT 0,
    selling_price NUMERIC NOT NULL DEFAULT 0,
    mrp NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Create Indexes for High Performance Search & Filters
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON public.products (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history (product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON public.price_history (changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_imeis_product_id ON public.imeis (product_id);
CREATE INDEX IF NOT EXISTS idx_imeis_number ON public.imeis (imei);
CREATE INDEX IF NOT EXISTS idx_sold_imeis_product_id ON public.sold_imeis (product_id);
CREATE INDEX IF NOT EXISTS idx_sold_imeis_imei ON public.sold_imeis (imei);
CREATE INDEX IF NOT EXISTS idx_sold_imeis_sold_at ON public.sold_imeis (sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_accessory_stock_brand ON public.accessory_stock (brand);
CREATE INDEX IF NOT EXISTS idx_accessory_stock_type ON public.accessory_stock (item_type);
CREATE INDEX IF NOT EXISTS idx_accessory_stock_updated_at ON public.accessory_stock (updated_at DESC);

-- 8. Row Level Security (RLS) Policies
-- Enables public read/write access using the anonymous key
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sold_imeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessory_stock ENABLE ROW LEVEL SECURITY;

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

-- Sold IMEIs RLS
CREATE POLICY "Allow all access on sold_imeis" ON public.sold_imeis
    FOR ALL USING (true) WITH CHECK (true);

-- Accessory tables RLS
CREATE POLICY "Allow all access on accessory_brands" ON public.accessory_brands
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access on accessory_types" ON public.accessory_types
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access on accessory_stock" ON public.accessory_stock
    FOR ALL USING (true) WITH CHECK (true);

-- 9. Seed Initial Popular Smartphone Brands
INSERT INTO public.brands (name, color) VALUES
    ('Apple', '#8b5cf6'),
    ('Samsung', '#1d4ed8'),
    ('vivo', '#2563eb'),
    ('OPPO', '#f97316'),
    ('OnePlus', '#0f766e'),
    ('realme', '#ec4899'),
    ('Xiaomi', '#ef4444'),
    ('iQOO', '#14b8a6'),
    ('Motorola', '#f59e0b'),
    ('Nothing', '#111827'),
    ('Google Pixel', '#10b981')
ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color;

INSERT INTO public.accessory_brands (name) VALUES
    ('vivo'),
    ('Samsung'),
    ('Anker'),
    ('Realme'),
    ('OnePlus')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.accessory_types (name) VALUES
    ('Headphone'),
    ('USB-C Cable'),
    ('Power Bank'),
    ('Charger'),
    ('Case')
ON CONFLICT (name) DO NOTHING;
`;

// Migration SQL for updating existing database with unit-level price columns
const SUPABASE_MIGRATION_SQL = `-- Migration: Add unit-specific price columns & remarks to existing IMEIs table
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS dp NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS mop NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS mrp NUMERIC;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS public.imeis ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Accessory tables migration
CREATE TABLE IF NOT EXISTS public.accessory_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.accessory_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.accessory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    item_type TEXT NOT NULL,
    serial_no TEXT,
    landing_price NUMERIC NOT NULL DEFAULT 0,
    qty INTEGER NOT NULL DEFAULT 1,
    landing_price_per_pc NUMERIC NOT NULL DEFAULT 0,
    selling_price NUMERIC NOT NULL DEFAULT 0,
    mrp NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
`;

// Global instance
window.dbService = new SupabaseService();
window.SUPABASE_SQL_SCHEMA = SUPABASE_SQL_SCHEMA;
window.SUPABASE_MIGRATION_SQL = SUPABASE_MIGRATION_SQL;

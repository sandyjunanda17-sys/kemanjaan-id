"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  BrandConfig,
  BrandItem,
  CategoryConfig,
  Order,
  PhoneProduct,
  PhoneVariant,
  PromoBanner,
  ShippingOption,
  StoreData,
  TradeInSubmission,
  Voucher,
} from "@/types/store";
import { INITIAL_STORE_DATA } from "@/data/initialData";

export interface CartItem {
  product: PhoneProduct;
  variant: PhoneVariant;
  quantity: number;
}

interface StoreContextType {
  store: StoreData;
  isLoaded: boolean;
  syncStatus: "synced" | "saving" | "local-only";
  metaInfo: {
    storageType: string;
    isCloudConnected: boolean;
    isVercel: boolean;
    storageKey: string;
  } | null;
  updateBrandConfig: (config: BrandConfig) => Promise<void>;
  saveCategory: (cat: CategoryConfig, previousName?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  moveCategory: (idx: number, direction: "up" | "down") => Promise<void>;
  saveBrand: (brand: BrandItem, previousName?: string) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  saveProduct: (product: PhoneProduct) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveBanner: (banner: PromoBanner) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  saveVoucher: (voucher: Voucher) => Promise<void>;
  deleteVoucher: (id: string) => Promise<void>;
  updateShippingOptions: (options: ShippingOption[]) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order["status"], resiNumber?: string) => Promise<void>;
  updateTradeInStatus: (id: string, status: TradeInSubmission["status"], estimatedValue?: number) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  importStoreJson: (jsonData: StoreData) => Promise<void>;
  createOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<Order>;
  createTradeIn: (sub: Omit<TradeInSubmission, "id" | "createdAt" | "status">) => Promise<TradeInSubmission>;
  cart: CartItem[];
  addToCart: (product: PhoneProduct, variant: PhoneVariant, qty?: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateCartQty: (productId: string, variantId: string, qty: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  compareIds: string[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  activeTradeInCredit: { model: string; amount: number } | null;
  setActiveTradeInCredit: (credit: { model: string; amount: number } | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = "kemanjaan_store_data_v1";
const CART_KEY = "kemanjaan_cart_v1";
const WISHLIST_KEY = "kemanjaan_wishlist_v1";

function sanitizeClientStore(data: StoreData): StoreData {
  if (!data || !data.brandConfig) return INITIAL_STORE_DATA;
  const brandName = (data.brandConfig.name || "").toLowerCase();
  if (brandName.includes("nusaphone") || brandName.includes("r phone")) {
    return INITIAL_STORE_DATA;
  }
  return {
    ...data,
    categories:
      data.categories && data.categories.length > 0
        ? data.categories
        : INITIAL_STORE_DATA.categories,
    brands:
      data.brands && data.brands.length > 0
        ? data.brands
        : INITIAL_STORE_DATA.brands,
  };
}

const COLOR_PALETTES: Record<
  BrandConfig["primaryColor"],
  { 50: string; 100: string; 500: string; 600: string; 700: string; 900: string }
> = {
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    900: "#1e3a8a",
  },
  emerald: {
    50: "#ecfdf5",
    100: "#d1fae5",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    900: "#064e3b",
  },
  violet: {
    50: "#f5f3ff",
    100: "#ede9fe",
    500: "#8b5cf6",
    600: "#7c3aed",
    700: "#6d28d9",
    900: "#4c1d95",
  },
  rose: {
    50: "#fff1f2",
    100: "#ffe4e6",
    500: "#f43f5e",
    600: "#e11d48",
    700: "#be123c",
    900: "#881337",
  },
  amber: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    900: "#78350f",
  },
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    500: "#475569",
    600: "#334155",
    700: "#1e293b",
    900: "#0f172a",
  },
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<StoreData>(INITIAL_STORE_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "local-only">("synced");
  const [metaInfo, setMetaInfo] = useState<StoreContextType["metaInfo"]>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [activeTradeInCredit, setActiveTradeInCredit] = useState<{ model: string; amount: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  };

  useEffect(() => {
    async function init() {
      let localData: StoreData | null = null;
      try {
        const rawLocal = localStorage.getItem(STORAGE_KEY);
        if (rawLocal) {
          localData = sanitizeClientStore(JSON.parse(rawLocal));
          setStore(localData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
        }
        const rawCart = localStorage.getItem(CART_KEY);
        if (rawCart) setCart(JSON.parse(rawCart));
        const rawWish = localStorage.getItem(WISHLIST_KEY);
        if (rawWish) setWishlist(JSON.parse(rawWish));
      } catch {
        // ignore storage errors
      }

      try {
        const res = await fetch("/api/store", { cache: "no-store" });
        if (res.ok) {
          const resJson = await res.json();
          if (resJson._meta) setMetaInfo(resJson._meta);
          const serverData = sanitizeClientStore(resJson as StoreData);
          const localTime = localData ? new Date(localData.lastUpdated).getTime() : 0;
          const serverTime = new Date(serverData.lastUpdated).getTime();

          if (localData && localTime > serverTime) {
            setStore(localData);
            await fetch("/api/store", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(localData),
            });
          } else {
            setStore(serverData);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
            } catch {}
          }
          setSyncStatus("synced");
        } else if (localData) {
          setStore(localData);
          setSyncStatus("local-only");
        }
      } catch {
        if (localData) setStore(localData);
        setSyncStatus("local-only");
      } finally {
        setIsLoaded(true);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const palette = COLOR_PALETTES[store.brandConfig.primaryColor] || COLOR_PALETTES.rose;
    const root = document.documentElement;
    root.style.setProperty("--brand-50", palette[50]);
    root.style.setProperty("--brand-100", palette[100]);
    root.style.setProperty("--brand-500", palette[500]);
    root.style.setProperty("--brand-600", palette[600]);
    root.style.setProperty("--brand-700", palette[700]);
    root.style.setProperty("--brand-900", palette[900]);
    document.title = `${store.brandConfig.name} — ${store.brandConfig.tagline}`;
  }, [store.brandConfig.primaryColor, store.brandConfig.name, store.brandConfig.tagline]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {}
  }, [wishlist, isLoaded]);

  const persistStore = async (nextStore: StoreData) => {
    const stamped: StoreData = {
      ...nextStore,
      lastUpdated: new Date().toISOString(),
    };
    setStore(stamped);
    setSyncStatus("saving");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
    } catch {}

    try {
      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stamped),
      });
      if (res.ok) {
        const json = await res.json();
        setSyncStatus(json.persistedOnServer ? "synced" : "local-only");
        if (json.storageType) {
          setMetaInfo((prev) => ({
            storageType: json.storageType,
            isCloudConnected: Boolean(json.persistedOnCloud),
            isVercel: Boolean(json.isVercel),
            storageKey: prev?.storageKey || "default",
          }));
        }
      } else {
        setSyncStatus("local-only");
      }
    } catch {
      setSyncStatus("local-only");
    }
  };

  const updateBrandConfig = async (config: BrandConfig) => {
    await persistStore({ ...store, brandConfig: config });
    showToast("Identitas brand & pengaturan toko berhasil disimpan!");
  };

  const saveCategory = async (cat: CategoryConfig, previousName?: string) => {
    const currentCats = store.categories || INITIAL_STORE_DATA.categories || [];
    const exists = currentCats.some((c) => c.id === cat.id);
    const nextCats = exists
      ? currentCats.map((c) => (c.id === cat.id ? cat : c))
      : [...currentCats, cat];

    let nextProducts = store.products;
    if (previousName && previousName !== cat.name) {
      nextProducts = store.products.map((p) =>
        p.condition === previousName ? { ...p, condition: cat.name } : p
      );
    }

    await persistStore({ ...store, categories: nextCats, products: nextProducts });
    showToast(exists ? `Kategori "${cat.name}" diperbarui!` : `Kategori "${cat.name}" ditambahkan!`);
  };

  const deleteCategory = async (id: string) => {
    const currentCats = store.categories || INITIAL_STORE_DATA.categories || [];
    const nextCats = currentCats.filter((c) => c.id !== id);
    await persistStore({ ...store, categories: nextCats });
    showToast("Kategori dihapus.");
  };

  const moveCategory = async (idx: number, direction: "up" | "down") => {
    const currentCats = [...(store.categories || INITIAL_STORE_DATA.categories || [])];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= currentCats.length) return;
    const temp = currentCats[idx];
    currentCats[idx] = currentCats[targetIdx];
    currentCats[targetIdx] = temp;
    await persistStore({ ...store, categories: currentCats });
    showToast("Urutan kategori diperbarui!");
  };

  const saveBrand = async (brand: BrandItem, previousName?: string) => {
    const currentBrands = store.brands || INITIAL_STORE_DATA.brands || [];
    const exists = currentBrands.some((b) => b.id === brand.id);
    const nextBrands = exists
      ? currentBrands.map((b) => (b.id === brand.id ? brand : b))
      : [...currentBrands, brand];

    let nextProducts = store.products;
    if (previousName && previousName !== brand.name) {
      nextProducts = store.products.map((p) =>
        p.brand === previousName ? { ...p, brand: brand.name } : p
      );
    }

    await persistStore({ ...store, brands: nextBrands, products: nextProducts });
    showToast(exists ? `Brand "${brand.name}" diperbarui!` : `Brand "${brand.name}" ditambahkan!`);
  };

  const deleteBrand = async (id: string) => {
    const currentBrands = store.brands || INITIAL_STORE_DATA.brands || [];
    const nextBrands = currentBrands.filter((b) => b.id !== id);
    await persistStore({ ...store, brands: nextBrands });
    showToast("Brand dihapus.");
  };

  const saveProduct = async (product: PhoneProduct) => {
    const exists = store.products.some((p) => p.id === product.id);
    const nextProducts = exists
      ? store.products.map((p) => (p.id === product.id ? product : p))
      : [product, ...store.products];
    await persistStore({ ...store, products: nextProducts });
    showToast(exists ? `Produk "${product.name}" diperbarui!` : `Produk "${product.name}" ditambahkan!`);
  };

  const deleteProduct = async (id: string) => {
    const targetProduct = store.products.find((p) => p.id === id);
    const nextProducts = store.products.filter((p) => p.id !== id);
    await persistStore({ ...store, products: nextProducts });

    if (targetProduct && targetProduct.images && targetProduct.images.length > 0) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: targetProduct.images }),
        });
      } catch {}
    }

    showToast("Produk berhasil dihapus dari katalog.");
  };

  const saveBanner = async (banner: PromoBanner) => {
    const exists = store.banners.some((b) => b.id === banner.id);
    const nextBanners = exists
      ? store.banners.map((b) => (b.id === banner.id ? banner : b))
      : [banner, ...store.banners];
    await persistStore({ ...store, banners: nextBanners });
    showToast("Banner promo berhasil disimpan!");
  };

  const deleteBanner = async (id: string) => {
    await persistStore({ ...store, banners: store.banners.filter((b) => b.id !== id) });
    showToast("Banner promo dihapus.");
  };

  const saveVoucher = async (voucher: Voucher) => {
    const exists = store.vouchers.some((v) => v.id === voucher.id);
    const nextVouchers = exists
      ? store.vouchers.map((v) => (v.id === voucher.id ? voucher : v))
      : [voucher, ...store.vouchers];
    await persistStore({ ...store, vouchers: nextVouchers });
    showToast(`Voucher ${voucher.code} berhasil disimpan!`);
  };

  const deleteVoucher = async (id: string) => {
    await persistStore({ ...store, vouchers: store.vouchers.filter((v) => v.id !== id) });
    showToast("Voucher dihapus.");
  };

  const updateShippingOptions = async (options: ShippingOption[]) => {
    await persistStore({ ...store, shippingOptions: options });
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"], resiNumber?: string) => {
    const nextOrders = store.orders.map((o) =>
      o.id === orderId ? { ...o, status, ...(resiNumber !== undefined ? { resiNumber } : {}) } : o
    );
    await persistStore({ ...store, orders: nextOrders });
  };

  const updateTradeInStatus = async (
    id: string,
    status: TradeInSubmission["status"],
    estimatedValue?: number
  ) => {
    const nextTradeIns = store.tradeIns.map((t) =>
      t.id === id
        ? { ...t, status, ...(estimatedValue !== undefined ? { estimatedValue } : {}) }
        : t
    );
    await persistStore({ ...store, tradeIns: nextTradeIns });
  };

  const resetToDefaultData = async () => {
    await persistStore(INITIAL_STORE_DATA);
    showToast("Database toko telah di-reset ke katalog Kemanjaan.id.");
  };

  const importStoreJson = async (jsonData: StoreData) => {
    const sanitized = sanitizeClientStore(jsonData);
    await persistStore(sanitized);
    showToast("Database toko berhasil di-import!");
  };

  const createOrder = async (orderInput: Omit<Order, "id" | "createdAt">) => {
    const newOrder: Order = {
      ...orderInput,
      id: `KMJ-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    return newOrder;
  };

  const createTradeIn = async (
    subInput: Omit<TradeInSubmission, "id" | "createdAt" | "status">
  ) => {
    const newSub: TradeInSubmission = {
      ...subInput,
      id: `TRD-${Date.now()}`,
      status: "Menunggu Inspeksi",
      createdAt: new Date().toISOString(),
    };
    return newSub;
  };

  const addToCart = (product: PhoneProduct, variant: PhoneVariant, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && item.variant.id === variant.id
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: Math.min(variant.stock, updated[idx].quantity + qty),
        };
        return updated;
      }
      return [...prev, { product, variant, quantity: qty }];
    });
    showToast(`${product.name} (${variant.ram}) masuk Keranjang WA!`);
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.variant.id === variantId))
    );
  };

  const updateCartQty = (productId: string, variantId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variant.id === variantId
          ? { ...item, quantity: Math.min(item.variant.stock, qty) }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      showToast(exists ? "Dihapus dari Favorit" : "Disimpan ke Favorit ❤️");
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  const toggleCompare = (productId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) {
        showToast("Maksimal 3 produk untuk dibandingkan sekaligus.");
        return prev;
      }
      showToast("Ditambahkan ke perbandingan produk.");
      return [...prev, productId];
    });
  };

  const clearCompare = () => setCompareIds([]);

  return (
    <StoreContext.Provider
      value={{
        store,
        isLoaded,
        syncStatus,
        metaInfo,
        updateBrandConfig,
        saveCategory,
        deleteCategory,
        moveCategory,
        saveBrand,
        deleteBrand,
        saveProduct,
        deleteProduct,
        saveBanner,
        deleteBanner,
        saveVoucher,
        deleteVoucher,
        updateShippingOptions,
        updateOrderStatus,
        updateTradeInStatus,
        resetToDefaultData,
        importStoreJson,
        createOrder,
        createTradeIn,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        wishlist,
        toggleWishlist,
        compareIds,
        toggleCompare,
        clearCompare,
        activeTradeInCredit,
        setActiveTradeInCredit,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

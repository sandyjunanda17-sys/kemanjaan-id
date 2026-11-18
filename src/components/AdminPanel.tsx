"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import {
  BrandConfig,
  BrandItem,
  CategoryColorTheme,
  CategoryConfig,
  PhoneCondition,
  PhoneProduct,
  PhoneVariant,
  PromoBanner,
  Voucher,
} from "@/types/store";
import { buildWhatsAppUrl, formatRupiah } from "@/utils/format";
import { uploadOrProcessImage } from "@/utils/imageOptimizer";
import {
  Palette,
  Megaphone,
  Database,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  CheckCircle2,
  ExternalLink,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  X,
  Cloud,
  Copy,
  ChevronLeft,
  ChevronRight,
  Star,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Tag,
  Layers,
  ArrowUp,
  ArrowDown,
  Search,
} from "lucide-react";

export default function AdminPanel({
  onBackToStore,
}: {
  onBackToStore: () => void;
}) {
  const {
    store,
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
    resetToDefaultData,
    importStoreJson,
    showToast,
  } = useStore();

  const [subTab, setSubTab] = useState<
    "brand" | "categories" | "products" | "marketing" | "database"
  >("brand");

  // Brand form state
  const [brandForm, setBrandForm] = useState<BrandConfig>(store.brandConfig);

  // Category & Brand manager state
  const [newCategory, setNewCategory] = useState<{
    name: string;
    icon: string;
    shortLabel: string;
    colorTheme: CategoryColorTheme;
  }>({
    name: "",
    icon: "✨",
    shortLabel: "",
    colorTheme: "rose",
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryDraft, setEditingCategoryDraft] = useState<CategoryConfig | null>(null);
  const [editingCategoryOldName, setEditingCategoryOldName] = useState<string>("");

  const [newBrandItem, setNewBrandItem] = useState<{ name: string; icon: string }>({
    name: "",
    icon: "🌸",
  });
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingBrandDraft, setEditingBrandDraft] = useState<BrandItem | null>(null);
  const [editingBrandOldName, setEditingBrandOldName] = useState<string>("");

  // Admin Products search & filter
  const [adminSearch, setAdminSearch] = useState("");
  const [adminCatFilter, setAdminCatFilter] = useState("ALL");
  const [adminBrandFilter, setAdminBrandFilter] = useState("ALL");

  // Product Editor Modal state
  const [editingProduct, setEditingProduct] = useState<PhoneProduct | null>(null);
  const [completenessText, setCompletenessText] = useState("");
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [newImageUrlInput, setNewImageUrlInput] = useState("");

  // Banner & Voucher state
  const [newBanner, setNewBanner] = useState<Partial<PromoBanner>>({
    title: "",
    subtitle: "",
    badge: "PROMO SPESIAL",
    ctaText: "Lihat Promo",
    bgGradient: "from-slate-950 via-rose-950 to-pink-900",
    imageUrl: "/assets/storefront-gmaps.jpg",
    active: true,
  });

  const [newVoucher, setNewVoucher] = useState<Partial<Voucher>>({
    code: "",
    discountAmount: 10000,
    minPurchase: 150000,
    description: "",
    active: true,
  });

  // Handle Logo Image Upload with auto-optimization (any format, max 400x400)
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await uploadOrProcessImage(file);
      setBrandForm((prev) => ({ ...prev, logoUrl: optimized }));
      showToast("Logo berhasil dimuat & dioptimasi otomatis!");
    } catch {
      showToast("Gagal memproses file gambar logo.");
    }
  };

  // Handle Product Images Upload with multi-file auto compression & max 5 photos limit
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    const currentCount = editingProduct.images.length;
    if (currentCount >= 5) {
      showToast("Maksimal 5 foto per produk sudah terpenuhi.");
      return;
    }

    const availableSlots = 5 - currentCount;
    const filesToProcess = Array.from(files).slice(0, availableSlots);

    setIsCompressingImage(true);
    try {
      const processed: string[] = [];
      for (const file of filesToProcess) {
        const dataUrl = await uploadOrProcessImage(file);
        processed.push(dataUrl);
      }
      setEditingProduct({
        ...editingProduct,
        images: [...editingProduct.images, ...processed],
      });
      showToast(`${processed.length} foto berhasil dioptimasi & ditambahkan!`);
    } catch {
      showToast("Gagal memproses beberapa file foto.");
    } finally {
      setIsCompressingImage(false);
      e.target.value = "";
    }
  };

  // Add Product Image via external URL
  const handleAddImageUrl = () => {
    if (!editingProduct) return;
    const trimmed = newImageUrlInput.trim();
    if (!trimmed) {
      showToast("Masukkan link URL gambar terlebih dahulu.");
      return;
    }
    if (editingProduct.images.length >= 5) {
      showToast("Maksimal 5 foto per produk sudah terpenuhi.");
      return;
    }
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, trimmed],
    });
    setNewImageUrlInput("");
    showToast("Foto berhasil ditambahkan dari URL!");
  };

  // Make selected photo primary (slot 1)
  const handleSetPrimaryImage = (idx: number) => {
    if (!editingProduct || idx === 0) return;
    const imgs = [...editingProduct.images];
    const [selected] = imgs.splice(idx, 1);
    imgs.unshift(selected);
    setEditingProduct({ ...editingProduct, images: imgs });
    showToast("Foto utama produk berhasil diatur!");
  };

  // Remove photo slot & cleanup from Supabase Storage
  const handleRemoveProductImageSlot = async (idx: number) => {
    if (!editingProduct) return;
    const removedUrl = editingProduct.images[idx];
    const nextImages = editingProduct.images.filter((_, i) => i !== idx);
    setEditingProduct({ ...editingProduct, images: nextImages });

    if (removedUrl && removedUrl.includes("/rphone-images/")) {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: [removedUrl] }),
        });
      } catch {}
    }
    showToast("Foto berhasil dihapus.");
  };

  // Move photo left/right
  const handleMoveImage = (idx: number, direction: "left" | "right") => {
    if (!editingProduct) return;
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= editingProduct.images.length) return;
    const imgs = [...editingProduct.images];
    const temp = imgs[idx];
    imgs[idx] = imgs[targetIdx];
    imgs[targetIdx] = temp;
    setEditingProduct({ ...editingProduct, images: imgs });
  };

  const openNewProductModal = () => {
    const fresh: PhoneProduct = {
      id: `kmj-${Date.now()}`,
      name: "",
      brand: (store.brands && store.brands[0]?.name) || "Kemanjaan",
      condition: (store.categories && store.categories[0]?.name) || "Skincare & Moisturizer",
      warranty: "100% Original & Terdaftar BPOM",
      featured: true,
      flashSale: false,
      rating: 5.0,
      soldCount: 0,
      images: ["/assets/products/kmj-toner.svg"],
      description:
        "Produk kosmetik & skincare original berkualitas tinggi dengan harga terjangkau dari Toko Kosmetik Kemanjaan.",
      variants: [
        {
          id: `v-${Date.now()}`,
          ram: "Regular",
          storage: "50ml",
          color: "Original",
          colorHex: "#E87A90",
          price: 45000,
          originalPrice: 59000,
          stock: 20,
        },
      ],
      specs: {
        screen: "Mencerahkan & merawat kulit wajah",
        processor: "Niacinamide, Ceramide & Botanical Extracts",
        camera: "Semua jenis kulit",
        battery: "50 ml",
        os: "Gunakan rutin pagi dan malam",
        network: "BPOM Approved",
        sim: "Ringan & cepat meresap",
      },
      inspection: {
        batteryHealth: "Original 100%",
        imeiStatus: "Terdaftar BPOM & Halal",
        faceIdOrFingerprint: "Aman Kulit Sensitif",
        screenCondition: "Exp 2028",
        bodyCondition: "Segel Baru 100%",
        completeness: ["1x Produk Original", "Segel Kemasan Resmi"],
      },
      createdAt: new Date().toISOString(),
    };
    setCompletenessText(fresh.inspection.completeness.join(", "));
    setEditingProduct(fresh);
  };

  const openEditProductModal = (prod: PhoneProduct) => {
    setCompletenessText(prod.inspection.completeness.join(", "));
    setEditingProduct(JSON.parse(JSON.stringify(prod)));
  };

  const handleSaveProductModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      showToast("Nama produk tidak boleh kosong.");
      return;
    }
    if (editingProduct.images.length === 0) {
      showToast("Harap masukkan minimal 1 foto produk.");
      return;
    }
    const finalProd: PhoneProduct = {
      ...editingProduct,
      images: editingProduct.images.slice(0, 5),
      inspection: {
        ...editingProduct.inspection,
        completeness: completenessText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
    };
    await saveProduct(finalProd);
    setEditingProduct(null);
  };

  // Export database as JSON
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${store.brandConfig.name.toLowerCase().replace(/\s+/g, "-")}-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import database JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && parsed.brandConfig && Array.isArray(parsed.products)) {
          await importStoreJson(parsed);
          setBrandForm(parsed.brandConfig);
        } else {
          showToast("Format file JSON tidak valid.");
        }
      } catch {
        showToast("Gagal membaca file JSON.");
      }
    };
    reader.readAsText(file);
  };

  const totalRevenue = store.orders
    .filter((o) => o.status !== "Dibatalkan")
    .reduce((acc, o) => acc + o.total, 0);

  const totalStock = store.products.reduce(
    (acc, p) => acc + p.variants.reduce((vAcc, v) => vAcc + v.stock, 0),
    0
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {syncStatus === "synced"
                ? "CMS Live • Tersimpan Otomatis di Server & Browser"
                : "CMS Live • Tersimpan Instan"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Panel Admin & Kustomisasi Toko Online
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Ubah Logo, Nama Brand, Tema Warna, Katalog Skincare, Makeup, Varian Harga, hingga Banner &amp; Voucher kapan saja secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToStore}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-extrabold flex items-center gap-2 shadow-sm transition"
          >
            <ExternalLink className="w-4 h-4 text-brand-600" />
            <span>Lihat Tampilan Toko Live</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Katalog Kosmetik</span>
          <div className="text-xl sm:text-2xl font-black text-brand-700 mt-1">
            {store.products.length} Produk
          </div>
          <span className="text-[11px] text-slate-500">
            Tampil di halaman utama
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Stok Siap Jual</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {totalStock} Pcs
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            Tersedia untuk pembeli
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">WhatsApp Order Toko</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 break-all">
            {store.brandConfig.whatsappNumber}
          </div>
          <span className="text-[11px] text-slate-500">
            Tujuan pesanan langsung WA
          </span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Identitas Brand Aktif</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            {store.brandConfig.name}
          </div>
          <span className="text-[11px] text-brand-600 font-semibold capitalize">
            Tema: {store.brandConfig.primaryColor}
          </span>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
        {[
          { id: "brand", label: "1. Logo, WhatsApp & Brand", icon: Palette },
          {
            id: "categories",
            label: `2. Kategori & Brand (${(store.categories || []).length})`,
            icon: Layers,
          },
          { id: "products", label: `3. Katalog Produk (${store.products.length})`, icon: Sparkles },
          { id: "marketing", label: "4. Banner Promo & Voucher", icon: Megaphone },
          { id: "database", label: "5. Database & Backup", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as typeof subTab)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 transition ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BRAND, LOGO & THEME EDITOR */}
      {subTab === "brand" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Pengaturan Identitas Brand, Logo & Warna
                </h2>
                <p className="text-xs text-slate-500">
                  Perubahan langsung diterapkan ke seluruh halaman website begitu disimpan.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Brand / Nama Toko *
                  </label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, name: e.target.value })
                    }
                    placeholder="Contoh: KEMANJAAN.ID"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inisial Ikon Logo (Jika Tanpa Gambar)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={brandForm.logoTextIcon}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        logoTextIcon: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="KM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tagline / Slogan Toko
                </label>
                <input
                  type="text"
                  value={brandForm.tagline}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, tagline: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                />
              </div>

              {/* Logo Upload & URL */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">
                  Logo Toko (Upload File Gambar dari Perangkat atau Tempel URL)
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {brandForm.logoUrl ? (
                    <div className="w-16 h-16 rounded-2xl border border-slate-200 bg-white p-1.5 flex items-center justify-center relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={brandForm.logoUrl}
                        alt="Preview Logo"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setBrandForm({ ...brandForm, logoUrl: "" })}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow"
                        title="Hapus gambar logo"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-xl">
                      {brandForm.logoTextIcon || "RP"}
                    </div>
                  )}

                  <div className="flex-1 space-y-2 min-w-[220px]">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer shadow-sm transition">
                      <Upload className="w-4 h-4 text-brand-600" />
                      <span>Upload Gambar Logo (PNG/JPG/SVG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={brandForm.logoUrl}
                      onChange={(e) =>
                        setBrandForm({ ...brandForm, logoUrl: e.target.value })
                      }
                      placeholder="Atau tempel URL gambar logo (https://...)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-brand-600"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Pilih Tema Warna Utama Website
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {(
                    [
                      { id: "blue", label: "Biru Royal", hex: "#2563eb" },
                      { id: "emerald", label: "Emerald", hex: "#059669" },
                      { id: "violet", label: "Ungu Pro", hex: "#7c3aed" },
                      { id: "rose", label: "Merah Rose", hex: "#e11d48" },
                      { id: "amber", label: "Gold Amber", hex: "#d97706" },
                      { id: "slate", label: "Titanium", hex: "#1e293b" },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setBrandForm({ ...brandForm, primaryColor: c.id })
                      }
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                        brandForm.primaryColor === c.id
                          ? "border-slate-900 bg-slate-900 text-white font-bold shadow"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px]">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact & Store Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Admin (Format 628...)
                  </label>
                  <input
                    type="text"
                    value={brandForm.whatsappNumber}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        whatsappNumber: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Akun Instagram Toko
                  </label>
                  <input
                    type="text"
                    value={brandForm.instagramHandle}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        instagramHandle: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Lengkap Toko Fisik
                  </label>
                  <input
                    type="text"
                    value={brandForm.storeAddress}
                    onChange={(e) =>
                      setBrandForm({ ...brandForm, storeAddress: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    value={brandForm.operationalHours}
                    onChange={(e) =>
                      setBrandForm({
                        ...brandForm,
                        operationalHours: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              {/* Google Maps Link Field */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>Link Google Maps Toko (Bisa Dibuka & Disalin Pelanggan)</span>
                  </label>
                  {brandForm.mapsUrl && (
                    <a
                      href={brandForm.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Cek Buka Maps</span>
                    </a>
                  )}
                </div>
                <input
                  type="text"
                  value={brandForm.mapsUrl || ""}
                  onChange={(e) =>
                    setBrandForm({ ...brandForm, mapsUrl: e.target.value })
                  }
                  placeholder="Contoh: https://maps.app.goo.gl/... atau https://goo.gl/maps/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-brand-600 font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Cara ambil link: Buka aplikasi Google Maps &gt; cari lokasi toko Anda &gt; klik <strong>Bagikan / Share</strong> &gt; pilih <strong>Salin Link</strong> lalu tempel di sini.
                </p>
              </div>

              {/* Announcement Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Teks Pengumuman Promo di Bagian Paling Atas (Announcement Bar)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brandForm.announcementActive}
                      onChange={(e) =>
                        setBrandForm({
                          ...brandForm,
                          announcementActive: e.target.checked,
                        })
                      }
                      className="rounded text-brand-600"
                    />
                    Tampilkan
                  </label>
                </div>
                <input
                  type="text"
                  value={brandForm.announcementBar}
                  onChange={(e) =>
                    setBrandForm({
                      ...brandForm,
                      announcementBar: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-brand-600"
                />
              </div>

              <button
                type="button"
                onClick={() => updateBrandConfig(brandForm)}
                className="w-full py-3.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Brand, Logo & Tema</span>
              </button>
            </div>
          </div>

          {/* Right: Security & WhatsApp Closing Settings */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span>Keamanan & PIN Panel Admin</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ganti PIN 4 digit untuk mengamankan akses pengaturan toko Anda dari orang lain.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                PIN Masuk Admin (4 Angka)
              </label>
              <input
                type="text"
                maxLength={8}
                value={brandForm.adminPin}
                onChange={(e) =>
                  setBrandForm({ ...brandForm, adminPin: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold tracking-widest bg-white outline-none focus:border-brand-600"
              />
              <p className="text-[11px] text-slate-500">
                Default PIN adalah <strong>1234</strong>. Pastikan Anda mengingat PIN baru setelah disimpan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <h4 className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Alur Closing WhatsApp Aktif</span>
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Setiap calon pembeli yang mengklik tombol <strong>Pesan WA</strong> atau <strong>Pesan Sekarang via WhatsApp</strong> otomatis langsung diarahkan ke nomor WhatsApp:
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-xs font-mono font-bold text-emerald-900">
                wa.me/{brandForm.whatsappNumber.replace(/[^0-9]/g, "")}
              </div>
              <p className="text-[11px] text-emerald-700">
                Format pesanan, rincian shade/varian produk, dan total harga otomatis terketik di chat pembeli sehingga Anda tinggal balas &amp; closing!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES & BRANDS MANAGER */}
      {subTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Categories Manager */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-600" />
                <span>Kelola Kategori Produk ({(store.categories || []).length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambah, ubah nama, atur warna badge, urutkan, atau hapus kategori. Mengubah nama kategori otomatis memperbarui semua produk di dalamnya!
              </p>
            </div>

            {/* Add New Category Form */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-extrabold text-slate-800">+ Tambah Kategori Baru</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  placeholder="✨"
                  className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-xs text-center bg-white"
                  title="Ikon Emoji"
                />
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Nama Kategori (misal: Haircare)"
                  className="sm:col-span-5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                />
                <input
                  type="text"
                  value={newCategory.shortLabel}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, shortLabel: e.target.value.toUpperCase() })
                  }
                  placeholder="Label Badge (HAIRCARE)"
                  className="sm:col-span-3 px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase bg-white"
                />
                <select
                  value={newCategory.colorTheme}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      colorTheme: e.target.value as CategoryColorTheme,
                    })
                  }
                  className="sm:col-span-2 px-2 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
                >
                  <option value="rose">Rose</option>
                  <option value="amber">Gold</option>
                  <option value="pink">Pink</option>
                  <option value="purple">Ungu</option>
                  <option value="sky">Biru</option>
                  <option value="emerald">Hijau</option>
                  <option value="orange">Oranye</option>
                  <option value="slate">Gelap</option>
                </select>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!newCategory.name.trim()) {
                    showToast("Nama kategori tidak boleh kosong.");
                    return;
                  }
                  await saveCategory({
                    id: `cat-${Date.now()}`,
                    name: newCategory.name.trim(),
                    icon: newCategory.icon.trim() || "✨",
                    shortLabel:
                      newCategory.shortLabel.trim() ||
                      newCategory.name.trim().slice(0, 12).toUpperCase(),
                    colorTheme: newCategory.colorTheme,
                  });
                  setNewCategory({ name: "", icon: "✨", shortLabel: "", colorTheme: "rose" });
                }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition"
              >
                + Simpan Kategori Baru
              </button>
            </div>

            {/* Categories List */}
            <div className="space-y-2.5">
              {(store.categories || []).map((cat, idx) => {
                const count = store.products.filter((p) => p.condition === cat.name).length;
                const isEditing = editingCategoryId === cat.id && editingCategoryDraft;

                return (
                  <div
                    key={cat.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-2.5"
                  >
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          maxLength={4}
                          value={editingCategoryDraft.icon}
                          onChange={(e) =>
                            setEditingCategoryDraft({ ...editingCategoryDraft, icon: e.target.value })
                          }
                          className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-center"
                        />
                        <input
                          type="text"
                          value={editingCategoryDraft.name}
                          onChange={(e) =>
                            setEditingCategoryDraft({ ...editingCategoryDraft, name: e.target.value })
                          }
                          className="sm:col-span-4 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={editingCategoryDraft.shortLabel}
                          onChange={(e) =>
                            setEditingCategoryDraft({
                              ...editingCategoryDraft,
                              shortLabel: e.target.value.toUpperCase(),
                            })
                          }
                          className="sm:col-span-3 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs uppercase"
                        />
                        <select
                          value={editingCategoryDraft.colorTheme}
                          onChange={(e) =>
                            setEditingCategoryDraft({
                              ...editingCategoryDraft,
                              colorTheme: e.target.value as CategoryColorTheme,
                            })
                          }
                          className="sm:col-span-3 px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                        >
                          <option value="rose">Rose</option>
                          <option value="amber">Gold</option>
                          <option value="pink">Pink</option>
                          <option value="purple">Ungu</option>
                          <option value="sky">Biru</option>
                          <option value="emerald">Hijau</option>
                          <option value="orange">Oranye</option>
                          <option value="slate">Gelap</option>
                        </select>
                        <div className="sm:col-span-12 flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(null);
                              setEditingCategoryDraft(null);
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!editingCategoryDraft.name.trim()) return;
                              await saveCategory(editingCategoryDraft, editingCategoryOldName);
                              setEditingCategoryId(null);
                              setEditingCategoryDraft(null);
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl">{cat.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                              {cat.name}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span className="font-mono font-bold text-brand-700">
                                {cat.shortLabel}
                              </span>
                              <span>•</span>
                              <span>{count} produk</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveCategory(idx, "up")}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                            title="Naikkan urutan"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (store.categories || []).length - 1}
                            onClick={() => moveCategory(idx, "down")}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                            title="Turunkan urutan"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setEditingCategoryDraft({ ...cat });
                              setEditingCategoryOldName(cat.name);
                            }}
                            className="p-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700"
                            title="Edit Kategori"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Hapus kategori "${cat.name}"? (${count} produk saat ini menggunakan kategori ini)`
                                )
                              ) {
                                deleteCategory(cat.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Brands Manager */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-600" />
                <span>Kelola Brand Resmi ({(store.brands || []).length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambah, edit, atau hapus daftar brand yang tampil di filter katalog depan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="text-xs font-extrabold text-slate-800">+ Tambah Brand Baru</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={newBrandItem.icon}
                  onChange={(e) => setNewBrandItem({ ...newBrandItem, icon: e.target.value })}
                  className="w-12 px-2 py-2 rounded-xl border border-slate-200 text-xs text-center bg-white"
                  placeholder="🌸"
                />
                <input
                  type="text"
                  value={newBrandItem.name}
                  onChange={(e) => setNewBrandItem({ ...newBrandItem, name: e.target.value })}
                  placeholder="Nama Brand (misal: Somethinc)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newBrandItem.name.trim()) {
                      showToast("Nama brand tidak boleh kosong.");
                      return;
                    }
                    await saveBrand({
                      id: `br-${Date.now()}`,
                      name: newBrandItem.name.trim(),
                      icon: newBrandItem.icon.trim() || "✨",
                    });
                    setNewBrandItem({ name: "", icon: "🌸" });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="space-y-2 pr-1">
              {(store.brands || []).map((b) => {
                const count = store.products.filter((p) => p.brand === b.name).length;
                const isEditing = editingBrandId === b.id && editingBrandDraft;

                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          maxLength={4}
                          value={editingBrandDraft.icon}
                          onChange={(e) =>
                            setEditingBrandDraft({ ...editingBrandDraft, icon: e.target.value })
                          }
                          className="w-10 px-2 py-1 rounded-lg border border-slate-300 text-xs text-center"
                        />
                        <input
                          type="text"
                          value={editingBrandDraft.name}
                          onChange={(e) =>
                            setEditingBrandDraft({ ...editingBrandDraft, name: e.target.value })
                          }
                          className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!editingBrandDraft.name.trim()) return;
                            await saveBrand(editingBrandDraft, editingBrandOldName);
                            setEditingBrandId(null);
                            setEditingBrandDraft(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBrandId(null);
                            setEditingBrandDraft(null);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base">{b.icon}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900">
                              {b.name}
                            </div>
                            <div className="text-[10px] text-slate-500">{count} produk</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBrandId(b.id);
                              setEditingBrandDraft({ ...b });
                              setEditingBrandOldName(b.name);
                            }}
                            className="p-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100"
                            title="Edit Brand"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Hapus brand "${b.name}"?`)) {
                                deleteBrand(b.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                            title="Hapus Brand"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS MANAGEMENT */}
      {subTab === "products" && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Manajemen Katalog Kosmetik &amp; Produk ({store.products.length} Produk)
                </h2>
                <p className="text-xs text-slate-500">
                  Cari, filter, duplikat, edit harga/varian, atau tambah produk baru dengan cepat.
                </p>
              </div>
              <button
                onClick={openNewProductModal}
                className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-brand-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk Baru</span>
              </button>
            </div>

            {/* Search & Filter Controls inside Admin Products */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Cari nama produk..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none focus:border-brand-600"
                />
              </div>
              <select
                value={adminCatFilter}
                onChange={(e) => setAdminCatFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
              >
                <option value="ALL">Semua Kategori ({store.products.length})</option>
                {(store.categories || []).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <select
                value={adminBrandFilter}
                onChange={(e) => setAdminBrandFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold"
              >
                <option value="ALL">Semua Brand</option>
                {(store.brands || []).map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.icon} {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {store.products
              .filter((p) => {
                if (adminCatFilter !== "ALL" && p.condition !== adminCatFilter) return false;
                if (adminBrandFilter !== "ALL" && p.brand !== adminBrandFilter) return false;
                if (
                  adminSearch.trim() &&
                  !`${p.name} ${p.brand} ${p.condition}`
                    .toLowerCase()
                    .includes(adminSearch.toLowerCase())
                ) {
                  return false;
                }
                return true;
              })
              .map((prod) => {
                const totalProdStock = prod.variants.reduce((a, b) => a + b.stock, 0);
                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="p-4 flex gap-3.5 border-b border-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {prod.brand}
                            </span>
                            {prod.flashSale && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                                Promo
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-slate-900 text-sm mt-1">
                            {prod.name}
                          </h3>
                          <p className="text-[11px] text-brand-700 font-semibold">
                            {prod.condition}
                          </p>
                          <p className="text-xs font-black text-slate-900 mt-1">
                            {formatRupiah(prod.variants[0]?.price || 0)}
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 text-xs space-y-1 bg-slate-50/60">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Varian &amp; Stok:</span>
                          <span className="font-bold text-slate-800">
                            {prod.variants.length} Varian ({totalProdStock} Pcs)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status BPOM:</span>
                          <span className="font-semibold text-emerald-700">
                            {prod.inspection.imeiStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        onClick={() => openEditProductModal(prod)}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-1 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          const dup: PhoneProduct = {
                            ...JSON.parse(JSON.stringify(prod)),
                            id: `kmj-${Date.now()}`,
                            name: `${prod.name} (Salinan)`,
                            createdAt: new Date().toISOString(),
                          };
                          setCompletenessText(dup.inspection.completeness.join(", "));
                          setEditingProduct(dup);
                        }}
                        className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition"
                        title="Duplikat Produk"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplikat</span>
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(`Hapus produk "${prod.name}" dari katalog?`)
                          ) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}





      {/* TAB 5: BANNERS & VOUCHERS */}
      {subTab === "marketing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Promo Banners */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900">
              Kelola Banner Hero Halaman Utama
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <input
                type="text"
                value={newBanner.title || ""}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, title: e.target.value })
                }
                placeholder="Judul Promo Banner..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold"
              />
              <input
                type="text"
                value={newBanner.subtitle || ""}
                onChange={(e) =>
                  setNewBanner({ ...newBanner, subtitle: e.target.value })
                }
                placeholder="Subjudul penjelasan promo..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newBanner.badge || ""}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, badge: e.target.value })
                  }
                  placeholder="Teks Badge (PROMO)"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  value={newBanner.imageUrl || ""}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, imageUrl: e.target.value })
                  }
                  placeholder="URL Gambar Banner"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newBanner.title) return;
                  saveBanner({
                    id: `ban-${Date.now()}`,
                    title: newBanner.title,
                    subtitle: newBanner.subtitle || "",
                    badge: newBanner.badge || "PROMO",
                    ctaText: newBanner.ctaText || "Lihat Katalog",
                    bgGradient:
                      newBanner.bgGradient ||
                      "from-slate-900 via-blue-950 to-indigo-950",
                    imageUrl:
                      newBanner.imageUrl ||
                      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80",
                    active: true,
                  });
                  setNewBanner({ ...newBanner, title: "", subtitle: "" });
                }}
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
              >
                + Tambah Banner Promo
              </button>
            </div>

            <div className="space-y-3">
              {store.banners.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-brand-600 uppercase">
                        {b.badge}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{b.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteBanner(b.id)}
                    className="p-2 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Vouchers */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900">
              Kelola Kode Voucher Diskon
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={newVoucher.code || ""}
                  onChange={(e) =>
                    setNewVoucher({
                      ...newVoucher,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="KODE (HEMAT200)"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase bg-white"
                />
                <input
                  type="number"
                  step={50000}
                  value={newVoucher.discountAmount || 0}
                  onChange={(e) =>
                    setNewVoucher({
                      ...newVoucher,
                      discountAmount: Number(e.target.value),
                    })
                  }
                  placeholder="Nominal Diskon"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <input
                  type="number"
                  step={500000}
                  value={newVoucher.minPurchase || 0}
                  onChange={(e) =>
                    setNewVoucher({
                      ...newVoucher,
                      minPurchase: Number(e.target.value),
                    })
                  }
                  placeholder="Min. Belanja"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
              </div>
              <input
                type="text"
                value={newVoucher.description || ""}
                onChange={(e) =>
                  setNewVoucher({ ...newVoucher, description: e.target.value })
                }
                placeholder="Keterangan voucher..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newVoucher.code) return;
                  saveVoucher({
                    id: `voc-${Date.now()}`,
                    code: newVoucher.code.toUpperCase(),
                    discountAmount: newVoucher.discountAmount || 100000,
                    minPurchase: newVoucher.minPurchase || 0,
                    description:
                      newVoucher.description ||
                      `Potongan ${formatRupiah(newVoucher.discountAmount || 100000)}`,
                    active: true,
                  });
                  setNewVoucher({ ...newVoucher, code: "", description: "" });
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                + Buat Kode Voucher
              </button>
            </div>

            <div className="space-y-2.5">
              {store.vouchers.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                      {v.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 ml-2">
                      Potongan {formatRupiah(v.discountAmount)}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Min. Belanja {formatRupiah(v.minPurchase)} • {v.description}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteVoucher(v.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE EXPORT / IMPORT / RESET */}
      {subTab === "database" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Manajemen Database, Sinkronisasi Cloud & Backup
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Kelola penyimpanan data, pantau status cloud database agar editan Anda langsung tampil ke customer, dan unduh cadangan toko Anda.
            </p>
          </div>

          {/* CLOUD PERSISTENCE STATUS BANNER */}
          <div className="p-5 rounded-2xl border space-y-3 bg-gradient-to-br from-slate-50 to-slate-100/70 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    metaInfo?.isCloudConnected
                      ? "bg-emerald-500 text-white"
                      : "bg-brand-600 text-white"
                  }`}
                >
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Status Penyimpanan Online (Live Sync)
                    </h3>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        metaInfo?.storageType === "supabase-postgres"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : metaInfo?.isCloudConnected
                          ? "bg-teal-100 text-teal-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {metaInfo?.storageType === "supabase-postgres"
                        ? "⚡ SUPABASE POSTGRESQL AKTIF (KAPASITAS TINGGI 100+ PRODUK)"
                        : metaInfo?.isCloudConnected
                        ? "🟢 CLOUD KV AKTIF (ONLINE)"
                        : "🔵 SERVER FILE LOKAL"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {metaInfo?.storageType === "supabase-postgres"
                      ? "Terhubung ke Supabase PostgreSQL & Storage Cloud CDN. Kapasitas hingga ribuan produk (100+ produk), foto tersimpan permanen dan tidak akan pernah hilang!"
                      : metaInfo?.isCloudConnected
                      ? "Terhubung ke Cloud KV. Data tersimpan online. Untuk toko dengan 100+ produk & foto berkapasitas besar, sambungkan ke Supabase (Gratis)."
                      : "Data saat ini tersimpan sementara. Sambungkan ke Supabase (PostgreSQL) agar katalog produk tersimpan permanen dan mampu menampung 100+ produk."}
                  </p>
                </div>
              </div>

              {/* Action: Copy Link Toko */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.origin);
                    showToast("Link website toko berhasil disalin ke clipboard!");
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Link Toko untuk Customer</span>
              </button>
            </div>

            {/* Supabase Guide */}
            {metaInfo?.storageType !== "supabase-postgres" && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span>🚀</span>
                  <span>Solusi Permanen Toko KEMANJAAN.ID: Sambungkan ke Supabase (100% Gratis &amp; Kuat 100+ Produk)</span>
                </p>
                <p>
                  1. Buat akun & project gratis di <strong>supabase.com</strong>.
                </p>
                <p>
                  2. Jalankan script SQL pembuatan tabel di tab <strong>SQL Editor</strong> Supabase.
                </p>
                <p>
                  3. Masukkan <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ke menu <strong>Settings → Environment Variables</strong> di Vercel.
                </p>
                <p className="text-emerald-700 font-semibold">
                  ✓ Setelah terhubung, status di atas akan langsung berubah menjadi <strong>⚡ SUPABASE POSTGRESQL AKTIF</strong>, katalog 100+ produk tidak akan pernah hilang lagi!
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <Download className="w-7 h-7 text-brand-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Export Backup Database (.JSON)
              </h3>
              <p className="text-xs text-slate-500">
                Unduh seluruh konfigurasi brand, logo, katalog produk, dan pesanan ke file komputer Anda.
              </p>
              <button
                onClick={handleExportJson}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition"
              >
                Download File Backup JSON
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <Upload className="w-7 h-7 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Restore / Import Database (.JSON)
              </h3>
              <p className="text-xs text-slate-500">
                Pulihkan atau pindahkan data toko dari file backup JSON dengan 1 klik.
              </p>
              <label className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center cursor-pointer transition">
                <span>Pilih File JSON untuk Import</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
              <RotateCcw className="w-7 h-7 text-rose-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                Reset ke Data Default Pabrik
              </h3>
              <p className="text-xs text-slate-500">
                Kembalikan contoh produk, banner, dan pengaturan ke kondisi awal demonstrasi.
              </p>
              <button
                onClick={resetToDefaultData}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
              >
                Reset Data Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="sticky top-0 z-20 px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {store.products.some((p) => p.id === editingProduct.id)
                  ? `Edit Produk: ${editingProduct.name}`
                  : "Tambah Produk Kosmetik Baru"}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductModal} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Produk *
                  </label>
                  <input
                    required
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    placeholder="Contoh: Toner Kemanjaan Glow Signature (100ml)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Merk / Brand
                  </label>
                  <select
                    value={editingProduct.brand}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        brand: e.target.value as PhoneProduct["brand"],
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-white"
                  >
                    {Array.from(
                      new Set([
                        ...(store.brands || []).map((b) => b.name),
                        editingProduct.brand,
                        "Lainnya",
                      ])
                    )
                      .filter(Boolean)
                      .map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Produk
                  </label>
                  <select
                    value={editingProduct.condition}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        condition: e.target.value as PhoneCondition,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white"
                  >
                    {Array.from(
                      new Set([
                        ...(store.categories || []).map((c) => c.name),
                        editingProduct.condition,
                      ])
                    )
                      .filter(Boolean)
                      .map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Label Jaminan / BPOM
                  </label>
                  <input
                    type="text"
                    value={editingProduct.warranty}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        warranty: e.target.value,
                      })
                    }
                    placeholder="100% Original & Terdaftar BPOM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        featured: e.target.checked,
                      })
                    }
                  />
                  <span>Tampilkan di Produk Unggulan</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-rose-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.flashSale}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        flashSale: e.target.checked,
                      })
                    }
                  />
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Masukkan ke Promo Flash Sale</span>
                </label>
              </div>

              {/* Product Images (Maksimal 5 Foto, Slider & Auto Resizer) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Galeri Foto Produk ({editingProduct.images.length}/5 Foto)
                      </label>
                      <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 text-[10px] font-extrabold">
                        Maksimal 5 Foto
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Foto pertama (Slot 1) adalah <strong>Foto Utama</strong> di katalog. Foto 2–5 tampil saat pembeli menggeser (slider) foto produk.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingProduct.images.length < 5 ? (
                      <label
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition shadow-sm ${
                          isCompressingImage
                            ? "bg-slate-400 cursor-not-allowed"
                            : "bg-brand-600 hover:bg-brand-700"
                        }`}
                      >
                        {isCompressingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengompres Foto...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Foto HP</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*,.heic,.heif,.webp,.png,.jpg,.jpeg"
                          multiple
                          disabled={isCompressingImage}
                          onChange={handleProductImageUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 text-xs font-bold">
                        Slot 5 Foto Penuh
                      </span>
                    )}
                  </div>
                </div>

                {/* 5-Slot Grid Preview */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                  {[0, 1, 2, 3, 4].map((slotIdx) => {
                    const imgUrl = editingProduct.images[slotIdx];
                    const isOccupied = Boolean(imgUrl);
                    const isPrimary = slotIdx === 0;

                    return (
                      <div
                        key={slotIdx}
                        className={`aspect-square rounded-xl border relative overflow-hidden flex flex-col justify-between p-1.5 transition ${
                          isOccupied
                            ? isPrimary
                              ? "border-brand-500 bg-white shadow-sm ring-2 ring-brand-500/20"
                              : "border-slate-300 bg-white shadow-sm"
                            : "border-2 border-dashed border-slate-300 bg-slate-100/60 items-center justify-center text-center text-slate-400"
                        }`}
                      >
                        {isOccupied ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl}
                              alt={`Foto Slot ${slotIdx + 1}`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Top Badge: Slot Label & Delete */}
                            <div className="relative z-10 flex items-center justify-between w-full">
                              <span
                                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow ${
                                  isPrimary
                                    ? "bg-amber-500 text-slate-950 font-black"
                                    : "bg-slate-900/80 text-white"
                                }`}
                              >
                                {isPrimary ? "★ Foto 1 (Utama)" : `Foto ${slotIdx + 1}`}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleRemoveProductImageSlot(slotIdx)}
                                className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs flex items-center justify-center shadow"
                                title="Hapus foto ini"
                              >
                                ×
                              </button>
                            </div>

                            {/* Bottom Controls: Move & Set Primary */}
                            <div className="relative z-10 flex items-center justify-between w-full mt-auto pt-1 bg-slate-950/60 backdrop-blur-xs rounded-lg px-1 py-0.5">
                              {slotIdx > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(slotIdx)}
                                  className="text-[9px] font-bold text-amber-300 hover:text-amber-100 flex items-center gap-0.5"
                                  title="Jadikan Foto Utama (Slot 1)"
                                >
                                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                                  <span>Utamakan</span>
                                </button>
                              ) : (
                                <span className="text-[9px] font-bold text-emerald-300">
                                  Thumbnail Aktif
                                </span>
                              )}

                              <div className="flex items-center gap-1">
                                {slotIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(slotIdx, "left")}
                                    className="p-0.5 rounded text-white/90 hover:text-white hover:bg-white/20"
                                    title="Pindahkan ke kiri"
                                  >
                                    <ChevronLeft className="w-3 h-3" />
                                  </button>
                                )}
                                {slotIdx < editingProduct.images.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(slotIdx, "right")}
                                    className="p-0.5 rounded text-white/90 hover:text-white hover:bg-white/20"
                                    title="Pindahkan ke kanan"
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1 p-2">
                            <ImageIcon className="w-6 h-6 text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-400">
                              Slot {slotIdx + 1}
                            </span>
                            <span className="text-[9px] text-slate-400">Kosong</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Additional URL Input for Convenience */}
                {editingProduct.images.length < 5 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      value={newImageUrlInput}
                      onChange={(e) => setNewImageUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      placeholder="Atau tempel link URL foto langsung (https://...)"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-brand-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shrink-0"
                    >
                      + Tambah URL
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    <strong>Kompresor Otomatis Aktif:</strong> File foto kamera berukuran besar (10MB–20MB) dari iPhone/Samsung otomatis disesuaikan ukurannya secara lokal menjadi ~100KB agar website cepat & hemat penyimpanan.
                  </span>
                </div>
              </div>

              {/* Variants Editor */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Varian / Shade / Ukuran & Harga ({editingProduct.variants.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newVar: PhoneVariant = {
                        id: `v-${Date.now()}`,
                        ram: "Varian Baru",
                        storage: "50ml",
                        color: "Original",
                        colorHex: "#1e293b",
                        price: editingProduct.variants[0]?.price || 45000,
                        originalPrice:
                          editingProduct.variants[0]?.originalPrice || 59000,
                        stock: 3,
                      };
                      setEditingProduct({
                        ...editingProduct,
                        variants: [...editingProduct.variants, newVar],
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                  >
                    + Tambah Varian
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editingProduct.variants.map((v, idx) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-2 sm:grid-cols-7 gap-2 bg-white p-3 rounded-xl border border-slate-200 items-center"
                    >
                      <input
                        type="text"
                        value={v.ram}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, ram: e.target.value };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Varian/Shade"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={v.storage}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, storage: e.target.value };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Ukuran (50ml)"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={v.color}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, color: e.target.value };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Keterangan"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                      <input
                        type="number"
                        step={50000}
                        value={v.originalPrice || ""}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, originalPrice: Number(e.target.value) || 0 };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Harga Coret (Rp)"
                        title="Harga Asli Sebelum Diskon (Dicoret)"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 line-through"
                      />
                      <input
                        type="number"
                        step={50000}
                        value={v.price}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, price: Number(e.target.value) || 0 };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Harga Promo"
                        title="Harga Jual Aktif Toko"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-rose-600"
                      />
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const next = [...editingProduct.variants];
                          next[idx] = { ...v, stock: Number(e.target.value) || 0 };
                          setEditingProduct({ ...editingProduct, variants: next });
                        }}
                        placeholder="Stok"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                      />
                      {editingProduct.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              variants: editingProduct.variants.filter(
                                (_, i) => i !== idx
                              ),
                            })
                          }
                          className="text-rose-600 text-xs font-bold justify-self-end px-2"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* QC & Inspection Report */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Jaminan Keaslian, BPOM & Kemasan Produk
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Keaslian Produk
                    </label>
                    <input
                      type="text"
                      value={editingProduct.inspection.batteryHealth}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inspection: {
                            ...editingProduct.inspection,
                            batteryHealth: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Status BPOM / Halal
                    </label>
                    <select
                      value={editingProduct.inspection.imeiStatus}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inspection: {
                            ...editingProduct.inspection,
                            imeiStatus: e.target
                              .value as PhoneProduct["inspection"]["imeiStatus"],
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="Terdaftar BPOM & Halal">
                        Terdaftar BPOM &amp; Halal
                      </option>
                      <option value="BPOM Approved">BPOM Approved</option>
                      <option value="Halal & Higienis">Halal &amp; Higienis</option>
                      <option value="QC Lolos Toko Kemanjaan">
                        QC Lolos Toko Kemanjaan
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Kondisi Kemasan
                    </label>
                    <input
                      type="text"
                      value={editingProduct.inspection.bodyCondition}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inspection: {
                            ...editingProduct.inspection,
                            bodyCondition: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Isi Paket Pembelian (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={completenessText}
                    onChange={(e) => setCompletenessText(e.target.value)}
                    placeholder="1x Produk Original, Segel Kemasan Resmi, Pouch"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Manfaat Utama
                  </label>
                  <input
                    type="text"
                    value={editingProduct.specs.screen}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        specs: { ...editingProduct.specs, screen: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kandungan Aktif
                  </label>
                  <input
                    type="text"
                    value={editingProduct.specs.processor}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        specs: {
                          ...editingProduct.specs,
                          processor: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cocok Untuk
                  </label>
                  <input
                    type="text"
                    value={editingProduct.specs.camera}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        specs: { ...editingProduct.specs, camera: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ukuran / Netto
                  </label>
                  <input
                    type="text"
                    value={editingProduct.specs.battery}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        specs: { ...editingProduct.specs, battery: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Lengkap Produk
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Produk ke Katalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

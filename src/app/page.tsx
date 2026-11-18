"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import Navbar from "@/components/Navbar";
import ProductDetailModal from "@/components/ProductDetailModal";
import CompareModal from "@/components/CompareModal";
import CartCheckoutDrawer from "@/components/CartCheckoutDrawer";
import LivePurchaseNotification from "@/components/LivePurchaseNotification";
import AllBrandsModal from "@/components/AllBrandsModal";
import { PhoneProduct } from "@/types/store";
import {
  buildWhatsAppUrl,
  formatRupiah,
  getConditionBadgeStyle,
} from "@/utils/format";
import {
  ShieldCheck,
  Sparkles,
  Heart,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  MapPin,
  Clock,
  MessageCircle,
  CheckCircle2,
  X,
  ArrowRight,
  Flame,
  Lock,
  Navigation,
  Copy,
  ExternalLink,
  Home,
  BadgeCheck,
  Store,
  LayoutGrid,
} from "lucide-react";

const STORE_GALLERY = [
  {
    image: "/assets/storefront-gmaps.jpg",
    title: "Fasad Toko Kosmetik Kemanjaan",
    subtitle: "Pilar putih-emas & papan brand resmi di Tanjung Laut Indah",
  },
  {
    image: "/assets/gallery-wall-of-beauty.jpg",
    title: "Hanasui & Wall of Beauty",
    subtitle: "Etalase serum, sunscreen, eyeshadow palette & brush",
  },
  {
    image: "/assets/gallery-bags-accessories.jpg",
    title: "Rak Tas Cantik & Aksesoris",
    subtitle: "Koleksi sling bag, pouch & set kuas makeup lengkap",
  },
  {
    image: "/assets/gallery-team-pink.jpg",
    title: "Tim Kemanjaan Siap Membantu",
    subtitle: "Suasana ceria tim Kemanjaan di depan rak skincare",
  },
  {
    image: "/assets/gallery-beauty-talk.jpg",
    title: "Beauty Talk Diaries Q&A",
    subtitle: "Sharing tips skincare & konsultasi shade terpercaya",
  },
  {
    image: "/assets/gallery-store-interior.jpg",
    title: "Interior Toko Luas & Nyaman",
    subtitle: "Dekat Pelabuhan Bontang dengan produk lengkap harga murah",
  },
];

function formatSoldShort(sold: number): string {
  if (sold >= 1000) {
    return `${(sold / 1000).toFixed(1).replace(".0", "")}rb+`;
  }
  return `${sold}+`;
}

export default function HomePage() {
  const {
    store,
    cart,
    addToCart,
    wishlist,
    toggleWishlist,
    compareIds,
    toggleCompare,
    toastMessage,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"catalog" | "admin">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("ALL");
  const [onlyFlashSale, setOnlyFlashSale] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "popular">(
    "featured"
  );
  const [mobileCols, setMobileCols] = useState<2 | 3>(2);

  // Modals & Drawers
  const [detailProduct, setDetailProduct] = useState<PhoneProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAllBrandsOpen, setIsAllBrandsOpen] = useState(false);

  // Pagination (shows 12 initially, loads +12 more seamlessly)
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedBrand, selectedCondition, selectedPriceRange, onlyFlashSale, searchQuery, sortBy]);

  const categories = store.categories || [];
  const brands = store.brands || [];

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: store.products.length };
    store.products.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [store.products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: store.products.length };
    store.products.forEach((p) => {
      counts[p.condition] = (counts[p.condition] || 0) + 1;
    });
    return counts;
  }, [store.products]);

  const filteredProducts = useMemo(() => {
    return store.products
      .filter((p) => {
        if (selectedBrand !== "ALL" && p.brand !== selectedBrand) return false;
        if (selectedCondition !== "ALL" && p.condition !== selectedCondition) return false;
        if (onlyFlashSale && !p.flashSale) return false;

        const primaryPrice = p.variants[0]?.price || 0;
        if (selectedPriceRange === "under50k" && primaryPrice >= 50000) return false;
        if (selectedPriceRange === "50k-100k" && (primaryPrice < 50000 || primaryPrice > 100000))
          return false;
        if (selectedPriceRange === "above100k" && primaryPrice <= 100000) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const haystack = [
            p.name,
            p.brand,
            p.condition,
            p.description,
            p.specs.processor,
            ...p.variants.map((v) => `${v.ram} ${v.storage} ${v.color}`),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        const priceA = a.variants[0]?.price || 0;
        const priceB = b.variants[0]?.price || 0;
        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "popular") return b.soldCount - a.soldCount;
        return Number(b.featured) - Number(a.featured) || b.soldCount - a.soldCount;
      });
  }, [
    store.products,
    selectedBrand,
    selectedCondition,
    selectedPriceRange,
    onlyFlashSale,
    searchQuery,
    sortBy,
  ]);

  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const wishlistProducts = store.products.filter((p) => wishlist.includes(p.id));

  // Floating Cart Totals for Instant WhatsApp Conversion
  const cartQtyTotal = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => acc + i.variant.price * i.quantity, 0);
  const quickCartWaMessage = [
    `✨ *PESANAN KEMANJAAN.ID* ✨`,
    `Halo Kak Admin *${store.brandConfig.name}*, saya mau pesan produk berikut:`,
    ``,
    ...cart.map(
      (i, idx) =>
        `${idx + 1}. *${i.product.name}* (${i.variant.ram}) × ${i.quantity} = *${formatRupiah(i.variant.price * i.quantity)}*`
    ),
    ``,
    `💰 *Total Estimasi: ${formatRupiah(cartSubtotal)}*`,
    `Mohon info ketersediaan stok ya Kak! 💛`,
  ].join("\n");

  const hasActiveFilters =
    selectedBrand !== "ALL" ||
    selectedCondition !== "ALL" ||
    selectedPriceRange !== "ALL" ||
    onlyFlashSale ||
    searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Compact Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenWishlistModal={() => setIsWishlistOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === "catalog" && (
          <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-2 pb-8 space-y-2.5 sm:space-y-5">
            {/* ========================================================
                ULTRA-COMPACT ABOVE-THE-FOLD FILTER BAR (Mobile & Desktop)
                Ensures 6-8+ products appear immediately before scrolling!
               ======================================================== */}
            <div id="catalog-section" className="space-y-1.5">
              {/* Row 1: Filter Modal Trigger + Dynamic Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                <button
                  onClick={() => setIsAllBrandsOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] sm:text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-xs border border-amber-500/30 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </button>

                <button
                  onClick={() => setSelectedCondition("ALL")}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition ${
                    selectedCondition === "ALL"
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Semua ({store.products.length})
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCondition(cat.name)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold shrink-0 flex items-center gap-1 transition ${
                      selectedCondition === cat.name
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className="opacity-70 text-[10px]">
                      ({categoryCounts[cat.name] || 0})
                    </span>
                  </button>
                ))}
              </div>

              {/* Row 2: Dynamic Brand Chips + Promo Toggle + Mobile Grid Density & Sort */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
                  <button
                    onClick={() => setOnlyFlashSale(!onlyFlashSale)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-extrabold shrink-0 flex items-center gap-1 transition ${
                      onlyFlashSale
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    <Flame className="w-3 h-3" />
                    <span>Promo</span>
                  </button>

                  <button
                    onClick={() => setSelectedBrand("ALL")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold shrink-0 transition ${
                      selectedBrand === "ALL"
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Semua Brand
                  </button>

                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.name)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold shrink-0 flex items-center gap-1 transition ${
                        selectedBrand === b.name
                          ? "bg-slate-900 text-amber-300"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{b.icon}</span>
                      <span>{b.name}</span>
                    </button>
                  ))}
                </div>

                {/* Right Controls: Mobile 2/3 Col Switcher + Sort */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileCols(mobileCols === 2 ? 3 : 2)}
                    className="sm:hidden px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1"
                    title="Ubah tampilan jumlah kolom produk"
                  >
                    <LayoutGrid className="w-3 h-3 text-brand-600" />
                    <span>{mobileCols === 2 ? "2 Kol" : "3 Kol"}</span>
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10px] sm:text-xs font-bold text-slate-700 outline-none"
                    aria-label="Urutkan produk"
                  >
                    <option value="featured">Unggulan</option>
                    <option value="popular">Terlaris</option>
                    <option value="price-asc">Termurah</option>
                    <option value="price-desc">Termahal</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Status Indicator (only shown when filtered) */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between text-[11px] bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-slate-600 font-medium truncate">
                    Menampilkan <strong>{filteredProducts.length}</strong> produk
                    {selectedCondition !== "ALL" ? ` • ${selectedCondition}` : ""}
                    {selectedBrand !== "ALL" ? ` • ${selectedBrand}` : ""}
                    {onlyFlashSale ? " • Promo" : ""}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBrand("ALL");
                      setSelectedCondition("ALL");
                      setSelectedPriceRange("ALL");
                      setOnlyFlashSale(false);
                      setSearchQuery("");
                    }}
                    className="text-rose-600 font-extrabold hover:underline shrink-0 ml-2"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* ========================================================
                HIGH-CONVERSION COMPACT PRODUCT GRID
                Displays 6-8+ cards above the fold on Mobile & Desktop!
               ======================================================== */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800">
                  Produk tidak ditemukan
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Coba reset filter atau chat langsung Admin WhatsApp kami untuk tanya stok produk yang Kakak cari.
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedBrand("ALL");
                      setSelectedCondition("ALL");
                      setSelectedPriceRange("ALL");
                      setOnlyFlashSale(false);
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                  >
                    Reset Filter
                  </button>
                  <a
                    href={buildWhatsAppUrl(
                      store.brandConfig.whatsappNumber,
                      `Halo Admin *${store.brandConfig.name}*, saya mau tanya produk "${searchQuery}". Apakah ready Kak?`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Tanya via WA</span>
                  </a>
                </div>
              </div>
            ) : (
              <div
                className={`grid ${
                  mobileCols === 3 ? "grid-cols-3" : "grid-cols-2"
                } sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5`}
              >
                {displayedProducts.map((product) => {
                  const primaryVariant = product.variants[0];
                  const badge = getConditionBadgeStyle(product.condition, categories);
                  const isWished = wishlist.includes(product.id);
                  const isCompared = compareIds.includes(product.id);
                  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

                  const cardOriginal =
                    primaryVariant?.originalPrice ||
                    Math.round((primaryVariant?.price || 0) * 1.15);
                  const cardPrice = primaryVariant?.price || 0;
                  const cardSavings = cardOriginal > cardPrice ? cardOriginal - cardPrice : 0;
                  const cardPct =
                    cardOriginal > cardPrice ? Math.round((cardSavings / cardOriginal) * 100) : 0;

                  const directWaMessage = `Halo Admin *${store.brandConfig.name}*, saya mau pesan:\n\n🛍️ *${product.name}*\n• Brand: ${product.brand}\n• Varian: ${primaryVariant?.ram || "Standard"} (${primaryVariant?.storage || ""})\n• Harga: ${formatRupiah(cardPrice)}\n\nApakah masih ready Kak?`;

                  return (
                    <article
                      key={product.id}
                      data-product-card="true"
                      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-500/60 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Compact Image Container (80px Mobile / 128px Desktop) */}
                        <div className="relative h-20 sm:h-32 bg-slate-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            onClick={() => setDetailProduct(product)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          />

                          {/* Top Left Category + Discount Badges */}
                          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex items-center gap-1 flex-wrap max-w-[78%]">
                            <span
                              className={`text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md truncate ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.shortLabel}
                            </span>
                            {cardPct > 0 && (
                              <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                                -{cardPct}%
                              </span>
                            )}
                          </div>

                          {/* Top Right Wishlist & Compare */}
                          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex flex-col gap-1">
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className={`p-1 sm:p-1.5 rounded-full backdrop-blur-md shadow-xs transition ${
                                isWished
                                  ? "bg-rose-600 text-white"
                                  : "bg-white/90 text-slate-700 hover:bg-white"
                              }`}
                              title="Simpan ke Favorit"
                            >
                              <Heart
                                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                                  isWished ? "fill-white" : ""
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => toggleCompare(product.id)}
                              className={`hidden sm:flex p-1.5 rounded-full backdrop-blur-md shadow-xs transition ${
                                isCompared
                                  ? "bg-brand-600 text-white"
                                  : "bg-white/90 text-slate-700 hover:bg-white"
                              }`}
                              title="Bandingkan Produk"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Bottom Strip: BPOM & Terjual */}
                          <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1 bg-slate-950/80 backdrop-blur-md text-white px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[10px]">
                            <span className="flex items-center gap-0.5 font-semibold text-emerald-300 truncate">
                              <BadgeCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                              <span className="truncate">BPOM</span>
                            </span>
                            <span className="text-amber-300 font-bold shrink-0">
                              🔥 {formatSoldShort(product.soldCount)}
                            </span>
                          </div>
                        </div>

                        {/* Compact Card Body */}
                        <div className="p-1.5 sm:p-2.5 space-y-1">
                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500">
                            <span className="font-bold uppercase tracking-wider truncate max-w-[68%]">
                              {product.brand}
                            </span>
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400" />
                              {product.rating.toFixed(1)}
                            </span>
                          </div>

                          <h3
                            onClick={() => setDetailProduct(product)}
                            className="text-[11px] sm:text-xs font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-1 leading-snug"
                            title={product.name}
                          >
                            {product.name}
                          </h3>

                          {/* Compact Variant + Stock Row */}
                          <div className="flex items-center justify-between gap-1">
                            {primaryVariant && (
                              <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 truncate max-w-[70%]">
                                <span
                                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: primaryVariant.colorHex || "#E87A90" }}
                                />
                                <span className="truncate">{primaryVariant.ram}</span>
                              </span>
                            )}
                            <span className="text-[8px] sm:text-[10px] font-bold text-emerald-700 shrink-0">
                              Stok {totalStock}
                            </span>
                          </div>

                          {/* Compact Price Row */}
                          <div className="flex items-baseline gap-1.5 pt-0.5">
                            <span className="text-xs sm:text-base font-black text-rose-600">
                              {formatRupiah(cardPrice)}
                            </span>
                            {cardOriginal > cardPrice && (
                              <span className="text-[9px] sm:text-[11px] text-slate-400 line-through truncate">
                                {formatRupiah(cardOriginal)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* High-Conversion Action Footer */}
                      <div className="px-1.5 pb-1.5 sm:px-2.5 sm:pb-2.5 grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          disabled={!primaryVariant || primaryVariant.stock <= 0}
                          onClick={() =>
                            primaryVariant && addToCart(product, primaryVariant, 1)
                          }
                          className="py-1.5 px-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] sm:text-[11px] flex items-center justify-center gap-0.5 transition disabled:opacity-50"
                        >
                          <ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 shrink-0" />
                          <span className="truncate">+Keranjang</span>
                        </button>

                        <a
                          href={buildWhatsAppUrl(
                            store.brandConfig.whatsappNumber,
                            directWaMessage
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[9px] sm:text-[11px] flex items-center justify-center gap-0.5 shadow-xs transition"
                        >
                          <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                          <span className="truncate">Pesan WA</span>
                        </a>
                      </div>
                    </article>
                  );
                })}

                {/* Load More Pagination */}
                {filteredProducts.length > visibleCount && (
                  <div className="col-span-full pt-3 pb-1 text-center space-y-1.5">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 12)}
                      className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-500/25 transition active:scale-95 inline-flex items-center gap-2"
                    >
                      <span>Muat Lebih Banyak Produk (+12 Produk)</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">
                        Sisa {filteredProducts.length - visibleCount}
                      </span>
                    </button>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Menampilkan <strong>{Math.min(visibleCount, filteredProducts.length)}</strong>{" "}
                      dari <strong>{filteredProducts.length}</strong> produk
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                BELOW-THE-FOLD BRAND PROMOS, TRUST BADGES, KEDAI & GALLERY
               ======================================================== */}
            <div className="pt-6 border-t border-slate-200/80 space-y-6">
              {/* Hero Promo Banners */}
              {store.banners.filter((b) => b.active).length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {store.banners
                    .filter((b) => b.active)
                    .slice(0, 2)
                    .map((banner, idx) => (
                      <div
                        key={banner.id}
                        className={`${
                          idx === 0 ? "lg:col-span-7" : "lg:col-span-5"
                        } rounded-3xl bg-gradient-to-br ${
                          banner.bgGradient
                        } text-white p-5 sm:p-7 relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[210px] border border-amber-400/25`}
                      >
                        <div className="relative z-10 max-w-md space-y-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-[10px] font-extrabold uppercase tracking-wider text-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            {banner.badge}
                          </span>
                          <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
                            {banner.title}
                          </h2>
                          <p className="text-xs text-white/85 leading-relaxed">
                            {banner.subtitle}
                          </p>
                        </div>

                        <div className="relative z-10 pt-4 flex flex-wrap items-center gap-2.5">
                          <button
                            onClick={() => {
                              if (banner.ctaFilterBrand) {
                                setSelectedBrand(banner.ctaFilterBrand);
                              }
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-amber-50 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
                          >
                            <span>{banner.ctaText}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
                          </button>
                          <a
                            href={buildWhatsAppUrl(
                              store.brandConfig.whatsappNumber,
                              `Halo Admin *${store.brandConfig.name}*, saya mau konsultasi dan pesan produk via WhatsApp.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chat WA</span>
                          </a>
                        </div>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="hidden sm:block absolute -right-4 -bottom-4 w-48 h-48 object-cover rounded-3xl opacity-30 rotate-3 pointer-events-none"
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {store.brandConfig.trustBadges.map((tb, i) => (
                  <div
                    key={i}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900">{tb.title}</h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        {tb.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Kedai Kemanjaan Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-zinc-900 to-rose-950 text-white p-5 sm:p-6 border border-amber-500/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/logo-kedai.png"
                    alt="Logo Kedai Kemanjaan"
                    className="w-14 h-14 rounded-full border-2 border-amber-400 object-cover shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                      Sister Brand • Buka 12.00 – 20.00 WITA
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Kedai Kemanjaan (@kedaikemanjaan)
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                      Snack &amp; minuman creamy segar di samping Toko Kosmetik Kemanjaan! Bisa gabung orderan skincare via WhatsApp.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/assets/pricelist-highlight.jpg"
                    alt="Menu Kedai Kemanjaan"
                    className="w-11 h-11 rounded-full border-2 border-rose-300 object-cover hidden sm:block"
                  />
                  <a
                    href={buildWhatsAppUrl(
                      store.brandConfig.whatsappNumber,
                      `Halo Admin *Kedai Kemanjaan*, saya mau pesan Snack & Minuman dari @kedaikemanjaan!`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Pesan Kedai via WA</span>
                  </a>
                </div>
              </div>

              {/* Authentic Store Gallery */}
              <div id="store-gallery" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <Store className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
                      <span>Suasana Asli Toko &amp; Ulasan Google Maps (4.5 ★)</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      Dokumentasi langsung dari Google Maps &amp; Instagram @kemanjaan.id (17.8K+ Followers)
                    </p>
                  </div>
                  <a
                    href="https://www.instagram.com/kemanjaan.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-extrabold text-brand-600 hover:underline shrink-0"
                  >
                    @kemanjaan.id &rarr;
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {STORE_GALLERY.map((g, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                    >
                      <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={g.image} alt={g.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <h4 className="text-[11px] font-extrabold text-slate-900 line-clamp-1">
                          {g.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">
                          {g.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Highlight Quote + Maps Link */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="text-amber-500 text-xs font-black">
                    ★★★★★ 4.5 / 5 Rating Google Maps (16 Ulasan)
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic">
                    &ldquo;Barangnya murah-murah, bagus banget, lengkap lagii! Toko kosmetik ter-best di Bontang 💗 — Dekat dari pelabuhan, tokonya luas!&rdquo;
                  </p>
                  <span className="text-[11px] text-slate-400 font-semibold block">
                    — Vera Vera &amp; Pelanggan Setia Bontang
                  </span>
                </div>
                <a
                  href={store.brandConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Buka Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />

      <CartCheckoutDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <AllBrandsModal
        isOpen={isAllBrandsOpen}
        onClose={() => setIsAllBrandsOpen(false)}
        selectedBrand={selectedBrand}
        onSelectBrand={(brand) => {
          setSelectedBrand(brand);
          setIsAllBrandsOpen(false);
        }}
        selectedCondition={selectedCondition}
        onSelectCondition={(cond) => {
          setSelectedCondition(cond);
          setIsAllBrandsOpen(false);
        }}
        selectedPriceRange={selectedPriceRange}
        onSelectPriceRange={(range) => {
          setSelectedPriceRange(range);
          setIsAllBrandsOpen(false);
        }}
        brandCounts={brandCounts}
        categoryCounts={categoryCounts}
        totalProducts={store.products.length}
      />

      {/* Wishlist Modal */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                Produk Favorit Saya ({wishlistProducts.length})
              </h3>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {wishlistProducts.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">
                Belum ada produk yang disimpan ke daftar favorit.
              </p>
            ) : (
              <div className="space-y-3">
                {wishlistProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-900 truncate">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">{p.condition}</p>
                        <p className="text-xs font-black text-brand-700">
                          {formatRupiah(p.variants[0]?.price || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setIsWishlistOpen(false);
                          setDetailProduct(p);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold"
                      >
                        Lihat
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-28 lg:bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STICKY FLOATING WHATSAPP CHECKOUT BAR (When Cart Has Items) */}
      {cartQtyTotal > 0 && (
        <div
          id="stickyWaCartBar"
          className="fixed bottom-16 lg:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-20px)] max-w-xl bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-2.5 sm:p-3 border border-amber-400/50 shadow-2xl flex items-center justify-between gap-2"
        >
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="text-left min-w-0 flex-1 pl-1"
          >
            <div className="text-[10px] sm:text-xs text-amber-300 font-bold truncate">
              🛍️ {cartQtyTotal} Produk di Keranjang WA
            </div>
            <div className="text-xs sm:text-sm font-black text-white truncate">
              Total: {formatRupiah(cartSubtotal)}{" "}
              <span className="text-[10px] text-slate-400 font-medium underline ml-1">
                Edit
              </span>
            </div>
          </button>

          <a
            href={buildWhatsAppUrl(store.brandConfig.whatsappNumber, quickCartWaMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-lg shrink-0 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Pesan via WA</span>
          </a>
        </div>
      )}

      {/* Floating WhatsApp CS (Desktop when cart is empty) */}
      {cartQtyTotal === 0 && (
        <a
          href={buildWhatsAppUrl(
            store.brandConfig.whatsappNumber,
            `Halo Admin *${store.brandConfig.name}*, saya mau konsultasi produk atau pesan via WhatsApp.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl shadow-xl shadow-emerald-600/30 items-center gap-2 text-xs font-extrabold transition hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Chat &amp; Pesan WA</span>
        </a>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 border-t border-amber-500/30 mt-8 pb-24 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              {store.brandConfig.logoUrl ? (
                <div className="w-11 h-11 rounded-full border-2 border-amber-400 bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={store.brandConfig.logoUrl}
                    alt={store.brandConfig.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black flex items-center justify-center">
                  {store.brandConfig.logoTextIcon || "KM"}
                </div>
              )}
              <div>
                <span className="text-lg font-extrabold text-amber-300 block leading-tight">
                  {store.brandConfig.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  Toko Kosmetik Viral Dengan Harga Murah
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {store.brandConfig.tagline}. Owner: @liinaaaaaaae &bull; IG @kemanjaan.id &amp; @kedaikemanjaan.
            </p>
            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-300 font-medium">
                    {store.brandConfig.storeAddress}
                  </span>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={
                        store.brandConfig.mapsUrl ||
                        `https://maps.google.com/?q=${encodeURIComponent(
                          store.brandConfig.storeAddress
                        )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-[11px] font-bold border border-slate-700 shadow-sm transition"
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>Buka di Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        const targetMapsUrl =
                          store.brandConfig.mapsUrl ||
                          `https://maps.google.com/?q=${encodeURIComponent(
                            store.brandConfig.storeAddress
                          )}`;
                        navigator.clipboard.writeText(
                          `${store.brandConfig.name}\nAlamat: ${store.brandConfig.storeAddress}\nGoogle Maps: ${targetMapsUrl}`
                        );
                        showToast("Alamat & Link Google Maps berhasil disalin!");
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium border border-slate-700/80 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Link Maps</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 text-slate-400">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{store.brandConfig.operationalHours}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-xs">
            <h4 className="font-extrabold text-white uppercase tracking-wider">Kategori</h4>
            <ul className="space-y-2 text-slate-400">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelectedCondition(c.name);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-white transition"
                  >
                    {c.icon} {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-extrabold text-white uppercase tracking-wider">
              Pemesanan Langsung via WhatsApp
            </h4>
            <p className="text-slate-400 leading-relaxed">
              Pilih produk dari katalog, klik tombol <strong>Pesan WA</strong> atau kumpulkan di <strong>Keranjang WA</strong>. Tidak perlu checkout &amp; hitung ongkir di web — Admin siap layani langsung di WhatsApp!
            </p>
            <div className="pt-1">
              <a
                href={buildWhatsAppUrl(
                  store.brandConfig.whatsappNumber,
                  `Halo Admin *${store.brandConfig.name}*, saya ingin tanya stok & promo kosmetik hari ini.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WhatsApp (0821-5406-5176)</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800/80 py-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <span>
            &copy; {new Date().getFullYear()} {store.brandConfig.name}. All rights reserved.
          </span>
          <a
            href="/admin"
            className="text-slate-600 hover:text-slate-400 transition ml-1 inline-flex items-center"
            title="Akses Panel Admin"
          >
            <Lock className="w-3 h-3 opacity-30 hover:opacity-100" />
          </a>
        </div>
      </footer>

      {/* Live Social Proof Notification */}
      <LivePurchaseNotification
        products={store.products}
        onSelectProduct={(p) => setDetailProduct(p)}
      />

      {/* MOBILE BOTTOM APP NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => {
            setActiveTab("catalog");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-brand-600 transition"
        >
          <Home className="w-4 h-4" />
          <span>Katalog</span>
        </button>

        <button
          onClick={() => setIsAllBrandsOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-slate-600 hover:text-brand-600 transition"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Kategori</span>
        </button>

        <button
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-slate-500 hover:text-rose-600 transition"
        >
          <Heart className="w-4 h-4" />
          <span>Favorit</span>
          {wishlist.length > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
              {wishlist.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-slate-500 hover:text-brand-600 transition"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Keranjang</span>
          {cartQtyTotal > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-black flex items-center justify-center">
              {cartQtyTotal}
            </span>
          )}
        </button>

        <a
          href={buildWhatsAppUrl(
            store.brandConfig.whatsappNumber,
            cartQtyTotal > 0
              ? quickCartWaMessage
              : `Halo Admin *${store.brandConfig.name}*, saya mau konsultasi & pesan produk kosmetik.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 transition"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Pesan WA</span>
        </a>
      </div>
    </div>
  );
}

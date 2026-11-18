"use client";

import React, { useState, useEffect } from "react";
import { PhoneProduct } from "@/types/store";
import { useStore } from "@/context/StoreContext";
import {
  buildWhatsAppUrl,
  formatRupiah,
  getConditionBadgeStyle,
} from "@/utils/format";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Star,
  Box,
  FlaskConical,
  Droplets,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ProductDetailModalProps {
  product: PhoneProduct | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onOpenCart,
}: ProductDetailModalProps) {
  const { store, addToCart } = useStore();
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    setSelectedVariantIdx(0);
    setActiveImageIdx(0);
  }, [product?.id]);

  if (!product) return null;

  const currentVariant =
    product.variants[selectedVariantIdx] || product.variants[0];
  const badgeStyle = getConditionBadgeStyle(product.condition, store.categories);
  const images =
    product.images.length > 0 ? product.images : ["/assets/storefront-gmaps.jpg"];

  const handleAddToCartAndOpen = () => {
    addToCart(product, currentVariant, 1);
    onClose();
    onOpenCart();
  };

  const waMessage = `Halo Admin *${store.brandConfig.name}*, saya mau pesan produk ini:\n\n🛍️ *${product.name}*\n• Brand: ${product.brand}\n• Kategori: ${product.condition}\n• Varian/Shade: ${currentVariant.ram} (${currentVariant.storage})\n• Harga: ${formatRupiah(currentVariant.price)}\n\nApakah stok masih tersedia Kak?`;

  const origPrice =
    currentVariant.originalPrice || Math.round(currentVariant.price * 1.15);
  const savingsPct =
    origPrice > currentVariant.price
      ? Math.round(((origPrice - currentVariant.price) / origPrice) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur border-b border-slate-100">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 text-white">
              {product.brand}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              {product.condition}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            aria-label="Tutup detail produk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column: Image Gallery Slider */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStart === null) return;
                const touchEnd = e.changedTouches[0].clientX;
                const diff = touchStart - touchEnd;
                if (diff > 35) {
                  setActiveImageIdx((prev) => (prev + 1) % images.length);
                } else if (diff < -35) {
                  setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
                }
                setTouchStart(null);
              }}
              className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group select-none shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImageIdx] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover bg-white transition-opacity duration-200"
              />

              {product.flashSale && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> PROMO SPESIAL
                </div>
              )}

              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                  📷 {activeImageIdx + 1}/{images.length}
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition"
                    title="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev + 1) % images.length);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition"
                    title="Foto Berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.slice(0, 5).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIdx === i
                        ? "border-brand-600 ring-2 ring-brand-500/20 scale-105"
                        : "border-slate-200 opacity-65 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Jaminan Keaslian & BPOM */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Jaminan Keaslian &amp; BPOM</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {product.inspection.batteryHealth}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Status BPOM / Legal</span>
                  <strong className="text-emerald-700">{product.inspection.imeiStatus}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Kondisi Kemasan</span>
                  <strong className="text-slate-800">{product.inspection.bodyCondition}</strong>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[11px] text-slate-400 block mb-1.5 flex items-center gap-1">
                  <Box className="w-3.5 h-3.5" /> Isi Paket Pembelian:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.inspection.completeness.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Variant Picker, Specs & Direct WA Ordering */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    {product.rating.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{product.soldCount.toLocaleString("id-ID")} terjual</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">{product.warranty}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {product.name}
                </h2>
              </div>

              {/* Price Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-rose-50/40 border border-brand-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block">
                    Harga Promo Toko Kemanjaan
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-rose-600">
                      {formatRupiah(currentVariant.price)}
                    </span>
                    {origPrice > currentVariant.price && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatRupiah(origPrice)}
                      </span>
                    )}
                    {savingsPct > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-extrabold">
                        Hemat {savingsPct}%
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  Stok: {currentVariant.stock} Ready
                </span>
              </div>

              {/* Shade / Variant Selector */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-2.5">
                  Pilih Varian / Shade &amp; Ukuran:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((v, idx) => {
                    const active = idx === selectedVariantIdx;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                          active
                            ? "border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-5 h-5 rounded-full border border-slate-300 shrink-0 shadow-xs"
                            style={{ backgroundColor: v.colorHex || "#E87A90" }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-slate-900 truncate">
                              {v.ram} ({v.storage})
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{v.color}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <div className="text-xs font-black text-brand-700">
                            {formatRupiah(v.price)}
                          </div>
                          <div className="text-[10px] text-slate-400">Stok: {v.stock}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

              {/* Beauty Info Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[11px] block">Manfaat Utama</span>
                    <strong className="text-slate-800">{product.specs.screen}</strong>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <FlaskConical className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[11px] block">Kandungan Aktif</span>
                    <strong className="text-slate-800">{product.specs.processor}</strong>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <Droplets className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[11px] block">Cocok Untuk</span>
                    <strong className="text-slate-800">{product.specs.camera}</strong>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                  <PackageCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 text-[11px] block">Ukuran &amp; Tekstur</span>
                    <strong className="text-slate-800">
                      {product.specs.battery} • {product.specs.sim}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Ordering CTA Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
              <a
                href={buildWhatsAppUrl(store.brandConfig.whatsappNumber, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Pesan Langsung via WhatsApp</span>
              </a>

              <button
                type="button"
                disabled={currentVariant.stock <= 0}
                onClick={handleAddToCartAndOpen}
                className="py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ Keranjang WA</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

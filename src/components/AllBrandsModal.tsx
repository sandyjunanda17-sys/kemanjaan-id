"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { X, Sparkles, Check, RotateCcw } from "lucide-react";

interface AllBrandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  selectedPriceRange: string;
  onSelectPriceRange: (range: string) => void;
  brandCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  totalProducts: number;
}

const PRICE_RANGES = [
  { id: "ALL", label: "Semua Harga" },
  { id: "under50k", label: "Di bawah Rp 50rb" },
  { id: "50k-100k", label: "Rp 50rb - Rp 100rb" },
  { id: "above100k", label: "Di atas Rp 100rb" },
];

export default function AllBrandsModal({
  isOpen,
  onClose,
  selectedBrand,
  onSelectBrand,
  selectedCondition,
  onSelectCondition,
  selectedPriceRange,
  onSelectPriceRange,
  brandCounts,
  categoryCounts,
  totalProducts,
}: AllBrandsModalProps) {
  const { store } = useStore();
  if (!isOpen) return null;

  const categories = store.categories || [];
  const brands = store.brands || [];

  const handleReset = () => {
    onSelectBrand("ALL");
    onSelectCondition("ALL");
    onSelectPriceRange("ALL");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col justify-between">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Kategori, Brand &amp; Filter Harga
              </h3>
              <p className="text-[11px] text-slate-500">
                Pilih cepat dari {totalProducts} produk siap pesan via WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Section 1: Dynamic Categories */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span>Kategori Produk ({categories.length})</span>
              <span className="text-[10px] font-bold text-slate-400">
                Total {totalProducts} Produk
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onSelectCondition("ALL")}
                className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                  selectedCondition === "ALL"
                    ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <span>✨ Semua Kategori ({totalProducts})</span>
                {selectedCondition === "ALL" && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
              {categories.map((c) => {
                const isSelected = selectedCondition === c.name;
                const count = categoryCounts[c.name] ?? 0;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCondition(c.name)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      isSelected
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <span className="truncate">
                      {c.icon} {c.name} ({count})
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Dynamic Brand Grid */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
              Pilih Brand Resmi ({brands.length})
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onSelectBrand("ALL")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  selectedBrand === "ALL"
                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                    : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">✨</span>
                  {selectedBrand === "ALL" && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="mt-1.5">
                  <div className="text-xs font-black truncate">Semua Brand</div>
                  <div className="text-[10px] opacity-75">{totalProducts} Produk</div>
                </div>
              </button>

              {brands.map((b) => {
                const count = brandCounts[b.name] ?? 0;
                const isSelected = selectedBrand === b.name;

                return (
                  <button
                    key={b.id}
                    onClick={() => onSelectBrand(b.name)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-slate-900 border-slate-900 text-white shadow-md"
                        : "bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{b.icon}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="mt-1.5">
                      <div className="text-xs font-black truncate">{b.name}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {count} Produk
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Price Range */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-black uppercase tracking-wider text-slate-800">
              Rentang Harga
            </label>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((r) => {
                const isSelected = selectedPriceRange === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectPriceRange(r.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-5 py-3.5 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition active:scale-98"
          >
            <span>Terapkan Filter &amp; Lihat Produk</span>
          </button>
        </div>
      </div>
    </div>
  );
}

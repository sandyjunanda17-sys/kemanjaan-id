"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { buildWhatsAppUrl } from "@/utils/format";
import {
  ShoppingBag,
  Heart,
  SlidersHorizontal,
  ShieldCheck,
  Search,
  Sparkles,
  MessageCircle,
} from "lucide-react";

interface NavbarProps {
  activeTab?: "catalog" | "admin";
  setActiveTab?: (tab: "catalog" | "admin") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCart: () => void;
  onOpenCompare: () => void;
  onOpenWishlistModal: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenCart,
  onOpenCompare,
  onOpenWishlistModal,
}: NavbarProps) {
  const { store, cart, wishlist, compareIds } = useStore();
  const { brandConfig } = store;

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Slim 1-Line Announcement Bar */}
      {brandConfig.announcementActive && brandConfig.announcementBar && (
        <div className="bg-slate-950 text-amber-200 text-[10px] sm:text-xs py-1 px-3 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold truncate">
              <Sparkles className="w-3 h-3 shrink-0 text-amber-400" />
              <span className="truncate">{brandConfig.announcementBar}</span>
            </div>
            <div className="hidden md:flex items-center gap-2.5 text-[11px] text-white/90 shrink-0">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Original &amp; BPOM
              </span>
              <span className="text-white/40">•</span>
              <a
                href={buildWhatsAppUrl(
                  brandConfig.whatsappNumber,
                  `Halo Admin *${brandConfig.name}*, saya mau konsultasi atau pesan produk.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                Order WA: 0821-5406-5176
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Compact Main Header */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-1.5 sm:py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Name */}
          <button
            onClick={() => {
              setActiveTab?.("catalog");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 text-left group focus:outline-none shrink-0"
          >
            {brandConfig.logoUrl ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brandConfig.logoUrl}
                  alt={brandConfig.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                {brandConfig.logoTextIcon || "KM"}
              </div>
            )}
            <div>
              <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors block leading-none">
                {brandConfig.name}
              </span>
              <span className="hidden sm:block text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {brandConfig.tagline}
              </span>
            </div>
          </button>

          {/* Compact Search Input (Inline on Mobile & Desktop) */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== "catalog") setActiveTab?.("catalog");
                }}
                placeholder="Cari toner, Originote, lip cream..."
                className="w-full pl-8 sm:pl-10 pr-7 py-1.5 sm:py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 border border-transparent focus:border-brand-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-800 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Mobile Quick Action Icons */}
          <div className="flex items-center gap-1.5 lg:hidden shrink-0">
            <button
              onClick={onOpenWishlistModal}
              className="relative p-1.5 rounded-xl bg-slate-100 text-slate-700"
              aria-label="Wishlist Produk Favorit"
            >
              <Heart className="w-4 h-4 text-slate-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button
              onClick={onOpenCart}
              className="relative p-1.5 rounded-xl bg-brand-600 text-white"
              aria-label="Keranjang Pesanan WA"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenCompare}
              className="relative px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Bandingkan Produk"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-600" />
              <span>Bandingkan</span>
              {compareIds.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                  {compareIds.length}
                </span>
              )}
            </button>

            <button
              onClick={onOpenWishlistModal}
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              title="Produk Favorit Saya"
            >
              <Heart className="w-5 h-5 text-slate-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="relative px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-brand-600/20 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Keranjang WA</span>
              {totalCartItems > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-brand-700 text-[11px] font-extrabold">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

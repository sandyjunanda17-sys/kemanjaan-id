"use client";

import React, { useEffect, useState } from "react";
import { PhoneProduct, PhoneVariant } from "@/types/store";
import { formatRupiah } from "@/utils/format";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";

interface LivePurchaseNotificationProps {
  products: PhoneProduct[];
  onSelectProduct: (product: PhoneProduct) => void;
}

const BUYERS = [
  { name: "Nadia Putri", city: "Tanjung Laut Indah" },
  { name: "Rina Wulandari", city: "Bontang Selatan" },
  { name: "Ayu Lestari", city: "Bontang Utara" },
  { name: "Siti Rahma", city: "Loktuan" },
  { name: "Dewi Anggraini", city: "Berebas Tengah" },
  { name: "Tiara Ananda", city: "Bontang Baru" },
  { name: "Fitri Handayani", city: "Api-Api" },
  { name: "Dina Kartika", city: "Samarinda" },
  { name: "Mega Safitri", city: "Sangatta" },
  { name: "Maya Puspita", city: "Tanjung Laut" },
];

const TIME_AGOS = [
  "Baru saja",
  "1 menit lalu",
  "3 menit lalu",
  "5 menit lalu",
  "8 menit lalu",
];

export default function LivePurchaseNotification({
  products,
  onSelectProduct,
}: LivePurchaseNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<{
    buyer: { name: string; city: string };
    product: PhoneProduct;
    variant: PhoneVariant;
    timeAgo: string;
  } | null>(null);

  useEffect(() => {
    if (!products || products.length === 0) return;

    const triggerRandomNotification = () => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      if (!randomProduct || !randomProduct.variants || randomProduct.variants.length === 0) {
        return;
      }
      const randomVariant =
        randomProduct.variants[Math.floor(Math.random() * randomProduct.variants.length)];
      const randomBuyer = BUYERS[Math.floor(Math.random() * BUYERS.length)];
      const randomTime = TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)];

      setCurrentNotification({
        buyer: randomBuyer,
        product: randomProduct,
        variant: randomVariant,
        timeAgo: randomTime,
      });
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 6000);
    };

    const firstTimer = setTimeout(triggerRandomNotification, 4500);
    const intervalTimer = setInterval(triggerRandomNotification, 18000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(intervalTimer);
    };
  }, [products]);

  if (!currentNotification) return null;

  const { buyer, product, variant, timeAgo } = currentNotification;
  const originalPrice = variant.originalPrice || Math.round(variant.price * 1.15);
  const discountPct =
    originalPrice > variant.price
      ? Math.round(((originalPrice - variant.price) / originalPrice) * 100)
      : 0;

  return (
    <aside
      aria-label="Notifikasi Order WhatsApp Terbaru"
      className={`hidden sm:block fixed bottom-5 left-4 sm:left-6 z-40 max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-200/90 transition-all duration-500 transform ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-8 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group hover:opacity-90 transition text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0] || "/assets/storefront-gmaps.jpg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-bl-lg flex items-center justify-center text-white">
            <CheckCircle2 className="w-2.5 h-2.5" />
          </div>
        </button>

        <div onClick={() => onSelectProduct(product)} className="flex-1 min-w-0 cursor-pointer">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-extrabold text-slate-800 truncate">
              {buyer.name} ({buyer.city})
            </span>
            <span className="text-[10px] text-slate-400">• {timeAgo}</span>
          </div>

          <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
            Pesan {product.name}{" "}
            <span className="text-slate-500 font-normal">({variant.ram})</span>
          </p>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-black text-rose-600">
              {formatRupiah(variant.price)}
            </span>
            {originalPrice > variant.price && (
              <span className="text-[10px] text-slate-400 line-through">
                {formatRupiah(originalPrice)}
              </span>
            )}
            {discountPct > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                Hemat {discountPct}%
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setVisible(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition shrink-0"
          title="Tutup Notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <span className="flex items-center gap-1 text-emerald-700 font-bold">
          <ShoppingBag className="w-3 h-3 text-emerald-600" />
          Order Cepat via WhatsApp
        </span>
        <button
          onClick={() => onSelectProduct(product)}
          className="text-brand-600 font-extrabold hover:underline"
        >
          Lihat Produk &rarr;
        </button>
      </div>
    </aside>
  );
}

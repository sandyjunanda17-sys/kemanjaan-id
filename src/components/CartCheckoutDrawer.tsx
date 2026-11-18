"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { buildWhatsAppUrl, formatRupiah } from "@/utils/format";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartCheckoutDrawer({ isOpen, onClose }: CartCheckoutDrawerProps) {
  const {
    store,
    cart,
    removeFromCart,
    updateCartQty,
    clearCart,
    showToast,
  } = useStore();

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    amount: number;
  } | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
  const totalOriginalPrice = cart.reduce((acc, item) => {
    const orig = item.variant.originalPrice || Math.round(item.variant.price * 1.15);
    return acc + orig * item.quantity;
  }, 0);

  const voucherDiscount =
    appliedVoucher &&
    store.vouchers.some(
      (v) => v.active && v.code.toUpperCase() === appliedVoucher.code && subtotal >= v.minPurchase
    )
      ? appliedVoucher.amount
      : 0;

  const finalTotal = Math.max(0, subtotal - voucherDiscount);
  const totalSavings = Math.max(0, totalOriginalPrice - subtotal) + voucherDiscount;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyVoucher = (customCode?: string) => {
    const code = (customCode ?? voucherInput).trim().toUpperCase();
    if (!code) return;
    setVoucherInput(code);
    const found = store.vouchers.find((v) => v.active && v.code.toUpperCase() === code);
    if (!found) {
      showToast("Kode voucher tidak ditemukan atau sudah tidak aktif.");
      return;
    }
    if (subtotal < found.minPurchase) {
      showToast(`Minimal belanja untuk voucher ${found.code} adalah ${formatRupiah(found.minPurchase)}`);
      return;
    }
    setAppliedVoucher({ code: found.code, amount: found.discountAmount });
    showToast(`Voucher ${found.code} berhasil dipasang! Hemat ${formatRupiah(found.discountAmount)}`);
  };

  const whatsappMessage = [
    `✨ *PESANAN KEMANJAAN.ID* ✨`,
    `Halo Kak Admin *${store.brandConfig.name}*, saya mau pesan produk berikut:`,
    ``,
    `🛍️ *Daftar Pesanan (${totalItemsCount} item):*`,
    ...cart.map(
      (i, idx) =>
        `${idx + 1}. *${i.product.name}*\n   • Varian/Shade: ${i.variant.ram} (${i.variant.storage})\n   • Qty: ${i.quantity} × ${formatRupiah(i.variant.price)} = *${formatRupiah(i.variant.price * i.quantity)}*`
    ),
    ``,
    `Subtotal: ${formatRupiah(subtotal)}`,
    ...(voucherDiscount > 0 && appliedVoucher
      ? [`Voucher (${appliedVoucher.code}): -${formatRupiah(voucherDiscount)}`]
      : []),
    `💰 *Total Estimasi: ${formatRupiah(finalTotal)}*`,
    ``,
    `Mohon info ketersediaan stok & proses pengambilannya / kirimnya ya Kak. Terima kasih! 💛`,
  ].join("\n");

  const whatsappHref = buildWhatsAppUrl(store.brandConfig.whatsappNumber, whatsappMessage);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Top Bar */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Daftar Pesanan WhatsApp
              </h3>
              <p className="text-[11px] text-slate-500">
                {totalItemsCount} produk siap dikirim ke chat Admin WA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            aria-label="Tutup Keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <ShoppingBag className="w-14 h-14 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">Daftar pesanan masih kosong</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Pilih skincare, makeup, parfum, atau camilan Kedai Kemanjaan untuk dikumpulkan dan dikirim langsung ke WhatsApp.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-extrabold hover:bg-brand-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Lihat Katalog Produk</span>
              </button>
            </div>
          ) : (
            <>
              {/* Info Notice: No website checkout / no ongkir hassle */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 leading-relaxed">
                  <strong>Tanpa ribet checkout di web</strong> — tidak perlu isi formulir panjang atau hitung ongkir di sini. Langsung klik tombol hijau di bawah untuk kirim daftar ini ke WhatsApp Admin!
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variant.id}`}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex gap-3.5 items-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-brand-600">
                        {item.product.brand}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 line-clamp-2 leading-snug">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Varian: {item.variant.ram} • {item.variant.storage}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-black text-rose-600">
                          {formatRupiah(item.variant.price * item.quantity)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(item.product.id, item.variant.id, item.quantity - 1)
                            }
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQty(item.product.id, item.variant.id, item.quantity + 1)
                            }
                            className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            aria-label="Tambah jumlah"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.variant.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition self-start"
                      title="Hapus produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Optional Voucher Box */}
              {store.vouchers.filter((v) => v.active).length > 0 && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-brand-600" />
                    <span>Kode Voucher Promo (Opsional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      placeholder="Contoh: MANJA10 / BONTANGVIP"
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase font-bold outline-none focus:border-brand-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyVoucher()}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                    >
                      Pakai
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {store.vouchers
                      .filter((v) => v.active)
                      .map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleApplyVoucher(v.code)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                            appliedVoucher?.code === v.code && voucherDiscount > 0
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                              : "bg-slate-50 hover:bg-brand-50 border-slate-200 text-slate-600"
                          }`}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          <span>
                            {v.code} (-{formatRupiah(v.discountAmount)})
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer CTA */}
        {cart.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50 space-y-3.5">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Produk ({totalItemsCount} item)</span>
                <span className="font-bold text-slate-900">{formatRupiah(subtotal)}</span>
              </div>
              {voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Potongan Voucher ({appliedVoucher?.code})</span>
                  <span>- {formatRupiah(voucherDiscount)}</span>
                </div>
              )}
              {totalSavings > 0 && (
                <div className="flex justify-between text-rose-600 font-extrabold text-xs bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
                  <span>Total Penghematan Anda</span>
                  <span>Hemat {formatRupiah(totalSavings)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-base font-black text-slate-900">
                <span>Total Estimasi</span>
                <span className="text-xl text-brand-700">{formatRupiah(finalTotal)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Pesan Sekarang via WhatsApp</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition"
                >
                  Lanjut Pilih Produk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setAppliedVoucher(null);
                    showToast("Daftar pesanan dikosongkan.");
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition"
                >
                  Kosongkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

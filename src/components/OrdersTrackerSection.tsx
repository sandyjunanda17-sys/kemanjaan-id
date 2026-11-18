"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { formatRupiah, formatShortDate } from "@/utils/format";
import {
  PackageSearch,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Repeat,
  ShoppingBag,
} from "lucide-react";

export default function OrdersTrackerSection() {
  const { store } = useStore();
  const [searchCode, setSearchCode] = useState("");

  const filteredOrders = store.orders.filter(
    (o) =>
      !searchCode.trim() ||
      o.id.toLowerCase().includes(searchCode.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchCode.toLowerCase()) ||
      o.whatsapp.includes(searchCode)
  );

  const filteredTradeIns = store.tradeIns.filter(
    (t) =>
      !searchCode.trim() ||
      t.id.toLowerCase().includes(searchCode.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchCode.toLowerCase()) ||
      t.whatsapp.includes(searchCode)
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <PackageSearch className="w-6 h-6 text-brand-600" />
              Lacak Status Pesanan & Tukar Tambah
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Masukkan Nomor Invoice (INV-...), Nomor Tiket Trade-In (TRD-...), atau Nama Anda.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Cari No. Invoice / Nama / No. WA..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-brand-600"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders Column */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            Daftar Pesanan Pembelian ({filteredOrders.length})
          </h2>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Tidak ada pesanan yang cocok dengan pencarian.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                      {order.id}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatShortDate(order.createdAt)} • {order.customerName}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      order.status === "Selesai"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "Dikirim"
                        ? "bg-blue-100 text-blue-800"
                        : order.status === "Dibatalkan"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.status === "Dikirim" ? (
                      <Truck className="w-3.5 h-3.5" />
                    ) : order.status === "Selesai" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-slate-500">
                          {item.variantLabel} • x{item.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-slate-800">
                        {formatRupiah(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {order.resiNumber && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
                    <span className="text-blue-700 font-semibold">Nomor Resi Pengiriman:</span>
                    <span className="font-mono font-black text-blue-900">{order.resiNumber}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{order.shippingMethod}</span>
                  <span className="text-sm font-black text-brand-700">
                    Total: {formatRupiah(order.total)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Trade-In Tickets Column */}
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-emerald-600" />
            Tiket Tukar Tambah & Jual HP ({filteredTradeIns.length})
          </h2>

          {filteredTradeIns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Belum ada pengajuan Tukar Tambah / Jual HP.
            </div>
          ) : (
            filteredTradeIns.map((ti) => (
              <div
                key={ti.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                      {ti.id}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatShortDate(ti.createdAt)} • {ti.customerName}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ti.status === "Disetujui" || ti.status === "Selesai"
                        ? "bg-emerald-100 text-emerald-800"
                        : ti.status === "Ditolak"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ti.status}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jenis Pengajuan:</span>
                    <span className="font-bold text-slate-800">{ti.submissionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Unit HP Lama:</span>
                    <span className="font-bold text-slate-900">
                      {ti.oldPhoneBrand} {ti.oldPhoneModel} ({ti.storage})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kondisi & Kelengkapan:</span>
                    <span className="text-slate-700">
                      {ti.physicalCondition} • {ti.completeness}
                    </span>
                  </div>
                  {ti.targetPhoneName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Upgrade:</span>
                      <span className="font-semibold text-brand-700">{ti.targetPhoneName}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Taksiran Nilai Beli:</span>
                  <span className="text-base font-black text-emerald-600">
                    {formatRupiah(ti.estimatedValue)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

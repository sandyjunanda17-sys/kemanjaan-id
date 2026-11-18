"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { PhoneProduct, PhoneVariant, TradeInSubmission } from "@/types/store";
import { buildWhatsAppUrl, formatRupiah } from "@/utils/format";
import {
  Repeat,
  Calculator,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Banknote,
} from "lucide-react";

interface TradeInSectionProps {
  preselectedTarget?: { product: PhoneProduct; variant: PhoneVariant } | null;
  onOpenCart: () => void;
}

export default function TradeInSection({
  preselectedTarget,
  onOpenCart,
}: TradeInSectionProps) {
  const { store, createTradeIn, addToCart, setActiveTradeInCredit } = useStore();
  const baseModels = store.brandConfig.tradeInBaseModels;

  const [submissionType, setSubmissionType] = useState<
    "Tukar Tambah (Trade-In)" | "Jual Langsung ke Toko"
  >("Tukar Tambah (Trade-In)");
  const [selectedBaseId, setSelectedBaseId] = useState<string>(
    baseModels[0]?.id || "custom"
  );
  const [customBrand, setCustomBrand] = useState("Apple");
  const [customModel, setCustomModel] = useState("");
  const [customBasePrice, setCustomBasePrice] = useState(6000000);

  const [storage, setStorage] = useState("256GB");
  const [physicalCondition, setPhysicalCondition] =
    useState<TradeInSubmission["physicalCondition"]>("Mulus Sempurna (Grade A+)");
  const [completeness, setCompleteness] =
    useState<TradeInSubmission["completeness"]>("Fullset Original");
  const [batteryHealth, setBatteryHealth] = useState("90% - 100%");

  const [targetProductId, setTargetProductId] = useState<string>(
    preselectedTarget?.product.id || store.products[0]?.id || ""
  );
  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [submittedRecord, setSubmittedRecord] = useState<TradeInSubmission | null>(
    null
  );

  useEffect(() => {
    if (preselectedTarget) {
      setTargetProductId(preselectedTarget.product.id);
      setSubmissionType("Tukar Tambah (Trade-In)");
    }
  }, [preselectedTarget]);

  const currentBaseModel = baseModels.find((m) => m.id === selectedBaseId);
  const basePrice =
    selectedBaseId === "custom"
      ? customBasePrice
      : currentBaseModel?.basePrice || 5000000;

  // Calculate storage multiplier
  const storageBonus =
    storage === "1TB"
      ? 1500000
      : storage === "512GB"
      ? 850000
      : storage === "256GB"
      ? 350000
      : 0;

  // Condition multiplier
  const conditionFactor =
    physicalCondition === "Mulus Sempurna (Grade A+)"
      ? 1.0
      : physicalCondition === "Lecet Pemakaian Wajar (Grade A)"
      ? 0.91
      : physicalCondition === "Ada Dent / Retak Halus (Grade B)"
      ? 0.78
      : 0.6;

  // Completeness deduction
  const completenessDeduction =
    completeness === "Fullset Original"
      ? 0
      : completeness === "Unit + Box"
      ? 250000
      : 550000;

  // Battery deduction
  const batteryDeduction =
    batteryHealth === "90% - 100%"
      ? 0
      : batteryHealth === "80% - 89%"
      ? 200000
      : 450000;

  const estimatedValue = Math.max(
    500000,
    Math.round(
      ((basePrice + storageBonus) * conditionFactor -
        completenessDeduction -
        batteryDeduction) /
        50000
    ) * 50000
  );

  const targetProduct = store.products.find((p) => p.id === targetProductId);
  const targetVariant =
    preselectedTarget?.product.id === targetProductId
      ? preselectedTarget.variant
      : targetProduct?.variants[0];
  const targetPrice = targetVariant?.price || 0;
  const topUpAmount = Math.max(0, targetPrice - estimatedValue);

  const oldBrandName =
    selectedBaseId === "custom" ? customBrand : currentBaseModel?.brand || "Apple";
  const oldModelName =
    selectedBaseId === "custom"
      ? customModel || "Smartphone"
      : currentBaseModel?.model || "Smartphone";

  const handleApplyToCart = () => {
    if (!targetProduct || !targetVariant) return;
    setActiveTradeInCredit({
      model: `${oldModelName} (${storage})`,
      amount: estimatedValue,
    });
    addToCart(targetProduct, targetVariant, 1);
    onOpenCart();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !whatsapp.trim()) return;
    const record = await createTradeIn({
      customerName,
      whatsapp,
      oldPhoneBrand: oldBrandName,
      oldPhoneModel: oldModelName,
      storage,
      physicalCondition,
      completeness,
      batteryHealth,
      estimatedValue,
      targetPhoneName:
        submissionType === "Tukar Tambah (Trade-In)" && targetProduct
          ? `${targetProduct.name} (${targetVariant?.ram}/${targetVariant?.storage})`
          : undefined,
      submissionType,
      notes,
    });
    setSubmittedRecord(record);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Kalkulator Harga Otomatis & Transparan
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Tukar Tambah (Trade-In) & Jual HP Instan
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Cek taksiran harga HP lama Anda secara real-time dalam 30 detik. Bisa langsung dijadikan potongan harga beli HP baru/second di keranjang, atau dicairkan tunai!
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Valuation Calculator */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-600" />
              1. Spesifikasi & Kondisi HP Lama Anda
            </h2>
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setSubmissionType("Tukar Tambah (Trade-In)")}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                submissionType === "Tukar Tambah (Trade-In)"
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>Tukar Tambah HP</span>
            </button>
            <button
              type="button"
              onClick={() => setSubmissionType("Jual Langsung ke Toko")}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
                submissionType === "Jual Langsung ke Toko"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Jual HP (Cair Tunai)</span>
            </button>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Pilih Tipe HP Lama Anda
              </label>
              <select
                value={selectedBaseId}
                onChange={(e) => setSelectedBaseId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold text-slate-800 outline-none focus:border-brand-600"
              >
                {baseModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.brand} — {m.model} (Basis {formatRupiah(m.basePrice)})
                  </option>
                ))}
                <option value="custom">Lainnya / Ketik Tipe HP Sendiri...</option>
              </select>
            </div>

            {selectedBaseId === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Merk HP
                  </label>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="Apple / Samsung / OPPO"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nama Model
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="Contoh: iPhone 14 Plus"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Perkiraan Harga Pasar (Rp)
                  </label>
                  <input
                    type="number"
                    step={100000}
                    value={customBasePrice}
                    onChange={(e) => setCustomBasePrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Storage Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Kapasitas Penyimpanan (Storage)
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {["128GB", "256GB", "512GB", "1TB"].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setStorage(cap)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition ${
                      storage === cap
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Condition */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Kondisi Fisik & Fungsi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(
                  [
                    "Mulus Sempurna (Grade A+)",
                    "Lecet Pemakaian Wajar (Grade A)",
                    "Ada Dent / Retak Halus (Grade B)",
                    "Minus Fungsi / LCD (Grade C)",
                  ] as const
                ).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setPhysicalCondition(cond)}
                    className={`p-3 rounded-xl text-left text-xs font-bold border transition ${
                      physicalCondition === cond
                        ? "border-brand-600 bg-brand-50/70 text-brand-800"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Completeness & Battery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Kelengkapan Kotak
                </label>
                <select
                  value={completeness}
                  onChange={(e) =>
                    setCompleteness(
                      e.target.value as TradeInSubmission["completeness"]
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="Fullset Original">Fullset Original (Kotak + Kabel)</option>
                  <option value="Unit + Box">Unit + Box Saja</option>
                  <option value="Batangan (Unit Saja)">Batangan (Unit HP Saja)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Kesehatan Baterai (Battery Health)
                </label>
                <select
                  value={batteryHealth}
                  onChange={(e) => setBatteryHealth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="90% - 100%">90% - 100% (Prima)</option>
                  <option value="80% - 89%">80% - 89% (Normal)</option>
                  <option value="Di bawah 80% / Service">Di bawah 80% / Service</option>
                </select>
              </div>
            </div>

            {/* Target Phone if Tukar Tambah */}
            {submissionType === "Tukar Tambah (Trade-In)" && (
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-700 mb-2">
                  Pilih HP Tujuan Tukar Tambah (Upgrade Ke):
                </label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-brand-200 bg-brand-50/40 text-sm font-bold text-slate-900 outline-none focus:border-brand-600"
                >
                  {store.products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.condition}) — Mulai {formatRupiah(p.variants[0]?.price || 0)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right: Valuation Summary & Submission Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estimasi Nilai Beli HP Anda
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                Harga Terbaik
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {formatRupiah(estimatedValue)}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {oldBrandName} {oldModelName} • {storage} • {physicalCondition}
              </p>
            </div>

            {submissionType === "Tukar Tambah (Trade-In)" && targetProduct && (
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Harga {targetProduct.name}:</span>
                  <span className="font-bold text-white">{formatRupiah(targetPrice)}</span>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span>Nilai Tukar Tambah HP Lama:</span>
                  <span className="font-bold">- {formatRupiah(estimatedValue)}</span>
                </div>
                <div className="pt-2 border-t border-white/15 flex justify-between items-baseline text-sm font-black text-white">
                  <span>Estimasi Tambah Bayar:</span>
                  <span className="text-lg text-amber-300">{formatRupiah(topUpAmount)}</span>
                </div>
              </div>
            )}

            {submissionType === "Tukar Tambah (Trade-In)" && targetProduct && (
              <button
                type="button"
                onClick={handleApplyToCart}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Gunakan Potongan Ini & Checkout Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Form Pengajuan Resmi ke Admin */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            {submittedRecord ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Pengajuan Berhasil Terkirim!
                </h3>
                <p className="text-xs text-slate-500">
                  Kode Tiket Trade-In Anda:{" "}
                  <strong className="text-slate-900 font-mono">
                    {submittedRecord.id}
                  </strong>
                </p>
                <a
                  href={buildWhatsAppUrl(
                    store.brandConfig.whatsappNumber,
                    `Halo Admin *${store.brandConfig.name}*, saya mengajukan *${submittedRecord.submissionType}*:\n\n🎫 *ID Tiket:* ${submittedRecord.id}\n📱 *HP Lama:* ${submittedRecord.oldPhoneBrand} ${submittedRecord.oldPhoneModel} (${submittedRecord.storage})\n✨ *Kondisi:* ${submittedRecord.physicalCondition} | ${submittedRecord.completeness}\n💰 *Estimasi Kalkulator:* ${formatRupiah(submittedRecord.estimatedValue)}\n${submittedRecord.targetPhoneName ? `🎯 *Upgrade Ke:* ${submittedRecord.targetPhoneName}\n` : ""}\nMohon jadwal inspeksi / pencairan. Terima kasih!`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Kirim Tiket Inspeksi ke WhatsApp Admin</span>
                </a>
                <button
                  onClick={() => setSubmittedRecord(null)}
                  className="text-xs text-slate-500 underline"
                >
                  Hitung Ulang Unit Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  2. Kunci Estimasi Harga & Jadwalkan Inspeksi
                </h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap Anda *
                  </label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp *
                  </label>
                  <input
                    required
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="0812..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Misal: Ex iBox resmi, mulus belum pernah servis"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-brand-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition"
                >
                  Ajukan & Simpan Tiket Trade-In
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

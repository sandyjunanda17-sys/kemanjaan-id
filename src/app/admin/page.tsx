"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import AdminPanel from "@/components/AdminPanel";
import {
  Lock,
  KeyRound,
  ShieldAlert,
  ArrowLeft,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const { store } = useStore();
  const { brandConfig } = store;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [showPin, setShowPin] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  // Check existing session
  useEffect(() => {
    try {
      const savedAuth = sessionStorage.getItem("kemanjaan_admin_authed");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const correctPin = brandConfig.adminPin || "1234";

    if (pinInput.trim() === correctPin.trim()) {
      try {
        sessionStorage.setItem("kemanjaan_admin_authed", "true");
      } catch {}
      setIsAuthenticated(true);
      setErrorMsg("");
    } else {
      setIsShaking(true);
      setErrorMsg("PIN Admin salah. Silakan periksa kembali atau gunakan PIN default '1234'.");
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("kemanjaan_admin_authed");
    } catch {}
    setIsAuthenticated(false);
    setPinInput("");
  };

  // Loading state while reading sessionStorage
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        Memverifikasi sesi admin...
      </div>
    );
  }

  // If not authenticated -> show PIN gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 flex flex-col justify-between p-4 sm:p-6 text-white">
        <div className="max-w-md w-full mx-auto pt-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Toko</span>
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
            Akses Terbatas
          </span>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-8">
          <div
            className={`bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-transform ${
              isShaking ? "animate-bounce" : ""
            }`}
          >
            {/* Header Brand */}
            <div className="text-center space-y-3 pb-6 border-b border-slate-800">
              {brandConfig.logoUrl ? (
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brandConfig.logoUrl}
                    alt={brandConfig.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                  {brandConfig.logoTextIcon || <Sparkles className="w-8 h-8" />}
                </div>
              )}

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20 mb-2">
                  <Lock className="w-3 h-3" /> Area Khusus Pemilik Toko
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {brandConfig.name}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan PIN keamanan untuk mengakses panel kelola produk, logo, dan harga toko.
                </p>
              </div>
            </div>

            {/* PIN Form */}
            <form onSubmit={handleLogin} className="pt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  PIN Keamanan Admin (Default: 1234)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    autoFocus
                    maxLength={8}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Masukkan 4 angka PIN..."
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 text-center text-lg font-mono tracking-widest outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPin ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                onClick={() => handleLogin()}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition hover:scale-[1.01] active:scale-[0.99]"
              >
                <KeyRound className="w-4 h-4" />
                <span>Buka Panel Pemilik</span>
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  PIN awal bawaan sistem adalah <strong className="text-slate-300">1234</strong>. Anda dapat mengganti PIN ini kapan saja di menu Brand Toko.
                </p>
              </div>
            </form>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto pb-4 text-center text-[11px] text-slate-600">
          KEMANJAAN.ID CMS Security Engine • Official Beauty Store System
        </div>
      </div>
    );
  }

  // If authenticated -> show AdminPanel with top navigation
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top App Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-brand-600 text-[10px] font-black uppercase tracking-wider">
              ADMIN CMS
            </span>
            <div className="block">
              <span className="text-sm font-extrabold text-white">
                {brandConfig.name}
              </span>
              <span className="text-[11px] text-slate-400 ml-2">
                Panel Pengelola Toko
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
              title="Buka Website Toko"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand-400" />
              <span>Lihat Toko (Tampilan Pembeli)</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-rose-500/30 transition"
              title="Kunci Panel Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="inline">Kunci / Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Panel Component */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminPanel onBackToStore={() => { window.location.href = "/"; }} />
      </main>
    </div>
  );
}
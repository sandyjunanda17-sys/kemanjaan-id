import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

export const metadata: Metadata = {
  title: "KEMANJAAN.ID — Toko Kosmetik Viral Dengan Harga Murah | Bontang",
  description:
    "Katalog online resmi Toko Kosmetik Kemanjaan Bontang (@kemanjaan.id). Skincare viral, makeup original BPOM, parfum, tas cantik & Kedai Kemanjaan. Pesan langsung via WhatsApp 0821-5406-5176.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col antialiased selection:bg-brand-600 selection:text-white">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

# KEMANJAAN.ID — E-Commerce Katalog Kosmetik & Direct WhatsApp Order

Website katalog e-commerce resmi untuk **Toko Kosmetik Kemanjaan (`@kemanjaan.id`) — Bontang, Kalimantan Timur** dengan alur pemesanan **1-klik langsung ke WhatsApp** (tanpa ongkir dan tanpa formulir checkout bertahap di website) serta **Panel Admin CMS** lengkap untuk mengelola kategori, brand, produk, varian/shade, voucher, banner, dan identitas toko secara real-time.

---

## Fitur Utama

1. **Katalog Kosmetik Adaptif (6–8+ Produk Sebelum Scroll)**:
   - Tampilan responsif mobile-first dengan pilihan grid **`2 Kol`** dan **`3 Kol`** di HP, serta grid **`4 Kol`** di layar desktop.
   - Mendukung **36+ produk kurasi** (`Toner Kemanjaan`, `Elformula`, `The Originote`, `Facetology`, `Sea Makeup`, `Maybelline`, `Y.O.U`, `NPURE`, `Hanasui`, `OMG`, `Wardah`, `Marina`, `Kahf`, tas/aksesoris, dan menu `Kedai Kemanjaan`).
   - Filter instan berdasarkan kategori, brand, pencarian nama produk, rentang harga, serta modal direktori lengkap kategori & brand (`AllBrandsModal`).
2. **Pemesanan Langsung ke WhatsApp (`wa.me/6282154065176`)**:
   - Tombol **Pesan WA** langsung di kartu produk, detail produk (pemilihan shade/varian + info BPOM), bar melayang bawah (`#stickyWaCartBar`), dan keranjang pesan WA (`CartCheckoutDrawer`).
   - Tidak ada perhitungan ongkir atau form alamat panjang di website — daftar belanja, varian/shade, kode voucher (`MANJA10`, `BONTANGVIP`), dan total harga otomatis terformat rapi ke chat WhatsApp Admin.
3. **Panel Admin CMS Lengkap (`/admin`, PIN Default: `1234`)**:
   - **1. Logo, WhatsApp & Brand**: Ubah logo, nama brand, tagline, tema warna, nomor WhatsApp tujuan closing, alamat toko fisik, jam operasional, link Google Maps, pengumuman bar atas, dan PIN Admin.
   - **2. Kategori & Brand**: Tambah, edit/rename kategori (otomatis memperbarui semua produk terkait), ubah ikon/label warna, atur urutan, hapus kategori, serta kelola daftar brand resmi.
   - **3. Katalog Produk**: Pencarian cepat, filter kategori & brand, tombol **Duplikat** produk, edit varian/shade/stok/harga/foto (upload hingga 5 foto per produk), serta tambah produk baru.
   - **4. Banner Promo & Voucher** & **5. Database & Backup** (export/import JSON dan reset data bawaan).
4. **Penyimpanan Persisten**:
   - Mendukung mode **Supabase (PostgreSQL + CDN Storage)** untuk deployment cloud, atau otomatis fallback ke penyimpanan lokal (`data/store.json` + browser `localStorage`) saat dijalankan di lokal.

---

## Panduan Deployment Cepat ke Vercel + GitHub

1. **Siapkan Database Supabase (Opsional / Direkomendasikan untuk Produksi)**:
   - Buat project baru di [supabase.com](https://supabase.com), buka **SQL Editor**, lalu jalankan isi file `supabase-setup.sql`.
   - Salin `Project URL` dan `anon public key` dari **Project Settings -> API**.
2. **Import Repository ke Vercel**:
   - Buka [vercel.com](https://vercel.com) -> **Add New... -> Project** -> pilih repository GitHub ini.
   - Tambahkan Environment Variables (jika memakai Supabase):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Klik **Deploy**.
3. **Buka Panel Admin**:
   - Akses `https://domain-anda.vercel.app/admin` dengan PIN default **`1234`** untuk memperbarui produk, kategori, banner, atau mengganti PIN.

---

## Menjalankan di Komputer Lokal

```bash
npm install
npm run dev
```

Buka browser di [http://localhost:3000](http://localhost:3000) (Etalase) dan [http://localhost:3000/admin](http://localhost:3000/admin) (Panel Admin CMS).

---

## Struktur Berkas Penting

- `src/app/page.tsx` — Halaman katalog utama & etalase KEMANJAAN.ID.
- `src/app/admin/page.tsx` — Halaman autentikasi PIN & portal Panel Admin CMS.
- `src/components/AdminPanel.tsx` — Antarmuka lengkap manajemen Brand, Kategori & Brand, Katalog Produk, Banner/Voucher, dan Backup.
- `src/components/Navbar.tsx` — Header ringkas, pencarian inline, wishlist, dan tombol Keranjang WA.
- `src/components/ProductDetailModal.tsx` — Detail produk, varian/shade, informasi BPOM, dan tombol Pesan Langsung via WhatsApp.
- `src/components/CartCheckoutDrawer.tsx` — Daftar pesanan WhatsApp dengan voucher promo tanpa form checkout/ongkir.
- `src/components/AllBrandsModal.tsx` — Direktori interaktif semua kategori & brand.
- `src/context/StoreContext.tsx` & `src/app/api/store/route.ts` — State global, CRUD kategori/brand/produk, serta sinkronisasi penyimpanan.
- `src/data/initialData.ts` & `public/assets/` — Katalog awal 36 produk, aset toko, dan visual produk.

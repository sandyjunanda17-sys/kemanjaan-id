-- ==============================================================================
-- SCRIPT DATABASE SUPABASE UNTUK TOKO ONLINE "R PHONE CELL"
-- ==============================================================================
-- Jalankan script ini di menu "SQL Editor" -> "New query" -> klik "Run" di Supabase.
-- Script ini akan membuat tabel database dan bucket penyimpanan gambar otomatis.
-- ==============================================================================

-- 1. Buat Tabel Utama Toko (rphone_store)
CREATE TABLE IF NOT EXISTS public.rphone_store (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.rphone_store ENABLE ROW LEVEL SECURITY;

-- Policy: Publik boleh membaca data toko (untuk customer)
DROP POLICY IF EXISTS "Allow public read on rphone_store" ON public.rphone_store;
CREATE POLICY "Allow public read on rphone_store" 
  ON public.rphone_store FOR SELECT USING (true);

-- Policy: Publik / Admin boleh menyimpan dan memperbarui data
DROP POLICY IF EXISTS "Allow public insert on rphone_store" ON public.rphone_store;
CREATE POLICY "Allow public insert on rphone_store" 
  ON public.rphone_store FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on rphone_store" ON public.rphone_store;
CREATE POLICY "Allow public update on rphone_store" 
  ON public.rphone_store FOR UPDATE USING (true);

-- 2. Buat Bucket Storage untuk Foto Produk (rphone-images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('rphone-images', 'rphone-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage: Publik boleh melihat foto produk
DROP POLICY IF EXISTS "Public Access to rphone-images" ON storage.objects;
CREATE POLICY "Public Access to rphone-images" 
  ON storage.objects FOR SELECT USING (bucket_id = 'rphone-images');

-- Policy Storage: Publik / Admin boleh mengunggah foto produk
DROP POLICY IF EXISTS "Public Upload to rphone-images" ON storage.objects;
CREATE POLICY "Public Upload to rphone-images" 
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'rphone-images');

DROP POLICY IF EXISTS "Public Update to rphone-images" ON storage.objects;
CREATE POLICY "Public Update to rphone-images" 
  ON storage.objects FOR UPDATE USING (bucket_id = 'rphone-images');

DROP POLICY IF EXISTS "Public Delete to rphone-images" ON storage.objects;
CREATE POLICY "Public Delete to rphone-images" 
  ON storage.objects FOR DELETE USING (bucket_id = 'rphone-images');

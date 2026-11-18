import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { StoreData } from "@/types/store";

let supabaseInstance: SupabaseClient | null = null;

// Universal detection for Supabase environment variables
export function getSupabaseCredentials(): { url: string; key: string } | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_REST_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  if (url && key && url.startsWith("http")) {
    return { url: url.replace(/\/+$/, ""), key };
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials() !== null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  const creds = getSupabaseCredentials();
  if (!creds) return null;

  try {
    supabaseInstance = createClient(creds.url, creds.key, {
      auth: { persistSession: false },
    });
    return supabaseInstance;
  } catch (err) {
    console.error("[Supabase Client Init Error]:", err);
    return null;
  }
}

const STORE_RECORD_ID = "rphone_main";

/**
 * Fetch store data from Supabase PostgreSQL table `rphone_store`
 */
export async function fetchStoreFromSupabase(): Promise<StoreData | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("rphone_store")
      .select("data")
      .eq("id", STORE_RECORD_ID)
      .maybeSingle();

    if (error) {
      console.warn("[Supabase Read Warning]:", error.message);
      return null;
    }

    if (!data || !data.data) {
      return null;
    }

    return data.data as StoreData;
  } catch (err) {
    console.error("[Supabase Read Exception]:", err);
    return null;
  }
}

/**
 * Upsert store data to Supabase PostgreSQL table `rphone_store`
 */
export async function saveStoreToSupabase(store: StoreData): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload = {
      id: STORE_RECORD_ID,
      data: store,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from("rphone_store")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("[Supabase Upsert Error]:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Supabase Save Exception]:", err);
    return false;
  }
}

/**
 * Upload an image buffer/blob to Supabase Storage bucket `rphone-images`
 */
export async function uploadImageToSupabaseStorage(
  fileBuffer: Buffer | Blob | Uint8Array,
  fileName: string,
  contentType: string = "image/webp"
): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const creds = getSupabaseCredentials();
    if (!creds) return null;

    const bucketName = "rphone-images";
    const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const { error } = await client.storage
      .from(bucketName)
      .upload(cleanFileName, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error("[Supabase Storage Upload Error]:", error.message);
      return null;
    }

    // Generate public URL
    const { data: publicUrlData } = client.storage
      .from(bucketName)
      .getPublicUrl(cleanFileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("[Supabase Storage Upload Exception]:", err);
    return null;
  }
}

/**
 * Hapus berkas gambar dari Supabase Storage bucket `rphone-images`
 * Berfungsi membersihkan berkas ketika produk dihapus agar kuota storage tidak mubazir.
 */
export async function deleteImagesFromSupabaseStorage(imageUrls: string[]): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !imageUrls || imageUrls.length === 0) return true;

  try {
    const bucketName = "rphone-images";
    const filePaths: string[] = [];

    for (const rawUrl of imageUrls) {
      if (!rawUrl || typeof rawUrl !== "string") continue;
      // Hanya proses gambar yang disimpan di bucket Supabase
      if (rawUrl.includes(`/${bucketName}/`)) {
        const parts = rawUrl.split(`/${bucketName}/`);
        if (parts[1]) {
          // Bersihkan query parameters jika ada
          const pathWithoutQuery = parts[1].split("?")[0];
          filePaths.push(decodeURIComponent(pathWithoutQuery));
        }
      }
    }

    if (filePaths.length === 0) return true;

    const { error } = await client.storage
      .from(bucketName)
      .remove(filePaths);

    if (error) {
      console.warn("[Supabase Storage File Cleanup Error]:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Supabase Storage File Cleanup Exception]:", err);
    return false;
  }
}

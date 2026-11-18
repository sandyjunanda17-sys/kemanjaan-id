import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { INITIAL_STORE_DATA } from "@/data/initialData";
import { StoreData } from "@/types/store";
import {
  fetchStoreFromSupabase,
  saveStoreToSupabase,
  isSupabaseConfigured,
} from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const GLOBAL_STORE_KEY = "kemanjaan_official_store_v1";

function getStorageKey(): string {
  return GLOBAL_STORE_KEY;
}

function getKvConfig(): { url: string; token: string; source: string } | null {
  const knownPrefixes = ["STORAGE", "UPSTASH_REDIS", "KV", "VERCEL_KV", "REDIS", "KEMANJAAN_DB"];
  for (const prefix of knownPrefixes) {
    const url =
      process.env[`${prefix}_REST_API_URL`] ||
      process.env[`${prefix}_REST_URL`] ||
      process.env[`${prefix}_URL`];
    const token =
      process.env[`${prefix}_REST_API_TOKEN`] ||
      process.env[`${prefix}_TOKEN`] ||
      process.env[`${prefix}_REST_TOKEN`];
    if (url && token && url.startsWith("http")) {
      return { url: url.replace(/\/+$/, ""), token, source: `${prefix}_REST_API_URL` };
    }
  }
  return null;
}

function sanitizeStoreData(data: StoreData): { sanitized: StoreData; wasModified: boolean } {
  if (!data || !data.brandConfig) {
    return { sanitized: INITIAL_STORE_DATA, wasModified: true };
  }
  const brandName = (data.brandConfig.name || "").toLowerCase();
  if (brandName.includes("nusaphone") || brandName.includes("r phone")) {
    return { sanitized: INITIAL_STORE_DATA, wasModified: true };
  }
  const needsBackfill = !data.categories || data.categories.length === 0 || !data.brands || data.brands.length === 0;
  if (needsBackfill) {
    return {
      sanitized: {
        ...data,
        categories: data.categories && data.categories.length > 0 ? data.categories : INITIAL_STORE_DATA.categories,
        brands: data.brands && data.brands.length > 0 ? data.brands : INITIAL_STORE_DATA.brands,
      },
      wasModified: true,
    };
  }
  return { sanitized: data, wasModified: false };
}

async function readFromKv(key: string): Promise<StoreData | null> {
  const cfg = getKvConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", key]),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: string | null };
    if (!json.result) return null;
    const parsed = typeof json.result === "string" ? JSON.parse(json.result) : json.result;
    const { sanitized, wasModified } = sanitizeStoreData(parsed as StoreData);
    if (wasModified) await writeToKv(key, sanitized);
    return sanitized;
  } catch {
    return null;
  }
}

async function writeToKv(key: string, data: StoreData): Promise<boolean> {
  const cfg = getKvConfig();
  if (!cfg) return false;
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", key, JSON.stringify(data)]),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function readStoreFile(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as StoreData;
    const { sanitized, wasModified } = sanitizeStoreData(parsed);
    if (wasModified) {
      await fs.writeFile(DATA_FILE, JSON.stringify(sanitized, null, 2), "utf-8");
    }
    return sanitized;
  } catch {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_STORE_DATA, null, 2), "utf-8");
    } catch {
      // ignore on read-only fs
    }
    return INITIAL_STORE_DATA;
  }
}

export async function GET() {
  const supabaseActive = isSupabaseConfigured();
  const kvCfg = getKvConfig();
  const storageKey = getStorageKey();

  let data: StoreData | null = null;
  let storageType = "local-fs";

  if (supabaseActive) {
    data = await fetchStoreFromSupabase();
    if (data) storageType = "supabase-postgres";
  }

  if (!data && kvCfg) {
    data = await readFromKv(storageKey);
    if (data) {
      storageType = "cloud-kv";
      if (supabaseActive) {
        await saveStoreToSupabase(data);
        storageType = "supabase-postgres";
      }
    }
  }

  if (!data) {
    data = await readStoreFile();
    if (supabaseActive) {
      await saveStoreToSupabase(data);
      storageType = "supabase-postgres";
    } else if (kvCfg) {
      await writeToKv(storageKey, data);
      storageType = "cloud-kv";
    }
  }

  const { sanitized, wasModified } = sanitizeStoreData(data);
  data = sanitized;
  if (wasModified) {
    if (supabaseActive) await saveStoreToSupabase(data);
    else if (kvCfg) await writeToKv(storageKey, data);
  }

  return NextResponse.json(
    {
      ...data,
      _meta: {
        storageType,
        isCloudConnected: Boolean(supabaseActive || kvCfg),
        cloudSource: supabaseActive ? "supabase-postgres" : kvCfg?.source || "none",
        isVercel: Boolean(process.env.VERCEL),
        storageKey,
      },
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(request: Request) {
  try {
    const supabaseActive = isSupabaseConfigured();
    const kvCfg = getKvConfig();
    const storageKey = getStorageKey();
    const body = (await request.json()) as StoreData;
    const { sanitized } = sanitizeStoreData(body);

    const updated: StoreData = {
      ...sanitized,
      lastUpdated: new Date().toISOString(),
    };

    let persistedOnCloud = false;
    let persistedOnDisk = false;

    if (supabaseActive) persistedOnCloud = await saveStoreToSupabase(updated);
    if (kvCfg) {
      const kvOk = await writeToKv(storageKey, updated);
      if (!persistedOnCloud) persistedOnCloud = kvOk;
    }

    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
      persistedOnDisk = true;
    } catch {
      persistedOnDisk = false;
    }

    return NextResponse.json({
      ok: true,
      persistedOnServer: persistedOnCloud || persistedOnDisk,
      persistedOnCloud,
      persistedOnDisk,
      storageType: supabaseActive
        ? "supabase-postgres"
        : kvCfg
        ? "cloud-kv"
        : persistedOnDisk
        ? "local-fs"
        : "read-only-fallback",
      cloudSource: supabaseActive ? "supabase-postgres" : kvCfg?.source || "none",
      isVercel: Boolean(process.env.VERCEL),
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

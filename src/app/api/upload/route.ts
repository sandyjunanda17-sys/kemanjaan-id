import { NextResponse } from "next/server";
import {
  uploadImageToSupabaseStorage,
  deleteImagesFromSupabaseStorage,
  isSupabaseConfigured,
} from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Supabase belum dikonfigurasi di Environment Variables." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "Berkas gambar tidak ditemukan pada request." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || "image/webp";
    const fileName = file.name || "upload.webp";

    const publicUrl = await uploadImageToSupabaseStorage(buffer, fileName, contentType);

    if (!publicUrl) {
      return NextResponse.json(
        { ok: false, error: "Gagal mengunggah gambar ke Supabase Storage. Pastikan bucket 'rphone-images' sudah dibuat di Supabase." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      url: publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { urls?: string[] };
    const urls = body.urls || [];

    if (urls.length === 0) {
      return NextResponse.json({ ok: true, deleted: 0 });
    }

    const success = await deleteImagesFromSupabaseStorage(urls);

    return NextResponse.json({
      ok: success,
      deleted: urls.length,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

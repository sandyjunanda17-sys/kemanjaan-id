/**
 * Utility untuk memproses, mengompres, dan menyesuaikan ukuran gambar secara otomatis
 * Mendukung semua format gambar (JPG, PNG, WEBP, GIF, HEIC, BMP, dll.)
 * Terintegrasi langsung dengan Supabase Storage Cloud CDN dengan fallback WebP ringan
 */
export function processImageFile(
  file: File,
  maxWidth = 850,
  maxHeight = 850,
  quality = 0.76
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validasi tipe file
    if (!file.type.startsWith("image/") && !file.name.match(/\.(jpe?g|png|webp|gif|bmp|heic|heif|svg)$/i)) {
      reject(new Error("File bukan format gambar yang valid."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error("Gagal membaca berkas gambar."));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Proporsional resize (menjaga aspek rasio asli)
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(src);
            return;
          }

          // Background putih halus untuk gambar transparan
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Coba simpan ke WebP, fallback ke JPEG jika browser lama
          let dataUrl: string;
          try {
            dataUrl = canvas.toDataURL("image/webp", quality);
            if (!dataUrl.startsWith("data:image/webp")) {
              dataUrl = canvas.toDataURL("image/jpeg", quality);
            }
          } catch {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          resolve(dataUrl);
        } catch (err) {
          console.warn("Fallback to raw image:", err);
          resolve(src);
        }
      };

      img.onerror = () => reject(new Error("Format gambar tidak dapat dirender."));
      img.src = src;
    };

    reader.onerror = () => reject(new Error("Gagal membuka file dari perangkat."));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload gambar langsung ke Supabase Storage Cloud CDN (jika sudah diset),
 * atau fallback otomatis ke format WebP super ringan & tajam (< 50KB).
 */
export async function uploadOrProcessImage(file: File): Promise<string> {
  // 1. Coba upload langsung ke Supabase Storage via /api/upload
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        return data.url;
      }
    }
  } catch {
    // Lanjutkan ke fallback lokal jika Supabase belum aktif
  }

  // 2. Fallback kompresi lokal WebP
  return processImageFile(file, 850, 850, 0.76);
}

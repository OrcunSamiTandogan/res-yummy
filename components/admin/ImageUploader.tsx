"use client";

import { useRef, useState } from "react";
import { apiRequest } from "@/lib/admin-client";

const MAX_IMAGES = 4;
const MAX_EDGE = 1600;

/** Tarayıcıda görseli küçültüp webp'e çevirir (sunucuda depsiz, repo hafif kalsın). */
async function toWebp(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    bitmap = await createImageBitmap(file);
  }
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Tarayıcı görseli işleyemedi");
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    if (!blob) throw new Error("WebP dönüşümü başarısız oldu");
    return blob;
  } finally {
    bitmap.close();
  }
}

type Props = {
  images: string[];
  slug: string;
  onChange: (images: string[]) => void;
};

export function ImageUploader({ images, slug, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    if (images.length >= MAX_IMAGES) {
      setError(`En fazla ${MAX_IMAGES} görsel eklenebilir.`);
      return;
    }
    setBusy(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    try {
      const blob = await toWebp(file);
      const form = new FormData();
      form.append("file", new File([blob], `${slug || "gorsel"}.webp`, { type: "image/webp" }));
      form.append("slug", slug || "gorsel");
      const result = await apiRequest<{ path: string }>("/api/admin/upload", { method: "POST", body: form });
      onChange([...images, result.path]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme başarısız");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-slate-700 disabled:opacity-50"
        >
          {busy ? "Yükleniyor…" : "Görsel yükle"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="hidden"
          onChange={(event) => void handleFile(event.target.files)}
        />
        <span className="text-xs text-slate-400">
          {images.length}/{MAX_IMAGES} · otomatik küçültülür (max 1600px, webp)
        </span>
      </div>

      {preview ? <p className="text-xs text-amber-300">Yükleniyor, önizleme: {slug}.webp</p> : null}

      {images.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {images.map((image) => (
            <li key={image} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1 text-xs">
              <span className="max-w-[220px] truncate text-slate-300">{image}</span>
              <button
                type="button"
                onClick={() => onChange(images.filter((entry) => entry !== image))}
                className="text-rose-300 transition hover:text-rose-200"
                aria-label={`${image} görselini kaldır`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-500">Görsel yok — kalem, kategorinin ilk fotoğrafıyla gösterilir.</p>
      )}

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
      {images.length > 0 ? (
        <p className="text-xs text-slate-500">
          Yeni yüklenen görsel, Vercel rebuild tamamlanınca sitede görünür (~40 sn).
        </p>
      ) : null}
    </div>
  );
}

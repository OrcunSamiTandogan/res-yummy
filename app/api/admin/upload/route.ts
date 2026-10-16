import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { fileSha, writeFile } from "@/lib/github";
import { slugify } from "@/lib/menu-validate";
import { isSameOrigin } from "@/lib/origin-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB (panel zaten ~1600px webp'e küçültüp yollar)

/** Dosyanın gerçek türünü ilk baytlardan anlar (MIME'a güvenmiyoruz). */
function detectExtension(bytes: Uint8Array): "webp" | "png" | "jpg" | null {
  if (
    bytes.length > 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return "webp";
  }
  if (bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  return null;
}

/** Görseli public/menu/<slug>.<ext> olarak commit eder ve site yolunu döner. */
export async function POST(request: Request) {
  const store = await cookies();
  if (!verifySessionToken(store.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Geçersiz origin" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Form verisi okunamadı" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file alanı gerekli" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Boş dosya" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Görsel çok büyük (max 3 MB)" }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const extension = detectExtension(bytes);
  if (!extension) {
    return NextResponse.json({ error: "Desteklenmeyen görsel türü (webp/png/jpg)" }, { status: 415 });
  }

  const requestedSlug = form.get("slug");
  const baseName = typeof requestedSlug === "string" && requestedSlug.trim() ? requestedSlug : file.name;
  const slug = slugify(baseName);
  const fileName = `${slug}.${extension}`;
  const repoPath = `public/menu/${fileName}`;

  try {
    const sha = await fileSha(repoPath);
    const commit = await writeFile({
      path: repoPath,
      contentBase64: Buffer.from(bytes).toString("base64"),
      sha,
      message: `chore(menu): görsel ${fileName}`,
    });
    return NextResponse.json({ ok: true, path: `/menu/${fileName}`, commit });
  } catch (error) {
    const message = error instanceof Error ? error.message : "yükleme hatası";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

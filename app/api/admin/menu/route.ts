import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { readTextFile, repoConfig, writeTextFile } from "@/lib/github";
import { validateMenu } from "@/lib/menu-validate";
import { isSameOrigin } from "@/lib/origin-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MENU_PATH = "data/menu.json";

function fail(error: unknown): string {
  return error instanceof Error ? error.message : "bilinmeyen hata";
}

async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

/** Repodaki güncel menü verisi (build çıktısı değil, kaynak dosya). */
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const file = await readTextFile(MENU_PATH);
    if (!file) {
      return NextResponse.json({ error: `${MENU_PATH} repoda bulunamadı` }, { status: 404 });
    }
    return NextResponse.json({
      categories: JSON.parse(file.content) as unknown,
      sha: file.sha,
      path: MENU_PATH,
    });
  } catch (error) {
    return NextResponse.json({ error: fail(error) }, { status: 502 });
  }
}

/** Doğrulayıp repoya commit eder → Vercel otomatik rebuild. */
export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Geçersiz origin" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON gövde okunamadı" }, { status: 400 });
  }

  const body = payload as { categories?: unknown };
  const result = validateMenu(body.categories);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  try {
    const current = await readTextFile(MENU_PATH);
    const content = `${JSON.stringify(result.categories, null, 2)}\n`;
    const commit = await writeTextFile({
      path: MENU_PATH,
      content,
      sha: current?.sha ?? null,
      message: "chore(menu): admin panelden menü güncellendi",
    });
    const { repo, branch } = repoConfig();
    return NextResponse.json({
      ok: true,
      commit,
      repo,
      branch,
      categories: result.categories.length,
      items: result.categories.reduce((total, category) => total + category.items.length, 0),
    });
  } catch (error) {
    return NextResponse.json({ error: fail(error) }, { status: 502 });
  }
}

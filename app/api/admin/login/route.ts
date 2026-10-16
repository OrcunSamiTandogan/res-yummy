import { NextResponse } from "next/server";
import { adminConfigured, attachSessionCookie, checkPassword, missingAdminEnv } from "@/lib/auth";
import { isSameOrigin } from "@/lib/origin-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tek şifre ile giriş → imzalı httpOnly cookie. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Geçersiz origin" }, { status: 403 });
  }
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: `Panel yapılandırılmadı. Vercel'de eksik ortam değişkeni: ${missingAdminEnv().join(", ")}` },
      { status: 503 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password;
  } catch {
    password = "";
  }

  if (!password || !checkPassword(password)) {
    // Kaba kuvvet denemelerini yavaşlat.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return NextResponse.json({ error: "Şifre hatalı" }, { status: 401 });
  }

  return attachSessionCookie(NextResponse.json({ ok: true }));
}

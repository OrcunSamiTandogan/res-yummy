import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Oturumu kapatır (cookie silinir). */
export async function POST() {
  return clearSessionCookie(NextResponse.json({ ok: true }));
}

// Admin oturumu: tek şifre (env) + HMAC imzalı httpOnly cookie.
// Kütüphane yok — node:crypto yeterli. Şifre ve sır Vercel ortam değişkenlerinde durur.

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";

export const ADMIN_COOKIE = "resy_admin";
export const ADMIN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 gün

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET tanımlı değil ya da çok kısa (min 16 karakter)");
  }
  return secret;
}

/** Panelin çalışması için gereken üç değişken var mı? */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET && process.env.GITHUB_TOKEN);
}

/** Eksik değişkenlerin adlarını döner (kurulum ekranında gösterilir). */
export function missingAdminEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.ADMIN_PASSWORD) missing.push("ADMIN_PASSWORD");
  if (!process.env.ADMIN_SESSION_SECRET) missing.push("ADMIN_SESSION_SECRET");
  if (!process.env.GITHUB_TOKEN) missing.push("GITHUB_TOKEN");
  return missing;
}

/** Sabit süreli şifre karşılaştırması. */
export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const given = Buffer.from(candidate, "utf8");
  const want = Buffer.from(expected, "utf8");
  if (given.length !== want.length) return false;
  return timingSafeEqual(given, want);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + ADMIN_MAX_AGE_SECONDS * 1000;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expiresAt, nonce, signature] = parts;
  const expected = sign(`${expiresAt}.${nonce}`);
  if (signature.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"))) return false;
  const exp = Number(expiresAt);
  return Number.isFinite(exp) && exp > Date.now();
}

/** Cookie'yi yanıta ekler. */
export function attachSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

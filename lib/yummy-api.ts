"use client";

import type { MenuCategory } from "@/data/menu";
import type { LocalizedText } from "@/data/i18n";

export const CMS_API_URL = process.env.NEXT_PUBLIC_YUMMY_API_URL?.replace(/\/$/, "") ?? "";
export const cmsEnabled = CMS_API_URL.length > 0;

export type RestaurantContent = {
  restaurantName: LocalizedText;
  brandTagline: LocalizedText;
  slogan: LocalizedText;
  whatsappNumber: string;
  phone: string;
  address: LocalizedText;
  mapsUrl: string;
  mapsEmbed: string;
  workingHours: { days: LocalizedText; hours: string }[];
};

export type MessageRecord = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type MenuDocument = { categories: MenuCategory[]; revision: number };
type ApiError = { detail?: string | unknown[]; error?: string };

export async function cmsRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  if (!cmsEnabled) throw new Error("CMS API URL is not configured.");
  const isForm = init.body instanceof FormData;
  const response = await fetch(CMS_API_URL + path, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: isForm ? init.headers : { "Content-Type": "application/json", ...init.headers },
  });
  if (response.status === 401 && retry && !["/auth/login", "/auth/refresh"].includes(path)) {
    try {
      await cmsRequest("/auth/refresh", { method: "POST" }, false);
      return cmsRequest<T>(path, init, false);
    } catch {
      // Expired or revoked session.
    }
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError;
    throw new Error(typeof body.detail === "string" ? body.detail : body.error ?? "Request failed (" + response.status + ")");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function publicCmsRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!cmsEnabled) throw new Error("CMS API URL is not configured.");
  const response = await fetch(CMS_API_URL + path, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init.headers },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("CMS unavailable (" + response.status + ")");
  return response.json() as Promise<T>;
}

export async function uploadCmsImage(file: File): Promise<{ path: string }> {
  const form = new FormData();
  form.append("upload", file);
  return cmsRequest("/admin/media", { method: "POST", body: form });
}

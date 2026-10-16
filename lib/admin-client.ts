// Admin panelinin istemci tarafı yardımcıları: tipler, varsayılanlar, API çağrıları.
// Sunucu doğrulaması lib/menu-validate.ts içinde — buradakiler yalnızca UX için.

import type { Locale, LocalizedText } from "@/data/i18n";
import type { MenuCategory, MenuItem } from "@/data/menu";

export const EDIT_LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "id", label: "ID" },
  { code: "ru", label: "RU" },
  { code: "tr", label: "TR" },
];

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };

/** Sunucudaki id kuralıyla aynı: küçük harf, rakam, tek tire. */
export function slugifyId(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[çğıöşüİ]/g, (char) => TR_MAP[char] ?? char);
  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export function uniqueId(base: string, taken: Set<string>): string {
  const slug = slugifyId(base) || "kalem";
  if (!taken.has(slug)) return slug;
  let index = 2;
  while (taken.has(`${slug}-${index}`)) index += 1;
  return `${slug}-${index}`;
}

/** Aynı metni dört dile kopyalar (panel varsayılanı). */
export function sameText(value: string): LocalizedText {
  return { en: value, id: value, ru: value, tr: value };
}

export function collectIds(categories: MenuCategory[]): Set<string> {
  const ids = new Set<string>();
  for (const category of categories) {
    ids.add(category.id);
    for (const item of category.items) ids.add(item.id);
  }
  return ids;
}

export function newItem(id: string): MenuItem {
  return {
    id,
    name: sameText("Yeni kalem"),
    description: sameText("Açıklama"),
    price: 50000,
    images: [],
    swatch: "#f43f5e",
  };
}

export function newCategory(id: string): MenuCategory {
  return {
    id,
    icon: "🍽️",
    name: sameText("Yeni kategori"),
    items: [newItem(`${id}-1`)],
  };
}

export function formatIdr(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

/** API çağrısı: hata gövdesindeki `error` alanını Error mesajına çevirir. */
export async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: init?.body instanceof FormData ? init?.headers : { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = null;
    }
  }
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : `İstek başarısız (${response.status})`;
    throw new Error(message);
  }
  return (data ?? ({} as unknown)) as T;
}

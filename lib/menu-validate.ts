// Admin panelinden gelen menü verisinin sunucu tarafı doğrulaması.
// Amaç: bozuk/eksik veri repoya commit edilmesin (build kırılmasın).

import type { Locale, LocalizedText } from "@/data/i18n";
import { LOCALES } from "@/data/i18n";
import type { AddOn, MenuCategory, MenuItem } from "@/data/menu";

export type ValidationResult =
  | { ok: true; categories: MenuCategory[] }
  | { ok: false; error: string };

export const LIMITS = {
  categories: 12,
  itemsPerCategory: 40,
  name: 120,
  description: 400,
  icon: 8,
  imagesPerItem: 4,
  priceMin: 1000,
  priceMax: 50_000_000,
  addOnLabel: 60,
} as const;

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_PATTERN = /^\/menu\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpg|jpeg|png|webp)$/;
const SWATCH_PATTERN = /^#[0-9a-fA-F]{6}$/;

const LOCALE_CODES: Locale[] = LOCALES.map((entry) => entry.code);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== "string") throw new Error(`${label}: metin olmalı`);
  const trimmed = value.trim();
  if (trimmed.length < min) throw new Error(`${label}: en az ${min} karakter olmalı`);
  if (trimmed.length > max) throw new Error(`${label}: en fazla ${max} karakter olabilir`);
  return trimmed;
}

function readLocalized(value: unknown, label: string, min: number, max: number): LocalizedText {
  if (!isRecord(value)) throw new Error(`${label}: dört dilli nesne olmalı`);
  const out = {} as LocalizedText;
  for (const code of LOCALE_CODES) {
    out[code] = readString(value[code], `${label}.${code}`, min, max);
  }
  return out;
}

function readPrice(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${label}: tam sayı olmalı (IDR)`);
  }
  if (value < LIMITS.priceMin || value > LIMITS.priceMax) {
    throw new Error(`${label}: ${LIMITS.priceMin} – ${LIMITS.priceMax} aralığında olmalı`);
  }
  return value;
}

function readId(value: unknown, label: string): string {
  const id = readString(value, label, 2, 48);
  if (!ID_PATTERN.test(id)) {
    throw new Error(`${label}: sadece küçük harf, rakam ve tire (örn. "one-scoop")`);
  }
  return id;
}

function readImages(value: unknown, label: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new Error(`${label}: dizi olmalı`);
  if (value.length > LIMITS.imagesPerItem) {
    throw new Error(`${label}: en fazla ${LIMITS.imagesPerItem} görsel`);
  }
  return value.map((entry, index) => {
    const imagePath = readString(entry, `${label}[${index}]`, 5, 200);
    if (!IMAGE_PATTERN.test(imagePath)) {
      throw new Error(`${label}[${index}]: yol "/menu/dosya.jpg" biçiminde olmalı`);
    }
    return imagePath;
  });
}

function readAddOn(value: unknown, label: string): AddOn | undefined {
  if (value === undefined || value === null) return undefined;
  if (!isRecord(value)) throw new Error(`${label}: nesne olmalı`);
  return {
    label: readLocalized(value.label, `${label}.label`, 1, LIMITS.addOnLabel),
    price: readPrice(value.price, `${label}.price`),
  };
}

function readSwatch(value: unknown, label: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const swatch = readString(value, label, 4, 7);
  if (!SWATCH_PATTERN.test(swatch)) throw new Error(`${label}: "#rrggbb" biçiminde olmalı`);
  return swatch;
}

function readItem(value: unknown, label: string): MenuItem {
  if (!isRecord(value)) throw new Error(`${label}: nesne olmalı`);
  const item: MenuItem = {
    id: readId(value.id, `${label}.id`),
    name: readLocalized(value.name, `${label}.name`, 1, LIMITS.name),
    description: readLocalized(value.description, `${label}.description`, 1, LIMITS.description),
    price: readPrice(value.price, `${label}.price`),
    images: readImages(value.images, `${label}.images`),
  };
  const addOn = readAddOn(value.addOn, `${label}.addOn`);
  if (addOn) item.addOn = addOn;
  const swatch = readSwatch(value.swatch, `${label}.swatch`);
  if (swatch) item.swatch = swatch;
  return item;
}

function readCategory(value: unknown, label: string): MenuCategory {
  if (!isRecord(value)) throw new Error(`${label}: nesne olmalı`);
  if (!Array.isArray(value.items) || value.items.length === 0) {
    throw new Error(`${label}.items: en az 1 kalem olmalı`);
  }
  if (value.items.length > LIMITS.itemsPerCategory) {
    throw new Error(`${label}.items: en fazla ${LIMITS.itemsPerCategory} kalem`);
  }
  return {
    id: readId(value.id, `${label}.id`),
    icon: readString(value.icon, `${label}.icon`, 1, LIMITS.icon),
    name: readLocalized(value.name, `${label}.name`, 1, LIMITS.name),
    items: value.items.map((item, index) => readItem(item, `${label}.items[${index}]`)),
  };
}

/** Ham panel girdisini doğrular ve normalize edilmiş kategori listesini döner. */
export function validateMenu(input: unknown): ValidationResult {
  try {
    if (!Array.isArray(input) || input.length === 0) {
      throw new Error("menü: en az 1 kategori olmalı");
    }
    if (input.length > LIMITS.categories) {
      throw new Error(`menü: en fazla ${LIMITS.categories} kategori`);
    }
    const categories = input.map((entry, index) => readCategory(entry, `kategori[${index}]`));

    const categoryIds = new Set<string>();
    const itemIds = new Set<string>();
    for (const category of categories) {
      if (categoryIds.has(category.id)) throw new Error(`kategori id tekrarı: ${category.id}`);
      categoryIds.add(category.id);
      for (const item of category.items) {
        if (itemIds.has(item.id)) throw new Error(`kalem id tekrarı: ${item.id}`);
        itemIds.add(item.id);
      }
    }
    return { ok: true, categories };
  } catch (error) {
    const message = error instanceof Error ? error.message : "doğrulama hatası";
    return { ok: false, error: message };
  }
}

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };

/** Metni dosya adına uygun slug'a çevirir (görsel yüklemeleri için). */
export function slugify(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[çğıöşüİ]/g, (char) => TR_MAP[char] ?? char);
  const slug = normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return slug || "gorsel";
}

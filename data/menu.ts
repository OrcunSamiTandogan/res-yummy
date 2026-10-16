import type { LocalizedText } from "./i18n";
import menuJson from "./menu.json";

// Yummy — WAFFLE & GELATO menüsü.
//
// VERİ TARAFI: gerçek içerik `data/menu.json` içindedir (tek kaynak).
// `/admin` paneli bu dosyayı GitHub API ile günceller -> commit -> Vercel rebuild.
// Buradaki dosya yalnızca tipleri ve yükleyiciyi tutar, veri kopyası YOKTUR.
//
// Bilinen placeholder'lar (data/menu.json içinde, gerçek veri gelince panelden düzeltilir):
// cup-large 85000, bubble-cup 30000, fruit-cup 35000.

export type AddOn = {
  label: LocalizedText;
  price: number;
};

export type MenuItem = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number; // IDR cinsinden tam sayı
  images: string[];
  addOn?: AddOn; // isteğe bağlı ekstra (örn. "Add Ice Cream")
  swatch?: string; // gelato rengi için CSS rengi (opsiyonel vurgu noktası)
};

export type MenuCategory = {
  id: string;
  icon: string;
  name: LocalizedText;
  items: MenuItem[];
};

export const menuCategories = menuJson as MenuCategory[];

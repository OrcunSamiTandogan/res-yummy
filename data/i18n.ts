// Basit i18n — kütüphane yok. Marka/UI metinleri Record<Locale, string>.
// Varsayılan dil İngilizce. Dil değişimi client-side state ile (bkz. LanguageContext).

export type Locale = "en" | "id" | "ru" | "tr";

export type LocalizedText = Record<Locale, string>;

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "id", flag: "🇮🇩", label: "Bahasa Indonesia" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "tr", flag: "🇹🇷", label: "Türkçe" },
];

// Küçük yardımcı: bir LocalizedText'ten aktif dildeki değeri döndür.
export function pick(localized: LocalizedText, locale: Locale): string {
  return localized[locale];
}
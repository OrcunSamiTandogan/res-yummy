"use client";

import { LOCALES } from "@/data/i18n";
import { useLanguage } from "./LanguageContext";

/**
 * Gerçek dil seçici — seçilen dil LanguageContext üzerinden tüm sayfaya yayılır.
 * Varsayılan İngilizce (en). Dört dil: EN/ID/RU/TR.
 */
export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();

  return (
    <div role="group" aria-label="Select language" className="flex items-center gap-1">
      {LOCALES.map((lang) => {
        const isSelected = locale === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            aria-pressed={isSelected}
            aria-label={lang.label}
            title={lang.label}
            onClick={() => setLocale(lang.code)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              isSelected
                ? "bg-brand-700 text-white shadow-sm"
                : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            <span aria-hidden="true">{lang.flag}</span>
            <span>{lang.code}</span>
          </button>
        );
      })}
    </div>
  );
}
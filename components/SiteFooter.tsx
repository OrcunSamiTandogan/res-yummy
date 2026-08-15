"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { pick } from "@/data/i18n";
import { ui } from "@/data/ui";
import { restaurantName, brandTagline, address } from "@/data/restaurant";
import { WhatsAppButton } from "./WhatsAppButton";

export function SiteFooter() {
  const { locale } = useLanguage();

  return (
    <>
      <footer className="border-t border-white/10 bg-espresso pb-24 sm:pb-10">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-12">
          <p className="font-display text-lg font-semibold text-white">
            {pick(restaurantName, locale)}
          </p>
          <p className="mt-1 text-sm text-white/60">{pick(brandTagline, locale)}</p>
          <p className="mt-2 text-sm text-white/60">{pick(address, locale)}</p>

          {/* Alt menü */}
          <nav className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <Link href="/" className="text-white/70 transition hover:text-white">
              {pick(ui.navHome, locale)}
            </Link>
            <Link href="/contact" className="text-white/70 transition hover:text-white">
              {pick(ui.navContact, locale)}
            </Link>
            <Link href="/careers" className="text-white/70 transition hover:text-white">
              {pick(ui.navCareers, locale)}
            </Link>
          </nav>

          <p className="mt-6 text-xs text-white/60">
            &copy; {new Date().getFullYear()} {pick(restaurantName, locale)}.{" "}
            {pick(ui.footerRights, locale)}
          </p>

          {/* Geliştirici iletişimi */}
          <div className="mx-auto mt-8 max-w-md border-t border-white/10 pt-6">
            <p className="text-xs text-white/50">{pick(ui.siteCreditNote, locale)}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
              <a
                href="mailto:orcun@tandogan.dev"
                className="text-white/70 underline decoration-white/30 underline-offset-4 transition hover:text-white"
              >
                orcun@tandogan.dev
              </a>
              <a
                href={`https://wa.me/64273643999?text=${encodeURIComponent(
                  pick(ui.siteCreditMessage, locale),
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 underline decoration-white/30 underline-offset-4 transition hover:text-white"
              >
                +64 27 364 3999
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sabit WhatsApp butonu */}
      <WhatsAppButton
        message={pick(ui.generalMessage, locale)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg ring-4 ring-white/70 transition hover:bg-emerald-800"
      >
        <span className="sr-only">WhatsApp</span>
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.35a9.9 9.9 0 0 0 4.62 1.14h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.79 14.07c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.12.07-1.8-.11-.42-.11-.95-.3-1.63-.6-2.87-1.24-4.74-4.13-4.88-4.32-.14-.19-1.17-1.55-1.17-2.96s.73-2.1 1-2.39c.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.97.88 2.11.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.29-.12.57.17.29.75 1.24 1.62 2.01 1.11 1 2.05 1.31 2.33 1.46.29.14.46.12.63-.07.17-.19.71-.83.9-1.11.19-.29.38-.24.64-.14.26.1 1.65.78 1.93.93.29.14.48.21.55.33.07.12.07.67-.17 1.35Z" />
        </svg>
      </WhatsAppButton>
    </>
  );
}
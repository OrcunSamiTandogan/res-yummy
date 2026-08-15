"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "./LanguageContext";
import { pick } from "@/data/i18n";
import { ui } from "@/data/ui";
import { restaurantName } from "@/data/restaurant";

const NAV_LINKS = [
  { href: "/", key: "navHome" as const },
  { href: "/#menu", key: "menuButton" as const },
  { href: "/contact", key: "navContact" as const },
  { href: "/careers", key: "navCareers" as const },
];

export function SiteHeader() {
  const { locale } = useLanguage();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Step 1.0: Sticky header — scroll'da arka plan belirginleşir.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-cream/90 shadow-sm backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-700 font-display text-lg font-bold text-white shadow-sm">
            Y
          </span>
          <span className="font-display text-lg font-semibold text-slate-900">
            {pick(restaurantName, locale)}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  {pick(ui[link.key], locale)}
                </Link>
              );
            })}
          </nav>
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
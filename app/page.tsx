"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Clock, CalendarCheck, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import { menuCategories } from "@/data/menu";
import {
  restaurantName,
  brandTagline,
  slogan,
  address,
  phone,
  workingHours,
} from "@/data/restaurant";
import { MenuItemCard } from "@/components/MenuItemCard";
import { ReservationForm } from "@/components/ReservationForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/components/LanguageContext";
import { pick } from "@/data/i18n";
import { ui } from "@/data/ui";

export default function HomePage() {
  const { locale } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id ?? "");
  const [scrolled, setScrolled] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Step 1.0: Sticky header — hero'dan inildiğinde görünür olur.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Step 1.1: Kategori scroll-spy + reveal animasyonu tek observer'da.
  useEffect(() => {
    const sections = Object.values(sectionRefs.current).filter(
      (el): el is HTMLElement => el !== null,
    );

    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-category");
            if (id) setActiveCategory(id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
            reveal.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );

    sections.forEach((el) => spy.observe(el));
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));
    return () => {
      spy.disconnect();
      reveal.disconnect();
    };
  }, []);

  return (
    <main className="flex-1">
      {/* Sticky Header */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-cream/90 shadow-sm backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-700 font-display text-lg font-bold text-white shadow-sm">
              Y
            </span>
            <span className="font-display text-lg font-semibold text-slate-900">
              {pick(restaurantName, locale)}
            </span>
          </a>
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-1 sm:flex">
              <a
                href="#menu"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {pick(ui.menuButton, locale)}
              </a>
              <a
                href="#rezervasyon"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
              >
                {pick(ui.reserveButton, locale)}
              </a>
            </nav>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        className="relative overflow-hidden bg-cream bg-[radial-gradient(circle_at_1px_1px,rgba(180,83,9,0.08)_1px,transparent_0)] bg-[length:24px_24px]"
      >
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-36">
          <span
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700"
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            {pick(ui.heroBadge, locale)}
          </span>
          <h1
            data-reveal
            className="mt-6 font-display text-5xl font-semibold tracking-tight text-slate-900 sm:text-7xl"
          >
            {pick(restaurantName, locale)}
          </h1>
          <p
            data-reveal
            className="mx-auto mt-4 max-w-xl text-base text-slate-600 sm:text-lg"
          >
            {pick(slogan, locale)}
          </p>

          <div
            data-reveal
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-7 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-800"
            >
              <UtensilsCrossed className="h-4 w-4" />
              {pick(ui.menuButton, locale)}
            </a>
            <a
              href="#rezervasyon"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:bg-slate-600 hover:text-white"
            >
              <CalendarCheck className="h-4 w-4" />
              {pick(ui.reserveButton, locale)}
            </a>
          </div>

          {/* Hero görseli — yumuşak çerçeveli menü fotoğrafı */}
          <div data-reveal className="mx-auto mt-12 max-w-2xl">
            <div className="relative overflow-hidden rounded-3xl shadow-lift ring-1 ring-brand-100">
              <Image
                src="/menu/menu-1.jpg"
                alt={pick(brandTagline, locale)}
                width={1200}
                height={1600}
                priority
                className="h-64 w-full object-cover object-top sm:h-80"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/70 to-transparent p-4 text-left">
                <p className="font-display text-lg font-semibold text-white">
                  {pick(brandTagline, locale)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menü */}
      <section id="menu" className="scroll-mt-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              {pick(ui.menuEyebrow, locale)}
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
              {pick(ui.menuHeading, locale)}
            </h2>
          </div>

          {/* Kategori navigasyonu — ikonlu pill */}
          <div className="sticky top-[57px] z-30 -mx-4 mb-10 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {menuCategories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <a
                    key={category.id}
                    href={`#kat-${category.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-brand-700 text-white shadow-sm"
                        : "bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
                    }`}
                  >
                    <span aria-hidden="true">{category.icon}</span>
                    {pick(category.name, locale)}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="space-y-16">
            {menuCategories.map((category) => (
              <div
                key={category.id}
                id={`kat-${category.id}`}
                data-category={category.id}
                ref={(el) => {
                  sectionRefs.current[category.id] = el;
                }}
                className="scroll-mt-32"
              >
                <h3 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-3 font-display text-2xl font-semibold text-slate-900">
                  <span aria-hidden="true">{category.icon}</span>
                  {pick(category.name, locale)}
                </h3>
                <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="w-[78vw] flex-shrink-0 snap-start sm:w-[320px]"
                    >
                      <MenuItemCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rezervasyon */}
      <section id="rezervasyon" className="scroll-mt-16 bg-vanilla">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              {pick(ui.reserveEyebrow, locale)}
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
              {pick(ui.reserveHeading, locale)}
            </h2>
            <p className="mt-3 text-slate-600">{pick(ui.reserveSub, locale)}</p>
          </div>
          <ReservationForm />
        </div>
      </section>

      {/* İletişim + Saatler */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Phone className="h-5 w-5 text-brand-600" />
                {pick(ui.contactHeading, locale)}
              </h3>
              <p className="mt-3 flex items-start gap-2 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {pick(address, locale)}
              </p>
              <p className="mt-1 pl-6 text-slate-600">{phone}</p>
              <WhatsAppButton
                message={pick(ui.generalMessage, locale)}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                {pick(ui.writeWhatsApp, locale)}
              </WhatsAppButton>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Clock className="h-5 w-5 text-brand-600" />
                {pick(ui.hoursHeading, locale)}
              </h3>
              <ul className="mt-3 space-y-2">
                {workingHours.map((entry) => (
                  <li key={entry.days.en} className="flex justify-between text-sm text-slate-600">
                    <span>{pick(entry.days, locale)}</span>
                    <span className="font-medium text-slate-900">{entry.hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-espresso pb-24 sm:pb-10">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-12">
          <p className="font-display text-lg font-semibold text-white">
            {pick(restaurantName, locale)}
          </p>
          <p className="mt-1 text-sm text-white/60">{pick(brandTagline, locale)}</p>
          <p className="mt-2 text-sm text-white/60">{pick(address, locale)}</p>
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
    </main>
  );
}
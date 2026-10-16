"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Clock, CalendarCheck, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { menuCategories } from "@/data/menu";
import {
  restaurantName,
  brandTagline,
  slogan,
  address,
  phone,
  workingHours,
  mapsUrl,
} from "@/data/restaurant";
import { MenuItemCard } from "@/components/MenuItemCard";
import { ReservationForm } from "@/components/ReservationForm";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useLanguage } from "@/components/LanguageContext";
import { pick } from "@/data/i18n";
import { ui } from "@/data/ui";

export default function HomePage() {
  const { locale } = useLanguage();
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id ?? "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Step 1.0: Kategori scroll-spy + reveal animasyonu.
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
    <div>
      {/* Hero */}
      <section
        id="top"
        className="relative overflow-hidden bg-cream bg-[radial-gradient(circle_at_1px_1px,rgba(180,83,9,0.08)_1px,transparent_0)] bg-[length:24px_24px]"
      >
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-32 text-center sm:px-6 sm:pb-24 sm:pt-40">
          <span
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700"
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            {pick(ui.heroBadge, locale)}
          </span>
          <h1
            data-reveal
            className="mt-6 font-display text-6xl font-semibold tracking-tight text-slate-900 sm:text-7xl"
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

          {/* Hero görseli */}
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
      <section id="menu" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
              {pick(ui.menuEyebrow, locale)}
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
              {pick(ui.menuHeading, locale)}
            </h2>
          </div>

          {/* Kategori navigasyonu */}
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
      <section id="rezervasyon" className="scroll-mt-24 bg-vanilla">
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
              <div className="mt-5 flex flex-wrap gap-3">
                <WhatsAppButton
                  message={pick(ui.generalMessage, locale)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  {pick(ui.writeWhatsApp, locale)}
                </WhatsAppButton>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-50 px-5 py-2.5 text-sm font-semibold text-brand-700 ring-1 ring-brand-100 transition hover:bg-brand-100"
                >
                  {pick(ui.navContact, locale)}
                </Link>
              </div>
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
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition hover:text-brand-800"
              >
                <MapPin className="h-4 w-4" />
                {pick(ui.getDirections, locale)}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
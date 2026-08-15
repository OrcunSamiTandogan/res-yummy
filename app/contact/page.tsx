"use client";

import { MapPin, Phone, Clock, Navigation, MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { pick } from "@/data/i18n";
import { ui } from "@/data/ui";
import { address, phone, workingHours, mapsUrl, mapsEmbed } from "@/data/restaurant";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function ContactPage() {
  const { locale } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24 sm:pt-40">
      {/* Başlık */}
      <div className="mb-12 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
          {pick(ui.contactEyebrow, locale)}
        </span>
        <h1 className="mt-2 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
          {pick(ui.contactPageHeading, locale)}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">{pick(ui.contactSub, locale)}</p>
      </div>

      {/* Harita + bilgi kartı */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Harita */}
        <div className="overflow-hidden rounded-3xl shadow-soft ring-1 ring-brand-100/60 lg:col-span-3">
          <iframe
            title="Yummy location"
            src={mapsEmbed}
            className="h-80 w-full border-0 sm:h-full sm:min-h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        {/* Bilgi */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-100/60">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
              <MapPin className="h-5 w-5 text-brand-600" />
              {pick(ui.contactHeading, locale)}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{pick(address, locale)}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-brand-500" />
              {phone}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <WhatsAppButton
                message={pick(ui.generalMessage, locale)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <MessageCircle className="h-4 w-4" />
                {pick(ui.writeWhatsApp, locale)}
              </WhatsAppButton>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800"
              >
                <Navigation className="h-4 w-4" />
                {pick(ui.getDirections, locale)}
              </a>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-100/60">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
              <Clock className="h-5 w-5 text-brand-600" />
              {pick(ui.hoursHeading, locale)}
            </h2>
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
    </div>
  );
}
"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { MenuItem } from "@/data/menu";
import { ItemOrder } from "./ItemOrder";
import { useLanguage } from "./LanguageContext";
import { pick } from "@/data/i18n";

const IDR_FORMATTER = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { locale } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const hero = item.images[0];

  const name = pick(item.name, locale);
  const description = pick(item.description, locale);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-brand-100/60 transition duration-300 hover:-translate-y-1.5 hover:shadow-lift focus-within:-translate-y-1.5 focus-within:shadow-lift">
      {/* Görsel */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
        {hero ? (
          <>
            <div
              aria-hidden="true"
              className={`absolute inset-0 animate-pulse bg-brand-100 transition-opacity duration-300 ${
                loaded ? "opacity-0" : "opacity-100"
              }`}
            />
            <Image
              src={hero}
              alt={name}
              fill
              onLoad={() => setLoaded(true)}
              className={`object-cover transition duration-500 group-hover:scale-105 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-brand-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
              />
            </svg>
          </div>
        )}

        {/* Fiyat rozeti — sağ üstte yüzer */}
        <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-brand-700 shadow-sm ring-1 ring-brand-100 backdrop-blur">
          {IDR_FORMATTER.format(item.price)}
        </div>

        {/* Swatch noktası — gelato/lezzet rengi */}
        {item.swatch && (
          <span
            aria-hidden="true"
            className="absolute left-3 top-3 h-3.5 w-3.5 rounded-full ring-2 ring-white/80"
            style={{ backgroundColor: item.swatch }}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col space-y-3 p-5">
        <div className="flex items-start gap-3">
          <h3 className="font-display text-lg font-semibold leading-snug text-slate-900">{name}</h3>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{description}</p>

        {/* Add-on chip */}
        {item.addOn && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-berry-700">
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>{pick(item.addOn.label, locale)}</span>
            <span className="text-berry-500">
              {" "}
              +{IDR_FORMATTER.format(item.addOn.price)}
            </span>
          </div>
        )}

        <div className="mt-auto">
          <ItemOrder itemName={name} />
        </div>
      </div>
    </div>
  );
}
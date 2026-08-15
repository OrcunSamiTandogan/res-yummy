"use client";

import { useState } from "react";
import { CalendarDays, Clock, Users, Minus, Plus, MessageCircle } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useLanguage } from "./LanguageContext";
import { pick } from "@/data/i18n";
import { ui } from "@/data/ui";

const MIN_GUESTS = 1;
const MAX_GUESTS = 20;
const DEFAULT_GUESTS = 2;

const TIME_SLOTS = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
];

function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function ReservationForm() {
  const { locale } = useLanguage();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState(DEFAULT_GUESTS);

  const message = pick(ui.reservationMessage, locale)
    .replace("{date}", date)
    .replace("{time}", time)
    .replace("{guests}", String(guests));

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-100/60 sm:p-8">
      {/* Tarih */}
      <div className="mb-7">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarDays className="h-4 w-4 text-brand-600" />
          {pick(ui.date, locale)}
        </h3>
        <input
          type="date"
          value={date}
          min={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      {/* Saat */}
      <div className="mb-7">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Clock className="h-4 w-4 text-brand-600" />
          {pick(ui.time, locale)}
        </h3>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => setTime(slot)}
              aria-pressed={time === slot}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                time === slot
                  ? "bg-brand-700 text-white shadow-sm"
                  : "bg-brand-50 text-slate-700 ring-1 ring-brand-100 hover:bg-brand-100"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Kişi */}
      <div className="mb-7">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Users className="h-4 w-4 text-brand-600" />
          {pick(ui.guests, locale)}
        </h3>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setGuests((current) => Math.max(MIN_GUESTS, current - 1))}
            disabled={guests <= MIN_GUESTS}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-slate-700 ring-1 ring-brand-100 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={pick(ui.decreaseGuests, locale)}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center text-base font-bold text-slate-900">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests((current) => Math.min(MAX_GUESTS, current + 1))}
            disabled={guests >= MAX_GUESTS}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-slate-700 ring-1 ring-brand-100 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={pick(ui.increaseGuests, locale)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Gönder */}
      <WhatsAppButton
        message={message}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
          date
            ? "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800"
            : "pointer-events-none bg-slate-200 text-slate-400"
        }`}
      >
        <MessageCircle className="h-4 w-4" />
        {pick(ui.reserveOnWhatsApp, locale)}
      </WhatsAppButton>
      {!date && (
        <p className="mt-2 text-center text-xs text-slate-500">{pick(ui.pickDateHint, locale)}</p>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { Minus, Plus, MessageCircle } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { useLanguage } from "./LanguageContext";
import { pick } from "@/data/i18n";
import { ui } from "@/data/ui";

const MIN_QTY = 1;
const MAX_QTY = 20;
const DEFAULT_QTY = 1;

export function ItemOrder({ itemName }: { itemName: string }) {
  const { locale } = useLanguage();
  const [qty, setQty] = useState(DEFAULT_QTY);

  const decrease = () => setQty((prev) => Math.max(MIN_QTY, prev - 1));
  const increase = () => setQty((prev) => Math.min(MAX_QTY, prev + 1));

  const message = pick(ui.orderMessage, locale)
    .replace("{item}", itemName)
    .replace("{qty}", String(qty));

  return (
    <div className="space-y-3">
      {/* Adet stepper */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {pick(ui.qty, locale)}
        </p>
        <div className="flex items-center rounded-full bg-brand-50 ring-1 ring-brand-100">
          <button
            type="button"
            onClick={decrease}
            disabled={qty <= MIN_QTY}
            aria-label={pick(ui.decreaseQty, locale)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center text-sm font-bold text-slate-900">{qty}</span>
          <button
            type="button"
            onClick={increase}
            disabled={qty >= MAX_QTY}
            aria-label={pick(ui.increaseQty, locale)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* WhatsApp sipariş */}
      <WhatsAppButton
        message={message}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
      >
        <MessageCircle className="h-4 w-4" />
        {pick(ui.orderOnWhatsApp, locale)}
      </WhatsAppButton>
    </div>
  );
}
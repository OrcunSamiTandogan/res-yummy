"use client";

import { BadgeCheck, ListChecks, Banknote, Clock, MessageCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { pick } from "@/data/i18n";
import { ui } from "@/data/ui";
import { job } from "@/data/jobs";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function CareersPage() {
  const { locale } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-32 sm:px-6 sm:pb-24 sm:pt-40">
      {/* Başlık */}
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700">
          <Sparkles className="h-3.5 w-3.5" />
          {pick(ui.careersEyebrow, locale)}
        </span>
        <h1 className="mt-5 font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
          {pick(ui.careersHeading, locale)}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">{pick(ui.careersSub, locale)}</p>
      </div>

      {/* İlan kartı */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-brand-100/60">
        {/* Pozisyon başlığı */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-brand-50 to-vanilla p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-slate-900">
            {pick(job.title, locale)}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{pick(job.intro, locale)}</p>
        </div>

        <div className="space-y-7 p-6 sm:p-8">
          {/* Sorumluluklar */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900">
              <ListChecks className="h-4 w-4 text-brand-600" />
              {pick(ui.jobResponsibilitiesHeading, locale)}
            </h3>
            <ul className="space-y-2">
              {job.responsibilities.map((item) => (
                <li key={item.en} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {pick(item, locale)}
                </li>
              ))}
            </ul>
          </div>

          {/* Nitelikler */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900">
              <BadgeCheck className="h-4 w-4 text-brand-600" />
              {pick(ui.jobQualificationsHeading, locale)}
            </h3>
            <ul className="space-y-2">
              {job.qualifications.map((item) => (
                <li key={item.en} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-berry-500" />
                  {pick(item, locale)}
                </li>
              ))}
            </ul>
          </div>

          {/* Maaş + Saat bilgileri */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-brand-50 p-5 ring-1 ring-brand-100">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900">
                <Banknote className="h-4 w-4 text-brand-700" />
                {pick(ui.jobSalaryHeading, locale)}
              </h3>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {pick(job.salary, locale)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{pick(job.salaryDetail, locale)}</p>
            </div>
            <div className="rounded-2xl bg-vanilla p-5 ring-1 ring-brand-100">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900">
                <Clock className="h-4 w-4 text-brand-700" />
                {pick(ui.jobHoursHeading, locale)}
              </h3>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {pick(job.hours, locale)}
              </p>
              <p className="mt-1 text-sm text-slate-600">{pick(job.hoursDetail, locale)}</p>
            </div>
          </div>

          {/* Başvuru */}
          <div className="rounded-2xl border border-dashed border-brand-200 p-6 text-center">
            <p className="text-sm text-slate-600">
              {pick(ui.contactSub, locale)}
            </p>
            <WhatsAppButton
              message={pick(ui.jobApplicationMessage, locale)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <MessageCircle className="h-4 w-4" />
              {pick(ui.applyOnWhatsApp, locale)}
            </WhatsAppButton>
          </div>
        </div>
      </div>
    </div>
  );
}
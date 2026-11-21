"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale, LocalizedText } from "@/data/i18n";
import { cmsRequest, type RestaurantContent } from "@/lib/yummy-api";

const LOCALES: Locale[] = ["en", "id", "ru", "tr"];
const FIELDS = [
  ["restaurantName", "Restoran adı"], ["brandTagline", "Alt başlık"],
  ["slogan", "Slogan"], ["address", "Adres"],
] as const;

export function CmsSiteEditor() {
  const [site, setSite] = useState<RestaurantContent | null>(null);
  const [locale, setLocale] = useState<Locale>("en");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try { setSite(await cmsRequest<RestaurantContent>("/admin/site-content")); setError(""); }
    catch (err) { setError(err instanceof Error ? err.message : "İçerik alınamadı"); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  function patch(field: keyof RestaurantContent, value: string) {
    setSite((old) => old ? { ...old, [field]: value } : old);
  }
  function patchLocalized(field: typeof FIELDS[number][0], value: string) {
    setSite((old) => old ? { ...old, [field]: { ...old[field], [locale]: value } as LocalizedText } : old);
  }
  async function save() {
    if (!site) return;
    setSaving(true); setError(""); setMessage("");
    try {
      await cmsRequest("/admin/site-content", { method: "PUT", body: JSON.stringify(site) });
      setMessage("İçerik kaydedildi. Yeni ziyaretçiler güncel veriyi görür.");
    } catch (err) { setError(err instanceof Error ? err.message : "Kaydetme başarısız"); }
    finally { setSaving(false); }
  }

  if (!site) return <p className="mx-auto max-w-3xl p-8">{error || "Site içeriği yükleniyor…"}</p>;
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h2 className="font-display text-2xl">Restoran bilgileri</h2>
      <div className="flex gap-2">
        {LOCALES.map((code) => <button key={code} type="button" onClick={() => setLocale(code)}
          className={"rounded-lg px-4 py-2 " + (code === locale ? "bg-amber-700" : "bg-slate-800")}>{code.toUpperCase()}</button>)}
      </div>
      {FIELDS.map(([key, label]) => <label key={key} className="block text-sm">{label} ({locale})
        <textarea rows={key === "slogan" ? 3 : 2} value={site[key][locale]}
          onChange={(e) => patchLocalized(key, e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-3" />
      </label>)}
      {([
        ["whatsappNumber", "WhatsApp numarası (uluslararası, yalnızca rakam)"],
        ["phone", "Telefon"],
        ["mapsUrl", "Google Maps bağlantısı"],
        ["mapsEmbed", "Harita gömme URL'si"],
      ] as const).map(([key, label]) => <label key={key} className="block text-sm">{label}
        <input value={site[key]} onChange={(e) => patch(key, e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-3" />
      </label>)}
      <h3 className="font-semibold">Çalışma saatleri</h3>
      {site.workingHours.map((entry, index) => (
        <div key={index} className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Günler ({locale})
            <input value={entry.days[locale]} onChange={(e) => setSite((old) => old ? {
              ...old, workingHours: old.workingHours.map((hour, pos) => pos === index
                ? { ...hour, days: { ...hour.days, [locale]: e.target.value } } : hour)
            } : old)} className="mt-1 w-full rounded-lg bg-slate-900 p-3" />
          </label>
          <label className="text-sm">Saatler
            <input value={entry.hours} onChange={(e) => setSite((old) => old ? {
              ...old, workingHours: old.workingHours.map((hour, pos) => pos === index
                ? { ...hour, hours: e.target.value } : hour)
            } : old)} className="mt-1 w-full rounded-lg bg-slate-900 p-3" />
          </label>
        </div>
      ))}
      {error && <p role="alert" className="text-rose-300">{error}</p>}
      {message && <p role="status" className="text-emerald-300">{message}</p>}
      <div className="flex gap-3">
        <button type="button" disabled={saving} onClick={() => void save()} className="rounded-lg bg-amber-700 px-6 py-3 disabled:opacity-50">
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
        <button type="button" onClick={() => void load()} className="rounded-lg border border-slate-700 px-6 py-3">Yenile</button>
      </div>
    </div>
  );
}

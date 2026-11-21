"use client";

import { useState } from "react";
import { cmsEnabled, publicCmsRequest } from "@/lib/yummy-api";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  if (!cmsEnabled) return null;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const values = Object.fromEntries(["name", "email", "subject", "message", "website"]
      .map((field) => [field, String(fields.get(field) ?? "")]));
    setPending(true); setStatus(""); setError("");
    try {
      await publicCmsRequest("/contact", { method: "POST", body: JSON.stringify(values) });
      form.reset(); setStatus("Mesajınız alındı.");
    } catch { setError("Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin veya WhatsApp kullanın."); }
    finally { setPending(false); }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mt-10 space-y-4 rounded-3xl bg-white p-6 shadow-soft ring-1 ring-brand-100">
      <h2 className="font-display text-2xl text-slate-900">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Name<input required minLength={2} maxLength={120} name="name" className="mt-1 w-full rounded-xl border p-3" /></label>
        <label className="text-sm">Email<input required type="email" name="email" className="mt-1 w-full rounded-xl border p-3" /></label>
      </div>
      <label className="block text-sm">Subject<input required minLength={2} maxLength={180} name="subject" className="mt-1 w-full rounded-xl border p-3" /></label>
      <label className="block text-sm">Message<textarea required minLength={10} maxLength={5000} rows={5} name="message" className="mt-1 w-full rounded-xl border p-3" /></label>
      <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {error && <p role="alert" className="text-rose-700">{error}</p>}
      {status && <p role="status" className="text-emerald-700">{status}</p>}
      <button disabled={pending} type="submit" className="rounded-full bg-brand-700 px-6 py-3 font-semibold text-white disabled:opacity-50">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

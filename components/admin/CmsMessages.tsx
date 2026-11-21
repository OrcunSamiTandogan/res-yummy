"use client";

import { useCallback, useEffect, useState } from "react";
import { cmsRequest, type MessageRecord } from "@/lib/yummy-api";

export function CmsMessages() {
  const [messages, setMessages] = useState<MessageRecord[] | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setMessages(await cmsRequest<MessageRecord[]>("/admin/messages")); setError(""); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Mesajlar alınamadı"); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function toggle(message: MessageRecord) {
    try {
      await cmsRequest("/admin/messages/" + encodeURIComponent(message.id), {
        method: "PATCH", body: JSON.stringify({ read: !message.read }),
      });
      setMessages((current) => current?.map((item) => item.id === message.id ? { ...item, read: !item.read } : item) ?? null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Güncelleme başarısız"); }
  }

  return <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
    <div className="flex justify-between"><h2 className="font-display text-2xl">İletişim mesajları</h2>
      <button type="button" onClick={() => void load()} className="rounded-lg bg-slate-800 px-4 py-2 text-sm">Yenile</button></div>
    {error && <p role="alert" className="text-rose-300">{error}</p>}
    {!messages ? <p>Mesajlar yükleniyor…</p> : messages.length === 0 ? <p>Henüz mesaj yok.</p> : messages.map((message) => (
      <article key={message.id} className="space-y-2 rounded-xl border border-slate-700 p-5">
        <div className="flex flex-wrap justify-between gap-2">
          <h3 className="font-semibold">{message.subject}</h3>
          <time className="text-xs text-slate-400" dateTime={message.created_at}>
            {new Date(message.created_at).toLocaleString("tr-TR")}
          </time>
        </div>
        <p className="text-sm">{message.name} · <a href={"mailto:" + message.email} className="underline">{message.email}</a></p>
        <p className="whitespace-pre-wrap text-sm text-slate-300">{message.message}</p>
        <button type="button" onClick={() => void toggle(message)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs">
          {message.read ? "Okunmadı işaretle" : "Okundu işaretle"}
        </button>
      </article>
    ))}
  </div>;
}

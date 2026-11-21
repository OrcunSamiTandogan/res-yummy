"use client";

import { useEffect, useState } from "react";
import { cmsRequest } from "@/lib/yummy-api";
import { MenuEditor } from "./MenuEditor";
import { CmsSiteEditor } from "./CmsSiteEditor";
import { CmsMessages } from "./CmsMessages";

type View = "menu" | "site" | "messages";

export function CmsAdminApp() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<View>("menu");

  useEffect(() => {
    let active = true;
    void cmsRequest<{ email: string }>("/auth/me")
      .then((data) => { if (active) setUser(data.email); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const result = await cmsRequest<{ email: string }>("/auth/login", {
        method: "POST", body: JSON.stringify({ email, password }),
      });
      setUser(result.email); setPassword("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Giriş başarısız"); }
    finally { setBusy(false); }
  }

  async function logout() {
    try { await cmsRequest("/auth/logout", { method: "POST" }, false); }
    finally { setUser(null); }
  }

  if (loading) return <p className="p-12 text-center text-slate-300">Oturum denetleniyor…</p>;
  if (!user) return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={(event) => void login(event)} className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="font-display text-2xl">Yummy CMS</h1>
        <p className="text-sm text-slate-400">İçerik yönetim paneline giriş yap.</p>
        <label className="block text-sm">E-posta
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-950 p-3" />
        </label>
        <label className="block text-sm">Şifre
          <input type="password" autoComplete="current-password" required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-950 p-3" />
        </label>
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <button disabled={busy} type="submit" className="w-full rounded-lg bg-amber-700 p-3 font-semibold disabled:opacity-50">
          {busy ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
    </div>
  );
  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-6 py-4">
        <div><h1 className="font-display text-xl">Yummy CMS</h1><p className="text-xs text-slate-400">{user}</p></div>
        <div className="flex flex-wrap gap-2">
          {(["menu", "site", "messages"] as const).map((key) => (
            <button key={key} type="button" onClick={() => setView(key)}
              aria-current={view === key ? "page" : undefined}
              className={"rounded-lg px-4 py-2 text-sm " + (view === key ? "bg-amber-700" : "bg-slate-800")}>
              {{ menu: "Menü", site: "Site bilgileri", messages: "Mesajlar" }[key]}
            </button>
          ))}
          <button type="button" onClick={() => void logout()} className="rounded-lg border border-slate-700 px-4 py-2 text-sm">Çıkış</button>
        </div>
      </header>
      {view === "menu" ? <MenuEditor repo="MongoDB CMS" branch="live" onLogout={() => void logout()} /> : null}
      {view === "site" ? <CmsSiteEditor /> : null}
      {view === "messages" ? <CmsMessages /> : null}
    </div>
  );
}

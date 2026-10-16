"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/admin-client";
import { MenuEditor } from "./MenuEditor";

type SessionInfo = {
  configured: boolean;
  missing: string[];
  authenticated: boolean;
  repo: string;
  branch: string;
};

export function AdminApp() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setSession(await apiRequest<SessionInfo>("/api/admin/session"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Panel durumu okunamadı");
      }
    })();
  }, []);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiRequest("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      setSession(await apiRequest<SessionInfo>("/api/admin/session"));
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    try {
      await apiRequest("/api/admin/logout", { method: "POST" });
    } finally {
      setSession((current) => (current ? { ...current, authenticated: false } : current));
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-slate-400">{error ?? "Yükleniyor…"}</p>
      </div>
    );
  }

  if (!session.configured) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-2xl font-semibold">Panel yapılandırılmadı</h1>
        <p className="mt-3 text-sm text-slate-400">
          Vercel &rarr; Project &rarr; Settings &rarr; Environment Variables altına şu değişkenleri ekleyip yeniden
          deploy et:
        </p>
        <ul className="mt-4 space-y-1 text-sm">
          {session.missing.map((name) => (
            <li key={name} className="rounded-lg bg-slate-900 px-3 py-2 font-mono text-amber-300">
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          Ayrıntılı kurulum: README.md &rarr; &quot;Yönetim paneli&quot;.
        </p>
      </div>
    );
  }

  if (!session.authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 ring-1 ring-slate-800">
          <h1 className="font-display text-xl font-semibold">Yummy — Yönetim</h1>
          <p className="mt-1 text-xs text-slate-400">Menüyü düzenlemek için şifreyi gir.</p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Panel şifresi"
            autoComplete="current-password"
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={busy || password.length === 0}
            className="mt-4 w-full rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-50"
          >
            {busy ? "Kontrol ediliyor…" : "Giriş"}
          </button>
          {error ? <p className="mt-3 text-xs text-rose-300">{error}</p> : null}
        </form>
      </div>
    );
  }

  return <MenuEditor repo={session.repo} branch={session.branch} onLogout={handleLogout} />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yummy — Yönetim",
  robots: { index: false, follow: false, nocache: true },
};

// Panel kabuğu: site header/footer'ı yok, kendi koyu arayüzü var.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
}

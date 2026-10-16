import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { restaurantName, brandTagline } from "@/data/restaurant";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const display = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  // OG/Twitter görselleri mutlak URL ile çözülsün diye taban adres (Vercel'de otomatik doğru).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://res-yummy.vercel.app"),
  title: `${restaurantName.en} — ${brandTagline.en}`,
  description: "Crispy waffles and silky gelato. Easy WhatsApp ordering and table reservations.",
  openGraph: {
    title: `${restaurantName.en} — ${brandTagline.en}`,
    description: "Crispy waffles and silky gelato in Pererenan, Bali. Order on WhatsApp.",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

// Kök layout: yalnızca fontlar + html/body.
// Site kabuğu (header/footer) app/(site)/layout.tsx, panel kabuğu app/admin/layout.tsx içinde.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}

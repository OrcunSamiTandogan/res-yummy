import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import "./globals.css";
import { restaurantName, brandTagline } from "@/data/restaurant";
import { LanguageProvider } from "@/components/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const display = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: `${restaurantName.en} — ${brandTagline.en}`,
  description: "Crispy waffles and silky gelato. Easy WhatsApp ordering and table reservations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col bg-cream font-sans text-slate-900">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
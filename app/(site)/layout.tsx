import { LanguageProvider } from "@/components/LanguageContext";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// Site kabuğu: dil sağlayıcı + üst menü + alt bilgi (sabit WhatsApp butonu dahil).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-cream">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </LanguageProvider>
  );
}

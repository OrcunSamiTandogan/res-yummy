# Yummy — Waffle & Gelato

Tek sayfalık restoran/tatlı dükkanı tanıtım + WhatsApp sipariş + masa rezervasyon sitesi.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · lucide-react
- **Diller:** EN (default) · ID · RU · TR
- **Para birimi:** IDR (Endonezya Rupiahı)

## Yerelde çalıştırma

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build
```

## İçerik güncelleme

Tüm metin, fiyat, iletişim ve menü verisi `data/` klasöründedir:

- `data/restaurant.ts` — ad, slogan, WhatsApp, adres, çalışma saatleri
- `data/menu.ts` — kategoriler + menü kalemleri (fiyat + görsel + renk swatch)
- `data/ui.ts` — arayüz etiketleri + WhatsApp mesaj şablonları
- `data/i18n.ts` — dil listesi + `pick()` yardımcısı

Menü fotoğrafları `public/menu/` altındadır.
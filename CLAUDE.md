# Yummy — Waffle & Gelato (Handoff + UI Kılavuzu)

> Bu dosya yeni bir Claude Code oturumuna bu projeyi devretmek için yazıldı.

---

## 1. Proje Özeti

**Yummy** — tek sayfalık tatlı dükkanı tanıtım + sipariş + rezervasyon sitesi (Waffle & Gelato).
Backend YOK, login YOK, ödeme YOK. Tüm aksiyonlar tek WhatsApp mesajına bağlanır.

- **Deploy:** Vercel, GitHub'a bağlı — `git push origin master` → otomatik deploy.

---

## 2. Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16.3 (App Router, Turbopack) + React 19 + TypeScript |
| Stil | Tailwind CSS 3.4 |
| İkon | lucide-react |
| i18n | Custom, kütüphane yok (React Context) — dört dil |
| Görsel | `next/image` + `public/menu/*.jpg` |
| Deploy | Vercel |

Tailwind özel renkleri (`tailwind.config.ts`):
- `brand` = karamel/amber (waffle) `#b45309` + gam (50–900)
- `berry` = çilek vurgusu `#e11d48`
- `cream` = `#fff8ef` (sayfa zemini) · `vanilla` = `#fdf1dd` (rezervasyon zemini)
- `espresso` = `#231510` (footer)
- `gelato` = pastel tonlar (mint/blue/pink/lemon)

Fontlar (`app/layout.tsx`): Fredoka (display) + Inter (body).

---

## 3. Dosya Haritası

```
res-yummy/
├── CLAUDE.md
├── README.md
├── app/
│   ├── layout.tsx             # LanguageProvider + fontlar + metadata
│   ├── page.tsx               # ANA SAYFA ("use client") — tüm bölümler
│   └── globals.css            # tailwind + focus-visible + reduced-motion
├── components/
│   ├── LanguageContext.tsx    # aktif dil state (React Context, 4 dil)
│   ├── LanguageSelector.tsx   # EN/ID/RU/TR bayraklı seçici
│   ├── WhatsAppButton.tsx     # wa.me link üretici (merkezi)
│   ├── MenuItemCard.tsx       # kart (foto + fiyat rozeti + swatch + addOn + adet)
│   ├── ItemOrder.tsx          # adet stepper + "WhatsApp'tan sipariş"
│   └── ReservationForm.tsx    # tarih + saat pill + kişi → rezervasyon mesajı
├── data/
│   ├── i18n.ts                # Locale tipi ("en"|"id"|"ru"|"tr"), DEFAULT, LOCALES, pick()
│   ├── ui.ts                  # UI etiketleri + mesaj şablonları (4 dil)
│   ├── restaurant.ts          # ad, slogan, WhatsApp, adres, saatler (localized)
│   └── menu.ts                # 4 kategori × kalemler (localized + IDR fiyat + foto + swatch)
└── public/menu/menu-1..2.jpg  # müşteri menü fotoğrafları
```

---

## 4. i18n Nasıl Çalışıyor

- `data/i18n.ts`: `Locale = "en" | "id" | "ru" | "tr"`, `DEFAULT_LOCALE = "en"`.
- Tüm metinler `Record<Locale, string>`; okuma `pick(text, locale)`.
- **Dil ekleme:** `data/i18n.ts` union + `LOCALES` güncelle → `data/ui.ts`, `data/restaurant.ts`,
  `data/menu.ts` içindeki **her** objeye yeni dil metnini ekle (TypeScript eksik key'i hata olarak yakalar).
- WhatsApp mesaj şablonları `ui.ts` içinde `{item}`/`{qty}`/`{date}`/`{time}`/`{guests}` placeholder
  ile `.replace()` edilir.

---

## 5. Sayfa Akışı (app/page.tsx)

1. **Sticky header** — scroll'da görünür; logo "Y", Menü/Rezervasyon linki, dil seçici.
2. **Hero** — radial dot desenli cream zemin, "WAFFLE & GELATO" rozeti, büyük "Yummy" başlığı,
   slogan, iki buton, altta menü fotoğrafı (gradient overlay).
3. **Menü** — ikonlu kategori başlıkları + sticky pill navigasyon (scroll-spy) + yatay scroll-snap slider.
4. **Rezervasyon** — `ReservationForm` (tarih + saat pill + kişi; tarih olmadan buton pasif).
5. **İletişim + Çalışma Saatleri** — iki kolon.
6. **Footer** — espresso zemin, ad + geliştirici kredisi.
7. **Sabit WhatsApp butonu** — sağ altta yeşil yuvarlak.

Scroll-spy + reveal animasyonu `IntersectionObserver` ile (page.tsx Step 1.0 / 1.1).

---

## 6. Placeholder'lar

| Alan | Konum | Durum |
|------|-------|-------|
| WhatsApp numarası | `data/restaurant.ts` → `whatsappNumber` | ✅ gerçek: `905367841917` (+90 536 784 19 17) |
| Adres | `data/restaurant.ts` → `address` | ✅ gerçek: Pererenan, Kuta Utara, Badung, Bali |
| Telefon | `data/restaurant.ts` → `phone` | ✅ gerçek: `+90 536 784 19 17` |
| Gelato boyut "Large" fiyatı | `data/menu.ts` → `cup-large` | `85000` placeholder |
| Bubble Cup / Fruit Cup fiyatları | `data/menu.ts` | `30000` / `35000` placeholder |

Placeholder'lar `// placeholder` yorumuyla işaretli; müşteri verisi gelince tek yerden güncellenir.
Numara değişikliği: `data/restaurant.ts` içindeki `whatsappNumber` (wa.me, + ve boşluk olmadan)
ile `phone` (ekranda görünen format) birlikte güncellenir.

---

## 7. Kodlama Konvansiyonları

- Türkçe yorum yapılabilir; karmaşık mantıkta `# Step 1.0` stili adım notu.
- TypeScript `strict` açık — tip hatası = build hatası.
- `git add .` YASAK → path-specific add (`git add app components data public`).
- Branch: `master` (asla `main`). Identity: `orcunst@gmail.com`.
- Client directive sadece gereken dosyada (`page.tsx`, interaktif bileşenler).

---

## 8. Doğrulama

```bash
cd res-yummy
npm run build        # tip + üretim build
npm audit            # 0 vulnerability hedefi
git push origin master
```

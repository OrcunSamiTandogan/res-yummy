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
├── .env.example               # panel ortam değişkenleri
├── app/
│   ├── layout.tsx             # kök: fontlar + metadata (site kabuğu DEĞİL)
│   ├── robots.ts              # /admin ve /api disallow
│   ├── (site)/
│   │   ├── layout.tsx         # LanguageProvider + SiteHeader + SiteFooter
│   │   ├── page.tsx           # ANA SAYFA ("use client") — tüm bölümler
│   │   ├── contact/page.tsx
│   │   └── careers/page.tsx
│   ├── admin/
│   │   ├── layout.tsx         # panel kabuğu (noindex)
│   │   └── page.tsx           # <AdminApp />
│   └── api/admin/
│       ├── session/route.ts   # GET: yapılandırma + oturum durumu
│       ├── login/route.ts     # POST: şifre → imzalı cookie
│       ├── logout/route.ts    # POST: cookie sil
│       ├── menu/route.ts      # GET: repodaki menu.json · PUT: doğrula + commit
│       └── upload/route.ts    # POST: görsel → public/menu/*.webp commit
├── components/
│   ├── LanguageContext.tsx    # aktif dil state (React Context, 4 dil)
│   ├── LanguageSelector.tsx   # EN/ID/RU/TR bayraklı seçici
│   ├── WhatsAppButton.tsx     # wa.me link üretici (merkezi)
│   ├── MenuItemCard.tsx       # kart (foto + fiyat rozeti + swatch + addOn + adet)
│   ├── ItemOrder.tsx          # adet stepper + "WhatsApp'tan sipariş"
│   ├── ReservationForm.tsx    # tarih + saat pill + kişi → rezervasyon mesajı
│   └── admin/
│       ├── AdminApp.tsx       # oturum kontrolü + giriş ekranı
│       ├── MenuEditor.tsx     # kategori/kalem CRUD + yayınla
│       └── ImageUploader.tsx  # tarayıcıda webp + yükleme
├── lib/
│   ├── auth.ts                # HMAC cookie oturum + sabit süreli şifre kontrolü
│   ├── github.ts              # Contents API (oku/yaz)
│   ├── menu-validate.ts       # sunucu tarafı menü doğrulaması
│   ├── origin-guard.ts        # CSRF (aynı origin) kontrolü
│   └── admin-client.ts        # panel istemci yardımcıları
├── data/
│   ├── i18n.ts                # Locale tipi, LOCALES, pick()
│   ├── ui.ts                  # UI etiketleri + mesaj şablonları (4 dil)
│   ├── restaurant.ts          # ad, slogan, WhatsApp, adres, saatler (localized)
│   ├── menu.json              # MENÜ VERİSİ (tek kaynak; panel bunu düzenler)
│   └── menu.ts                # menü tipleri + json yükleyici
└── public/menu/               # menü görselleri (menu-1..2.jpg + panelden yüklenenler)
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

## 5. Sayfa Akışı (`app/(site)/page.tsx`)

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

Yerel panel testi (duman testi):

```bash
ADMIN_PASSWORD=test123 \
ADMIN_SESSION_SECRET=0123456789abcdef0123456789abcdef \
GITHUB_TOKEN=<pat> \
npx next start -p 3100
# /admin → giriş → menü düzenle → Yayınla
```

---

## 9. Yönetim Paneli (`/admin`) — Vercel-only mimari

**Karar (2026-10-16):** Telegram bot YOK, VPS YOK. Menü yönetimi tamamen Vercel içinde.

### Neden Git'e yazıyor?

Vercel dosya sistemi salt-okunur; çalışma anında `data/menu.json` yazılamaz. Bu yüzden yazma işi
GitHub Contents API ile **commit** olarak yapılır; Vercel commit'i görüp otomatik rebuild alır (~40 sn).
Böylece veritabanı, sunucu ve ek maliyet gerekmez; her değişiklik git geçmişinde kalır (**git = veritabanı**).

### Akış

```
/admin (tarayıcı)  →  PUT /api/admin/menu  →  lib/menu-validate.ts (doğrula)
                   →  lib/github.ts (commit data/menu.json)  →  Vercel rebuild  →  canlı site
```

Görsel yolu: tarayıcıda canvas ile **1600px webp**'e küçültülür → `POST /api/admin/upload`
→ `public/menu/<slug>.webp` commit. (Sunucuda sharp/Pillow yok — bu yüzden dönüşüm istemcide.)

### Güvenlik

- Oturum: `ADMIN_PASSWORD` (sabit süreli karşılaştırma) + `ADMIN_SESSION_SECRET` ile **HMAC-SHA256** imzalı
  `httpOnly` cookie (7 gün, `sameSite=lax`, üretimde `secure`). Kütüphane yok — `node:crypto`.
- State değiştiren tüm isteklerde `lib/origin-guard.ts` ile **aynı origin** kontrolü (CSRF).
- `GITHUB_TOKEN` yalnızca sunucuda okunur; yalnızca `res-yummy` + `Contents: Read and write` yetkisi yeterli.
- `/admin` ve `/api/` → `app/robots.ts` disallow + panel `noindex`.
- Yükleme: gerçek tür ilk baytlardan doğrulanır (webp/png/jpg), max 3 MB, dosya adı slug'lanır.

### Sınırlar (bilinçli)

- Yayınla → site ~40 sn sonra güncellenir (rebuild beklemesi). Anlık güncelleme istenirse
  ileride Vercel KV/Blob + ISR ya da eren kalıbı (FastAPI + Mongo) gerekir.
- İçerik dört dilde tutulur; kaydetmeden önce dört dilin de dolu olması gerekir (doğrulama hata verir).
- Tek şifre var; çok kullanıcı/rol yok (gerekirse GitHub OAuth eklenebilir).

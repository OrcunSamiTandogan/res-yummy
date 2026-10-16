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
- `data/menu.json` — **menünün tek kaynağı** (kategoriler + kalemler; panel bunu düzenler)
- `data/menu.ts` — menü tipleri + `menu.json` yükleyicisi (veri tutmaz)
- `data/ui.ts` — arayüz etiketleri + WhatsApp mesaj şablonları
- `data/i18n.ts` — dil listesi + `pick()` yardımcısı

Menü fotoğrafları `public/menu/` altındadır.

## Yönetim paneli (`/admin`)

Menüyü koddan bağımsız yönetmek için Vercel üzerinde çalışan panel — **VPS yok, veritabanı yok**:

- `/admin` → şifreli giriş → kategori/kalem ekle-sil, fiyat, ad/açıklama (EN/ID/RU/TR), görsel yükleme
- **"Yayınla"** → panel `data/menu.json` dosyasını GitHub API ile commit eder → **Vercel otomatik rebuild (~40 sn)** → site güncellenir
- **Git = veritabanı**: her değişiklik commit olarak durur, `git revert` ile geri alınabilir
- Görseller tarayıcıda 1600px webp'e küçültülür ve `public/menu/` altına commit edilir
- Panel arama motorlarına kapalı (`robots.txt` + `noindex`)

### Gerekli ortam değişkenleri

Vercel → Project → Settings → Environment Variables (yerelde `.env.local`):

```bash
cp .env.example .env.local
```

| Değişken | Açıklama |
|---|---|
| `ADMIN_PASSWORD` | Panele giriş şifresi (tek şifre) |
| `ADMIN_SESSION_SECRET` | Oturum cookie imzası, ≥16 karakter · `openssl rand -hex 32` |
| `GITHUB_TOKEN` | Fine-grained PAT — **yalnızca** `res-yummy`, izin **Contents: Read and write** |
| `GITHUB_REPO` | (opsiyonel) varsayılan `OrcunSamiTandogan/res-yummy` |
| `GITHUB_BRANCH` | (opsiyonel) varsayılan `master` |

### PAT nasıl alınır

1. GitHub → Settings → Developer settings → **Personal access tokens → Fine-grained tokens** → Generate new token
2. Repository access: **Only select repositories** → `res-yummy`
3. Repository permissions → **Contents: Read and write** (başka izin gerekmez)
4. Token'ı Vercel'de `GITHUB_TOKEN` olarak ekle, sonra **Redeploy**

Şifre ya da sır değişirse mevcut oturumlar otomatik geçersiz olur (cookie imzası değişir).

### Panelin yetenekleri

| İşlem | Not |
|---|---|
| Kategori ekle / sil | İkon (emoji) + ad (4 dil) |
| Kalem ekle / sil / sırala | ↑ ↓ ile sıra değişir |
| Ad + açıklama | Seçili dilde düzenlenir; "tüm dillere kopyala" kısayolu var |
| Fiyat | IDR tam sayı (1.000 – 50.000.000) |
| Ekstra (add-on) | Örn. "Add Ice Cream +Rp 20.000" |
| Renk (swatch) | Gelato vurgu rengi |
| Görsel | Kalem başına max 4; tarayıcıda webp + 1600px |

Kaydetme akışı: panel `PUT /api/admin/menu` → sunucu doğrulaması (`lib/menu-validate.ts`) → GitHub commit → Vercel build.
Doğrulama başarısızsa (boş ad, geçersiz id, tekrar eden id, fiyat aralığı dışı vb.) hiçbir şey commit edilmez.

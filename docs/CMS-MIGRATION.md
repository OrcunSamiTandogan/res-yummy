# Yummy CMS — mimari geçiş ve kurulum

Bu özellik dalında Eren Karakoc Design projesinin FastAPI, MongoDB, güvenli cookie oturumu, görsel işleme, iletişim kayıtları ve CMS yaklaşımı Yummy'ye uyarlandı. Eren'in portfolyo içeriği, markası veya dağıtım sunucusunun ayarları kopyalanmadı. Canlıya otomatik dağıtım YAPILMADI.

## Mimari

- Public ve admin arayüzü: mevcut Next.js 16 ve Vercel.
- Ayrı backend: FastAPI, /api/v1, MongoDB 8.
- Giriş: Argon2, kısa ömürlü JWT, dönen refresh session, HttpOnly ve API host'una özel cookie; MongoDB login rate limit.
- Menü: tüm 4 dil, IDR fiyatı, ürün görselleri, çok kullanıcılı edit çakışmasına karşı revision kontrolü.
- İşletme: ad, slogan, adres, WhatsApp numarası, harita ve saatler CMS üzerinden güncellenir.
- Görsel: tip/çözünürlük/boyut doğrulama, EXIF temizlenmiş WebP ve sınırlı depolama.
- İletişim: API'de kaydedilen mesajlar; honeypot, istek sınırı, dedupe ve saklama süresi.
- Menü güncellemeleri GitHub commit veya Vercel rebuild beklemez.

## Yerel başlatma

Proje kökünde:

    docker compose up -d mongo
    cd backend
    python3.12 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt -r requirements-dev.txt
    cp .env.example .env
    # .env içindeki sırları ve şifreyi güvenli rastgele değerlerle değiştir
    python -m app.cli bootstrap-admin
    python -m app.cli seed-content
    uvicorn app.main:app --reload --port 8672

Başka terminalde, repo kökünde:

    npm ci
    # .env.local dosyasına bu iki satırı ekle:
    # NEXT_PUBLIC_YUMMY_API_URL=http://localhost:8672/api/v1
    # YUMMY_API_ORIGIN=http://localhost:8672
    npm run dev

Public: http://localhost:3000
CMS: http://localhost:3000/admin
API health: http://localhost:8672/health
API dokümantasyonu: http://localhost:8672/docs (production dışında)

İlk seed, data/menu.json ve data/site.json dosyalarını MongoDB'ye bir kez aktarır. Var olan CMS içeriklerini ezmez. Admin bootstrap mevcut kullanıcıyı ezmez. Dört dilde içerik düzenlenir.

## Canlı ortam değişkenleri

Frontend/Vercel:
- NEXT_PUBLIC_YUMMY_API_URL=https://api.EXAMPLE.COM/api/v1
- YUMMY_API_ORIGIN=https://api.EXAMPLE.COM
- NEXT_PUBLIC_SITE_URL=https://EXAMPLE.COM

Backend güvenli sunucu:
- APP_ENV=production
- MONGODB_URI=... (kimlik doğrulamalı, özel ağ)
- MONGODB_DATABASE=yummy
- JWT_SECRET: en az 32 karakter rastgele
- PRIVACY_HASH_SECRET: farklı en az 32 karakter rastgele
- PUBLIC_ORIGIN=https://EXAMPLE.COM
- ADMIN_ORIGIN=https://EXAMPLE.COM (aynı /admin yolu için)
- MEDIA_ROOT: kalıcı volume, servis kullanıcısının yazabildiği dizin
- TRUSTED_PROXY_IPS: sadece gerçekten güvenilen ters proxy IP'leri
- ADMIN_BOOTSTRAP_EMAIL / ADMIN_BOOTSTRAP_PASSWORD: ilk kurulum için

API ve public/admin HTTPS adresleri aynı site kök alan adını paylaşmalı ki host-only, SameSite=Lax cookie oturumu sorunsuz çalışsın. Production'da Vercel preview adresleri, farklı sitelerdeki third-party cookie'lere güvenmemeli. MongoDB'yi internete açmayın. Secret'ları repoya commit etmeyin. Production Python paketlerini kilitli requirements.lock ile kurun.

## API uç noktaları

Public:
- GET /api/v1/menu
- GET /api/v1/site-content
- POST /api/v1/contact

Admin (giriş ve kesin Origin kontrolü):
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
- GET/PUT /api/v1/admin/menu (revision gönderilir)
- GET/PUT /api/v1/admin/site-content
- GET /api/v1/admin/messages
- PATCH /api/v1/admin/messages/{id}
- POST /api/v1/admin/media (multipart; alan adı: upload)

Next.js, /media/* yolunu YUMMY_API_ORIGIN üzerinden okur. Public menü API'si erişilemezse eski fiyatlarla sipariş alınmaması için menü geçici olarak kapalı gösterilir. Temel iletişim bilgileri kesintide kontrol edilmiş statik değerleri kullanır.

## Kontroller ve rollback

    cd backend && python -m pytest -q
    # repo kökünde:
    npm run typecheck
    npm run build

Canlıya geçiş öncesi ters proxy/TLS, MongoDB kimlik doğrulama ve yedeği, HTTP-only cookie, CORS/Origin, 401/429/409 durumları, resim yükleme, dört dil, veri kesintisi ve rollback senaryoları test edilmeli.

Üretimde frontend ortam değişkenlerini tanımlayana kadar eski GitHub tabanlı yönetim paneli çalışır. İki CMS değişkeni tanımlandığında yeni CMS devreye girer ve eski panel oturumları devre dışı bırakılır. Geri dönüş için Vercel'de yeni değişkenleri kaldırıp redeploy yapın. Geri dönüş, MongoDB'deki son değişiklikleri otomatik olarak eski statik dosyalara taşımaz; önce veri dışa aktarımı planlayın.

Eren'e ait VPS/DNS/port veya MongoDB verileri değiştirilmemiştir.

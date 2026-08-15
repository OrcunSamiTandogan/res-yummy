import type { LocalizedText } from "./i18n";

// Arayüz (UI) etiketleri ve mesaj şablonları — en/id/ru/tr dört dilde.

export const ui = {
  heroBadge: {
    en: "WAFFLE & GELATO",
    id: "WAFFLE & GELATO",
    ru: "ВАФЛИ И ДЖЕЛАТО",
    tr: "WAFFLE & GELATO",
  } as LocalizedText,

  heroSub: {
    en: "Crispy waffles, silky gelato. Every bite, a perfect blend.",
    id: "Waffle renyah, gelato lembut. Setiap gigitan, paduan sempurna.",
    ru: "Хрустящие вафли, нежное джелато. Каждый кусочек — идеальное сочетание.",
    tr: "Çıtır waffle'lar, ipeksi gelato. Her lokma kusursuz bir uyum.",
  } as LocalizedText,

  menuButton: {
    en: "View Menu",
    id: "Lihat Menu",
    ru: "Посмотреть меню",
    tr: "Menüyü Gör",
  } as LocalizedText,

  reserveButton: {
    en: "Table Reservation",
    id: "Reservasi Meja",
    ru: "Бронирование столика",
    tr: "Masa Rezervasyonu",
  } as LocalizedText,

  menuEyebrow: {
    en: "Our Menu",
    id: "Menu Kami",
    ru: "Наше меню",
    tr: "Menümüz",
  } as LocalizedText,

  menuHeading: {
    en: "Sweet, made fresh",
    id: "Manis, dibuat segar",
    ru: "Сладко и свежо",
    tr: "Taze, tatlı lezzet",
  } as LocalizedText,

  reserveEyebrow: {
    en: "Reservation",
    id: "Reservasi",
    ru: "Бронирование",
    tr: "Rezervasyon",
  } as LocalizedText,

  reserveHeading: {
    en: "Save Your Table",
    id: "Pesan Meja Anda",
    ru: "Забронируйте столик",
    tr: "Masanızı Ayırtın",
  } as LocalizedText,

  reserveSub: {
    en: "Pick a date and time, and send your reservation in one WhatsApp message.",
    id: "Pilih tanggal dan jam, lalu kirim reservasi Anda dalam satu pesan WhatsApp.",
    ru: "Выберите дату и время и отправьте бронирование одним сообщением в WhatsApp.",
    tr: "Tarih ve saati seçin, rezervasyonunuzu tek WhatsApp mesajıyla gönderin.",
  } as LocalizedText,

  contactHeading: {
    en: "Contact",
    id: "Kontak",
    ru: "Контакты",
    tr: "İletişim",
  } as LocalizedText,

  hoursHeading: {
    en: "Opening Hours",
    id: "Jam Buka",
    ru: "Часы работы",
    tr: "Çalışma Saatleri",
  } as LocalizedText,

  writeWhatsApp: {
    en: "Message on WhatsApp",
    id: "Kirim Pesan di WhatsApp",
    ru: "Написать в WhatsApp",
    tr: "WhatsApp'tan Yaz",
  } as LocalizedText,

  // ItemOrder
  qty: {
    en: "Qty",
    id: "Jumlah",
    ru: "Кол-во",
    tr: "Adet",
  } as LocalizedText,

  decreaseQty: {
    en: "Decrease quantity",
    id: "Kurangi jumlah",
    ru: "Уменьшить количество",
    tr: "Adedi azalt",
  } as LocalizedText,

  increaseQty: {
    en: "Increase quantity",
    id: "Tambah jumlah",
    ru: "Увеличить количество",
    tr: "Adedi artır",
  } as LocalizedText,

  orderOnWhatsApp: {
    en: "Order on WhatsApp",
    id: "Pesan via WhatsApp",
    ru: "Заказать в WhatsApp",
    tr: "WhatsApp'tan Sipariş",
  } as LocalizedText,

  orderMessage: {
    en: "Hi, I'd like to order: {item} x{qty}.",
    id: "Halo, saya ingin memesan: {item} x{qty}.",
    ru: "Здравствуйте, хочу заказать: {item} x{qty}.",
    tr: "Merhaba, sipariş vermek istiyorum: {item} x{qty}.",
  } as LocalizedText,

  // ReservationForm
  date: {
    en: "Date",
    id: "Tanggal",
    ru: "Дата",
    tr: "Tarih",
  } as LocalizedText,

  time: {
    en: "Time",
    id: "Jam",
    ru: "Время",
    tr: "Saat",
  } as LocalizedText,

  guests: {
    en: "Number of Guests",
    id: "Jumlah Tamu",
    ru: "Количество гостей",
    tr: "Kişi Sayısı",
  } as LocalizedText,

  decreaseGuests: {
    en: "Decrease guests",
    id: "Kurangi tamu",
    ru: "Уменьшить количество гостей",
    tr: "Kişi sayısını azalt",
  } as LocalizedText,

  increaseGuests: {
    en: "Increase guests",
    id: "Tambah tamu",
    ru: "Увеличить количество гостей",
    tr: "Kişi sayısını artır",
  } as LocalizedText,

  reserveOnWhatsApp: {
    en: "Reserve on WhatsApp",
    id: "Reservasi via WhatsApp",
    ru: "Забронировать в WhatsApp",
    tr: "WhatsApp'tan Rezervasyon",
  } as LocalizedText,

  pickDateHint: {
    en: "Select a date to continue.",
    id: "Pilih tanggal untuk melanjutkan.",
    ru: "Выберите дату, чтобы продолжить.",
    tr: "Devam etmek için bir tarih seçin.",
  } as LocalizedText,

  reservationMessage: {
    en: "Hi, I'd like to book a table. Date: {date}, Time: {time}, Guests: {guests}.",
    id: "Halo, saya ingin memesan meja. Tanggal: {date}, Jam: {time}, Tamu: {guests}.",
    ru: "Здравствуйте, хочу забронировать столик. Дата: {date}, Время: {time}, Гостей: {guests}.",
    tr: "Merhaba, masa ayırtmak istiyorum. Tarih: {date}, Saat: {time}, Kişi: {guests}.",
  } as LocalizedText,

  // Footer + floating button
  footerRights: {
    en: "All rights reserved.",
    id: "Semua hak dilindungi.",
    ru: "Все права защищены.",
    tr: "Tüm hakları saklıdır.",
  } as LocalizedText,

  generalMessage: {
    en: "Hi, I'd like some information.",
    id: "Halo, saya ingin informasi.",
    ru: "Здравствуйте, хочу получить информацию.",
    tr: "Merhaba, bilgi almak istiyorum.",
  } as LocalizedText,

  // Footer — site sahibi/geliştirici iletişim notu
  siteCreditNote: {
    en: "Want changes to this site or an admin panel? Get in touch:",
    id: "Ingin perubahan pada situs ini atau panel admin? Hubungi kami:",
    ru: "Нужны изменения на сайте или админ-панель? Свяжитесь с нами:",
    tr: "Bu sitede değişiklik ya da yönetim paneli mi istiyorsunuz? İletişime geçin:",
  } as LocalizedText,

  siteCreditMessage: {
    en: "Hi, I'd like to request changes to the Yummy website.",
    id: "Halo, saya ingin meminta perubahan pada situs Yummy.",
    ru: "Здравствуйте, хочу запросить изменения на сайте Yummy.",
    tr: "Merhaba, Yummy sitesinde değişiklik talep etmek istiyorum.",
  } as LocalizedText,
};
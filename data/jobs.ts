import type { LocalizedText } from "./i18n";

// Yummy — kariyer/iş ilanı içeriği. Başvuru WhatsApp'tan gider (DB yok).
// Maaş: asgari ücret (UMK) + satış primi. Çalışma: esnek/dönüşümlü vardiyalar.

export type JobPosting = {
  title: LocalizedText;
  intro: LocalizedText;
  responsibilities: LocalizedText[];
  qualifications: LocalizedText[];
  salary: LocalizedText;
  salaryDetail: LocalizedText;
  hours: LocalizedText;
  hoursDetail: LocalizedText;
};

export const job: JobPosting = {
  title: {
    en: "Waffle Sales & Service (Front-of-House)",
    id: "Penjualan & Pelayanan Waffle (Front-of-House)",
    ru: "Продавец вафель и обслуживание (Front-of-House)",
    tr: "Waffle Satış & Servis (Front-of-House)",
  },

  intro: {
    en: "Welcome our guests with a smile and make every waffle moment memorable.",
    id: "Sambut tamu dengan senyuman dan buat setiap momen waffle berkesan.",
    ru: "Встречайте гостей с улыбкой и делайте каждый вафельный момент незабываемым.",
    tr: "Misafirleri güler yüzle karşıla ve her waffle anını unutulmaz kıl.",
  },

  responsibilities: [
    {
      en: "Greet customers warmly and help them choose",
      id: "Menyambut pelanggan dengan ramah dan membantu memilih",
      ru: "Тепло приветствовать клиентов и помогать с выбором",
      tr: "Müşterileri sıcak karşıla ve seçimde yardımcı ol",
    },
    {
      en: "Sell & serve waffles, gelato and drinks",
      id: "Menjual & menyajikan waffle, gelato, dan minuman",
      ru: "Продавать и подавать вафли, джелато и напитки",
      tr: "Waffle, gelato ve içecek satışı/yapımı",
    },
    {
      en: "Keep the counter clean, tidy and well-stocked",
      id: "Menjaga meja tetap bersih, rapi, dan stok terisi",
      ru: "Поддерживать чистоту, порядок и наличие товара на витрине",
      tr: "Tezgâhı temiz, düzenli ve dolu tut",
    },
    {
      en: "Handle orders via WhatsApp and in person",
      id: "Menangani pesanan via WhatsApp dan langsung",
      ru: "Обрабатывать заказы через WhatsApp и лично",
      tr: "WhatsApp ve yüz yüze siparişleri takip et",
    },
  ],

  qualifications: [
    {
      en: "Energetic & dynamic with a positive attitude",
      id: "Energik & dinamis dengan sikap positif",
      ru: "Энергичный и динамичный, позитивный настрой",
      tr: "Enerjik, dinamik ve pozitif",
    },
    {
      en: "Friendly, smiling and people-oriented",
      id: "Ramah, murah senyum, dan suka bertemu orang",
      ru: "Дружелюбный, улыбчивый, ориентированный на людей",
      tr: "Güler yüzlü, samimi ve insan odaklı",
    },
    {
      en: "Reliable, punctual and a quick learner",
      id: "Dapat diandalkan, tepat waktu, dan cepat belajar",
      ru: "Надёжный, пунктуальный, быстро учится",
      tr: "Güvenilir, dakik ve çabuk öğrenen",
    },
    {
      en: "Basic English or Bahasa Indonesia is a plus",
      id: "Bahasa Inggris atau Bahasa Indonesia dasar menjadi nilai tambah",
      ru: "Базовый английский или индонезийский — плюс",
      tr: "Temel İngilizce veya Bahasa Indonesia artıdır",
    },
  ],

  salary: {
    en: "Minimum wage + sales commission",
    id: "Upah minimum + komisi penjualan",
    ru: "Минимальная зарплата + комиссия с продаж",
    tr: "Asgari ücret + satış primi",
  },

  salaryDetail: {
    en: "Your earnings grow with every sale you make.",
    id: "Penghasilan Anda bertambah seiring setiap penjualan.",
    ru: "Ваш доход растёт с каждой продажей.",
    tr: "Kazancın, yaptığın her satışla birlikte büyür.",
  },

  hours: {
    en: "Flexible shifts available",
    id: "Tersedia shift fleksibel",
    ru: "Гибкие смены",
    tr: "Esnek vardiyalar",
  },

  hoursDetail: {
    en: "Morning, afternoon and evening shifts — full-time & part-time.",
    id: "Shift pagi, siang, dan malam — penuh & paruh waktu.",
    ru: "Утренние, дневные и вечерние смены — полная и частичная занятость.",
    tr: "Sabah, öğle ve akşam vardiyaları — tam & yarı zamanlı.",
  },
};
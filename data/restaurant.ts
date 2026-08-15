import type { LocalizedText } from "./i18n";

// Yummy — WAFFLE & GELATO tatlı dükkanı genel bilgileri.
// İletişim numarası şimdilik placeholder; müşteri verisi gelince tek yerden güncellenir.

export const restaurantName: LocalizedText = {
  en: "Yummy",
  id: "Yummy",
  ru: "Yummy",
  tr: "Yummy",
};

export const brandTagline: LocalizedText = {
  en: "Waffle & Gelato",
  id: "Waffle & Gelato",
  ru: "Вафли и Джелато",
  tr: "Waffle & Gelato",
};

export const slogan: LocalizedText = {
  en: "Crispy waffles, silky gelato — a perfect blend in every bite.",
  id: "Waffle renyah, gelato lembut — paduan sempurna di setiap gigitan.",
  ru: "Хрустящие вафли и нежное джелато — идеальное сочетание в каждом кусочке.",
  tr: "Çıtır waffle'lar, ipeksi gelato — her lokmada kusursuz bir uyum.",
};

// Uluslararası format, + / boşluk / tire yok. (Şu an placeholder.)
export const whatsappNumber = "62000000000";

// Gerçek mekân adresi (Google Maps linkinden çözümlendi).
export const address: LocalizedText = {
  en: "Jl. Munduk Kedungu, Pererenan, Kuta Utara, Badung, Bali",
  id: "Jl. Munduk Kedungu, Pererenan, Kuta Utara, Badung, Bali",
  ru: "Джл. Мундук Кедунгу, Переренан, Кута Утара, Бадунг, Бали",
  tr: "Jl. Munduk Kedungu, Pererenan, Kuta Utara, Badung, Bali",
};

export const phone = "+62 8xx xxx xx xx";

// Google Maps: yol tarifi + gömülü harita (koordinat -8.6541, 115.1244).
export const mapsUrl = "https://maps.app.goo.gl/D2xfTfwx89yTRx4C6";
export const mapsEmbed = "https://www.google.com/maps?q=-8.6541186,115.1244132&hl=en&z=17&output=embed";

export type WorkHours = { days: LocalizedText; hours: string };

export const workingHours: WorkHours[] = [
  { days: { en: "Monday – Friday", id: "Senin – Jumat", ru: "Понедельник – Пятница", tr: "Pazartesi – Cuma" }, hours: "11:00 – 23:00" },
  { days: { en: "Saturday", id: "Sabtu", ru: "Суббота", tr: "Cumartesi" }, hours: "10:00 – 24:00" },
  { days: { en: "Sunday", id: "Minggu", ru: "Воскресенье", tr: "Pazar" }, hours: "10:00 – 22:00" },
];
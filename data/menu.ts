import type { LocalizedText } from "./i18n";

// Yummy — WAFFLE & GELATO menüsü.
// İçerik, müşteri menü fotoğraflarından (WhatsApp Image 2026-08-14) OCR ile çıkarıldı.
// "// placeholder" işaretli fiyatlar fotoğraftan net okunamadı, şimdilik tahmini
// dolduruldu — müşteri net veri verince tek yerden güncellenir.

export type AddOn = {
  label: LocalizedText;
  price: number;
};

export type MenuItem = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number; // IDR cinsinden tam sayı
  images: string[];
  addOn?: AddOn; // isteğe bağlı ekstra (örn. "Add Ice Cream")
  swatch?: string; // gelato rengi için CSS rengi (opsiyonel vurgu noktası)
};

export type MenuCategory = {
  id: string;
  icon: string;
  name: LocalizedText;
  items: MenuItem[];
};

const ADD_ICE_CREAM: AddOn = {
  label: {
    en: "Add Ice Cream",
    id: "Tambah Es Krim",
    ru: "Добавить мороженое",
    tr: "Dondurma Ekle",
  },
  price: 20000,
};

export const menuCategories: MenuCategory[] = [
  {
    id: "waffles",
    icon: "🧇",
    name: {
      en: "Waffles",
      id: "Waffle",
      ru: "Вафли",
      tr: "Waffle",
    },
    items: [
      {
        id: "waffle-delight",
        name: { en: "Waffle Delight", id: "Waffle Delight", ru: "Вафля Делайт", tr: "Waffle Delight" },
        description: {
          en: "Crispy waffle topped with strawberry, milk chocolate and white chocolate.",
          id: "Waffle renyah dengan topping stroberi, cokelat susu, dan cokelat putih.",
          ru: "Хрустящая вафля с клубникой, молочным и белым шоколадом.",
          tr: "Çilek, sütlü çikolata ve beyaz çikolata ile kaplı çıtır waffle.",
        },
        price: 100000,
        images: ["/menu/menu-1.jpg"],
        addOn: ADD_ICE_CREAM,
        swatch: "#f43f5e",
      },
      {
        id: "belgian-chocolate-waffle",
        name: { en: "Belgian Chocolate Waffle", id: "Waffle Cokelat Belgia", ru: "Вафля с бельгийским шоколадом", tr: "Belçika Çikolatalı Waffle" },
        description: {
          en: "Warm waffle loaded with rich Belgian chocolate.",
          id: "Waffle hangat dengan cokelat Belgia yang kaya.",
          ru: "Тёплая вафля с насыщенным бельгийским шоколадом.",
          tr: "Zengin Belçika çikolatasıyla dolu sıcak waffle.",
        },
        price: 90000,
        images: ["/menu/menu-1.jpg"],
        addOn: ADD_ICE_CREAM,
        swatch: "#92400e",
      },
    ],
  },
  {
    id: "gelato-scoops",
    icon: "🍨",
    name: {
      en: "Gelato Scoops",
      id: "Scoop Gelato",
      ru: "Джелато шариками",
      tr: "Gelato Topları",
    },
    items: [
      {
        id: "one-scoop",
        name: { en: "1 Scoop", id: "1 Scoop", ru: "1 шарик", tr: "1 Top" },
        description: {
          en: "A single scoop of our silky daily gelato.",
          id: "Satu scoop gelato lembut pilihan harian.",
          ru: "Один шарик нашего нежного джелато дня.",
          tr: "Günün ipeksi gelatosundan tek top.",
        },
        price: 50000,
        images: ["/menu/menu-2.jpg"],
        swatch: "#a7f3d0",
      },
      {
        id: "two-scoops",
        name: { en: "2 Scoops", id: "2 Scoops", ru: "2 шарика", tr: "2 Top" },
        description: {
          en: "Two scoops, two flavors — mix and match.",
          id: "Dua scoop, dua rasa — bebas pilih dan padukan.",
          ru: "Два шарика, два вкуса — выбирайте и сочетайте.",
          tr: "İki top, iki tat — karıştır ve eşleştir.",
        },
        price: 65000,
        images: ["/menu/menu-2.jpg"],
        swatch: "#bae6fd",
      },
      {
        id: "three-scoops",
        name: { en: "3 Scoops", id: "3 Scoops", ru: "3 шарика", tr: "3 Top" },
        description: {
          en: "Three scoops for the full gelato tasting.",
          id: "Tiga scoop untuk mencicipi gelato sepuasnya.",
          ru: "Три шарика — полная дегустация джелато.",
          tr: "Dolu dolu gelato keyfi için üç top.",
        },
        price: 90000,
        images: ["/menu/menu-2.jpg"],
        swatch: "#fbcfe8",
      },
    ],
  },
  {
    id: "gelato-cups",
    icon: "🍧",
    name: {
      en: "Gelato Cups",
      id: "Cup Gelato",
      ru: "Джелато в стаканчике",
      tr: "Gelato Kâseleri",
    },
    items: [
      {
        id: "cup-small",
        name: { en: "Small", id: "Kecil", ru: "Маленький", tr: "Küçük" },
        description: {
          en: "Small cup — a light, refreshing treat.",
          id: "Cup kecil — suguhan ringan yang menyegarkan.",
          ru: "Маленький стаканчик — лёгкое освежающее угощение.",
          tr: "Küçük kâse — hafif ve ferahlatıcı bir tatlı.",
        },
        price: 35000,
        images: ["/menu/menu-2.jpg"],
        swatch: "#fde68a",
      },
      {
        id: "cup-medium",
        name: { en: "Medium", id: "Sedang", ru: "Средний", tr: "Orta" },
        description: {
          en: "Medium cup — the just-right classic.",
          id: "Cup sedang — pilihan klasik yang pas.",
          ru: "Средний стаканчик — классика в самый раз.",
          tr: "Orta kâse — tam kıvamında klasik.",
        },
        price: 60000,
        images: ["/menu/menu-2.jpg"],
        swatch: "#fdba74",
      },
      {
        id: "cup-large",
        name: { en: "Large", id: "Besar", ru: "Большой", tr: "Büyük" },
        description: {
          en: "Large cup — share (or don't).",
          id: "Cup besar — untuk berbagi (atau tidak).",
          ru: "Большой стаканчик — чтобы поделиться (или нет).",
          tr: "Büyük kâse — paylaşmak için (ya da hiç).",
        },
        price: 85000, // placeholder — fotoğraftan net okunamadı
        images: ["/menu/menu-2.jpg"],
        swatch: "#f43f5e",
      },
    ],
  },
  {
    id: "bubble-fruit",
    icon: "🍓",
    name: {
      en: "Bubble & Fruit Cups",
      id: "Bubble & Fruit Cup",
      ru: "Бабл и фруктовые стаканчики",
      tr: "Bubble & Meyve Kâseleri",
    },
    items: [
      {
        id: "bubble-cup",
        name: { en: "Bubble Cup", id: "Bubble Cup", ru: "Бабл кап", tr: "Bubble Kâse" },
        description: {
          en: "Chewy tapioca pearls with chilled fruit juice.",
          id: "Boba kenyal dengan jus buah dingin.",
          ru: "Жевательные шарики тапиоки с холодным фруктовым соком.",
          tr: "Soğuk meyve suyuyla çiğnenebilir tapyoka incileri.",
        },
        price: 30000, // placeholder — fotoğraftan net okunamadı
        images: ["/menu/menu-1.jpg"],
        swatch: "#bae6fd",
      },
      {
        id: "fruit-cup",
        name: { en: "Fruit Cup", id: "Fruit Cup", ru: "Фруктовый стаканчик", tr: "Meyve Kâsesi" },
        description: {
          en: "Fresh strawberry and banana in a light syrup.",
          id: "Stroberi dan pisang segar dengan sirup ringan.",
          ru: "Свежая клубника и банан в лёгком сиропе.",
          tr: "Hafif şurupta taze çilek ve muz.",
        },
        price: 35000, // placeholder — fotoğraftan net okunamadı
        images: ["/menu/menu-1.jpg"],
        swatch: "#a7f3d0",
      },
    ],
  },
];
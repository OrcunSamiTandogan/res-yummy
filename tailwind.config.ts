import type { Config } from "tailwindcss";

// Yummy — WAFFLE & GELATO temasi.
// brand   = karamel/amber (waffle),  berry = cilekli topping vurgusu,
// cream   = sicak vanilya zemin,     espresso = koyu cikolata footer.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#b45309",
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        berry: {
          DEFAULT: "#e11d48",
          50: "#fff1f2",
          100: "#ffe4e6",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
        },
        cream: "#fff8ef",
        vanilla: "#fdf1dd",
        espresso: "#231510",
        gelato: {
          mint: "#a7f3d0",
          blue: "#bae6fd",
          pink: "#fbcfe8",
          lemon: "#fde68a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(180, 83, 9, 0.10)",
        lift: "0 18px 45px rgba(180, 83, 9, 0.16)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
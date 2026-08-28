import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "@/locales/uz.json";
import ru from "@/locales/ru.json";
import en from "@/locales/en.json";

// Sahifa statik matnlari (menyu, tugmalar, formalar) shu yerda tarjima
// qilinadi. Backenddan keladigan mahsulot/kategoriya nomlari esa
// languageStore + src/lib/i18n.ts (productName va h.k.) orqali boshqariladi.
const STORAGE_KEY = "rising-chemicals-language";

function getInitialLanguage(): "uz" | "ru" | "en" {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const lang = raw ? JSON.parse(raw)?.state?.language : null;
    if (lang === "uz" || lang === "ru" || lang === "en") return lang;
  } catch {
    // localStorage o'qilmasa yoki format noto'g'ri bo'lsa — default'ga tushamiz
  }
  return "ru";
}

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

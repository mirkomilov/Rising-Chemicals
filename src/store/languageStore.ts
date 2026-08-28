import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/i18n";
import type { Locale } from "@/types/database.types";

interface LanguageState {
  language: Locale;
  setLanguage: (language: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "ru",
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
    }),
    {
      name: "rising-chemicals-language",
      onRehydrateStorage: () => (state) => {
        // localStorage'dan o'qilgandan keyin i18next tilini ham moslaymiz
        // (src/i18n.ts allaqachon boshlang'ich tilni shu kalitdan o'qiydi,
        // bu yerda faqat store bilan sinxronligini kafolatlaymiz).
        if (state) i18n.changeLanguage(state.language);
      },
    }
  )
);

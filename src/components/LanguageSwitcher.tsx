import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, ChevronDown } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";
import type { Locale } from "@/types/database.types";
import { cn } from "@/lib/utils";

const LANGUAGE_LABELS: Record<Locale, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={t("header.toggleLanguage")}
        aria-expanded={open}
      >
        <Globe className="h-5 w-5" />
        <span>{LANGUAGE_LABELS[language]}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-24 overflow-hidden rounded-md border border-border bg-background shadow-md">
          {(Object.keys(LANGUAGE_LABELS) as Locale[]).map((code) => (
            <button
              key={code}
              onClick={() => {
                setLanguage(code);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                language === code
                  ? "font-semibold text-primary"
                  : "text-foreground"
              )}
            >
              {LANGUAGE_LABELS[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

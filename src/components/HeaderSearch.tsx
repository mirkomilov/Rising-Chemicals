import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguageStore } from "@/store/languageStore";
import type { Locale } from "@/types/database.types";

interface SearchResult {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  image_urls: string[] | null;
  categories: { name_uz: string; name_ru: string; name_en: string } | null;
}

function localized(
  obj:
    | { name_uz?: string | null; name_ru?: string | null; name_en?: string | null }
    | null
    | undefined,
  locale: Locale
): string {
  if (!obj) return "";
  return obj[`name_${locale}`] || obj.name_ru || obj.name_uz || obj.name_en || "";
}

export default function HeaderSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguageStore((s) => s.language);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    // "%" filtr shablonini buzmasligi uchun, "," esa .or() ichidagi
    // shartlarni ajratuvchi belgi bilan chalkashmasligi uchun tozalanadi.
    const safeQuery = q.replace(/[,()%]/g, "");
    const timer = setTimeout(() => {
      supabase
        .from("products")
        .select("id, name_uz, name_ru, name_en, image_urls, categories(name_uz, name_ru, name_en)")
        .eq("is_active", true)
        .or(
          `name_uz.ilike.%${safeQuery}%,name_ru.ilike.%${safeQuery}%,name_en.ilike.%${safeQuery}%`
        )
        .limit(8)
        .then(({ data }) => setResults((data as unknown as SearchResult[]) ?? []));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function goToProduct(id: string) {
    setOpen(false);
    setQuery("");
    navigate(`/products/${id}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <div ref={containerRef} className="relative hidden md:block md:w-40 lg:w-52">
      <form onSubmit={handleSubmit}>
        <div className="group relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={t("header.searchPlaceholder")}
            className="w-full rounded-full border border-transparent bg-muted py-2 pl-9 pr-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
              aria-label={t("header.clearSearch")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {open && query.trim() && (
        <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-lg border border-border bg-background shadow-lg">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              {t("products.noSearchResults")}
            </p>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => goToProduct(r.id)}
                className="flex w-full items-center gap-3 border-b border-border p-3 text-left last:border-b-0 hover:bg-muted"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {r.image_urls?.[0] && (
                    <img
                      src={r.image_urls[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{localized(r, language)}</p>
                  {r.categories && (
                    <p className="truncate text-xs text-muted-foreground">
                      {localized(r.categories, language)}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

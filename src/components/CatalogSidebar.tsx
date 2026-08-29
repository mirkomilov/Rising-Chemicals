import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRight, LayoutList } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { CategoryTreeNode } from "@/types/database.types";
import { useLanguageStore } from "@/store/languageStore";

export default function CatalogSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguageStore((s) => s.language);
  const [roots, setRoots] = useState<CategoryTreeNode[]>([]);

  useEffect(() => {
    supabase
      .rpc("get_category_tree", { p_locale: language })
      .then(({ data }) => {
        setRoots((data ?? []).filter((c: CategoryTreeNode) => !c.parent_id));
      });
  }, [language]);

  return (
    <aside className="flex h-[420px] w-full shrink-0 flex-col overflow-hidden rounded-lg bg-primary text-primary-foreground sm:h-[520px] md:h-[640px] md:w-72">
      <div className="flex items-center gap-2 border-b border-white/15 px-4 py-4 font-semibold tracking-wide">
        <LayoutList className="h-5 w-5" />
        {t("home.catalogTitle")}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {roots.length === 0 && (
          <p className="px-4 py-3 text-sm text-primary-foreground/60">
            {t("home.noCatalog")}
          </p>
        )}
        {roots.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate(`/products?category=${c.id}`)}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition hover:bg-white/10"
          >
            <span className="line-clamp-2">{c.name}</span>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
          </button>
        ))}
      </nav>
    </aside>
  );
}

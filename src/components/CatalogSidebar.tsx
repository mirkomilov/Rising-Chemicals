import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, LayoutList } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { CategoryTreeNode } from "@/types/database.types";
import { useLanguageStore } from "@/store/languageStore";
import { cn } from "@/lib/utils";

export default function CatalogSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const language = useLanguageStore((s) => s.language);
  const [roots, setRoots] = useState<CategoryTreeNode[]>([]);
  // Faqat mobil ko'rinishga taalluqli: tor ekranda ochiq ro'yxat butun
  // ekranni egallab, bannerni pastga surib yuborardi. md+ da ro'yxat
  // CSS orqali doim ochiq (md:block), bu holat unga ta'sir qilmaydi.
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase
      .rpc("get_category_tree", { p_locale: language })
      .then(({ data }) => {
        setRoots((data ?? []).filter((c: CategoryTreeNode) => !c.parent_id));
      });
  }, [language]);

  return (
    // md+ da panel absolyut holatda o'ralgan qutini to'ldiradi — shunda
    // uzun kategoriya ro'yxati qator balandligini cho'zib yubormaydi va
    // balandlikni yonidagi karusel (3:2) belgilaydi. Aks holda karusel
    // ro'yxat balandligiga cho'zilib, rasm atrofida xira chiziqlar qolardi.
    <div className="relative w-full shrink-0 md:w-60 lg:w-72">
      {/* bg-primary emas: qorong'i temada --primary teal'ga aylanadi va
          butun panel qichqiruvchi yorqin blokka aylanib ketardi. Brend
          navy rangi ikkala temada ham bir xil, vazmin ko'rinadi. */}
      <aside className="flex flex-col overflow-hidden rounded-lg bg-brand-navy text-white md:absolute md:inset-0">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="flex w-full items-center gap-2 border-b border-white/15 px-4 py-3.5 text-left font-semibold tracking-wide md:pointer-events-none md:py-4"
        >
          <LayoutList className="h-5 w-5 shrink-0" />
          <span className="flex-1">{t("home.catalogTitle")}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200 md:hidden",
              mobileOpen && "rotate-180"
            )}
          />
        </button>

        <nav
          className={cn(
            "max-h-[50vh] flex-1 overflow-y-auto py-2 md:block md:max-h-none",
            mobileOpen ? "block" : "hidden"
          )}
        >
          {roots.length === 0 && (
            <p className="px-4 py-3 text-sm text-white/60">
              {t("home.noCatalog")}
            </p>
          )}
          {roots.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/products?category=${c.id}`)}
              className="group flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors duration-200 hover:bg-white/10"
            >
              <span className="line-clamp-2 transition-transform duration-200 group-hover:translate-x-0.5">
                {c.name}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );
}

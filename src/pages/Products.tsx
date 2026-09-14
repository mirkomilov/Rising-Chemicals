import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { CategoryTreeNode, Product } from "@/types/database.types";
import { useLanguageStore } from "@/store/languageStore";
import ProductCard from "@/components/ProductCard";
import PageLoader from "@/components/PageLoader";
import Seo from "@/components/Seo";
import { cn } from "@/lib/utils";

export default function Products() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q")?.trim() ?? "";
  const categoryFromUrl = searchParams.get("category");
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // Butun sahifa bo'yicha bitta loader — Bosh sahifadagidek, faqat birinchi
  // yuklanishda ko'rinadi (kategoriyalar VA birinchi mahsulot ro'yxati
  // tayyor bo'lguncha), shuning uchun loader navbar/sidebar paydo bo'lishi
  // bilan joyini o'zgartirib "sakramaydi".
  const [initialLoading, setInitialLoading] = useState(true);
  // Keyinchalik kategoriya almashtirilganda/qidiruvda faqat mahsulotlar
  // ro'yxati o'rnida ko'rinadigan kichik loader.
  const [productsLoading, setProductsLoading] = useState(false);
  const language = useLanguageStore((s) => s.language);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    supabase
      .rpc("get_category_tree", { p_locale: language })
      .then(({ data }) => {
        setCategories(data ?? []);
        // Kategoriya umuman bo'lmasa, mahsulot so'rovi hech qachon
        // ishga tushmaydi — loader abadiy osilib qolmasligi uchun shu
        // yerning o'zida ham yopamiz.
        if (!data || data.length === 0) setInitialLoading(false);
      });
  }, [language]);

  // Sahifa birinchi ochilganda "hammasi" ko'rinishi o'rniga to'g'ridan-to'g'ri
  // kategoriya tanlangan holda ochiladi: agar URL'da ?category= bo'lsa o'sha,
  // aks holda birinchi (asosiy) kategoriya.
  useEffect(() => {
    if (activeCategory !== null || categories.length === 0) return;
    if (categoryFromUrl && categories.some((c) => c.id === categoryFromUrl)) {
      setActiveCategory(categoryFromUrl);
      setExpandedIds((prev) => new Set(prev).add(categoryFromUrl));
      return;
    }
    const firstRoot = categories.find((c) => !c.parent_id);
    if (firstRoot) setActiveCategory(firstRoot.id);
  }, [categories, activeCategory, categoryFromUrl]);

  useEffect(() => {
    if (searchQuery) {
      // Qidiruv butun katalog bo'yicha, tanlangan kategoriyadan qat'i nazar ishlaydi.
      setProductsLoading(true);
      const safeQuery = searchQuery.replace(/[,()%]/g, "");
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .or(
          `name_uz.ilike.%${safeQuery}%,name_ru.ilike.%${safeQuery}%,name_en.ilike.%${safeQuery}%`
        )
        .then(({ data }) => {
          setProducts(data ?? []);
          setProductsLoading(false);
          setInitialLoading(false);
        });
      return;
    }

    if (!activeCategory) return;
    setProductsLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category_id", activeCategory)
      .then(({ data }) => {
        setProducts(data ?? []);
        setProductsLoading(false);
        setInitialLoading(false);
      });
  }, [activeCategory, searchQuery]);

  // get_category_tree() cheksiz chuqurlikdagi daraxtni depth/path bilan
  // qaytaradi — har bir tugunning bolalarini parent_id orqali topamiz.
  const roots = categories.filter((c) => !c.parent_id);
  const childrenOf = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  function selectCategory(id: string) {
    if (searchQuery) navigate("/products");
    setActiveCategory(id);
  }

  function renderCategoryNode(node: CategoryTreeNode) {
    const children = childrenOf(node.id);
    const isExpanded = expandedIds.has(node.id);
    return (
      <div key={node.id} className="mt-1">
        <div
          className={cn(
            "flex items-center rounded-md pr-3 transition-colors duration-200",
            !searchQuery && activeCategory === node.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {children.length > 0 ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              style={{ marginLeft: `${node.depth * 0.75}rem` }}
              aria-label={isExpanded ? t("products.collapse") : t("products.expand")}
              className="p-2"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <span style={{ marginLeft: `${node.depth * 0.75}rem` }} className="w-[26px]" />
          )}
          <button
            onClick={() => {
              selectCategory(node.id);
              if (children.length > 0) {
                setExpandedIds((prev) => new Set(prev).add(node.id));
              }
            }}
            className={cn(
              "flex-1 py-2 pr-1 text-left text-sm",
              node.depth === 0 ? "font-medium" : ""
            )}
          >
            {node.name}
          </button>
        </div>
        {isExpanded && children.map((child) => renderCategoryNode(child))}
      </div>
    );
  }

  const seoTitle = searchQuery
    ? t("products.searchResultsTitle", { query: searchQuery })
    : t("products.title");

  if (initialLoading) {
    return (
      <>
        <Seo title={seoTitle} />
        <PageLoader />
      </>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row">
      <Seo title={seoTitle} />
      {/* ===== SIDEBAR — KATALOG ===== */}
      {/* Mobil/tablet ekranlarda mahsulotlar ustidan to'liq kenglikda,
          balandligi cheklangan (scroll qiladigan) holatda chiqadi — aks
          holda 256px'lik qattiq kenglik tor ekranda mahsulotlar ro'yxatini
          deyarli butunlay siqib qo'yardi. Desktopda (md+) avvalgidek chapda
          sobit ustun bo'lib qoladi. */}
      <aside className="max-h-64 w-full shrink-0 overflow-y-auto rounded-lg border border-border p-3 md:max-h-none md:w-64 md:overflow-visible md:border-0 md:p-0">
        <h3 className="mb-3 font-semibold">{t("products.catalog")}</h3>

        {roots.map((root) => renderCategoryNode(root))}
      </aside>

      {/* ===== MAHSULOTLAR RO'YXATI ===== */}
      <section className="flex-1">
        <h2 className="mb-6 text-xl font-semibold">{seoTitle}</h2>
        {productsLoading ? (
          <PageLoader className="min-h-[30vh] py-12" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {searchQuery ? t("products.noSearchResults") : t("products.noProducts")}
              </p>
            )}
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

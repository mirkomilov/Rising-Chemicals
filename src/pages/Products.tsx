import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { CategoryTreeNode, Product } from "@/types/database.types";
import { useCartStore } from "@/store/cartStore";
import { useLanguageStore } from "@/store/languageStore";
import { productName, productTechParams } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function Products() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const addItem = useCartStore((s) => s.addItem);
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
      .then(({ data }) => setCategories(data ?? []));
  }, [language]);

  // Sahifa birinchi ochilganda "hammasi" ko'rinishi o'rniga to'g'ridan-to'g'ri
  // birinchi (asosiy) kategoriya tanlangan holda ochiladi.
  useEffect(() => {
    if (activeCategory !== null || categories.length === 0) return;
    const firstRoot = categories.find((c) => !c.parent_id);
    if (firstRoot) setActiveCategory(firstRoot.id);
  }, [categories, activeCategory]);

  useEffect(() => {
    if (!activeCategory) return;
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category_id", activeCategory)
      .then(({ data }) => setProducts(data ?? []));
  }, [activeCategory]);

  // get_category_tree() cheksiz chuqurlikdagi daraxtni depth/path bilan
  // qaytaradi — har bir tugunning bolalarini parent_id orqali topamiz.
  const roots = categories.filter((c) => !c.parent_id);
  const childrenOf = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  function renderCategoryNode(node: CategoryTreeNode) {
    const children = childrenOf(node.id);
    const isExpanded = expandedIds.has(node.id);
    return (
      <div key={node.id} className="mt-1">
        <div
          className={cn(
            "flex items-center rounded-md pr-3",
            activeCategory === node.id
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
              setActiveCategory(node.id);
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

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      {/* ===== SIDEBAR — KATALOG ===== */}
      <aside className="w-64 shrink-0">
        <h3 className="mb-3 font-semibold">{t("products.catalog")}</h3>

        {roots.map((root) => renderCategoryNode(root))}
      </aside>

      {/* ===== MAHSULOTLAR RO'YXATI ===== */}
      <section className="flex-1">
        <h2 className="mb-6 text-xl font-semibold">{t("products.title")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("products.noProducts")}</p>
          )}
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-lg border border-border bg-card p-3"
            >
              <Link to={`/products/${p.id}`} className="block">
                <div className="mb-2 aspect-square overflow-hidden rounded-md bg-muted">
                  {p.image_urls?.[0] && (
                    <img
                      src={p.image_urls[0]}
                      alt={productName(p, language)}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="line-clamp-2 text-sm font-medium hover:text-primary">
                  {productName(p, language)}
                </p>
              </Link>

              {/* Texnik parametrlar */}
              {Object.keys(productTechParams(p, language)).length > 0 && (
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {Object.entries(productTechParams(p, language))
                    .slice(0, 2)
                    .map(([k, v]) => (
                      <li key={k}>
                        {k}: {v}
                      </li>
                    ))}
                </ul>
              )}

              <p className="mt-auto pt-2 font-semibold text-primary">
                {p.price.toLocaleString()} {t("common.currency")}
              </p>
              <button
                onClick={() => addItem(p)}
                className="mt-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition hover:opacity-90"
              >
                {t("products.addToCart")}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

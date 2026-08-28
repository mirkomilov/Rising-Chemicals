import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const addItem = useCartStore((s) => s.addItem);
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    supabase
      .rpc("get_category_tree", { p_locale: language })
      .then(({ data }) => setCategories(data ?? []));
  }, [language]);

  useEffect(() => {
    let query = supabase.from("products").select("*").eq("is_active", true);
    if (activeCategory) query = query.eq("category_id", activeCategory);
    query.then(({ data }) => setProducts(data ?? []));
  }, [activeCategory]);

  // get_category_tree() cheksiz chuqurlikdagi daraxtni depth/path bilan
  // qaytaradi — har bir tugunning bolalarini parent_id orqali topamiz.
  const roots = categories.filter((c) => !c.parent_id);
  const childrenOf = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId);

  function renderCategoryNode(node: CategoryTreeNode) {
    const children = childrenOf(node.id);
    return (
      <div key={node.id} className="mt-1">
        <button
          onClick={() => setActiveCategory(node.id)}
          style={{ paddingLeft: `${0.75 + node.depth * 0.75}rem` }}
          className={cn(
            "block w-full rounded-md py-2 pr-3 text-left text-sm",
            node.depth === 0 ? "font-medium" : "",
            activeCategory === node.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {node.name}
        </button>
        {children.map((child) => renderCategoryNode(child))}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      {/* ===== SIDEBAR — KATALOG ===== */}
      <aside className="w-64 shrink-0">
        <h3 className="mb-3 font-semibold">{t("products.catalog")}</h3>
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "block w-full rounded-md px-3 py-2 text-left text-sm",
            activeCategory === null
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {t("products.all")}
        </button>

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
              <div className="mb-2 aspect-square overflow-hidden rounded-md bg-muted">
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={productName(p, language)}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="line-clamp-2 text-sm font-medium">
                {productName(p, language)}
              </p>

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

              <p className="mt-2 font-semibold text-primary">
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

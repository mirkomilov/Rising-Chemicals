import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/types/database.types";
import { useFavoritesStore } from "@/store/favoritesStore";
import ProductCard from "@/components/ProductCard";
import PageLoader from "@/components/PageLoader";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import Seo from "@/components/Seo";

export default function Favorites() {
  const { t } = useTranslation();
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(favoriteIds.length > 0);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .in("id", favoriteIds)
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, [favoriteIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <Seo title={t("favorites.title")} noindex />
      <SectionHeading>{t("favorites.title")}</SectionHeading>

      {loading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("favorites.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i, 7) * 60} className="h-full">
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

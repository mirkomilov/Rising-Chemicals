import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/types/database.types";
import { useFavoritesStore } from "@/store/favoritesStore";
import ProductCard from "@/components/ProductCard";
import PageLoader from "@/components/PageLoader";

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h2 className="mb-6 text-xl font-semibold">{t("favorites.title")}</h2>

      {loading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("favorites.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

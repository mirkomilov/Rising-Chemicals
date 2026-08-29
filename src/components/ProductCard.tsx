import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import type { Product } from "@/types/database.types";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguageStore } from "@/store/languageStore";
import { productName, productTechParams } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const techParams = productTechParams(product, language);

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-3">
      <div className="relative">
        <Link to={`/products/${product.id}`} className="block">
          <div className="mb-2 aspect-square overflow-hidden rounded-md bg-muted">
            {product.image_urls?.[0] && (
              <img
                src={product.image_urls[0]}
                alt={productName(product, language)}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={
            isFavorite ? t("products.removeFromFavorites") : t("products.addToFavorites")
          }
          className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1.5 text-muted-foreground shadow-sm transition-colors hover:text-red-500"
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
        </button>
      </div>

      <Link to={`/products/${product.id}`} className="block">
        <p className="line-clamp-2 text-sm font-medium hover:text-primary">
          {productName(product, language)}
        </p>
      </Link>

      {Object.keys(techParams).length > 0 && (
        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          {Object.entries(techParams)
            .slice(0, 2)
            .map(([k, v]) => (
              <li key={k}>
                {k}: {v}
              </li>
            ))}
        </ul>
      )}

      <p className="mt-auto pt-2 font-semibold text-primary">
        {product.price.toLocaleString()} {t("common.currency")}
      </p>
      <button
        onClick={() => addItem(product)}
        className="mt-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition hover:opacity-90"
      >
        {t("products.addToCart")}
      </button>
    </div>
  );
}

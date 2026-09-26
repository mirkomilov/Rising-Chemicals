import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/types/database.types";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguageStore } from "@/store/languageStore";
import { productName, productDescription, productTechParams } from "@/lib/i18n";
import PageLoader from "@/components/PageLoader";
import FadeImage from "@/components/FadeImage";
import Seo from "@/components/Seo";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const isFavorite = useFavoritesStore((s) => (product ? s.isFavorite(product.id) : false));

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setProduct(data ?? null);
        setActiveImage(0);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <Seo title={t("products.detail.notFound")} noindex />
        <p className="text-muted-foreground">{t("products.detail.notFound")}</p>
        <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
          {t("products.detail.back")}
        </Link>
      </div>
    );
  }

  const images = product.image_urls ?? [];
  const description = productDescription(product, language);
  const techParams = productTechParams(product, language);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <Seo title={productName(product, language)} />
      <Link
        to="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("products.detail.back")}
      </Link>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            {images[activeImage] && (
              <FadeImage
                key={images[activeImage]}
                src={images[activeImage]}
                alt={productName(product, language)}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((url, idx) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "h-16 w-16 overflow-hidden rounded-md border-2 transition-colors duration-200",
                    idx === activeImage
                      ? "border-primary"
                      : "border-transparent hover:border-primary/40"
                  )}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-bold sm:text-2xl">{productName(product, language)}</h1>
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              aria-label={
                isFavorite
                  ? t("products.removeFromFavorites")
                  : t("products.addToFavorites")
              }
              className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
            >
              <Heart
                className={cn(
                  "h-6 w-6 transition-transform duration-200 hover:scale-110",
                  isFavorite && "fill-red-500 text-red-500"
                )}
              />
            </button>
          </div>
          <p className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
            {t("common.priceFrom", { price: product.price.toLocaleString() })}
          </p>

          {description && (
            <div className="mt-6">
              <h2 className="mb-2 font-semibold">{t("products.detail.description")}</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          )}

          {Object.keys(techParams).length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 font-semibold">{t("products.detail.techParams")}</h2>
              <ul className="text-sm text-muted-foreground">
                {Object.entries(techParams).map(([k, v]) => (
                  <li
                    key={k}
                    className="flex justify-between gap-4 border-b border-border py-1.5"
                  >
                    {/* whitespace-pre-line — admin panelda kiritilgan qator
                        ko'chirishlari saqlanadi, aks holda HTML ularni
                        oddiy bo'sh joyga aylantirib yuborardi. */}
                    <span className="min-w-0 whitespace-pre-line break-words">{k}</span>
                    <span className="min-w-0 whitespace-pre-line break-words text-right font-medium text-foreground">
                      {v}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => addItem(product)}
            className="mt-6 w-full rounded-md bg-secondary px-5 py-2.5 font-medium text-secondary-foreground transition hover:opacity-90 active:scale-95 sm:w-auto"
          >
            {t("products.addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}

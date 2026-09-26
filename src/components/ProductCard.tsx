import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, ArrowRight } from "lucide-react";
import type { Product } from "@/types/database.types";
import FadeImage from "@/components/FadeImage";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguageStore } from "@/store/languageStore";
import { productName, productDescription } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const addItem = useCartStore((s) => s.addItem);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const description = productDescription(product, language);

  return (
    // Barcha kartalar bir xil "chiroyli" ko'rinishda bo'lishi uchun har bir
    // zona (nom, tavsif) o'zining eng ko'p qatoriga mos min-h bilan
    // belgilangan — mahsulotda tavsif bo'lmasa ham yoki qisqa bo'lsa ham,
    // karta balandligi o'zgarmaydi, butun qator bir xilda ko'rinadi.
    <div className="group flex h-full flex-col rounded-lg border border-border bg-card p-2.5 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg sm:p-3">
      <div className="relative">
        <Link to={`/products/${product.id}`} className="block">
          <div className="mb-2 aspect-square overflow-hidden rounded-md bg-muted">
            {product.image_urls?.[0] && (
              <FadeImage
                src={product.image_urls[0]}
                alt={productName(product, language)}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
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
          className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-2 text-muted-foreground shadow-sm backdrop-blur transition-all duration-200 hover:scale-110 hover:text-red-500"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isFavorite && "scale-110 fill-red-500 text-red-500"
            )}
          />
        </button>
      </div>

      <Link to={`/products/${product.id}`} className="block">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium transition-colors group-hover:text-primary">
          {productName(product, language)}
        </p>

        {/* Tavsif 2 qatorga qirqiladi; sig'masa "Batafsil" o'qishga
            taklif qiladi — to'liq matn mahsulot sahifasida ko'rinadi. */}
        <p className="line-clamp-2 min-h-[2rem] pt-0.5 text-xs text-muted-foreground">
          {description}
        </p>
        <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-medium text-secondary transition-transform duration-200 group-hover:translate-x-0.5">
          {t("products.readMore")}
          <ArrowRight className="h-3 w-3" />
        </span>
      </Link>

      {/* "dan" ("starting from"): narxlar miqdorga qarab kelishiladi va
          o'zgarishi mumkin — bu ko'rsatilgan narx yakuniy emas, boshlang'ich
          narx ekanini bildiradi. */}
      <p className="mt-auto pt-2 text-sm font-semibold text-primary sm:text-base">
        {t("common.priceFrom", { price: product.price.toLocaleString() })}
      </p>
      <button
        onClick={() => addItem(product)}
        className="mt-2 rounded-md bg-secondary px-2 py-2 text-xs font-medium text-secondary-foreground transition hover:opacity-90 active:scale-95 sm:px-3 sm:py-1.5 sm:text-sm"
      >
        {t("products.addToCart")}
      </button>
    </div>
  );
}

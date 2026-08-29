import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import type { Brand, Product } from "@/types/database.types";
import { useLanguageStore } from "@/store/languageStore";
import { productName } from "@/lib/i18n";
import PageLoader from "@/components/PageLoader";
import HeroCarousel from "@/components/HeroCarousel";
import CatalogSidebar from "@/components/CatalogSidebar";

export default function Home() {
  const { t } = useTranslation();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    Promise.all([
      supabase.from("brands").select("*"),
      supabase
        .from("products")
        .select("*")
        .eq("is_top", true)
        .eq("is_active", true)
        .limit(8),
    ]).then(([brandsRes, productsRes]) => {
      setBrands(brandsRes.data ?? []);
      setTopProducts(productsRes.data ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      {/* ===== KATALOG + HERO / CAROUSEL ===== */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <CatalogSidebar />
          <HeroCarousel />
        </div>
      </section>

      {/* ===== HAMKOR BRENDLAR ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-xl font-semibold">{t("home.partnersTitle")}</h2>
        <div className="flex flex-wrap items-center gap-8">
          {brands.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("home.noPartners")}</p>
          )}
          {brands.map((b) => (
            <img
              key={b.id}
              src={b.logo_url ?? ""}
              alt={b.name}
              className="h-10 object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </section>

      {/* ===== FIRMA HAQIDA ===== */}
      <section className="bg-muted/40 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-3 text-xl font-semibold">{t("home.aboutTitle")}</h2>
          <p className="max-w-3xl text-muted-foreground">{t("home.aboutText")}</p>
        </div>
      </section>

      {/* ===== TOP MAHSULOTLAR ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-xl font-semibold">{t("home.topProductsTitle")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {topProducts.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("home.noTopProducts")}</p>
          )}
          {topProducts.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}`}
              className="block rounded-lg border border-border bg-card p-3 transition hover:shadow-md"
            >
              <div className="mb-2 aspect-square overflow-hidden rounded-md bg-muted">
                {p.image_urls?.[0] && (
                  <img
                    src={p.image_urls[0]}
                    alt={productName(p, language)}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <p className="line-clamp-2 text-sm font-medium">
                {productName(p, language)}
              </p>
              <p className="mt-1 font-semibold text-primary">
                {p.price.toLocaleString()} {t("common.currency")}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

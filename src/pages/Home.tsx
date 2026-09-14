import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FlaskConical, ShieldCheck, Truck, Headset } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/types/database.types";
import { useLanguageStore } from "@/store/languageStore";
import { productName } from "@/lib/i18n";
import PageLoader from "@/components/PageLoader";
import HeroCarousel from "@/components/HeroCarousel";
import CatalogSidebar from "@/components/CatalogSidebar";
import BrandsMarquee from "@/components/BrandsMarquee";
import Seo from "@/components/Seo";
import { SITE_NAME } from "@/lib/seo";

export default function Home() {
  const { t } = useTranslation();
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("is_top", true)
      .eq("is_active", true)
      .limit(8)
      .then(({ data }) => {
        setTopProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <Seo title={SITE_NAME} />
        <PageLoader />
      </>
    );
  }

  return (
    <div>
      <Seo title={SITE_NAME} />
      {/* ===== KATALOG + HERO / CAROUSEL ===== */}
      {/* min-h to'ldiradi + markazlaydi, shu bilan header/quti va quti/keyingi bo'lim orasidagi bo'shliq doim teng bo'ladi va bo'lim ekran ostiga chiqib qolmaydi */}
      <section className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-4 py-6">
        <div className="flex w-full flex-col gap-4 md:flex-row">
          <CatalogSidebar />
          <HeroCarousel />
        </div>
      </section>

      {/* ===== HAMKOR BRENDLAR ===== */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-xl font-semibold">
            {t("home.partnersTitle")}
          </h2>
          <BrandsMarquee />
        </div>
      </section>

      {/* ===== FIRMA HAQIDA ===== */}
      <section className="bg-muted/40 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-3 text-xl font-semibold">{t("home.aboutTitle")}</h2>
          <p className="max-w-3xl text-muted-foreground">{t("home.aboutText")}</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FlaskConical, title: t("home.aboutFeature1Title"), text: t("home.aboutFeature1Text") },
              { icon: ShieldCheck, title: t("home.aboutFeature2Title"), text: t("home.aboutFeature2Text") },
              { icon: Truck, title: t("home.aboutFeature3Title"), text: t("home.aboutFeature3Text") },
              { icon: Headset, title: t("home.aboutFeature4Title"), text: t("home.aboutFeature4Text") },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mb-1 font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TOP MAHSULOTLAR ===== */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-xl font-semibold">{t("home.topProductsTitle")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {topProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("home.noTopProducts")}</p>
            )}
            {topProducts.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="group block rounded-lg border border-border bg-card p-3 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-2 aspect-square overflow-hidden rounded-md bg-muted">
                  {p.image_urls?.[0] && (
                    <img
                      src={p.image_urls[0]}
                      alt={productName(p, language)}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">
                  {productName(p, language)}
                </p>
                <p className="mt-1 font-semibold text-primary">
                  {p.price.toLocaleString()} {t("common.currency")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

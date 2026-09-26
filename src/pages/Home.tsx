import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlaskConical, ShieldCheck, Truck, Headset } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/types/database.types";
import PageLoader from "@/components/PageLoader";
import HeroCarousel from "@/components/HeroCarousel";
import CatalogSidebar from "@/components/CatalogSidebar";
import BrandsMarquee from "@/components/BrandsMarquee";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { SITE_NAME } from "@/lib/seo";

export default function Home() {
  const { t } = useTranslation();
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      {/* min-h blokni birinchi ekranga to'ldirib markazlaydi, lekin faqat
          keng VA past ekranlarda (odatdagi noutbuklar). Tor yoki juda baland
          ekranlarda (planshet tik holati, portret monitor) blok o'z
          o'lchamiga nisbatan kichik bo'lib, atrofida ulkan bo'sh joy
          qolardi — u yerda oddiy py-6 bo'shlig'i ishlatiladi. */}
      <section className="mx-auto flex max-w-7xl items-center px-4 py-6 [@media(min-width:1024px)_and_(max-height:1000px)]:min-h-[calc(100vh-81px)]">
        <div className="flex w-full flex-col gap-4 md:flex-row">
          <CatalogSidebar />
          <HeroCarousel />
        </div>
      </section>

      {/* ===== HAMKOR BRENDLAR ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <SectionHeading>{t("home.partnersTitle")}</SectionHeading>
          </Reveal>
          <Reveal delay={80}>
            <BrandsMarquee />
          </Reveal>
        </div>
      </section>

      {/* ===== FIRMA HAQIDA ===== */}
      <section className="bg-muted/40 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <SectionHeading className="mb-4">{t("home.aboutTitle")}</SectionHeading>
            <p className="max-w-3xl leading-relaxed text-muted-foreground">
              {t("home.aboutText")}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FlaskConical, title: t("home.aboutFeature1Title"), text: t("home.aboutFeature1Text") },
              { icon: ShieldCheck, title: t("home.aboutFeature2Title"), text: t("home.aboutFeature2Text") },
              { icon: Truck, title: t("home.aboutFeature3Title"), text: t("home.aboutFeature3Text") },
              { icon: Headset, title: t("home.aboutFeature4Title"), text: t("home.aboutFeature4Text") },
            ].map(({ icon: Icon, title, text }, i) => (
              // Kartalar ketma-ket 70ms oraliq bilan chiqadi — hammasi
              // bir vaqtda "otilib chiqqanidan" ko'ra tinchroq ko'rinadi.
              <Reveal key={title} delay={i * 70} className="h-full">
                <div className="group h-full rounded-lg border border-border bg-card p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mb-1.5 font-medium">{title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TOP MAHSULOTLAR ===== */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <SectionHeading>{t("home.topProductsTitle")}</SectionHeading>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {topProducts.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">{t("home.noTopProducts")}</p>
            )}
            {topProducts.map((p, i) => (
              <Reveal key={p.id} delay={i * 60} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

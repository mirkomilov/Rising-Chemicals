import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import HeaderSearch from "@/components/HeaderSearch";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "relative text-base font-medium transition-colors hover:text-primary",
    "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-primary after:transition-all after:duration-200",
    isActive
      ? "text-primary after:w-full"
      : "text-muted-foreground after:w-0 hover:after:w-full"
  );

// Mobil menyu paneli ichidagi havolalar uchun — desktopdagi (navLinkClass)
// pastki chiziqcha animatsiyasi o'rniga fon rangi bilan ajratiladi, ro'yxat
// ko'rinishiga qulayroq.
const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-3 py-2.5 text-base font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );

export default function Header() {
  const { t } = useTranslation();
  const location = useLocation();
  const totalCount = useCartStore((s) => s.totalCount());
  const favoritesCount = useFavoritesStore((s) => s.ids.length);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sahifa almashganda mobil menyu avtomatik yopiladi.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      {/* 3 ustunli grid (logo / nav / ikonkalar) — nav "position:absolute"
          bilan markazlashtirilsa, tablet va kichikroq noutbuk kengliklarida
          (taxminan 768-1150px) logo va o'ng tomondagi qidiruv+ikonkalar bilan
          ustma-ust tushib qolar edi (bo'sh joy yetmagani uchun). Grid ustunlar
          hech qachon ustma-ust tushmasligini kafolatlaydi: logo va ikonkalar
          o'z tabiiy kengligini oladi, nav esa qolgan barcha joyni (1fr) egallab,
          shu bo'shliq ichida markazlashadi. */}
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:gap-4">
        <Link to="/" className="flex shrink-0 items-center">
          {/* Logotip torroq ekranlarda kichikroq — aks holda qidiruv/savat/
              menyu ikonkalari bilan birga sig'may, gorizontal toshib ketadi. */}
          <img
            src="/rising-logo.png"
            alt="Rising Chemicals"
            className="h-8 w-auto sm:h-10 lg:h-14"
          />
        </Link>

        {/* To'liq nav + inline qidiruv/tema/til faqat lg+ (~1024px+)
            ekranlarda ko'rinadi — shu kenglikdan boshlab uchala ustun ham
            (logo, nav, ikonkalar) erkin sig'adi. Tablet va undan kichik
            ekranlarda bularning barchasi pastdagi hamburger panelida. */}
        <nav className="hidden items-center justify-center gap-8 lg:flex">
          <NavLink to="/" className={navLinkClass} end>
            {t("header.home")}
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            {t("header.products")}
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            {t("header.contact")}
          </NavLink>
        </nav>

        <div className="flex items-center justify-end gap-0.5 sm:gap-2">
          <HeaderSearch />

          <Link
            to="/favorites"
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("header.favorites")}
          >
            <Heart className="h-5 w-5" />
            {favoritesCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                {favoritesCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t("header.cart")}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                {totalCount}
              </span>
            )}
          </Link>

          {/* Tema/til almashtirish tablet/mobilda asosiy qatordan pastdagi
              menyu paneliga ko'chadi — joy tejash uchun (kamdan-kam
              bosiladi, hamisha ko'zga tashlanib turishi shart emas). */}
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t("header.closeMenu") : t("header.openMenu")}
            aria-expanded={mobileOpen}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ===== MOBIL/TABLET MENYU PANELI ===== */}
      {/* Nav havolalari, qidiruv va tema/til (lg:flex/lg:block bilan
          yashiringan) faqat shu kenglikdan kichik ekranlarda shu yerda
          ko'rinadi. */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <div className="mb-4">
            <HeaderSearch mobile onNavigate={() => setMobileOpen(false)} />
          </div>
          <nav className="flex flex-col gap-1">
            <NavLink to="/" className={mobileNavLinkClass} end>
              {t("header.home")}
            </NavLink>
            <NavLink to="/products" className={mobileNavLinkClass}>
              {t("header.products")}
            </NavLink>
            <NavLink to="/contact" className={mobileNavLinkClass}>
              {t("header.contact")}
            </NavLink>
          </nav>

          <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}

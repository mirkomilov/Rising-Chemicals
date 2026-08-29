import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, Atom } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm font-medium transition-colors hover:text-primary",
    isActive ? "text-primary" : "text-muted-foreground"
  );

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const totalCount = useCartStore((s) => s.totalCount());
  const favoritesCount = useFavoritesStore((s) => s.ids.length);
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        {/* Logo — /public/logo.png ga asl logotipni joylashtiring */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <Atom className="h-7 w-7 text-primary" strokeWidth={2.2} />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">RISING</span>{" "}
            <span className="text-secondary">CHEMICALS</span>
          </span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="hidden md:flex md:w-40 lg:w-48">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("header.searchPlaceholder")}
              className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm"
            />
          </div>
        </form>

        {/* Nav havolalari sahifaning haqiqiy o'rtasiga joylashadi, chap/o'ng
            guruhlarning kengligidan qat'i nazar. */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
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

        <div className="ml-auto flex items-center gap-2">
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

          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

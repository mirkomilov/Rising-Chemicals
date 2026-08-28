import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router-dom";
import { ShoppingCart, Atom } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
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
  const totalCount = useCartStore((s) => s.totalCount());

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo — /public/logo.png ga asl logotipni joylashtiring */}
        <Link to="/" className="flex items-center gap-2">
          <Atom className="h-7 w-7 text-primary" strokeWidth={2.2} />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">RISING</span>{" "}
            <span className="text-secondary">CHEMICALS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
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

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />

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
        </div>
      </div>
    </header>
  );
}

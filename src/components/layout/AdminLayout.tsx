import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, NavLink, Navigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import PageLoader from "@/components/PageLoader";
import Seo from "@/components/Seo";

const links = [
  { to: "/admin", labelKey: "admin.layout.dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", labelKey: "admin.layout.products", icon: Package },
  { to: "/admin/categories", labelKey: "admin.layout.categories", icon: FolderTree },
  { to: "/admin/orders", labelKey: "admin.layout.orders", icon: ClipboardList },
  { to: "/admin/stats", labelKey: "admin.layout.stats", icon: BarChart3 },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Sahifa (admin sub-route) almashganda mobil sidebar avtomatik yopiladi.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <>
        <Seo title="Admin" noindex />
        <PageLoader />
      </>
    );
  }

  // Admin sessiyasi yo'q bo'lsa login sahifasiga yo'naltiramiz
  if (!authed) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Admin panelning barcha ichki sahifalari (Outlet orqali) shu
          Helmet'dan meros oladi — qidiruv tizimlari indexlamasligi kerak. */}
      <Seo title="Admin" noindex />

      {/* Mobil/tablet ekranlarda sidebar ekrandan tashqarida turadi va
          hamburger tugma bosilganda ustidan drawer sifatida chiqadi;
          desktopda (md+) avvalgidek doim ko'rinadigan sobit ustun. */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-border bg-card transition-transform duration-200 md:static md:z-auto md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <span className="text-lg font-bold">
            <span className="text-primary">RISING</span>{" "}
            <span className="text-secondary">{t("admin.layout.brand")}</span>
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label={t("header.closeMenu")}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map(({ to, labelKey, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </NavLink>
          ))}
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {t("admin.layout.logout")}
          </button>
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("header.openMenu")}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

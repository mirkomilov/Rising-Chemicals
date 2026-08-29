import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, NavLink, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  BarChart3,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import AtomSpinner from "@/components/AtomSpinner";

const links = [
  { to: "/admin", labelKey: "admin.layout.dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", labelKey: "admin.layout.products", icon: Package },
  { to: "/admin/categories", labelKey: "admin.layout.categories", icon: FolderTree },
  { to: "/admin/orders", labelKey: "admin.layout.orders", icon: ClipboardList },
  { to: "/admin/stats", labelKey: "admin.layout.stats", icon: BarChart3 },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

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

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted-foreground">
        <AtomSpinner size={56} />
        {t("admin.layout.loading")}
      </div>
    );
  }

  // Admin sessiyasi yo'q bo'lsa login sahifasiga yo'naltiramiz
  if (!authed) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-5">
          <span className="text-lg font-bold">
            <span className="text-primary">RISING</span>{" "}
            <span className="text-secondary">{t("admin.layout.brand")}</span>
          </span>
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

      <main className="flex flex-1 flex-col">
        <div className="flex h-16 shrink-0 items-center justify-end gap-2 border-b border-border bg-card px-6">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

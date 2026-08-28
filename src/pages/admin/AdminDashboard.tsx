import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import { Package, ClipboardList, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [counts, setCounts] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    newOrders: 0,
  });

  useEffect(() => {
    async function load() {
      const [products, orders, customers, newOrders] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
      ]);
      setCounts({
        products: products.count ?? 0,
        orders: orders.count ?? 0,
        customers: customers.count ?? 0,
        newOrders: newOrders.count ?? 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: t("admin.dashboard.products"), value: counts.products, icon: Package },
    { label: t("admin.dashboard.totalOrders"), value: counts.orders, icon: ClipboardList },
    { label: t("admin.dashboard.customers"), value: counts.customers, icon: Users },
    { label: t("admin.dashboard.newOrders"), value: counts.newOrders, icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("admin.dashboard.title")}</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <Icon className="mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

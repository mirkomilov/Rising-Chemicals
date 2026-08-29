import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import type { Order, Customer, OrderStatus } from "@/types/database.types";
import PageLoader from "@/components/PageLoader";

type OrderRow = Order & { customers: Customer | null };

const statusLabelKey: Record<OrderStatus, string> = {
  new: "admin.orders.statusNew",
  processing: "admin.orders.statusProcessing",
  completed: "admin.orders.statusCompleted",
  cancelled: "admin.orders.statusCancelled",
};

const statusColor: Record<OrderStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(*)")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setLoadError(error.message);
      return;
    }
    setLoadError(null);
    setOrders((data as OrderRow[]) ?? []);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      console.error(error);
      alert(`Xatolik: ${error.message}`);
      return;
    }
    load();
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("admin.orders.title")}</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3">{t("admin.orders.customer")}</th>
              <th className="p-3">{t("admin.orders.phone")}</th>
              <th className="p-3">{t("admin.orders.amount")}</th>
              <th className="p-3">{t("admin.orders.date")}</th>
              <th className="p-3">{t("admin.orders.status")}</th>
              <th className="p-3">{t("admin.orders.telegram")}</th>
            </tr>
          </thead>
          <tbody>
            {loadError && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-red-500">
                  Xatolik: {loadError}
                </td>
              </tr>
            )}
            {!loadError && orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  {t("admin.orders.noOrders")}
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3">{o.customers?.full_name ?? "—"}</td>
                <td className="p-3">{o.customers?.phone ?? "—"}</td>
                <td className="p-3">
                  {o.total_amount.toLocaleString()} {t("common.currency")}
                </td>
                <td className="p-3">{new Date(o.created_at).toLocaleString()}</td>
                <td className="p-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                    className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${statusColor[o.status]}`}
                  >
                    {Object.entries(statusLabelKey).map(([value, key]) => (
                      <option key={value} value={value}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">{o.telegram_sent ? "✅" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

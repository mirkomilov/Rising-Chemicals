import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Order, Customer, OrderItem, OrderStatus, Locale } from "@/types/database.types";
import { useLanguageStore } from "@/store/languageStore";
import PageLoader from "@/components/PageLoader";

type OrderItemRow = OrderItem & {
  products: { name_uz: string; name_ru: string; name_en: string } | null;
};
type OrderRow = Order & { customers: Customer | null; order_items: OrderItemRow[] };

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

function productLabel(
  p: { name_uz: string; name_ru: string; name_en: string } | null,
  locale: Locale
): string {
  if (!p) return "—";
  return p[`name_${locale}`] || p.name_ru || p.name_uz || p.name_en;
}

export default function AdminOrders() {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(*), order_items(*, products(name_uz, name_ru, name_en))")
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
    await load();
    setSelectedOrder((prev) => (prev ? { ...prev, status } : prev));
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
              <th className="p-3">{t("admin.orders.date")}</th>
              <th className="p-3">{t("admin.orders.status")}</th>
            </tr>
          </thead>
          <tbody>
            {loadError && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-red-500">
                  Xatolik: {loadError}
                </td>
              </tr>
            )}
            {!loadError && orders.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  {t("admin.orders.noOrders")}
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className="cursor-pointer border-t border-border hover:bg-muted/50"
              >
                <td className="p-3">{o.customers?.full_name ?? "—"}</td>
                <td className="p-3">{o.customers?.phone ?? "—"}</td>
                <td className="p-3">{new Date(o.created_at).toLocaleString()}</td>
                <td className="p-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${statusColor[o.status]}`}
                  >
                    {t(statusLabelKey[o.status])}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("admin.orders.details")}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={t("admin.orders.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mijoz ma'lumotlari */}
            <div className="mb-4 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">{t("admin.orders.customer")}: </span>
                <span className="font-medium">{selectedOrder.customers?.full_name ?? "—"}</span>
              </p>
              <p>
                <span className="text-muted-foreground">{t("admin.orders.phone")}: </span>
                {selectedOrder.customers?.phone ?? "—"}
              </p>
              {selectedOrder.customers?.email && (
                <p>
                  <span className="text-muted-foreground">{t("admin.orders.email")}: </span>
                  {selectedOrder.customers.email}
                </p>
              )}
              <p>
                <span className="text-muted-foreground">{t("admin.orders.date")}: </span>
                {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
              {selectedOrder.comment && (
                <p>
                  <span className="text-muted-foreground">{t("admin.orders.comment")}: </span>
                  {selectedOrder.comment}
                </p>
              )}
              <p>
                <span className="text-muted-foreground">{t("admin.orders.telegram")}: </span>
                {selectedOrder.telegram_sent ? "✅" : "—"}
              </p>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.orders.status")}
              </label>
              <select
                value={selectedOrder.status}
                onChange={(e) =>
                  updateStatus(selectedOrder.id, e.target.value as OrderStatus)
                }
                className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${statusColor[selectedOrder.status]}`}
              >
                {Object.entries(statusLabelKey).map(([value, key]) => (
                  <option key={value} value={value}>
                    {t(key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Buyurtma tarkibi */}
            <div>
              <p className="mb-2 text-sm font-medium">{t("admin.orders.items")}</p>
              <div className="overflow-hidden rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="p-2">{t("admin.stats.product")}</th>
                      <th className="p-2">{t("admin.orders.quantity")}</th>
                      <th className="p-2">{t("admin.orders.unitPrice")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.order_items.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-muted-foreground">
                          {t("admin.orders.noItems")}
                        </td>
                      </tr>
                    )}
                    {selectedOrder.order_items.map((item) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="p-2">{productLabel(item.products, language)}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">
                          {item.price_at_order.toLocaleString()} {t("common.currency")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-right font-semibold">
                {t("admin.orders.amount")}: {selectedOrder.total_amount.toLocaleString()}{" "}
                {t("common.currency")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

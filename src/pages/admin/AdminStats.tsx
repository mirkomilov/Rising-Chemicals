import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";

interface SalesStat {
  product_id: string;
  product_name: string;
  total_sold_qty: number;
  total_sold_amount: number;
  total_orders: number;
}

export default function AdminStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<SalesStat[]>([]);

  useEffect(() => {
    // sales_stats — schema.sql da yaratilgan tayyor VIEW
    // (faqat status = 'completed' bo'lgan buyurtmalarni hisoblaydi)
    supabase
      .from("sales_stats")
      .select("*")
      .order("total_sold_qty", { ascending: false })
      .then(({ data }) => setStats((data as SalesStat[]) ?? []));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t("admin.stats.title")}</h1>
      <p className="mb-4 text-sm text-muted-foreground">{t("admin.stats.note")}</p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3">{t("admin.stats.product")}</th>
              <th className="p-3">{t("admin.stats.soldQty")}</th>
              <th className="p-3">{t("admin.stats.totalAmount")}</th>
              <th className="p-3">{t("admin.stats.ordersCount")}</th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  {t("admin.stats.noData")}
                </td>
              </tr>
            )}
            {stats.map((s) => (
              <tr key={s.product_id} className="border-t border-border">
                <td className="p-3">{s.product_name}</td>
                <td className="p-3">{s.total_sold_qty}</td>
                <td className="p-3">
                  {s.total_sold_amount.toLocaleString()} {t("common.currency")}
                </td>
                <td className="p-3">{s.total_orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

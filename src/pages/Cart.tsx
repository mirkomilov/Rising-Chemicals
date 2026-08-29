import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/store/cartStore";
import { useLanguageStore } from "@/store/languageStore";
import { productName } from "@/lib/i18n";
import { supabase } from "@/lib/supabaseClient";
import { Minus, Plus, Trash2 } from "lucide-react";
import AtomSpinner from "@/components/AtomSpinner";

// Supabase'dan qaytadigan xatolar (PostgrestError, StorageError) doim ham
// native Error emas — shuning uchun instanceof tekshiruvi ba'zida
// muvaffaqiyatsiz bo'ladi. Har ikkalasidan ham xabar matnini olamiz.
function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

export default function Cart() {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, clearCart, totalAmount } =
    useCartStore();
  const language = useLanguageStore((s) => s.language);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", comment: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      // ID'larni oldindan o'zimiz yaratamiz — shunda yozilgan qatorni
      // "qaytarib o'qish" (RETURNING/select) shart emas, va anonim
      // mijozlarga customers/orders jadvalidan o'qish huquqi berish
      // kerak bo'lmaydi (bu boshqa mijozlarning shaxsiy ma'lumotlarini
      // oshkor qilib qo'yishi mumkin edi).
      const customerId = crypto.randomUUID();
      const orderId = crypto.randomUUID();

      // 1. Mijozni yaratamiz
      const { error: custErr } = await supabase.from("customers").insert({
        id: customerId,
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
      });
      if (custErr) throw custErr;

      // 2. Buyurtmani yaratamiz
      const { error: orderErr } = await supabase.from("orders").insert({
        id: orderId,
        customer_id: customerId,
        total_amount: totalAmount(),
        comment: form.comment || null,
      });
      if (orderErr) throw orderErr;

      // 3. Buyurtma tarkibidagi mahsulotlarni saqlaymiz
      const orderItems = items.map((i) => ({
        order_id: orderId,
        product_id: i.product.id,
        quantity: i.quantity,
        price_at_order: i.product.price,
      }));
      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(orderItems);
      if (itemsErr) throw itemsErr;

      // Telegram botga xabar yuborish — Supabase Database Webhook orqali
      // avtomatik ishlaydi (orders jadvaliga INSERT bo'lganda Edge Function chaqiriladi).
      // Frontendda qo'shimcha kod yozish shart emas.

      clearCart();
      setSuccess(true);
    } catch (err) {
      console.error(err);
      const code = err && typeof err === "object" && "code" in err ? (err as { code: unknown }).code : null;
      if (code === "23503") {
        alert(t("cart.staleItemsError"));
      } else {
        alert(`${t("cart.errorAlert")}\n\n${errorMessage(err)}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-primary">{t("cart.successTitle")}</h2>
        <p className="mt-2 text-muted-foreground">{t("cart.successText")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h2 className="mb-6 text-xl font-semibold">{t("cart.title")}</h2>

      {items.length === 0 ? (
        <p className="text-muted-foreground">{t("cart.empty")}</p>
      ) : (
        <>
          <div className="space-y-3">
            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-3"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {product.image_urls?.[0] && (
                    <img
                      src={product.image_urls[0]}
                      alt={productName(product, language)}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{productName(product, language)}</p>
                  <p className="text-sm text-primary">
                    {product.price.toLocaleString()} {t("common.currency")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                    className="rounded-md border border-border p-1 hover:bg-muted"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="rounded-md border border-border p-1 hover:bg-muted"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(product.id)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-lg font-semibold">
              {t("cart.total", { amount: totalAmount().toLocaleString() })}
            </span>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
              >
                {t("cart.checkout")}
              </button>
            )}
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4 rounded-lg border border-border bg-card p-5"
            >
              <h3 className="font-semibold">{t("cart.formTitle")}</h3>
              <input
                required
                placeholder={t("cart.fullName")}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                required
                type="tel"
                inputMode="numeric"
                placeholder={t("cart.phone")}
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/[^\d+]/g, "") })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder={t("cart.email")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <textarea
                placeholder={t("cart.comment")}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
              />
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-5 py-2.5 font-medium text-secondary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {submitting && <AtomSpinner size={18} />}
                {submitting ? t("cart.submitting") : t("cart.submit")}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

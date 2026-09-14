import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import type { Product, Category, Brand, Locale } from "@/types/database.types";
import { productName } from "@/lib/i18n";
import { useLanguageStore } from "@/store/languageStore";
import {
  categoryDisplayName,
  categoryPathIds,
  collectSelfAndDescendantIds,
  flattenCategoryTree,
} from "@/lib/categoryTree";
import { toOptimizedWebp } from "@/lib/imageOptimize";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Pencil, Upload, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import PageLoader from "@/components/PageLoader";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const LOCALES: Locale[] = ["uz", "ru", "en"];
const LOCALE_LABELS: Record<Locale, string> = { uz: "UZ", ru: "RU", en: "EN" };

// Supabase Dashboard -> Storage'da oldindan yaratilgan public bucket nomi.
const PRODUCT_IMAGES_BUCKET = "product-images";

type TechParamRow = { key: string; value: string };
const emptyTechParamRows = (): TechParamRow[] => [{ key: "", value: "" }];

const emptyForm = {
  name_uz: "",
  name_ru: "",
  name_en: "",
  brand_id: "",
  price: "",
  quantity: "",
  description_uz: "",
  description_ru: "",
  description_en: "",
  is_top: false,
};

function emptyTechParams(): Record<Locale, TechParamRow[]> {
  return { uz: emptyTechParamRows(), ru: emptyTechParamRows(), en: emptyTechParamRows() };
}

function techParamsToRows(params: Record<string, string> | null | undefined): TechParamRow[] {
  const entries = Object.entries(params ?? {});
  return entries.length ? entries.map(([key, value]) => ({ key, value })) : emptyTechParamRows();
}

function rowsToTechParams(rows: TechParamRow[]): Record<string, string> {
  return Object.fromEntries(
    rows.filter((r) => r.key.trim() !== "").map((r) => [r.key, r.value])
  );
}

// UZ/RU/EN tab tugmalari — nom, tavsif va texnik parametr formalarida
// bir xil ko'rinishda qayta ishlatiladi.
function LocaleTabs({
  active,
  onChange,
}: {
  active: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="mb-2 flex gap-1">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => onChange(loc)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
            active === loc
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          )}
        >
          {LOCALE_LABELS[loc]}
        </button>
      ))}
    </div>
  );
}

export default function AdminProducts() {
  const { t } = useTranslation();
  const language = useLanguageStore((s) => s.language);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [techParams, setTechParams] = useState<Record<Locale, TechParamRow[]>>(emptyTechParams());
  const [activeLocale, setActiveLocale] = useState<Locale>("ru");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  async function loadAll() {
    const [{ data: p }, { data: c }, { data: b }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*"),
      supabase.from("brands").select("*"),
    ]);
    setProducts(p ?? []);
    setCategories(c ?? []);
    setBrands(b ?? []);
  }

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

  const categoryOptions = useMemo(
    () => flattenCategoryTree(categories, language),
    [categories, language]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const categoryIds = categoryFilter
      ? collectSelfAndDescendantIds(categories, categoryFilter)
      : null;

    return products.filter((p) => {
      if (categoryIds && (!p.category_id || !categoryIds.has(p.category_id))) return false;
      if (!query) return true;
      const haystack = `${p.name_uz ?? ""} ${p.name_ru ?? ""} ${p.name_en ?? ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [products, search, categoryFilter, categories]);

  // Filtr yoki sahifa hajmi o'zgarganda birinchi sahifaga qaytamiz —
  // aks holda foydalanuvchi bo'sh sahifada qolib ketishi mumkin.
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function resetForm() {
    setForm(emptyForm);
    setCategoryPath([]);
    setImageUrls([]);
    setTechParams(emptyTechParams());
    setActiveLocale("ru");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(p: Product) {
    setForm({
      name_uz: p.name_uz ?? "",
      name_ru: p.name_ru ?? "",
      name_en: p.name_en ?? "",
      brand_id: p.brand_id ?? "",
      price: String(p.price),
      quantity: String(p.quantity),
      description_uz: p.description_uz ?? "",
      description_ru: p.description_ru ?? "",
      description_en: p.description_en ?? "",
      is_top: p.is_top,
    });
    setCategoryPath(p.category_id ? categoryPathIds(categories, p.category_id) : []);
    setImageUrls(p.image_urls ?? []);
    setTechParams({
      uz: techParamsToRows(p.tech_params_uz),
      ru: techParamsToRows(p.tech_params_ru),
      en: techParamsToRows(p.tech_params_en),
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name_uz: form.name_uz,
      name_ru: form.name_ru,
      name_en: form.name_en,
      category_id: categoryPath.length ? categoryPath[categoryPath.length - 1] : null,
      brand_id: form.brand_id || null,
      price: Number(form.price),
      quantity: Number(form.quantity),
      description_uz: form.description_uz || null,
      description_ru: form.description_ru || null,
      description_en: form.description_en || null,
      image_urls: imageUrls,
      is_top: form.is_top,
      tech_params_uz: rowsToTechParams(techParams.uz),
      tech_params_ru: rowsToTechParams(techParams.ru),
      tech_params_en: rowsToTechParams(techParams.en),
    };

    const { error } = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);

    if (error) {
      console.error(error);
      alert(`Xatolik: ${error.message}`);
      return;
    }

    resetForm();
    loadAll();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("admin.products.confirmDelete"))) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert(`Xatolik: ${error.message}`);
      return;
    }
    loadAll();
  }

  function updateTechParamRow(locale: Locale, idx: number, field: "key" | "value", value: string) {
    const next = { ...techParams, [locale]: [...techParams[locale]] };
    next[locale][idx] = { ...next[locale][idx], [field]: value };
    setTechParams(next);
  }

  function addTechParamRow(locale: Locale) {
    setTechParams({ ...techParams, [locale]: [...techParams[locale], { key: "", value: "" }] });
  }

  async function handleImageFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploaded: string[] = [];
      for (const rawFile of files) {
        const file = await toOptimizedWebp(rawFile);
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;

        const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      setImageUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`${t("admin.products.uploadError")}\n\n${message}`);
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImageAt(idx: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("admin.products.title")}</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {showForm ? t("admin.products.cancel") : t("admin.products.add")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 space-y-4 rounded-lg border border-border bg-card p-5"
        >
          <LocaleTabs active={activeLocale} onChange={setActiveLocale} />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required={activeLocale === "ru"}
              placeholder={t("admin.products.namePlaceholder", {
                locale: LOCALE_LABELS[activeLocale],
              })}
              value={form[`name_${activeLocale}`]}
              onChange={(e) => setForm({ ...form, [`name_${activeLocale}`]: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm sm:col-span-2"
            />
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {(() => {
                const selects = [];
                for (let level = 0; level <= categoryPath.length; level++) {
                  const parentId = level === 0 ? null : categoryPath[level - 1];
                  const options = categories.filter((c) => c.parent_id === parentId);
                  if (options.length === 0) break;
                  const value = categoryPath[level] ?? "";
                  selects.push(
                    <select
                      key={level}
                      value={value}
                      onChange={(e) => {
                        const val = e.target.value;
                        const next = categoryPath.slice(0, level);
                        if (val) next.push(val);
                        setCategoryPath(next);
                      }}
                      className="min-w-[10rem] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">
                        {level === 0
                          ? t("admin.products.selectCategory")
                          : t("admin.products.noSubcategory")}
                      </option>
                      {options.map((c) => (
                        <option key={c.id} value={c.id}>
                          {categoryDisplayName(c, language)}
                        </option>
                      ))}
                    </select>
                  );
                }
                return selects;
              })()}
            </div>
            <select
              value={form.brand_id}
              onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{t("admin.products.selectBrand")}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              placeholder={t("admin.products.price")}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              required
              type="number"
              placeholder={t("admin.products.quantity")}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">{t("admin.products.imageLabel")}</p>
            <div className="flex flex-wrap items-center gap-3">
              {imageUrls.map((url, idx) => (
                <div
                  key={url}
                  className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImageAt(idx)}
                    aria-label={t("admin.products.removeImage")}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {t("admin.products.primaryImage")}
                    </span>
                  )}
                </div>
              ))}

              <label
                className={cn(
                  "flex h-28 w-28 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-background text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-muted",
                  uploadingImage && "pointer-events-none opacity-50"
                )}
              >
                {uploadingImage ? (
                  <span>{t("admin.products.uploading")}</span>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>{t("admin.products.chooseImage")}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFilesChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-medium">
              {t("admin.products.descriptionTitle", { locale: LOCALE_LABELS[activeLocale] })}
            </p>
            <textarea
              placeholder={t("admin.products.descriptionPlaceholder")}
              value={form[`description_${activeLocale}`]}
              onChange={(e) =>
                setForm({ ...form, [`description_${activeLocale}`]: e.target.value })
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          {/* Texnik parametrlar — har til uchun alohida */}
          <div>
            <p className="mb-2 text-sm font-medium">
              {t("admin.products.techParamsTitle", { locale: LOCALE_LABELS[activeLocale] })}
            </p>
            {techParams[activeLocale].map((tp, idx) => (
              <div key={idx} className="mb-2 flex gap-2">
                <input
                  placeholder={t("admin.products.techParamName")}
                  value={tp.key}
                  onChange={(e) => updateTechParamRow(activeLocale, idx, "key", e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  placeholder={t("admin.products.techParamValue")}
                  value={tp.value}
                  onChange={(e) => updateTechParamRow(activeLocale, idx, "value", e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTechParamRow(activeLocale)}
              className="text-sm text-primary hover:underline"
            >
              {t("admin.products.addParam")}
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_top}
              onChange={(e) => setForm({ ...form, is_top: e.target.checked })}
            />
            {t("admin.products.isTop")}
          </label>

          <button
            type="submit"
            className="rounded-md bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground hover:opacity-90"
          >
            {editingId ? t("admin.products.save") : t("admin.products.submitAdd")}
          </button>
        </form>
      )}

      {/* ===== QIDIRUV + KATEGORIYA FILTRI ===== */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.products.searchPlaceholder")}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">{t("admin.products.allCategories")}</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {"  ".repeat(c.depth)}
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="p-3">{t("admin.products.tableName")}</th>
              <th className="p-3">{t("admin.products.tablePrice")}</th>
              <th className="p-3">{t("admin.products.tableQuantity")}</th>
              <th className="p-3">{t("admin.products.tableTop")}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  {t("admin.products.noResults")}
                </td>
              </tr>
            )}
            {pageProducts.map((p) => (
              <tr key={p.id} className="border-t border-border transition-colors hover:bg-muted/50">
                <td className="p-3">{productName(p, language)}</td>
                <td className="p-3">
                  {p.price.toLocaleString()} {t("common.currency")}
                </td>
                <td className="p-3">{p.quantity}</td>
                <td className="p-3">{p.is_top ? "✅" : "—"}</td>
                <td className="flex gap-2 p-3">
                  <button onClick={() => startEdit(p)} className="text-primary hover:opacity-70">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:opacity-70">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINATION ===== */}
      {filteredProducts.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{t("admin.products.pageSizeLabel")}</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>
              {t("admin.products.pageInfo", {
                from: (currentPage - 1) * pageSize + 1,
                to: Math.min(currentPage * pageSize, filteredProducts.length),
                total: filteredProducts.length,
              })}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("admin.products.prevPage")}
            </button>
            <span className="px-2 font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              {t("admin.products.nextPage")}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

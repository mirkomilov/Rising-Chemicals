import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import type { Category } from "@/types/database.types";
import {
  categoryDisplayName,
  collectSelfAndDescendantIds,
  flattenCategoryTree,
} from "@/lib/categoryTree";
import { Plus, Trash2, Pencil } from "lucide-react";

const emptyForm = { name_uz: "", name_ru: "", name_en: "", parent_id: "" };

export default function AdminCategories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const { data } = await supabase.from("categories").select("*").order("created_at");
    setCategories(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(c: Category) {
    setForm({
      name_uz: c.name_uz ?? "",
      name_ru: c.name_ru ?? "",
      name_en: c.name_en ?? "",
      parent_id: c.parent_id ?? "",
    });
    setEditingId(c.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name_uz: form.name_uz,
      name_ru: form.name_ru,
      name_en: form.name_en,
      parent_id: form.parent_id || null,
    };

    const { error } = editingId
      ? await supabase.from("categories").update(payload).eq("id", editingId)
      : await supabase.from("categories").insert(payload);

    if (error) {
      console.error(error);
      alert(`Xatolik: ${error.message}`);
      return;
    }

    resetForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("admin.categories.confirmDelete"))) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert(`Xatolik: ${error.message}`);
      return;
    }
    load();
  }

  // Tahrirlanayotgan kategoriyani o'z-o'ziga yoki o'z avlodiga "ota" qilib
  // tanlashning oldini olish uchun ular "Ota kategoriya" ro'yxatidan chiqarib
  // tashlanadi (tsiklga yo'l qo'ymaslik uchun).
  const excludeIds = editingId
    ? collectSelfAndDescendantIds(categories, editingId)
    : new Set<string>();
  const categoryOptions = flattenCategoryTree(categories, excludeIds);

  const rootCategories = categories.filter((c) => !c.parent_id);
  const childrenOf = (id: string) => categories.filter((c) => c.parent_id === id);

  function renderCategoryRow(c: Category, depth: number) {
    const children = childrenOf(c.id);
    return (
      <div key={c.id}>
        <div
          style={{ paddingLeft: `${depth * 1.25}rem` }}
          className="flex items-center justify-between border-t border-border py-2.5 first:border-t-0"
        >
          <div>
            <span className="font-medium">
              {depth > 0 && <span className="text-muted-foreground">— </span>}
              {categoryDisplayName(c)}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              UZ: {c.name_uz || "—"} · EN: {c.name_en || "—"}
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => startEdit(c)} className="text-primary hover:opacity-70">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:opacity-70">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {children.map((child) => renderCategoryRow(child, depth + 1))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("admin.categories.title")}</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {showForm ? t("admin.categories.cancel") : t("admin.categories.add")}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 space-y-4 rounded-lg border border-border bg-card p-5"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              required
              placeholder={t("admin.categories.nameUz")}
              value={form.name_uz}
              onChange={(e) => setForm({ ...form, name_uz: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              required
              placeholder={t("admin.categories.nameRu")}
              value={form.name_ru}
              onChange={(e) => setForm({ ...form, name_ru: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              required
              placeholder={t("admin.categories.nameEn")}
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <select
            value={form.parent_id}
            onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("admin.categories.noParent")}</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {"  ".repeat(c.depth)}
                {c.depth > 0 ? "— " : ""}
                {c.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-md bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground hover:opacity-90"
          >
            {editingId ? t("admin.categories.save") : t("admin.categories.submitAdd")}
          </button>
        </form>
      )}

      <div className="rounded-lg border border-border bg-card px-4">
        {rootCategories.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">
            {t("admin.categories.noCategories")}
          </p>
        )}
        {rootCategories.map((c) => renderCategoryRow(c, 0))}
      </div>
    </div>
  );
}

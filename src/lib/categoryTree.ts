import type { Category } from "@/types/database.types";

export interface FlatCategoryOption {
  id: string;
  depth: number;
  label: string;
}

// Admin panelda kategoriya nomini ko'rsatish uchun: name_ru asosiy, bo'lmasa
// name_uz, bo'lmasa name_en (backenddagi COALESCE fallback mantig'iga mos).
export function categoryDisplayName(c: Category): string {
  return c.name_ru || c.name_uz || c.name_en || "(nomsiz)";
}

// categories jadvalidagi flat (parent_id orqali bog'langan) qatorlarni
// cheksiz chuqurlikdagi daraxt tartibida, depth bilan tekis ro'yxatga
// aylantiradi — dropdown yoki indentli ro'yxat chizish uchun qulay.
export function flattenCategoryTree(
  categories: Category[],
  excludeIds: Set<string> = new Set()
): FlatCategoryOption[] {
  const childrenOf = (parentId: string | null) =>
    categories.filter(
      (c) => c.parent_id === parentId && !excludeIds.has(c.id)
    );

  const result: FlatCategoryOption[] = [];
  function walk(parentId: string | null, depth: number) {
    for (const c of childrenOf(parentId)) {
      result.push({ id: c.id, depth, label: categoryDisplayName(c) });
      walk(c.id, depth + 1);
    }
  }
  walk(null, 0);
  return result;
}

// Berilgan kategoriya va uning barcha avlodlari (descendants) id'larini
// qaytaradi. "Ota kategoriya" tanlashda kategoriyani o'z-o'ziga yoki
// bolasiga bog'lab, tsikl hosil qilishning oldini olish uchun ishlatiladi.
export function collectSelfAndDescendantIds(
  categories: Category[],
  rootId: string
): Set<string> {
  const ids = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of categories) {
      if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) {
        ids.add(c.id);
        changed = true;
      }
    }
  }
  return ids;
}

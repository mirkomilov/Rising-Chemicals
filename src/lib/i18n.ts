import type { Locale, Product } from "@/types/database.types";

// Tanlangan tilda tarjima topilmasa, "ru" ustuniga qaytamiz (backenddagi
// COALESCE fallback mantig'iga mos).
export function productName(product: Product, locale: Locale): string {
  return product[`name_${locale}`] || product.name_ru;
}

export function productDescription(
  product: Product,
  locale: Locale
): string {
  return product[`description_${locale}`] || product.description_ru || "";
}

export function productTechParams(
  product: Product,
  locale: Locale
): Record<string, string> {
  return product[`tech_params_${locale}`] &&
    Object.keys(product[`tech_params_${locale}`]).length > 0
    ? product[`tech_params_${locale}`]
    : product.tech_params_ru;
}

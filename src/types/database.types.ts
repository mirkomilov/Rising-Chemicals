// Bu tiplar schema.sql asosida qo'lda yozilgan.
// Keyinchalik `supabase gen types typescript` buyrug'i bilan avtomatik yangilash mumkin.
//
// MUHIM: i18n migratsiyasidan keyin tarjima qilinadigan maydonlar
// name/description bitta ustun o'rniga name_uz/name_ru/name_en va
// description_uz/ru/en ko'rinishiga o'tkazildi. brands.name TARJIMA
// QILINMAYDI — bir xil qoladi.

export type Locale = "uz" | "ru" | "en";

export interface Category {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  parent_id: string | null;
  created_at: string;
}

// get_category_tree(p_locale) SQL funksiyasi qaytaradigan qator.
// Bu funksiya tanlangan tilga mos "name" ustunini (fallback bilan)
// va daraxt bo'ylab depth/path ma'lumotlarini qaytaradi.
export interface CategoryTreeNode {
  id: string;
  name: string;
  parent_id: string | null;
  depth: number;
  path: string;
}

export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  category_id: string | null;
  brand_id: string | null;
  price: number;
  quantity: number;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  // masalan: { "Zichligi": "1.2 g/cm3", "Tozaligi": "99%" }
  tech_params_uz: Record<string, string>;
  tech_params_ru: Record<string, string>;
  tech_params_en: Record<string, string>;
  image_url: string | null;
  is_top: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
}

export type OrderStatus = "new" | "processing" | "completed" | "cancelled";

export interface Order {
  id: string;
  customer_id: string | null;
  status: OrderStatus;
  total_amount: number;
  telegram_sent: boolean;
  comment: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price_at_order: number;
}

// Savatchada ishlatiladigan yengil tip (frontendda, baza yozuvi emas)
export interface CartItem {
  product: Product;
  quantity: number;
}

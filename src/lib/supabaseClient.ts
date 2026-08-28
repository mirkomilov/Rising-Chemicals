import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // .env fayl to'g'ri sozlanmagan bo'lsa, dev rejimida ogohlantiramiz
  console.warn(
    "Supabase URL yoki ANON KEY topilmadi. .env faylini tekshiring (.env.example'ga qarang)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

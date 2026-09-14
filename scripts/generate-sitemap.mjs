// Build vaqtida ishga tushadi (package.json "build" skriptiga ulangan) va
// Supabase'dagi faol mahsulotlar ro'yxatiga asoslanib public/sitemap.xml
// faylini avtomatik generatsiya qiladi — shu bilan har bir mahsulot sahifasi
// ham qidiruv tizimlari uchun sitemap orqali topiladigan bo'ladi.
//
// Domen hali bo'lmasa ham bu skript xatosiz ishlaydi (FALLBACK_SITE_URL
// ishlatiladi) — domen sotib olingach Vercel loyiha sozlamalarida
// VITE_SITE_URL environment o'zgaruvchisini qo'shsangiz bo'ldi, kodga
// tegish shart emas.

import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const FALLBACK_SITE_URL = "https://risingchemicals.uz";

// Vercel build muhitida bu o'zgaruvchilar loyiha sozlamalaridan process.env
// orqali avtomatik keladi. Lokal `npm run build` uchun esa .env faylini
// o'zimiz o'qib olamiz (loyihada dotenv paketi yo'q, shuning uchun eng
// oddiy qatorma-qator parser yetarli).
async function loadLocalEnv() {
  try {
    const content = await readFile(path.join(ROOT, ".env"), "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;
      const [, key, rawValue = ""] = match;
      if (process.env[key] === undefined) {
        process.env[key] = rawValue.replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // .env topilmasa (masalan Vercel'da) — muammo emas, process.env'dagi
    // qiymatlar bilan davom etamiz.
  }
}

async function main() {
  await loadLocalEnv();

  const siteUrl = (process.env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, "");
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  const staticRoutes = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/products", changefreq: "daily", priority: "0.9" },
    { path: "/contact", changefreq: "monthly", priority: "0.5" },
  ];

  let productEntries = [];

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[sitemap] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY topilmadi — sitemap faqat statik sahifalar bilan generatsiya qilinadi."
    );
  } else {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("products")
      .select("id, created_at")
      .eq("is_active", true);

    if (error) {
      console.warn(`[sitemap] Mahsulotlarni olishda xatolik: ${error.message}`);
    } else {
      productEntries = (data ?? []).map((p) => ({
        path: `/products/${p.id}`,
        lastmod: p.created_at ? new Date(p.created_at).toISOString().slice(0, 10) : undefined,
        changefreq: "weekly",
        priority: "0.7",
      }));
    }
  }

  const allEntries = [...staticRoutes, ...productEntries];

  const urlTags = allEntries
    .map((entry) => {
      const lines = [
        "  <url>",
        `    <loc>${siteUrl}${entry.path}</loc>`,
        entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority}</priority>`,
        "  </url>",
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlTags}\n</urlset>\n`;

  const outPath = path.join(ROOT, "public", "sitemap.xml");
  await writeFile(outPath, xml, "utf-8");
  console.log(`[sitemap] ${allEntries.length} ta URL bilan sitemap.xml yaratildi (${outPath}).`);
}

main().catch((err) => {
  // Sitemap generatsiyasi muvaffaqiyatsiz bo'lsa ham build butunlay
  // to'xtab qolmasligi kerak — shuning uchun xatoni faqat log qilamiz.
  console.error("[sitemap] Generatsiya muvaffaqiyatsiz bo'ldi:", err);
});

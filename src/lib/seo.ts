// Domen hali sotib olinmagan bo'lsa ham loyihaning SEO infratuzilmasi
// (canonical havolalar, sitemap.xml) shu yerdagi manzilga tayanadi.
// Domen sotib olingach, Vercel loyiha sozlamalarida (Environment Variables)
// VITE_SITE_URL'ni haqiqiy domeningiz bilan to'ldiring — kod ichida hech
// narsani qo'lda o'zgartirish shart emas. Sitemap generatsiya skripti
// (scripts/generate-sitemap.mjs) ham xuddi shu qoidaga amal qiladi.
const FALLBACK_SITE_URL = "https://risingchemicals.uz";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, "");
export const SITE_NAME = "Rising Chemicals";

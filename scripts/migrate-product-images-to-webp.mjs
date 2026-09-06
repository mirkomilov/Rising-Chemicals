// Bir martalik skript: bazadagi mahsulotlarning image_urls'idagi PNG/JPG rasmlarni
// Supabase Storage'da WebP'ga o'tkazadi va bazadagi linklarni yangilaydi.
//
// Ishlatish: node scripts/migrate-product-images-to-webp.mjs
// Talab: .env faylida VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
//        ADMIN_MIGRATION_EMAIL, ADMIN_MIGRATION_PASSWORD to'ldirilgan bo'lishi kerak.

import { createClient } from "@supabase/supabase-js";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const PRODUCT_IMAGES_BUCKET = "product-images";
const MAX_DIMENSION = 1600;
const QUALITY = 82;

function loadEnv() {
  const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
const ADMIN_EMAIL = env.ADMIN_MIGRATION_EMAIL;
const ADMIN_PASSWORD = env.ADMIN_MIGRATION_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY .env'da topilmadi.");
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "ADMIN_MIGRATION_EMAIL / ADMIN_MIGRATION_PASSWORD .env'da to'ldirilmagan. " +
      "Admin login email/parolini .env fayliga yozib qo'ying."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function runCwebp(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn("cwebp", ["-quiet", "-q", String(QUALITY), "-resize", String(MAX_DIMENSION), "0", inputPath, "-o", outputPath]);
    proc.on("error", reject);
    proc.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`cwebp exited with code ${code}`))));
  });
}

function storagePathFromPublicUrl(url) {
  const marker = `/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

async function convertOne(url, tmpDir) {
  const path = storagePathFromPublicUrl(url);
  if (!path) return { url, changed: false };
  if (path.toLowerCase().endsWith(".webp")) return { url, changed: false };

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Yuklab bo'lmadi: ${url} (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());

  const ext = path.split(".").pop() || "bin";
  const inputPath = join(tmpDir, `in.${ext}`);
  const outputPath = join(tmpDir, "out.webp");
  await writeFile(inputPath, buf);
  await runCwebp(inputPath, outputPath);
  const webpBuf = await readFile(outputPath);

  const newPath = `${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(newPath, webpBuf, { contentType: "image/webp" });
  if (uploadError) throw uploadError;

  const { error: removeError } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
  if (removeError) console.warn(`  Ogohlantirish: eski faylni o'chirib bo'lmadi (${path}): ${removeError.message}`);

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(newPath);
  return { url, changed: true, newUrl: data.publicUrl, before: buf.length, after: webpBuf.length };
}

async function main() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (authError) {
    console.error("Login xatosi:", authError.message);
    process.exit(1);
  }

  const { data: products, error } = await supabase.from("products").select("id, image_urls");
  if (error) {
    console.error("Mahsulotlarni o'qib bo'lmadi:", error.message);
    process.exit(1);
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let convertedCount = 0;

  for (const product of products ?? []) {
    const urls = product.image_urls ?? [];
    if (urls.length === 0) continue;

    const tmpDir = await mkdtemp(join(tmpdir(), "webp-migrate-"));
    const nextUrls = [];
    let productChanged = false;

    try {
      for (const url of urls) {
        try {
          const result = await convertOne(url, tmpDir);
          if (result.changed) {
            console.log(`  ${product.id}: ${url} -> ${result.newUrl} (${result.before}B -> ${result.after}B)`);
            totalBefore += result.before;
            totalAfter += result.after;
            convertedCount += 1;
            productChanged = true;
            nextUrls.push(result.newUrl);
          } else {
            nextUrls.push(url);
          }
        } catch (err) {
          console.error(`  Xatolik (${url}):`, err.message);
          nextUrls.push(url);
        }
      }
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }

    if (productChanged) {
      const { error: updateError } = await supabase
        .from("products")
        .update({ image_urls: nextUrls })
        .eq("id", product.id);
      if (updateError) {
        console.error(`  Bazani yangilab bo'lmadi (${product.id}):`, updateError.message);
      }
    }
  }

  console.log("\n--- Yakun ---");
  console.log(`Konvertatsiya qilingan rasmlar: ${convertedCount}`);
  if (convertedCount > 0) {
    console.log(`Hajm: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`);
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);

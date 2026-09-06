const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.82;

/**
 * Rasmni brauzerda WebP formatga o'tkazadi va katta rasmlarni MAX_DIMENSION
 * chegarasigacha kichraytiradi. Supabase Storage'ga faqat optimallashtirilgan
 * fayl yuklanishi uchun upload'dan oldin chaqiriladi.
 */
export async function toOptimizedWebp(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  // SVG kabi vector formatlarni piksel rasmga aylantirish shart emas.
  if (file.type === "image/svg+xml") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );
  if (!blob) return file;

  // Ba'zi eski brauzerlar WebP encode'ni qo'llamaydi va PNG qaytaradi — bunday holda asl faylni saqlaymiz.
  if (blob.type !== "image/webp") return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], newName, { type: "image/webp" });
}

// supabase/functions/telegram-notify/index.ts
//
// Vazifasi: order_items jadvaliga yangi qator qo'shilganda
// (ya'ni zayavka to'liq saqlangandan keyin) sotuvchiga
// Telegramda xabar yuboradi.
//
// Himoya: bitta buyurtmada bir nechta mahsulot bo'lsa, order_items'ga
// bir nechta qator qo'shiladi va webhook har biri uchun alohida
// chaqiriladi. Xabar FAQAT BIR MARTA yuborilishi uchun
// orders.telegram_sent ustunini atomik ravishda false -> true
// qilib yangilaymiz; buni faqat BITTA chaqiruv muvaffaqiyatli
// bajara oladi (poyga holati — race condition — shu tarzda oldini olinadi).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    // Supabase Database Webhook order_items INSERT bo'lganda
    // shu formatda ma'lumot yuboradi: { type, table, record, ... }
    const orderId: string | undefined = payload?.record?.order_id;

    if (!orderId) {
      return new Response(JSON.stringify({ error: "order_id topilmadi" }), {
        status: 400,
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1) Atomik flag almashtirish — faqat birinchi chaqiruv o'tadi
    const { data: flagged, error: flagErr } = await supabase
      .from("orders")
      .update({ telegram_sent: true })
      .eq("id", orderId)
      .eq("telegram_sent", false)
      .select()
      .maybeSingle();

    if (flagErr) throw flagErr;

    // Agar flag allaqachon true bo'lsa (boshqa chaqiruv ulgurgan
    // bo'lsa) yoki order topilmasa — hech narsa qilmasdan chiqamiz
    if (!flagged) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    // 2) Buyurtma haqida to'liq ma'lumot: mijoz + mahsulotlar
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(
        `
        id, total_amount, comment, created_at,
        customers ( full_name, phone, email ),
        order_items ( quantity, price_at_order, products ( name_ru ) )
      `
      )
      .eq("id", orderId)
      .single();

    if (orderErr) throw orderErr;

    const customer = order.customers as any;
    const items = (order.order_items as any[]) ?? [];

    // 3) Telegram xabarini shakllantiramiz
    let text = `🆕 <b>Yangi zayavka!</b>\n\n`;
    text += `👤 <b>Mijoz:</b> ${customer?.full_name ?? "—"}\n`;
    text += `📞 <b>Telefon:</b> ${customer?.phone ?? "—"}\n`;
    if (customer?.email) text += `✉️ <b>Email:</b> ${customer.email}\n`;

    text += `\n🧪 <b>Mahsulotlar:</b>\n`;
    for (const item of items) {
      const name = item.products?.name_ru ?? "Noma'lum mahsulot";
      const sum = item.quantity * item.price_at_order;
      text += `• ${name} — ${item.quantity} dona × ${item.price_at_order.toLocaleString(
        "ru-RU"
      )} = ${sum.toLocaleString("ru-RU")} so'm\n`;
    }

    text += `\n💰 <b>Jami:</b> ${order.total_amount.toLocaleString("ru-RU")} so'm\n`;
    if (order.comment) text += `\n💬 <b>Izoh:</b> ${order.comment}\n`;

    text += `\n🕒 ${new Date(order.created_at).toLocaleString("uz-UZ")}`;

    // 4) Telegram Bot API orqali yuboramiz
    const tgRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      console.error("Telegram xatosi:", tgData);
      return new Response(JSON.stringify({ telegramError: tgData }), {
        status: 502,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});

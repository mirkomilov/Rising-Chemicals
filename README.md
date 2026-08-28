# Rising Chemicals — Websayt

React + TypeScript + Vite + Tailwind + Supabase asosida qurilgan.

## 1. O'rnatish

```bash
npm install
```

## 2. Supabase sozlash

1. `.env.example` faylini nusxalab `.env` deb saqlang:
   ```bash
   cp .env.example .env
   ```
2. Supabase Dashboard → **Settings → API** bo'limidan `Project URL` va `anon public key`ni oling, `.env` fayliga joylashtiring.

## 3. Ishga tushirish

```bash
npm run dev
```

Sayt `http://localhost:5173` da ochiladi.

## 4. Admin user yaratish

Admin panelga kirish uchun (`/admin/login`):

1. Supabase Dashboard → **Authentication → Users → Add user** orqali email/parol bilan foydalanuvchi yarating.
2. Keyin **SQL Editor**da quyidagini ishga tushiring (yaratilgan user'ning UUID'sini `auth.users` jadvalidan oling):

```sql
insert into admin_users (id, email, role)
values ('BU_YERGA_USER_UUID', 'admin@example.com', 'admin');
```

Shundan keyin shu email/parol bilan `/admin/login` orqali kirishingiz mumkin.

## 5. Logotip

`Rising Chemicals` logotipini `public/logo.png` sifatida joylashtiring
(hozircha `Header.tsx`da vaqtincha atom ikonkasi + matn ishlatilgan,
logotip qo'shilgach shu joyni `<img src="/logo.png" />` ga almashtiramiz).

## 6. shadcn/ui komponentlarini qo'shish (ixtiyoriy, keyingi bosqich)

Loyihada hozircha Tailwind + CSS o'zgaruvchilari (shadcn konvensiyasi bo'yicha)
tayyorlangan, lekin shadcn CLI orqali tayyor komponentlar (Button, Dialog,
Table va h.k.) hali qo'shilmagan. Buni keyingi bosqichda quyidagicha qilamiz:

```bash
npx shadcn@latest init
npx shadcn@latest add button dialog input select table
```

## Papka strukturasi

```
src/
  components/
    layout/       — Header, Footer, MainLayout, AdminLayout
    ui/            — shadcn komponentlari shu yerga tushadi
  lib/
    supabaseClient.ts
    utils.ts       — cn() helper
  pages/
    Home.tsx, Products.tsx, Cart.tsx, Contact.tsx
    admin/         — AdminLogin, AdminDashboard, AdminProducts,
                      AdminCategories, AdminOrders, AdminStats
  store/
    cartStore.ts   — savatcha (localStorage'da saqlanadi)
    themeStore.ts  — light/dark tema (localStorage'da saqlanadi)
  types/
    database.types.ts
```

## Keyingi bosqichlar (hali qilinmagan)

- [ ] Telegram bot — Supabase Edge Function + Database Webhook orqali
      `orders` jadvaliga INSERT bo'lganda avtomatik xabar yuborish
- [ ] Home page uchun haqiqiy carousel/slayder komponenti
- [ ] Rasm yuklash — Supabase Storage integratsiyasi (hozircha faqat URL kiritiladi)
- [ ] shadcn komponentlarini joriy qilish (Button, Dialog, Table va h.k.)

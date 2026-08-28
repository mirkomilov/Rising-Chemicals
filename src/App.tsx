import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";

import MainLayout from "@/components/layout/MainLayout";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Contact from "@/pages/Contact";

import AdminLayout from "@/components/layout/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminStats from "@/pages/admin/AdminStats";

export default function App() {
  const theme = useThemeStore((s) => s.theme);

  // sahifa birinchi ochilganda saqlangan temani <html> tegiga qo'llaymiz
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Routes>
      {/* ===== Public sayt ===== */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* ===== Admin panel ===== */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="stats" element={<AdminStats />} />
      </Route>
    </Routes>
  );
}

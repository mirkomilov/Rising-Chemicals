import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(t("admin.login.error"));
      return;
    }
    navigate("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6"
      >
        <h1 className="text-center text-xl font-bold">
          <span className="text-primary">RISING</span>{" "}
          <span className="text-secondary">{t("admin.login.brand")}</span>
        </h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <input
          type="email"
          required
          placeholder={t("admin.login.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder={t("admin.login.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t("admin.login.submitting") : t("admin.login.submit")}
        </button>
      </form>
    </div>
  );
}

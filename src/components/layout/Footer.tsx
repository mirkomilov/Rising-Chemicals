import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Send, Instagram } from "lucide-react";

const TELEGRAM_URL = "https://t.me/risingchemicals";
const INSTAGRAM_URL = "https://www.instagram.com/risingchemicals/";
const PHONE_DISPLAY = "+998 88 888 28 38";
const PHONE_HREF = "tel:+998888882838";
const EMAIL = "info@risingchemicals.uz";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src="/rising-logo.png" alt="Rising Chemicals" className="mb-3 h-11 w-auto" />
          <p className="max-w-sm text-sm text-muted-foreground">{t("footer.tagline")}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">{t("footer.quickLinksTitle")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="transition hover:text-primary">
                {t("header.home")}
              </Link>
            </li>
            <li>
              <Link to="/products" className="transition hover:text-primary">
                {t("header.products")}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition hover:text-primary">
                {t("header.contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">{t("footer.contactTitle")}</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a href={PHONE_HREF} className="transition hover:text-primary">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a href={`mailto:${EMAIL}`} className="transition hover:text-primary">
                {EMAIL}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{t("footer.addressValue")}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}

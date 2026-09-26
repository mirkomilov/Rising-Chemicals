import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { FaTelegramPlane, FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";

const TELEGRAM_URL = "https://t.me/risingchemicals";
const INSTAGRAM_URL = "https://www.instagram.com/risingchemicals/";
const FACEBOOK_URL = "https://www.facebook.com/risingchemicals/";
const WHATSAPP_URL = "https://wa.me/998888882838";
const PHONE_DISPLAY = "+998 88 888 28 38";
const PHONE_HREF = "tel:+998888882838";
const EMAIL = "risingchemicals@gmail.com";

const SOCIAL_LINKS = [
  { href: TELEGRAM_URL, label: "Telegram", icon: FaTelegramPlane },
  { href: INSTAGRAM_URL, label: "Instagram", icon: FaInstagram },
  { href: FACEBOOK_URL, label: "Facebook", icon: FaFacebookF },
  { href: WHATSAPP_URL, label: "WhatsApp", icon: FaWhatsapp },
];

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-muted/40">
      {/* Tor ekranda bir ustun: 2 ustunli holatda uzun e-mail manzili
          ustun kengligiga sig'may, butun sahifada gorizontal scroll
          paydo qilardi. */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 lg:flex lg:items-start lg:justify-between lg:gap-8">
        <div className="sm:col-span-2 lg:col-span-1 lg:max-w-xs">
          <img src="/rising-logo.png" alt="Rising Chemicals" className="mb-3 h-11 w-auto" />
          <p className="max-w-sm text-[15px] text-muted-foreground">{t("footer.tagline")}</p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">{t("footer.socialTitle")}</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <li key={label} className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-primary"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
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
              <a
                href={`mailto:${EMAIL}`}
                className="min-w-0 break-all transition hover:text-primary"
              >
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

      <div className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}

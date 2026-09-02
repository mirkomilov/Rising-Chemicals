import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin, Send, Instagram } from "lucide-react";

const TELEGRAM_URL = "https://t.me/risingchemicals";
const INSTAGRAM_URL = "https://www.instagram.com/risingchemicals/";
const PHONE_DISPLAY = "+998 88 888 28 38";
const PHONE_HREF = "tel:+998888882838";
const EMAIL = "info@risingchemicals.uz";

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="mb-8 text-2xl font-semibold">{t("contact.title")}</h2>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{t("contact.addressTitle")}</p>
              {/* TODO: aniq manzil bilan almashtiring */}
              <p className="text-sm text-muted-foreground">
                {t("contact.addressValue")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{t("contact.phoneTitle")}</p>
              <a href={PHONE_HREF} className="text-sm text-muted-foreground hover:text-primary">
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{t("contact.emailTitle")}</p>
              <a href={`mailto:${EMAIL}`} className="text-sm text-muted-foreground hover:text-primary">
                {EMAIL}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Send className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{t("contact.socialTitle")}</p>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  <Send className="h-3.5 w-3.5" /> Telegram
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  <Instagram className="h-3.5 w-3.5" /> Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* TODO: Google Maps embed shu yerga joylashtiriladi */}
        <div className="flex h-72 items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
          {t("contact.mapPlaceholder")}
        </div>
      </div>
    </div>
  );
}

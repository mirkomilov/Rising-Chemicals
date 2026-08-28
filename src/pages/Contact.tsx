import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin, Send } from "lucide-react";

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
              <p className="text-sm text-muted-foreground">+998 XX XXX XX XX</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{t("contact.emailTitle")}</p>
              <p className="text-sm text-muted-foreground">info@risingchemicals.uz</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Send className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{t("contact.socialTitle")}</p>
              <div className="flex gap-3 text-sm text-muted-foreground">
                <a href="#" className="hover:text-primary">Telegram</a>
                <a href="#" className="hover:text-primary">Instagram</a>
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

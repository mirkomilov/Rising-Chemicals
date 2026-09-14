import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin } from "lucide-react";

const PHONE_DISPLAY = "+998 88 888 28 38";
const PHONE_HREF = "tel:+998888882838";
const EMAIL = "info@risingchemicals.uz";

export default function Contact() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col md:h-[340px]">
          <h2 className="mb-10 text-3xl font-semibold">{t("contact.title")}</h2>

          <div className="space-y-8 md:flex-1 md:flex md:flex-col md:justify-center md:pb-16">
            <div className="flex items-start gap-4">
              <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="text-lg font-medium">{t("contact.addressTitle")}</p>
                <p className="text-base text-muted-foreground">
                  {t("contact.addressValue")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="text-lg font-medium">{t("contact.phoneTitle")}</p>
                <a href={PHONE_HREF} className="text-base text-muted-foreground hover:text-primary">
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="text-lg font-medium">{t("contact.emailTitle")}</p>
                <a href={`mailto:${EMAIL}`} className="text-base text-muted-foreground hover:text-primary">
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="h-72 overflow-hidden rounded-lg border border-border md:h-[340px]">
          <iframe
            title={t("contact.addressTitle")}
            src="https://www.google.com/maps?q=41.224861,69.323861&z=17&output=embed"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

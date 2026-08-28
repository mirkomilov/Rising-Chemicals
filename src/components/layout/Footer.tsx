import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-lg font-bold">
            <span className="text-primary">RISING</span>{" "}
            <span className="text-secondary">CHEMICALS</span>
          </h3>
          <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">{t("footer.contactTitle")}</h4>
          <p className="text-sm text-muted-foreground">
            {t("footer.phone")}
            <br />
            {t("footer.email")}
            <br />
            {t("footer.address")}
          </p>
        </div>

        <div>
          <h4 className="mb-2 font-semibold">{t("footer.socialTitle")}</h4>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">Telegram</a>
            <a href="#" className="hover:text-primary">Instagram</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}

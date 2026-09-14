import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

interface SeoProps {
  /** Sahifaga xos sarlavha. SITE_NAME bilan bir xil bo'lsa, qo'shimcha
   *  "| Rising Chemicals" qo'shilmaydi (bosh sahifa uchun). */
  title: string;
  /** Qidiruv tizimlari bu sahifani indexlamasligi kerak bo'lsa (admin,
   *  savatcha, sevimlilar kabi shaxsiy/xizmat sahifalari). */
  noindex?: boolean;
}

// Har bir sahifada <title> va canonical havolani boshqaradi. Meta
// description/Open Graph teglar atayin bu yerda emas, index.html'da statik
// holda saqlanadi — chunki ular ijtimoiy tarmoq bot'lari (Telegram,
// WhatsApp) uchun JS ishga tushishidan oldin ham mavjud bo'lishi kerak.
export default function Seo({ title, noindex = false }: SeoProps) {
  const { pathname } = useLocation();
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonical = `${SITE_URL}${pathname}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}

import { useTranslation } from "react-i18next";
import AtomSpinner from "@/components/AtomSpinner";
import { cn } from "@/lib/utils";

// Ma'lumot yuklanayotgan har qanday sahifa/bo'lim uchun bir xil ko'rinishdagi
// loader. min-h orqali ota elementning flex holatidan qat'i nazar sahifa
// balandligining katta qismini egallaydi, shuning uchun spinner haqiqatan
// ham markazda (gorizontal ham, vertikal ham) ko'rinadi.
export default function PageLoader({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex min-h-screen w-full flex-col items-center justify-center gap-5 text-sm text-muted-foreground",
        className
      )}
    >
      <AtomSpinner size={140} />
      {t("common.loading")}
    </div>
  );
}

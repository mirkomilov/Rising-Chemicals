import { useTranslation } from "react-i18next";
import AtomSpinner from "@/components/AtomSpinner";
import { cn } from "@/lib/utils";

// Ma'lumot yuklanayotgan har qanday sahifa/bo'lim uchun bir xil ko'rinishdagi
// markazlashtirilgan loader — AtomSpinner'ning kattaroq varianti.
export default function PageLoader({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-24 text-sm text-muted-foreground",
        className
      )}
    >
      <AtomSpinner size={80} />
      {t("common.loading")}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** Ketma-ket elementlarni bir oz kechiktirib "to'lqin" hosil qilish uchun (ms). */
  delay?: number;
  className?: string;
}

// Element ekranga kirganda bir marta: 16px pastdan ko'tarilib, paydo bo'ladi.
// Ataylab kichik masofa va qisqa davomiylik — kattaroq qiymatlar sahifani
// "sakrayotgandek" qiladi va kontent kelishini kutib turishga majburlaydi.
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Harakat kamaytirilgan bo'lsa animatsiyani umuman o'tkazib yuboramiz:
  // index.css transitionlarni o'chiradi, lekin boshlang'ich "ko'rinmas"
  // holat o'chmaydi — shuning uchun darhol ko'ringan holatdan boshlaymiz.
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      // Element pastdan 10% ko'ringanda ishga tushadi — foydalanuvchi
      // unga yetib borguncha animatsiya allaqachon tugagan bo'ladi.
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      style={visible && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}

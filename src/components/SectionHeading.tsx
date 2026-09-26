import { cn } from "@/lib/utils";

// Sayt bo'ylab yagona sarlavha ko'rinishi: qisqa teal aksent chizig'i +
// kattalashtirilgan sarlavha. Chiziq brend rangini takrorlab, bo'limlar
// boshlanishini ko'z bilan ajratadi — barcha sarlavhalar bir xil
// o'lchamda bo'lganida sahifa "tekis" ko'rinardi.
export default function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {/* bg-secondary emas: light/dark temada --primary va --secondary
          o'rin almashadi, shuning uchun qorong'i temada bu chiziq to'q
          navy bo'lib fonda ko'rinmay qolardi. brand-teal esa ikkala
          temada ham bir xil aksent bo'lib turadi. */}
      <span className="mb-3 block h-1 w-10 rounded-full bg-brand-teal" />
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {children}
      </h2>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface AtomSpinnerProps {
  size?: number;
  className?: string;
}

// Ikkita brend rangi (navy -> teal) orasida chiziqli interpolyatsiya.
const NAVY: [number, number, number] = [15, 76, 117]; // #0F4C75
const TEAL: [number, number, number] = [26, 194, 155]; // #1AC29B

function dotColor(t: number): string {
  const r = Math.round(NAVY[0] + (TEAL[0] - NAVY[0]) * t);
  const g = Math.round(NAVY[1] + (TEAL[1] - NAVY[1]) * t);
  const b = Math.round(NAVY[2] + (TEAL[2] - NAVY[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

const DOT_COUNT = 22;
const DURATION = 3.6;

// Har bir nuqta uchun: yo'l bo'yicha boshlang'ich siljish (manfiy delay),
// o'lchami (ikki tomonlama to'lqin — 8-shaklning ikkala halqasiga mos) va rangi.
const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const t = i / DOT_COUNT;
  return {
    delay: -(t * DURATION),
    size: 5 + 6 * (0.5 + 0.5 * Math.sin(t * Math.PI * 4)),
    color: dotColor(t),
  };
});

// Cheksizlik (∞) belgisi bo'ylab harakatlanuvchi rangli nuqtalar loaderi.
// Ichki chizma 200x100 "artboard"da qurilgan, tashqi width/height'ga
// mos ravishda scale() orqali moslashtiriladi.
export default function AtomSpinner({ size = 48, className }: AtomSpinnerProps) {
  const width = size;
  const height = size * 0.5;

  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      <div
        className="absolute left-0 top-0"
        style={{
          width: 200,
          height: 100,
          transform: `scale(${width / 200}, ${height / 100})`,
          transformOrigin: "top left",
        }}
      >
        {DOTS.map((d, i) => (
          <span
            key={i}
            className="infinity-dot"
            style={
              {
                width: d.size,
                height: d.size,
                backgroundColor: d.color,
                animationDelay: `${d.delay}s`,
                "--infinity-duration": `${DURATION}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

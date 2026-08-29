import { cn } from "@/lib/utils";

interface AtomSpinnerProps {
  size?: number;
  className?: string;
}

// Brendning atom ikonkasi — yuklanish paytida aylanadigan animatsiya sifatida
// ishlatiladi (public/atom-icon.png — logotipdan matnisiz ajratib olingan).
export default function AtomSpinner({ size = 48, className }: AtomSpinnerProps) {
  return (
    <img
      src="/atom-icon.png"
      alt=""
      style={{ width: size, height: size }}
      className={cn("animate-spin", className)}
    />
  );
}

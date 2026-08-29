import { cn } from "@/lib/utils";

interface AtomSpinnerProps {
  size?: number;
  className?: string;
}

// Brendning atom ikonkasi — yuklanish paytida aylanadigan animatsiya sifatida
// ishlatiladi (public/atom-icon.png — logotipdan matnisiz ajratib olingan).
// Tailwind'ning standart animate-spin tezligi (1s) o'rniga sekinroq, yumshoqroq
// aylanish uchun animationDuration inline uslub orqali qayta belgilanadi.
export default function AtomSpinner({ size = 48, className }: AtomSpinnerProps) {
  return (
    <img
      src="/atom-icon.png"
      alt=""
      style={{ width: size, height: size, animationDuration: "1.8s" }}
      className={cn("animate-spin", className)}
    />
  );
}

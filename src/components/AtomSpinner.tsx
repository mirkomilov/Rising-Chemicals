import { cn } from "@/lib/utils";

interface AtomSpinnerProps {
  size?: number;
  className?: string;
}

// Sharsimon (globus kabi) 3D loader: soyalangan yadro + har biri o'z
// tekisligida qiyshiq turgan holda aylanadigan ikkita orbita halqasi
// (har birida bitta elektron nuqta). Butunlay CSS (index.css) orqali
// chizilgan — 3D chuqurlik va soya effekti uchun rasm ishlatilmaydi.
export default function AtomSpinner({ size = 48, className }: AtomSpinnerProps) {
  return (
    <div className={cn("atom3d", className)} style={{ width: size, height: size }}>
      <div className="atom3d-sphere" />
      <div className="atom3d-ring atom3d-ring-a">
        <span className="atom3d-dot" />
      </div>
      <div className="atom3d-ring atom3d-ring-b">
        <span className="atom3d-dot" />
      </div>
    </div>
  );
}

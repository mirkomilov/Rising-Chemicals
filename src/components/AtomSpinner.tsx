import { cn } from "@/lib/utils";

interface AtomSpinnerProps {
  size?: number;
  className?: string;
}

// Brendning atom ikonkasi — X, Y va Z o'qlarida bir vaqtda, turli
// tezlikda aylanadigan uch qatlamli 3D animatsiya (public/atom-icon.png).
export default function AtomSpinner({ size = 48, className }: AtomSpinnerProps) {
  return (
    <div
      className={cn("atom-spin-perspective", className)}
      style={{ width: size, height: size }}
    >
      <div className="atom-spin-x h-full w-full">
        <div className="atom-spin-y h-full w-full">
          <div className="atom-spin-z h-full w-full">
            <img src="/atom-icon.png" alt="" className="h-full w-full object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}

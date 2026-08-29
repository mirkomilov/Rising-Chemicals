import { cn } from "@/lib/utils";

interface AtomSpinnerProps {
  size?: number;
  className?: string;
}

// Oddiy, klassik aylanuvchi halqa loader.
export default function AtomSpinner({ size = 48, className }: AtomSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-4 border-border border-t-primary",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

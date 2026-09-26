import { useState } from "react";
import { cn } from "@/lib/utils";

// Rasm yuklanib bo'lgach mayin paydo bo'ladi. Keshdan kelgan rasm uchun
// onLoad ba'zan React hodisani ulguruncha ishlab bo'ladi — shuning uchun
// ref callback'da complete holatini ham tekshiramiz, aks holda rasm
// ko'rinmas holatda qotib qolishi mumkin edi.
export default function FadeImage({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...props}
      ref={(node) => {
        if (node?.complete) setLoaded(true);
      }}
      onLoad={(e) => {
        setLoaded(true);
        props.onLoad?.(e);
      }}
      className={cn(
        "transition-opacity duration-500 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
}

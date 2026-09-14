import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = Array.from({ length: 9 }, (_, i) => `/main-page/image${i + 1}.webp`);

const AUTO_ADVANCE_MS = 5000;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  // Faqat ko'rilgan/ko'rilishi kutilayotgan slaydlarni yuklaymiz, 9 tasini birdan emas.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1 % SLIDES.length]));

  useEffect(() => {
    setLoaded((prev) => {
      const nextActive = (active + 1) % SLIDES.length;
      if (prev.has(active) && prev.has(nextActive)) return prev;
      const next = new Set(prev);
      next.add(active);
      next.add(nextActive);
      return next;
    });
  }, [active]);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, []);

  function prev() {
    setActive((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  }

  function next() {
    setActive((i) => (i + 1) % SLIDES.length);
  }

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-lg bg-muted sm:h-[520px] md:h-[640px] md:flex-1">
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        >
          {loaded.has(i) && (
            <>
              {/* fon: butun konteynerni to'ldiruvchi xiralashgan nusxa */}
              <img
                src={src}
                alt=""
                aria-hidden
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full scale-110 object-cover blur-2xl"
              />
              {/* old plan: rasm to'liq, kesilmagan holda ko'rinadi */}
              <img
                src={src}
                alt="Rising Chemicals"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={i === 0 ? "high" : "auto"}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={prev}
        aria-label="Oldingi"
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Keyingi"
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === active ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

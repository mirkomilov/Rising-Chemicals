const LOGOS = Array.from({ length: 11 }, (_, i) => `/brends/img${i + 1}.png`);

export default function BrandsMarquee() {
  return (
    <div
      className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
    >
      <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
        {[...LOGOS, ...LOGOS].map((src, i) => (
          <div
            key={i}
            // bg-white (bg-card emas): logotiplar oq fon uchun chizilgan —
            // qorong'i temada bg-card to'q bo'lib, ko'pchilik logotip
            // butunlay ko'rinmay qolardi.
            className="flex h-24 w-40 shrink-0 items-center justify-center rounded-lg border border-border bg-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
          >
            <img
              src={src}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

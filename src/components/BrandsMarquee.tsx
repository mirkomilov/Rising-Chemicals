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
            className="flex h-24 w-40 shrink-0 items-center justify-center rounded-lg border border-border bg-card p-4 shadow-sm"
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

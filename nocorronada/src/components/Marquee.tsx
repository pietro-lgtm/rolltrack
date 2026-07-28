/** Full-bleed repeating ticker. Duplicates content 2x for a seamless loop. */
export function Marquee({
  text,
  className = "",
  separator = "•",
  durationSeconds = 28,
}: {
  text: string;
  className?: string;
  separator?: string;
  durationSeconds?: number;
}) {
  const items = Array.from({ length: 12 }, () => text);
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden>
      <div
        className="marquee-track"
        style={{ "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties}
      >
        {[0, 1].map((half) => (
          <span key={half} className="display flex shrink-0 items-center text-inherit">
            {items.map((t, i) => (
              <span key={i} className="mx-4 flex items-center gap-8">
                {t} <span className="text-volt">{separator}</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

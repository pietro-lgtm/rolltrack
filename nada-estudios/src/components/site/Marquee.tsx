/** CSS-only infinite marquee. Children are duplicated for the seamless loop. */
export function Marquee({
  children,
  duration = 30,
  className = "",
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`marquee overflow-hidden ${className}`} aria-hidden>
      <div
        className="marquee-track"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center">{children}</div>
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
import { site } from "@/config/site";

type Sponsor = { name: string; note: string; logo?: string };
const sponsors: readonly Sponsor[] = site.sponsors;

/**
 * Official sponsor logo band. Logos live in public/sponsors/ and are
 * normalized to white via CSS filter so any official mark sits on black.
 * Sponsors without a logo file fall back to a type lockup.
 */
export function SponsorStrip({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "py-6" : "py-10"}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-6 px-4 sm:px-6">
        <p className="label-mono shrink-0 text-muted">Powered by</p>
        <div className="flex flex-1 flex-wrap items-center justify-around gap-x-12 gap-y-6">
          {sponsors.map((s) =>
            s.logo ? (
              <img
                key={s.name}
                src={s.logo}
                alt={s.name}
                title={s.note}
                className={`w-auto opacity-75 brightness-0 invert transition-opacity hover:opacity-100 ${
                  compact ? "h-5 sm:h-6" : "h-7 sm:h-9"
                }`}
              />
            ) : (
              <span
                key={s.name}
                title={s.note}
                className={`display text-ink opacity-75 ${compact ? "text-lg" : "text-2xl"}`}
              >
                {s.name}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

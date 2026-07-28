/* eslint-disable @next/next/no-img-element */
import { adsForSlot, type AdBanner } from "@/data/ads";

/**
 * Sponsor banner strip. Renders nothing while src/data/ads.ts is empty.
 * Plain <img> on purpose: banner artwork lives in public/ads/ at final size.
 */
export function AdRail({ slot }: { slot: AdBanner["slot"] }) {
  const banners = adsForSlot(slot);
  if (banners.length === 0) return null;

  return (
    <section className="border-b hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="label-mono text-muted">Publicidad</p>
        {banners.map((b) => (
          <a
            key={b.image}
            href={b.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block border hairline transition-colors hover:border-volt"
          >
            <img src={b.image} alt={b.alt} className="h-auto w-full" />
          </a>
        ))}
      </div>
    </section>
  );
}

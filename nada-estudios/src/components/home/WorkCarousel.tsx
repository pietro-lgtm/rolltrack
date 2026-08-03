"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PortfolioItem } from "@/lib/content";
import { resolveEmbed } from "@/components/trabajo/embed";

type Media = { kind: "image"; src: string } | { kind: "video"; src: string } | null;

/** Photo if there is one; a direct video file if not (third-party iframe
 * embeds — YouTube/Vimeo/Drive/Instagram — don't autoplay reliably inline in
 * a looping carousel, so those items fall back to the typographic slide). */
function mediaFor(item: PortfolioItem): Media {
  if (item.image) return { kind: "image", src: item.image };
  if (item.videoUrl) {
    const embed = resolveEmbed(item.videoUrl);
    if (embed.kind === "video") return { kind: "video", src: embed.src };
  }
  return null;
}

const AUTOPLAY_MS = 5000;

export function WorkCarousel({ items }: { items: PortfolioItem[] }) {
  const slides = items.map((item) => ({ item, media: mediaFor(item) }));
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  // Scroll position is the single source of truth for `index` (see onScroll
  // below). `go()` only ever calls scrollTo — it must never setIndex directly,
  // or the animated scroll and the index-driven effect fight each other and
  // the carousel snaps back to the start mid-transition.
  const indexRef = useRef(0);
  const count = slides.length;

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  function go(delta: number) {
    const track = trackRef.current;
    if (!track) return;
    const next = (indexRef.current + delta + count) % count;
    track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    if (paused || count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => go(1), AUTOPLAY_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, count]);

  if (count === 0) return null;

  return (
    <div
      className="relative border-y-2 border-ink bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        // overflow-anchor:none matters here — without it, the browser's scroll
        // anchoring "helpfully" re-adjusts scrollLeft as caption text reflows
        // on webfont swap / images decode, silently smooth-scrolling the
        // carousel to a random slide right after mount.
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [overflow-anchor:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) => {
          const w = e.currentTarget.clientWidth;
          if (!w) return;
          const i = Math.round(e.currentTarget.scrollLeft / w);
          if (i !== index) setIndex(i);
        }}
      >
        {slides.map(({ item, media }, i) => (
          <Link
            key={item.slug}
            href={`/trabajo/${item.slug}`}
            className="group relative aspect-[4/5] w-full shrink-0 snap-start sm:aspect-video"
          >
            {media?.kind === "image" ? (
              <Image
                src={media.src}
                alt={item.client}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : media?.kind === "video" ? (
              <video
                src={media.src}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-ink">
                <span className="display text-5xl text-paper sm:text-7xl">{item.client}</span>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 border-t-2 border-ink bg-ink p-5 sm:p-6">
              <div>
                <p className="display text-2xl text-paper sm:text-3xl">{item.client}</p>
                <p className="label-mono mt-1 text-paper/60">{item.tags.join(" · ")}</p>
              </div>
              <span className="label-mono shrink-0 text-paper/60 transition-colors group-hover:text-accent">
                Ver caso →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {count > 1 && (
        <div className="flex items-center justify-between border-t-2 border-ink px-4 py-3 sm:px-6">
          <p className="label-mono text-paper/60">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Proyecto anterior"
              onClick={() => go(-1)}
              className="label-mono border-2 border-paper/40 px-3 py-1.5 text-paper transition-colors hover:border-accent hover:text-accent"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Proyecto siguiente"
              onClick={() => go(1)}
              className="label-mono border-2 border-paper/40 px-3 py-1.5 text-paper transition-colors hover:border-accent hover:text-accent"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

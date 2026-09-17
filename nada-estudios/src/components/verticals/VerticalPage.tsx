import Link from "next/link";
import { resolveEmbed } from "@/components/trabajo/embed";
import { Reveal } from "@/components/site/Reveal";
import type { Vertical } from "@/data/verticals";
import { VerticalIntakeForm } from "./VerticalIntakeForm";

/**
 * Shared layout for the vertical landing pages (/empresarial, /restaurantes):
 * hero → video reel → proof marks → inverted intake section.
 */
export function VerticalPage({ vertical }: { vertical: Vertical }) {
  const [firstVideo, ...restVideos] = vertical.videos;

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 sm:pt-24">
        <Reveal>
          <p className="label-mono text-mid">{vertical.eyebrow}</p>
          <h1 className="display mt-3 text-5xl sm:text-7xl lg:text-8xl">
            {vertical.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-8 max-w-2xl text-lg text-mid sm:text-xl">{vertical.intro}</p>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#form" className="btn btn-accent">
              {vertical.formCta}
            </a>
            <Link href={`/trabajo/${vertical.caseSlug}`} className="btn btn-ghost">
              Ver el caso →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Reel */}
      {firstVideo && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <VideoEmbed src={firstVideo} title={`${vertical.name} — reel`} />
          </Reveal>
          {restVideos.length > 0 && (
            <Reveal delay={0.06}>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {restVideos.map((src, i) => (
                  <VideoEmbed key={src} src={src} title={`${vertical.name} — clip ${i + 2}`} />
                ))}
              </div>
            </Reveal>
          )}
        </section>
      )}

      {/* Proof */}
      {vertical.proof.length > 0 && (
        <section className="border-y-2 border-ink">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <Reveal>
              <p className="label-mono text-mid">con quién trabajamos</p>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="mt-6 flex flex-wrap items-center gap-x-10 gap-y-4">
                {vertical.proof.map((name) => (
                  <span key={name} className="display text-2xl sm:text-4xl">
                    {name}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Intake */}
      <section id="form" className="bg-ink text-paper">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <p className="label-mono text-paper/50">{vertical.eyebrow}</p>
            <h2 className="display mt-3 text-4xl sm:text-6xl">{vertical.formTitle}</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <VerticalIntakeForm vertical={vertical} />
          </Reveal>
        </div>
      </section>
    </>
  );
}

/** Renders a stored video URL as whatever resolveEmbed says it is: an iframe
 * (Vimeo/YouTube/Drive — what every vertical video currently is), a native
 * <video> for direct file URLs, or a link-out card for platforms that block
 * inline embedding. */
function VideoEmbed({ src, title }: { src: string; title: string }) {
  const embed = resolveEmbed(src);

  if (embed.kind === "video") {
    return (
      <video
        src={embed.src}
        controls
        playsInline
        className="aspect-video w-full border-2 border-ink bg-ink object-cover"
      />
    );
  }

  if (embed.kind === "iframe") {
    return (
      <div className="aspect-video w-full border-2 border-ink">
        <iframe
          src={embed.src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <a
      href={embed.src}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex aspect-video w-full items-center justify-center border-2 border-ink bg-smoke px-6 text-center transition-colors hover:bg-ink hover:text-paper"
    >
      <span className="label-mono">Ver video ↗</span>
    </a>
  );
}

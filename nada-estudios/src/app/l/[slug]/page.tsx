import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { site } from "@/config/site";
import { Reveal } from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const entry = content.landings.find((l) => l.slug === slug && l.published);

  if (!entry) {
    return { title: site.name, robots: { index: false, follow: false } };
  }

  return {
    title: entry.headline,
    description: entry.subhead,
    robots: { index: false, follow: false },
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const content = await getContent();
  const entry = content.landings.find((l) => l.slug === slug && l.published);

  if (!entry) notFound();

  const ctaHref = `/empezar?src=${encodeURIComponent(slug)}`;

  return (
    <>
      {/* Slim black top bar — no nav, no exits from the funnel. */}
      <header className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <span className="label-mono inline-block border border-paper/40 px-3 py-1.5">
            NADA estudios
          </span>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24">
          <Reveal>
            <p className="label-mono mb-4 text-mid">
              Producción de contenido · {site.cities.join(" · ")}
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="display mb-6 text-[13vw] sm:text-6xl md:text-7xl">
              {entry.headline}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mb-4 max-w-2xl text-xl text-mid md:text-2xl">
              {entry.subhead}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mb-8 max-w-xl text-base md:text-lg">{entry.body}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link
              href={ctaHref}
              className="btn btn-accent w-full text-center sm:w-auto"
            >
              {entry.ctaLabel} →
            </Link>
          </Reveal>
        </section>

        {/* Proof row */}
        {entry.proof.length > 0 && (
          <section className="border-y-2 border-ink bg-smoke py-8">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <p className="label-mono mb-4 text-mid">Con marcas como</p>
              <div className="flex flex-wrap gap-3">
                {entry.proof.map((name) => (
                  <span
                    key={name}
                    className="label-mono border-2 border-ink bg-paper px-3 py-2"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trust strip */}
        <section className="border-b-2 border-ink py-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="label-mono text-mid">{site.cities.join(" · ")}</p>
            <p className="label-mono text-mid">
              Precios publicados. Sin llamadas misteriosas.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-ink py-16 text-paper">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
            <Reveal>
              <p className="display mb-8 text-4xl md:text-5xl">
                ¿Listos para producir?
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <Link
                href={ctaHref}
                className="btn btn-accent w-full text-center sm:w-auto"
              >
                {entry.ctaLabel} →
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Minimal mono footer line */}
      <footer className="py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <a
            href={`mailto:${site.email}`}
            className="label-mono link-under"
          >
            {site.email}
          </a>
          <p className="label-mono text-mid">Precios en USD + IVA</p>
        </div>
      </footer>
    </>
  );
}

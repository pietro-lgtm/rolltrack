import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { defaultContent, getContent } from "@/lib/content";
import { Reveal } from "@/components/site/Reveal";
import { resolveEmbed } from "@/components/trabajo/embed";

type Props = {
  params: Promise<{ slug: string }>;
};

// ISR: pick up admin content edits without a redeploy.
export const revalidate = 300;

export async function generateStaticParams() {
  return defaultContent.portfolio.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const item = content.portfolio.find((p) => p.slug === slug);
  if (!item) return {};
  return {
    title: item.client,
    description: item.description,
  };
}

export default async function CasoPage({ params }: Props) {
  const { slug } = await params;
  const content = await getContent();
  const items = [...content.portfolio].sort((a, b) => a.order - b.order);
  const index = items.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const item = items[index];
  const next = items[(index + 1) % items.length];
  const embed = item.videoUrl ? resolveEmbed(item.videoUrl) : null;

  return (
    <article>
      <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 sm:pt-24">
        <Reveal>
          <p className="label-mono text-mid">
            <Link href="/trabajo" className="link-under">
              trabajo
            </Link>{" "}
            / {item.client}
          </p>
          <h1 className="display mt-4 text-4xl sm:text-6xl lg:text-7xl">
            {item.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-mid sm:text-xl">
            {item.description}
          </p>
          <div className="label-mono mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-mid">
            <span>{item.tags.join(" · ")}</span>
            <span aria-hidden>—</span>
            <span>{item.year}</span>
          </div>
        </Reveal>
      </section>

      {item.metrics.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pt-12 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap divide-x-2 divide-ink border-2 border-ink">
              {item.metrics.map((m) => (
                <div key={m.label} className="min-w-[140px] flex-1 p-6">
                  <p className="display text-4xl sm:text-5xl">{m.value}</p>
                  <p className="label-mono mt-2 text-mid">{m.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Reveal>
          {embed ? (
            embed.kind === "video" ? (
              <video
                src={embed.src}
                controls
                playsInline
                className="aspect-video w-full border-2 border-ink bg-ink"
              />
            ) : (
              <div className="aspect-video w-full border-2 border-ink">
                <iframe
                  src={embed.src}
                  title={item.client}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )
          ) : item.image ? (
            <div className="relative aspect-[16/10] w-full border-2 border-ink">
              <Image
                src={`/api/img?p=${encodeURIComponent(item.image)}`}
                alt={item.client}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center border-2 border-ink bg-smoke px-6 text-center">
              <p className="display text-5xl text-ink/10 sm:text-8xl">
                {item.client}
              </p>
            </div>
          )}
        </Reveal>
      </section>

      <section className="border-t-2 border-ink bg-smoke">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <Reveal>
            <Link href={`/trabajo/${next.slug}`} className="group block">
              <p className="label-mono text-mid">siguiente proyecto</p>
              <p className="display mt-2 text-3xl transition-colors group-hover:text-accent sm:text-5xl">
                {next.client} →
              </p>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-24">
          <Reveal>
            <p className="display text-4xl sm:text-6xl">¿Querés algo así?</p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/empezar?src=trabajo" className="btn btn-accent mt-10 inline-flex">
              Empezar →
            </Link>
          </Reveal>
        </div>
      </section>
    </article>
  );
}

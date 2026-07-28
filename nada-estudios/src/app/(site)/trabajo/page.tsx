import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { Reveal } from "@/components/site/Reveal";
import { PortfolioCard } from "@/components/trabajo/PortfolioCard";

// ISR: pick up admin content edits without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Trabajo",
  description:
    "Contenido de marca para Heineken, Dos Pinos, Banco Promerica, Universal y más. Producción de nivel internacional, precios publicados.",
};

export default async function TrabajoPage() {
  const content = await getContent();
  const items = [...content.portfolio].sort((a, b) => a.order - b.order);

  // Alternate typographic treatments; reserve accent (yellow) for exactly one
  // card, and only on an item without a photo.
  let accentUsed = false;
  const cards = items.map((item, i) => {
    let treatment: "paper" | "ink" | "accent" = i % 2 === 0 ? "paper" : "ink";
    if (!item.image && !accentUsed && i > 0) {
      treatment = "accent";
      accentUsed = true;
    }
    return { item, treatment };
  });

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24">
        <Reveal>
          <p className="label-mono text-mid">trabajo</p>
          <h1 className="display mt-3 text-5xl sm:text-7xl lg:text-8xl">
            Trabajo que se nota.
          </h1>
          <p className="label-mono mt-4 text-mid">
            ({items.length} proyecto{items.length === 1 ? "" : "s"})
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {cards.map(({ item, treatment }, i) => (
            <Reveal
              key={item.slug}
              delay={(i % 6) * 0.06}
              className={item.featured ? "sm:col-span-2 lg:col-span-2" : ""}
            >
              <PortfolioCard item={item} index={i} treatment={treatment} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-20 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Reveal>
            <p className="display text-3xl sm:text-5xl">¿Querés algo así?</p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/empezar?src=trabajo" className="btn btn-accent">
              Empezar →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

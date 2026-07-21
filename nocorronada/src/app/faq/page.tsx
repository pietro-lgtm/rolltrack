import type { Metadata } from "next";
import { faqs, type Faq } from "@/data/faq";
import { FaqJsonLd } from "@/lib/jsonld";
import { SectionLabel, VoltLink, GhostLink } from "@/components/ui";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Todo lo que preguntan del club de running en San José, Costa Rica: dónde corremos, quién puede venir, qué necesitás, cuánto cuesta (nada) y qué es el BUNKER GP.",
};

type Cluster = { label: string; items: Faq[] };

const clusters: Cluster[] = [
  {
    label: "Lo esencial",
    items: faqs.filter((f) => f.category === "esencial"),
  },
  {
    label: "Entrenos y eventos",
    items: faqs.filter(
      (f) => f.category === "eventos" || f.category === "bunker-gp"
    ),
  },
  {
    label: "El club",
    items: faqs.filter((f) => f.category === "club"),
  },
];

function FaqItem({ item }: { item: Faq }) {
  return (
    <details className="group border-b hairline">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
        <span className="label-mono text-ink transition-colors group-open:text-volt">
          {item.q}
        </span>
        <span
          className="label-mono shrink-0 text-muted transition-all group-hover:text-volt group-open:rotate-45 group-open:text-volt"
          aria-hidden
        >
          +
        </span>
      </summary>
      <p className="max-w-2xl pb-6 text-muted">{item.a}</p>
    </details>
  );
}

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />

      {/* Header */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="label-mono text-muted">Preguntas</p>
          <h1 className="display mt-4 text-6xl sm:text-8xl">FAQ</h1>
          <p className="mt-6 max-w-xl text-muted">
            Lo que todo el mundo pregunta antes de aparecerse un domingo. Sin
            letra chica: es gratis, es abierto y nadie se queda atrás.
          </p>
        </div>
      </section>

      {/* Clusters */}
      {clusters.map((cluster) => (
        <section key={cluster.label} className="border-b hairline">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <SectionLabel>{cluster.label}</SectionLabel>
            <div className="mt-6 border-t hairline">
              {cluster.items.map((item) => (
                <FaqItem key={item.q} item={item} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="display text-3xl sm:text-5xl">
            ¿Nada de esto respondió lo tuyo?
          </h2>
          <p className="mt-6 max-w-xl text-muted">
            Escribinos y te contestamos de verdad. O mejor: venís el domingo y
            preguntás en persona con café en mano.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <GhostLink href={site.social.instagram} external>
              Escribinos en IG
            </GhostLink>
            <VoltLink href="/unite">Unite al club</VoltLink>
          </div>
        </div>
      </section>
    </>
  );
}

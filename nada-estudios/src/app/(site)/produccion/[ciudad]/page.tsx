import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { packages, formatUsd } from "@/data/services";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd, serviceJsonLd } from "@/components/seo/JsonLd";

const CITIES = ["san-jose", "cdmx", "nueva-york"] as const;
type Ciudad = (typeof CITIES)[number];

const paqueteA = packages.find((p) => p.id === "a")!;
const paqueteB = packages.find((p) => p.id === "b")!;
const paqueteC = packages.find((p) => p.id === "c")!;

type CityContent = {
  lang: "es" | "en";
  eyebrow: string;
  cityName: string;
  countryFlag: string;
  headline: string[];
  intro: string;
  clients: string[];
  clientsLabel: string;
  servicesLabel: string;
  proofLabel: string;
  ctaLabel: string;
  ctaSub: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
};

const content: Record<Ciudad, CityContent> = {
  "san-jose": {
    lang: "es",
    eyebrow: "Producción en San José",
    cityName: "San José, Costa Rica",
    countryFlag: "CR",
    headline: ["Productora audiovisual", "en San José, Costa Rica."],
    intro:
      "Somos el estudio de producción de contenido detrás de campañas para las marcas líderes de Costa Rica: Heineken, Dos Pinos, Banco Promerica. Video, foto y social media, con precio publicado — nada de cotizar por teléfono.",
    clients: ["Heineken", "Dos Pinos", "Banco Promerica", "Universal", "Mercado de Valores"],
    clientsLabel: "Marcas que ya confían en nosotros en Costa Rica",
    servicesLabel: "Lo que producimos desde San José",
    proofLabel: "Con quién trabajamos",
    ctaLabel: "Empezar en San José",
    ctaSub: "Contanos qué necesitás y te recomendamos el paquete correcto.",
    metaTitle: "Productora audiovisual en San José, Costa Rica",
    metaDescription:
      "Agencia de contenido y productora audiovisual en Costa Rica. Video, foto y manejo de redes sociales para marcas como Heineken, Dos Pinos y Banco Promerica. Precios publicados.",
    keywords: [
      "productora audiovisual costa rica",
      "agencia de contenido costa rica",
      "manejo de redes sociales costa rica",
      "video para redes sociales costa rica",
    ],
  },
  cdmx: {
    lang: "es",
    eyebrow: "Producción en CDMX",
    cityName: "Ciudad de México",
    countryFlag: "MX",
    headline: ["Productora audiovisual", "y agencia de contenido en CDMX."],
    intro:
      "Producimos video, foto y contenido para redes desde Ciudad de México, con el mismo estándar que usamos con marcas como Heineken y Banco Promerica en Centroamérica. Tú ves el precio antes de escribirnos, no después de tres llamadas.",
    clients: ["Heineken", "Dos Pinos", "Universal", "AR Holdings"],
    clientsLabel: "Marcas con las que hemos trabajado",
    servicesLabel: "Lo que producimos desde CDMX",
    proofLabel: "Prueba de trabajo real",
    ctaLabel: "Empezar en CDMX",
    ctaSub: "Cuéntanos qué necesitas y te recomendamos el paquete correcto.",
    metaTitle: "Productora audiovisual y agencia de contenido en CDMX",
    metaDescription:
      "Productora audiovisual en CDMX. Video, foto y manejo de redes sociales para marcas, con precios publicados desde $2,200/mes. Agencia de contenido con oficinas en CDMX, San José y Nueva York.",
    keywords: ["productora audiovisual cdmx", "agencia de contenido cdmx"],
  },
  "nueva-york": {
    lang: "en",
    eyebrow: "Nearshore production, NYC lane",
    cityName: "New York, USA",
    countryFlag: "US",
    headline: ["Content production for US brands,", "produced in LatAm."],
    intro:
      "Same timezone. US quality bar. LatAm cost. We run production out of San José and CDMX and manage US accounts from our New York office — video, photo and social content, delivered on published pricing instead of a discovery call.",
    clients: ["Heineken", "Dos Pinos", "Banco Promerica", "Universal"],
    clientsLabel: "Brands we've produced for",
    servicesLabel: "What we produce, priced in USD",
    proofLabel: "Proof, not adjectives",
    ctaLabel: "Start a project",
    ctaSub: "Tell us what you need and we'll recommend the right package.",
    metaTitle: "Nearshore Content Production — New York / Costa Rica / CDMX",
    metaDescription:
      "Nearshore content production agency for US brands. Video, photo and social media production out of Costa Rica and CDMX, managed same-timezone from New York. Published USD pricing.",
    keywords: [
      "content production agency costa rica",
      "video production company costa rica",
      "nearshore content production latam",
      "social media agency costa rica",
    ],
  },
};

export function generateStaticParams() {
  return CITIES.map((ciudad) => ({ ciudad }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ciudad: string }>;
}): Promise<Metadata> {
  const { ciudad } = await params;
  const c = content[ciudad as Ciudad];
  if (!c) return {};
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    keywords: c.keywords,
    alternates: { canonical: `${site.url}/produccion/${ciudad}` },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      locale: c.lang === "en" ? "en_US" : "es_CR",
    },
  };
}

export default async function ProduccionCiudadPage({
  params,
}: {
  params: Promise<{ ciudad: string }>;
}) {
  const { ciudad } = await params;
  const c = content[ciudad as Ciudad];
  if (!c) notFound();

  const t =
    c.lang === "en"
      ? {
          months: "/mo",
          seeAll: "See full rate card →",
          startCta: "Start →",
          packageWord: "Package",
        }
      : {
          months: "/mes",
          seeAll: "Ver rate card completo →",
          startCta: "Empezar →",
          packageWord: "Paquete",
        };

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: `${site.name} — ${c.cityName}`,
          description: c.metaDescription,
          url: `${site.url}/produccion/${ciudad}`,
          offers: [
            { name: paqueteA.name, price: paqueteA.price },
            { name: paqueteB.name, price: paqueteB.price },
            { name: paqueteC.name, price: paqueteC.price },
          ],
        })}
      />

      <section className="border-b-2 border-ink px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="label-mono mb-4 text-mid">
              {c.eyebrow} · {c.countryFlag}
            </p>
            <h1 className="display text-5xl sm:text-6xl md:text-7xl">
              {c.headline.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-mid">{c.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/empezar?src=${ciudad}`} className="btn btn-accent">
                {c.ctaLabel} →
              </Link>
              <Link href="/servicios" className="btn btn-ghost">
                {t.seeAll}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b-2 border-ink px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="label-mono mb-8 text-mid">{c.servicesLabel}</p>
          </Reveal>
          <div className="divide-y-2 divide-ink border-y-2 border-ink">
            {packages.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <div className="leader py-5">
                  <span className="leader-name text-base sm:text-lg">
                    {t.packageWord} {p.name.replace("Paquete ", "")} — {p.summary}
                  </span>
                  <span className="leader-price text-base sm:text-lg">
                    {formatUsd(p.price)}
                    {t.months}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="label-mono mb-6 text-mid">{c.clientsLabel}</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {c.clients.map((name) => (
                <span key={name} className="display text-2xl sm:text-3xl">
                  {name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-ink px-4 py-16 text-paper sm:px-6 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label-mono mb-2 text-accent">{c.proofLabel}</p>
            <h2 className="display text-3xl sm:text-4xl">{c.ctaSub}</h2>
          </div>
          <Link href={`/empezar?src=${ciudad}`} className="btn btn-accent whitespace-nowrap">
            {t.startCta}
          </Link>
        </div>
      </section>
    </>
  );
}

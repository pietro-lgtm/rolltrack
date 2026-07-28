import type { Metadata } from "next";
import Link from "next/link";
import { clients, site } from "@/config/site";
import { packages, formatUsd } from "@/data/services";
import { getContent } from "@/lib/content";
import { Marquee } from "@/components/site/Marquee";
import { Reveal } from "@/components/site/Reveal";

// ISR: pick up admin content edits without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: {
    canonical: site.url,
    languages: { es: site.url, en: `${site.url}/en`, "x-default": site.url },
  },
};

export default async function Home() {
  const { portfolio } = await getContent();
  const featured = portfolio
    .filter((p) => p.featured)
    .sort((a, b) => a.order - b.order)
    .slice(0, 4);

  return (
    <>
      {/* ---- Hero ------------------------------------------------------- */}
      <section className="flex min-h-[calc(100svh-3.5rem)] flex-col justify-between px-4 pt-10 pb-6 sm:px-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="rise flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-3">
            <span className="label-mono">NADA estudios</span>
            <span className="label-mono hidden sm:inline">estudio de producción de contenido</span>
            <span className="label-mono">CR · MX · NYC</span>
          </div>

          <h1 className="display mt-10 text-[15vw] leading-[0.9] sm:text-[11vw] lg:text-[9.5rem]">
            <span className="rise block" style={{ "--rise-delay": "0.05s" } as React.CSSProperties}>
              CONTENIDO
            </span>
            <span className="rise block" style={{ "--rise-delay": "0.12s" } as React.CSSProperties}>
              QUE <span className="bg-accent px-2">VENDE.</span>
            </span>
          </h1>

          <div className="rise mt-10 grid gap-6 md:grid-cols-2" style={{ "--rise-delay": "0.2s" } as React.CSSProperties}>
            <p className="label-mono max-w-md leading-relaxed normal-case text-mid">
              Producción de video, foto y social media para marcas que no tienen
              tiempo que perder. Campañas y paquetes mensuales — con precios
              publicados, como debería ser.
            </p>
            <div className="flex flex-wrap items-start gap-3 md:justify-end">
              <Link href="/empezar?src=home" className="btn btn-accent">
                Empezar →
              </Link>
              <Link href="/trabajo" className="btn btn-ghost">
                Ver trabajo
              </Link>
            </div>
          </div>
        </div>

        <div className="rise mx-auto w-full max-w-7xl" style={{ "--rise-delay": "0.3s" } as React.CSSProperties}>
          <p className="label-mono text-mid">scroll ↓</p>
        </div>
      </section>

      {/* ---- Client marquee --------------------------------------------- */}
      <section className="border-y-2 border-ink bg-ink py-5 text-paper">
        <Marquee duration={35}>
          {clients.map((c) => (
            <span key={c} className="label-mono mx-6 flex items-center gap-12 text-sm">
              {c} <span className="text-accent">✕</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ---- What we do -------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <Reveal>
          <p className="label-mono text-mid">( qué hacemos )</p>
          <h2 className="display mt-4 max-w-3xl text-5xl sm:text-7xl">
            Dos formas de trabajar con nosotros.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="flex h-full flex-col border-2 border-ink p-6 sm:p-8">
              <p className="label-mono text-mid">01</p>
              <h3 className="display mt-3 text-3xl sm:text-4xl">Campañas</h3>
              <p className="mt-4 max-w-md text-mid">
                Un lanzamiento, un evento, una temporada. Producción puntual de
                principio a fin: concepto, grabación, edición, entrega.
              </p>
              <div className="mt-6 space-y-2 text-sm">
                <div className="leader"><span className="leader-name">Cobertura de evento</span><span className="leader-price">$1,400</span></div>
                <div className="leader"><span className="leader-name">Sesión de fotos corporativas</span><span className="leader-price">desde $800</span></div>
                <div className="leader"><span className="leader-name">Campaña especial</span><span className="leader-price">desde $3,000</span></div>
              </div>
              <div className="mt-auto pt-8">
                <Link href="/servicios#addons" className="label-mono link-under">
                  Ver todos los servicios →
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex h-full flex-col border-2 border-ink bg-ink p-6 text-paper sm:p-8">
              <p className="label-mono text-accent">02</p>
              <h3 className="display mt-3 text-3xl sm:text-4xl">Retainers mensuales</h3>
              <p className="mt-4 max-w-md text-paper/70">
                Tu equipo de contenido, sin contratar un equipo. Video, foto y
                diseño todos los meses, con calendario editorial y reportes.
              </p>
              <div className="mt-6 space-y-2 text-sm">
                {packages.map((p) => (
                  <div key={p.id} className="leader">
                    <span className="leader-name">{p.name}</span>
                    <span className="leader-price">{formatUsd(p.price)}/mes</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <Link href="/servicios" className="label-mono link-under text-accent">
                  Ver paquetes completos →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Featured work ----------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
            <h2 className="display text-5xl sm:text-7xl">Trabajo</h2>
            <Link href="/trabajo" className="label-mono link-under">
              ver todo ({portfolio.length}) →
            </Link>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {featured.map((item, i) => (
            <Reveal key={item.slug} delay={i * 0.06}>
              <Link
                href={`/trabajo/${item.slug}`}
                className={`group block border-2 border-ink p-6 transition-colors sm:p-8 ${
                  i === 0
                    ? "bg-ink text-paper hover:bg-accent hover:text-ink"
                    : "hover:bg-ink hover:text-paper"
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="label-mono opacity-60">{item.tags.join(" / ")}</p>
                  <p className="label-mono opacity-60">{item.year}</p>
                </div>
                <p className="display mt-16 text-4xl sm:mt-24 sm:text-5xl">
                  {item.client}
                </p>
                <p className="mt-3 max-w-sm text-sm opacity-70">{item.title}</p>
                <p className="label-mono mt-6 opacity-0 transition-opacity group-hover:opacity-100">
                  ver caso →
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---- Pricing honesty --------------------------------------------- */}
      <section className="border-y-2 border-ink bg-accent">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="label-mono">( precios )</p>
            <h2 className="display mt-4 max-w-4xl text-5xl sm:text-8xl">
              Precios publicados. En serio.
            </h2>
            <p className="label-mono mt-6 max-w-lg leading-relaxed normal-case">
              Ninguna otra productora en el mercado publica sus precios. Nosotros
              sí: paquetes desde {formatUsd(packages[0].price)}/mes y servicios
              individuales desde $80. Sin cotizaciones misteriosas, sin llamadas
              de ventas eternas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/servicios" className="btn">
                Ver precios completos →
              </Link>
              <Link href="/faq" className="btn btn-ghost">
                Preguntas frecuentes
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Why NADA ----------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <p className="label-mono text-mid">( por qué nada )</p>
            <h2 className="display mt-4 text-4xl sm:text-6xl">
              Hacemos contenido propio todos los días.
            </h2>
            <p className="mt-6 max-w-md text-mid">
              NADA Estudios nace de No Pasa Nada: una empresa de medios con 9
              verticales de contenido propias entre Costa Rica y México. Vivimos
              del contenido que publicamos — por eso sabemos exactamente qué
              funciona cuando producimos el tuyo.
            </p>
            <Link href="/nosotros" className="label-mono link-under mt-8 inline-block">
              Conocé el estudio →
            </Link>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="grid grid-cols-2 gap-px bg-ink border-2 border-ink">
              {[
                ["10+", "marcas tier-1"],
                ["3", "ciudades"],
                ["9", "verticales propias"],
                ["24h", "tiempo de respuesta"],
              ].map(([n, label]) => (
                <div key={label} className="bg-paper p-6 sm:p-8">
                  <p className="display text-5xl sm:text-6xl">{n}</p>
                  <p className="label-mono mt-2 text-mid">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Process ------------------------------------------------------ */}
      <section className="border-t-2 border-ink bg-smoke">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="label-mono text-mid">( cómo funciona )</p>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Contanos qué necesitás", "2 minutos, sin llamadas. El formulario te dice qué paquete te sirve."],
              ["02", "Kickoff y calendario", "Definimos concepto, calendario editorial y fechas de grabación."],
              ["03", "Producimos", "Grabación, edición, diseño. Vos aprobás, nosotros ejecutamos."],
              ["04", "Publicás (o publicamos)", "Entregables listos para subir — o lo manejamos nosotros."],
            ].map(([n, title, body], i) => (
              <Reveal key={n} delay={i * 0.05}>
                <div className="border-2 border-ink bg-paper p-6 h-full">
                  <p className="label-mono text-mid">{n}</p>
                  <p className="display mt-3 text-xl">{title}</p>
                  <p className="mt-3 text-sm text-mid">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Final CTA ---------------------------------------------------- */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
          <Reveal>
            <h2 className="display text-6xl sm:text-9xl">
              ¿Hacemos
              <br />
              algo <span className="text-accent">juntos?</span>
            </h2>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/empezar?src=home-footer" className="btn btn-accent">
                Empezar un proyecto →
              </Link>
              <a href={site.whatsappUrl} target="_blank" rel="noopener noreferrer" className="label-mono link-under">
                o escribinos por WhatsApp
              </a>
            </div>
            <p className="label-mono mt-10 text-paper/40">
              English speaker? <Link href="/en" className="link-under text-paper/70">We got you →</Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

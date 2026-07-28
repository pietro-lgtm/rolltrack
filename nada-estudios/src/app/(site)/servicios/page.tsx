import type { Metadata } from "next";
import { packages, terms } from "@/data/services";
import { Reveal } from "@/components/site/Reveal";
import { PackageCard } from "@/components/servicios/PackageCard";
import { AddOnsSection } from "@/components/servicios/AddOnsSection";
import { ServiciosPageShell } from "@/components/servicios/ServiciosPageShell";

export const metadata: Metadata = {
  title: "Servicios y precios",
  description:
    "Retainers mensuales desde $2,200 y add-ons desde $80 — precios publicados, sin llamadas misteriosas. Video, foto, edición y cobertura de eventos en San José, CDMX y Nueva York.",
};

export default function ServiciosPage() {
  return (
    <ServiciosPageShell>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16">
        <Reveal>
          <p className="label-mono mb-4 text-mid">servicios · rate card</p>
          <h1 className="display mb-6 text-5xl sm:text-7xl">
            Precios publicados.
            <br />
            Como debería ser.
          </h1>
          <p className="label-mono max-w-xl text-mid">
            Ninguna otra productora en Costa Rica o México te muestra precios reales.
            Nosotros sí — retainers y add-ons con números fijos, no un formulario de
            &ldquo;cotizar&rdquo;.
          </p>
        </Reveal>
      </section>

      {/* Retainers */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" id="retainers">
        <Reveal>
          <p className="label-mono mb-8">Retainers mensuales</p>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((pkg, i) => (
            // id anchors: /empezar's result screen deep-links to #paquete-a|b|c
            <Reveal key={pkg.id} delay={i * 0.08} className="h-full">
              <div id={`paquete-${pkg.id}`} className="h-full scroll-mt-20">
                <PackageCard pkg={pkg} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Add-ons */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6" id="addons">
        <Reveal>
          <p className="label-mono mb-2">Add-ons</p>
          <p className="label-mono mb-8 text-mid">
            Servicios individuales, sin contrato. Se pagan una vez o por mes según
            corresponda.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <AddOnsSection />
        </Reveal>
      </section>

      {/* Terms */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Reveal>
          <div className="border-2 border-ink bg-smoke p-6 sm:p-8">
            <p className="label-mono mb-4">Condiciones</p>
            <ul className="space-y-2">
              {terms.map((term) => (
                <li key={term} className="label-mono text-mid">
                  — {term}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </ServiciosPageShell>
  );
}

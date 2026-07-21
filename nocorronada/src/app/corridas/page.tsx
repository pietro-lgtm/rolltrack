import type { Metadata } from "next";
import { events } from "@/data/events";
import { EventJsonLd } from "@/lib/jsonld";
import { SectionLabel, VoltLink } from "@/components/ui";
import { AdRail } from "@/components/AdRail";
import { CorridasList } from "@/components/corridas/CorridasList";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Corridas y entrenos",
  description:
    "Calendario del club de running en San José, Costa Rica: el domingo de siempre (~5K, grupos de ritmo) más las corridas en Cartago y Guanacaste, y carreras como el BUNKER GP. Filtrá por zona. Gratis, sin niveles.",
};

export default function CorridasPage() {
  const datedEvents = events.filter((e) => e.dateISO);

  return (
    <>
      {datedEvents.map((e) => (
        <EventJsonLd key={e.slug} event={e} />
      ))}

      {/* Header */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="label-mono text-muted">Calendario</p>
          <h1 className="display mt-4 text-5xl sm:text-8xl">Corridas</h1>
          <p className="mt-6 max-w-xl text-muted">
            Un club de correr con calendario de verdad: el domingo de siempre en
            San José, más Cartago y Guanacaste activos. Elegí tu zona. Todo se
            confirma primero en Instagram y WhatsApp.
          </p>
        </div>
      </section>

      {/* Zone filter + filtered lists (client) */}
      <CorridasList events={events} />

      {/* Sponsor rail — renders nothing while empty */}
      <AdRail slot="corridas" />

      {/* Strava / rutas */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionLabel>Rutas</SectionLabel>
          <h2 className="display mt-6 text-3xl sm:text-5xl">
            Cada kilómetro queda registrado
          </h2>
          <p className="mt-6 max-w-xl text-muted">
            Las rutas de cada domingo viven en nuestro club de Strava (+4,000
            miembros). Seguinos, sumá tus kilómetros y no te perdás por dónde
            vamos.
          </p>
          <div className="mt-8">
            <VoltLink href={site.social.strava} external>
              Ver rutas en Strava
            </VoltLink>
          </div>
        </div>
      </section>
    </>
  );
}

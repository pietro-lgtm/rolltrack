import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { EventJsonLd } from "@/lib/jsonld";
import { SectionLabel, VoltLink } from "@/components/ui";
import { AdRail } from "@/components/AdRail";
import { CorridasExplorer } from "@/components/corridas/CorridasExplorer";
import { ClubForm } from "@/components/corridas/ClubForm";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Corridas y entrenos",
  description:
    "Calendario del club de running en San José, Costa Rica: el domingo de siempre (~5K, grupos de ritmo) más las corridas en Cartago y Guanacaste, y carreras como el BUNKER GP. Filtrá por zona. Gratis, sin niveles.",
};

// Admin can override events via getContent(); keep the page fresh within a minute.
export const revalidate = 60;

export default async function CorridasPage() {
  const { events } = await getContent();
  const datedEvents = events.filter((e) => e.dateISO);

  return (
    <>
      {datedEvents.map((e) => (
        <EventJsonLd key={e.slug} event={e} />
      ))}

      {/* Header dropdown (zone selector) + filtered weekly/race lists (client) */}
      <CorridasExplorer events={events} />

      {/* Sponsor rail — renders nothing while empty */}
      <AdRail slot="corridas" />

      {/* Abrí tu club */}
      <section id="abri-tu-club" className="border-b hairline">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionLabel>Expansión · todo el país</SectionLabel>
          <h2 className="display mt-6 text-4xl sm:text-6xl">Abrí tu club</h2>
          <p className="mt-6 max-w-xl text-muted">
            ¿No hay NCN en tu ciudad? Abrilo vos. Buscamos gente que quiera
            llevar el club a todo el país (y más allá).
          </p>

          <div className="mt-10 max-w-2xl">
            <ClubForm />
          </div>
        </div>
      </section>

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

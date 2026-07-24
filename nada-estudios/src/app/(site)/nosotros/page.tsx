import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { clients, site } from "@/config/site";
import { getContent } from "@/lib/content";
import { Reveal } from "@/components/site/Reveal";
import { Marquee } from "@/components/site/Marquee";

// ISR: pick up admin content edits without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "NADA Estudios es el estudio de trabajo para marcas de No Pasa Nada. Producción de nivel internacional, precios publicados, tres ciudades.",
};

const NUMBERS = [
  { value: "10+", label: "marcas tier-1" },
  { value: "3", label: "ciudades" },
  { value: "9", label: "verticales propias" },
];

const ROLES = ["Dirección", "Producción", "Foto", "Video", "Diseño", "Cuentas"];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default async function NosotrosPage() {
  const content = await getContent();
  const team = [...content.team].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Story */}
      <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 sm:pt-24">
        <Reveal>
          <p className="label-mono text-mid">nosotros</p>
          <h1 className="display mt-3 text-5xl sm:text-7xl lg:text-8xl">
            La productora que no para de producir.
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-8 max-w-3xl text-lg text-mid sm:text-xl">
            NADA Estudios es el estudio de trabajo para marcas de{" "}
            <strong className="font-semibold text-ink">{site.parent}</strong>,
            una compañía de medios que produce contenido propio todos los días
            en 9 verticales — en Instagram, TikTok, YouTube, Spotify y newsletter.
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="display mt-10 max-w-3xl text-3xl sm:text-4xl lg:text-5xl">
            Hacemos contenido propio todos los días; por eso sabemos hacer el
            tuyo.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="label-mono mt-8 text-mid">
            Producción nivel internacional — precios publicados — tres ciudades
          </p>
        </Reveal>
      </section>

      {/* Numbers */}
      <section className="mt-16 border-y-2 border-ink sm:mt-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y-2 divide-ink sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
          {NUMBERS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <div className="px-6 py-10 text-center sm:px-8">
                <p className="display text-6xl sm:text-7xl">{stat.value}</p>
                <p className="label-mono mt-3 text-mid">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="label-mono text-mid">equipo</p>
          <h2 className="display mt-3 text-4xl sm:text-6xl">
            El equipo detrás.
          </h2>
        </Reveal>

        {team.length === 0 ? (
          <Reveal delay={0.1}>
            <div className="mt-10 border-2 border-ink p-8 sm:p-12">
              <p className="label-mono text-mid">roles en el estudio</p>
              <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {ROLES.map((role) => (
                  <li key={role} className="display text-2xl sm:text-3xl">
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, i) => (
              <Reveal key={member.name} delay={(i % 6) * 0.06}>
                <div className="border-2 border-ink">
                  <div className="relative aspect-[4/5] w-full border-b-2 border-ink bg-smoke">
                    {member.photo ? (
                      <Image
                        src={`/api/img?p=${encodeURIComponent(member.photo)}`}
                        alt={member.name}
                        fill
                        sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="display text-5xl text-ink/15">
                          {initials(member.name)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="display text-2xl">{member.name}</p>
                    <p className="label-mono mt-1 text-mid">{member.role}</p>
                    <p className="mt-3 text-sm text-mid">{member.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Cities */}
      <section className="border-y-2 border-ink bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="label-mono text-paper/50">dónde estamos</p>
          </Reveal>
          <div className="mt-6">
            {site.cities.map((city, i) => (
              <Reveal key={city} delay={i * 0.06}>
                <div className="flex items-baseline justify-between border-b border-paper/20 py-5 last:border-b-0">
                  <span className="display text-4xl sm:text-6xl">{city}</span>
                  <span className="label-mono text-paper/50">
                    0{i + 1}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="label-mono text-mid">con quién trabajamos</p>
        </Reveal>
        <Reveal delay={0.06}>
          <Marquee className="mt-8 border-y-2 border-ink py-6" duration={35}>
            {clients.map((c) => (
              <span
                key={c}
                className="display mx-8 whitespace-nowrap text-3xl sm:text-4xl"
              >
                {c}
              </span>
            ))}
          </Marquee>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6">
          <Reveal>
            <p className="display text-4xl sm:text-6xl lg:text-7xl">
              Trabajemos.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/empezar?src=nosotros" className="btn btn-accent mt-10 inline-flex">
              Trabajemos →
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { site } from "@/config/site";
import { TeamSignupForm } from "@/components/race/TeamSignupForm";

export const metadata: Metadata = {
  title: "Inscripción — BUNKER GP",
  description:
    "Inscribí tu equipo de 6 para el BUNKER GP, la primera carrera de NO CORRO NADA en un parqueo subterráneo de San José, Costa Rica. Sábado 7 de noviembre, 2026.",
};

const reglas = [
  "Equipos de 6 — ni 5 ni 7.",
  "Los 6 datos completos: nombre, correo, cédula y ritmo promedio.",
  "Ritmos variados: queremos equipos mezclados, no seis clones.",
  "La invitación llega por correo al capitán/a — solo a equipos completos.",
  "Hora y ubicación exacta: por anunciar.",
];

export default function BunkerGpInscripcionPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* HEADER */}
      <section className="border-b hairline py-16 sm:py-24">
        <p className="label-mono text-muted">NCN Race Series · Round 01</p>
        <h1 className="display mt-6 text-4xl sm:text-6xl lg:text-8xl">
          Inscripción
        </h1>
        <p className="mt-6 text-lg text-muted sm:text-xl">
          BUNKER GP · {site.race.dateLabel}
        </p>
        <div className="checker-volt mt-10" aria-hidden />
      </section>

      {/* REGLAS */}
      <section className="py-16 sm:py-20">
        <div className="border hairline">
          <p className="label-mono border-b hairline bg-asphalt px-6 py-4 text-muted">
            Las reglas
          </p>
          <ul>
            {reglas.map((regla, i) => (
              <li
                key={i}
                className="label-mono flex gap-4 border-b px-6 py-5 text-ink last:border-b-0 hairline"
              >
                <span className="shrink-0 text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{regla}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FORM */}
      <section className="pb-24">
        <TeamSignupForm />
      </section>
    </div>
  );
}

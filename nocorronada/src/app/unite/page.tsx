import type { Metadata } from "next";
import { SectionLabel } from "@/components/ui";
import { JoinForm } from "@/components/JoinForm";

export const metadata: Metadata = {
  title: "Unite al club",
  description:
    "Membresía gratis del run club de Costa Rica. Unite a NO CORRO NADA: aviso de cada entreno, prioridad en eventos como el BUNKER GP y descuentos de marcas aliadas. Correr en San José, gratis para siempre.",
};

const benefits = [
  "Aviso de cada entreno antes que el resto — con el punto de encuentro de la semana.",
  "Prioridad y cupos primero en eventos como el BUNKER GP.",
  "Giveaways y descuentos de nuestras marcas aliadas.",
  "Cero cuotas. La membresía es gratis para siempre.",
];

const requirements: { k: string; v: string }[] = [
  { k: "Correo", v: "Uno que revisés — ahí te caen los avisos." },
  { k: "WhatsApp", v: "Tu número para el grupo. Ahí se coordina todo cada domingo." },
  {
    k: "Exoneración",
    v: "Firmás la exoneración de responsabilidad. Corrés bajo tu propio riesgo.",
  },
];

export default async function UnitePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { source } = await searchParams;
  const raw = Array.isArray(source) ? source[0] : source;
  const initialSource = typeof raw === "string" && raw.trim() ? raw.trim() : "web";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="border-b hairline py-16 sm:py-24">
        <SectionLabel>Membresía gratis</SectionLabel>
        <h1 className="display mt-6 text-6xl sm:text-8xl">Unite al club</h1>
        <p className="mt-8 max-w-xl text-lg text-muted">
          Otro club de correr. Dejá tus datos, entrá al grupo y aparecé el
          domingo. Sin cuotas, sin niveles, sin excusas. Buena actitud y cero
          excusas — el resto lo ponemos nosotros.
        </p>
      </section>

      <div className="grid gap-16 py-16 sm:py-24 lg:grid-cols-2 lg:gap-20">
        {/* Left: what you get + requirements */}
        <div className="flex flex-col gap-16">
          <div>
            <SectionLabel>Qué recibís</SectionLabel>
            <ul className="mt-8">
              {benefits.map((line, i) => (
                <li
                  key={i}
                  className="flex gap-5 border-t hairline py-5 last:border-b"
                >
                  <span className="label-mono shrink-0 text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionLabel>Para entrar</SectionLabel>
            <p className="mt-6 text-muted">
              Tres cosas y quedás adentro:
            </p>
            <dl className="mt-6">
              {requirements.map((r) => (
                <div
                  key={r.k}
                  className="grid grid-cols-[7rem_1fr] gap-4 border-t hairline py-5 last:border-b"
                >
                  <dt className="label-mono text-ink">{r.k}</dt>
                  <dd className="text-muted">{r.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Right: the form */}
        <div>
          <div className="checker-volt mb-10" aria-hidden />
          <JoinForm source={initialSource} />
        </div>
      </div>
    </div>
  );
}

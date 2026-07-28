import Link from "next/link";
import { packages, formatUsd } from "@/data/services";
import { site } from "@/config/site";
import { Reveal } from "@/components/site/Reveal";
import type { Recommendation } from "./scoring";
import type { ContactValue } from "./ContactStep";

/** Instant payoff screen: matched package (or add-ons) + prefilled WhatsApp CTA. */
export function ResultScreen({
  recommendation,
  contact,
  pending = false,
}: {
  recommendation: Recommendation;
  contact: ContactValue;
  pending?: boolean;
}) {
  const pkg = recommendation.packageId
    ? packages.find((p) => p.id === recommendation.packageId) ?? null
    : null;

  const firstName = contact.name.trim().split(/\s+/)[0] || contact.name;
  const waText = `Hola, soy ${contact.name} de ${contact.company}, me interesa ${
    pkg ? `el ${recommendation.label}` : recommendation.label
  }`;
  const waUrl = `${site.whatsappUrl}?text=${encodeURIComponent(waText)}`;

  return (
    <div>
      <Reveal>
        <p className="label-mono text-mid">Listo, {firstName}.</p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="display mt-2 text-4xl sm:text-6xl">
          Tu paquete ideal: {recommendation.label}
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 border-2 border-ink p-6 sm:p-8">
          {pkg ? (
            <>
              <div className="leader">
                <span className="leader-name display text-2xl sm:text-3xl">{pkg.name}</span>
                <span className="leader-price label-mono">{formatUsd(pkg.price)} / mes</span>
              </div>
              <p className="label-mono mt-2 text-mid">{pkg.summary}</p>
              <ul className="mt-6 space-y-2">
                {pkg.features.map((f) => (
                  <li key={f} className="flex gap-3 text-sm leading-snug sm:text-base">
                    <span aria-hidden className="text-mid">
                      —
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="label-mono mt-6 text-mid">
                Renovación {formatUsd(pkg.renewalPrice)} / mes · contrato mínimo 3 meses
              </p>
            </>
          ) : (
            <>
              <h2 className="display text-2xl sm:text-3xl">Servicios individuales</h2>
              <p className="label-mono mt-2 text-mid">
                Sin retainer. Pagás por lo que necesitás, precio publicado.
              </p>
              <p className="mt-4 text-sm sm:text-base">
                Grabación por día, edición por pieza, fotos de producto, cobertura de
                eventos y más — cada uno con precio fijo. Sin llamadas misteriosas.
              </p>
            </>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
            Hablar por WhatsApp →
          </a>
          <Link href={recommendation.link} className="btn btn-ghost">
            {pkg ? "Ver el paquete" : "Ver servicios individuales"}
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/servicios" className="label-mono link-under">
            Ver todos los servicios
          </Link>
          <Link href="/trabajo" className="label-mono link-under">
            Ver trabajo
          </Link>
        </div>
      </Reveal>

      {pending && <p className="label-mono mt-6 text-mid">Guardando tu información…</p>}
    </div>
  );
}

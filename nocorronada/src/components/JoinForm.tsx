"use client";

import { useState } from "react";
import { site } from "@/config/site";
import { VoltLink, GhostLink } from "@/components/ui";

type JoinSuccess = {
  whatsappUrl: string;
  waiverUrl: string;
  stravaUrl: string;
};

const inputCls =
  "w-full border hairline bg-black px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted focus:border-volt";

export function JoinForm({ source }: { source: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<JoinSuccess | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      website: String(data.get("website") ?? ""),
      source,
    };

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.ok) {
        setSuccess({
          whatsappUrl: json.whatsappUrl,
          waiverUrl: json.waiverUrl,
          stravaUrl: json.stravaUrl,
        });
        return;
      }

      setError(
        typeof json?.error === "string"
          ? json.error
          : "Algo salió mal de nuestro lado. Intentá de nuevo en un momento.",
      );
    } catch {
      setError(
        "No pudimos procesar tu registro. Revisá tu conexión e intentá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div>
        <p className="label-mono text-muted">Registro recibido</p>
        <p className="display mt-4 text-5xl sm:text-6xl">Ya casi.</p>
        <p className="mt-6 max-w-md text-muted">
          Te tenemos en la lista. Faltan tres pasos y quedás oficialmente
          adentro:
        </p>

        <ol className="mt-10 flex flex-col gap-8">
          <li className="border-t hairline pt-6">
            <span className="label-mono text-muted">Paso 01</span>
            <p className="mt-2 mb-4">
              Entrá al grupo de WhatsApp. Ahí anunciamos el punto de encuentro
              cada semana.
            </p>
            <VoltLink href={success.whatsappUrl} external>
              Unirme al WhatsApp
            </VoltLink>
          </li>

          <li className="border-t hairline pt-6">
            <span className="label-mono text-muted">Paso 02</span>
            <p className="mt-2 mb-4">
              Firmá la exoneración de responsabilidad. Es rápido y va una sola
              vez.
            </p>
            <GhostLink href={success.waiverUrl} external>
              Firmar la exoneración
            </GhostLink>
          </li>

          <li className="border-t hairline pt-6">
            <span className="label-mono text-muted">Paso 03</span>
            <p className="mt-2 mb-4">
              Seguinos en Strava y sumate a los +4,000 que ya corren con
              nosotros.
            </p>
            <GhostLink href={success.stravaUrl} external>
              Seguir en Strava
            </GhostLink>
          </li>
        </ol>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative flex flex-col gap-6">
      {/* Honeypot: off-screen (not display:none, which some bots detect). */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website">No llenés este campo</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="label-mono text-muted">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="label-mono text-muted">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="label-mono text-muted">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="+506 8888 8888"
          className={inputCls}
        />
        <p className="label-mono text-muted">
          para agregarte al grupo de WhatsApp
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
        />
        <span>
          Acepto recibir correos del club y firmar la exoneración de
          responsabilidad.
        </span>
      </label>

      {error && (
        <div
          role="alert"
          className="border-l-2 border-l-volt bg-asphalt px-4 py-3"
        >
          <p className="text-ink">{error}</p>
          <p className="label-mono mt-2 text-muted">
            ¿Sigue fallando?{" "}
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-volt hover:underline"
            >
              Escribinos por Instagram
            </a>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="label-mono w-full bg-volt px-6 py-4 text-black transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Procesando…" : "Unirme al club"}
      </button>
    </form>
  );
}

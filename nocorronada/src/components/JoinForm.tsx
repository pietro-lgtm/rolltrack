"use client";

import { useState } from "react";
import { site } from "@/config/site";
import { waiver } from "@/data/waiver";
import { SectionLabel, VoltLink, GhostLink } from "@/components/ui";

type JoinSuccess = {
  whatsappUrl: string;
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
      nombre: String(data.get("nombre") ?? ""),
      apellido: String(data.get("apellido") ?? ""),
      edad: String(data.get("edad") ?? ""),
      cedula: String(data.get("cedula") ?? ""),
      nivel: String(data.get("nivel") ?? ""),
      meta5k: String(data.get("meta5k") ?? ""),
      correo: String(data.get("correo") ?? ""),
      telefono: String(data.get("telefono") ?? ""),
      aceptaSalud: data.get("aceptaSalud") !== null,
      aceptaAcuerdo: data.get("aceptaAcuerdo") !== null,
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
        <p className="mt-6 max-w-md text-volt">
          Exoneración firmada ✓ — quedás registrado.
        </p>
        <p className="mt-4 max-w-md text-muted">
          Faltan dos pasos y quedás oficialmente adentro:
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
        <label htmlFor="nombre" className="label-mono text-muted">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          minLength={2}
          maxLength={60}
          autoComplete="given-name"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="apellido" className="label-mono text-muted">
          Apellido
        </label>
        <input
          id="apellido"
          name="apellido"
          type="text"
          required
          minLength={2}
          maxLength={60}
          autoComplete="family-name"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="edad" className="label-mono text-muted">
          Edad
        </label>
        <input
          id="edad"
          name="edad"
          type="number"
          required
          min={10}
          max={99}
          inputMode="numeric"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="cedula" className="label-mono text-muted">
          Cédula
        </label>
        <input
          id="cedula"
          name="cedula"
          type="text"
          required
          inputMode="numeric"
          autoComplete="off"
          className={inputCls}
        />
        <p className="label-mono text-muted">para la exoneración</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="nivel" className="label-mono text-muted">
          Nivel de correr
        </label>
        <select
          id="nivel"
          name="nivel"
          required
          defaultValue=""
          className={`${inputCls} appearance-none`}
        >
          <option value="" disabled>
            Elegí tu nivel
          </option>
          {site.join.nivelOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="meta5k" className="label-mono text-muted">
          ¿En cuánto querés correr tu 5K?
        </label>
        <input
          id="meta5k"
          name="meta5k"
          type="text"
          required
          maxLength={40}
          placeholder="25:00 · o 'ni idea'"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="correo" className="label-mono text-muted">
          Correo
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          required
          autoComplete="email"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="telefono" className="label-mono text-muted">
          Teléfono
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+506 8888 8888"
          className={inputCls}
        />
        <p className="label-mono text-muted">para el grupo de WhatsApp</p>
      </div>

      {/* Waiver */}
      <div className="mt-2 flex flex-col gap-4">
        <SectionLabel>La exoneración</SectionLabel>

        <div className="max-h-64 overflow-y-auto border hairline bg-asphalt p-5">
          <p className="label-mono text-volt">{waiver.title}</p>
          <p className="mt-4 whitespace-pre-line text-sm text-muted">
            {waiver.body}
          </p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            name="aceptaSalud"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
          />
          <span>
            Acepto que NO PASA NADA ni ninguna de las marcas, organizaciones o
            partes asociadas son responsables por mi salud
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            name="aceptaAcuerdo"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
          />
          <span>
            Acepto el &ldquo;Acuerdo y Liberación de Responsabilidad de No Corro
            Nada Runners&rdquo;
          </span>
        </label>
      </div>

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

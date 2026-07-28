"use client";

import { useState } from "react";
import { site } from "@/config/site";

const inputCls =
  "w-full border hairline bg-black px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted focus:border-volt";

/** "Abrí tu club" application form. POSTs to /api/club. */
export function ClubForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const payload = {
      nombre: String(data.get("nombre") ?? ""),
      apellido: String(data.get("apellido") ?? ""),
      telefono: String(data.get("telefono") ?? ""),
      correo: String(data.get("correo") ?? ""),
      ciudad: String(data.get("ciudad") ?? ""),
      pais: String(data.get("pais") ?? ""),
      confirma10: data.get("confirma10") === "on",
      confirma2x: data.get("confirma2x") === "on",
      website: String(data.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.ok) {
        setSuccess(true);
        return;
      }

      setError(
        typeof json?.error === "string"
          ? json.error
          : "Algo salió mal de nuestro lado. Intentá de nuevo en un momento.",
      );
    } catch {
      setError(
        "No pudimos enviar tu solicitud. Revisá tu conexión e intentá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div>
        <p className="label-mono text-muted">Solicitud recibida</p>
        <p className="display mt-4 text-4xl sm:text-5xl">Recibido.</p>
        <p className="mt-6 max-w-md text-muted">
          Te escribimos pronto — buena actitud y cero excusas.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative flex flex-col gap-6"
    >
      {/* Honeypot: off-screen (not display:none, which some bots detect). */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
      >
        <label htmlFor="club-website">No llenés este campo</label>
        <input
          id="club-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="club-nombre" className="label-mono text-muted">
            Nombre
          </label>
          <input
            id="club-nombre"
            name="nombre"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="given-name"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="club-apellido" className="label-mono text-muted">
            Apellido
          </label>
          <input
            id="club-apellido"
            name="apellido"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="family-name"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="club-telefono" className="label-mono text-muted">
            Teléfono
          </label>
          <input
            id="club-telefono"
            name="telefono"
            type="tel"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="+506 8888 8888"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="club-correo" className="label-mono text-muted">
            Correo
          </label>
          <input
            id="club-correo"
            name="correo"
            type="email"
            required
            autoComplete="email"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="club-ciudad" className="label-mono text-muted">
            Ciudad
          </label>
          <input
            id="club-ciudad"
            name="ciudad"
            type="text"
            required
            maxLength={80}
            autoComplete="address-level2"
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="club-pais" className="label-mono text-muted">
            País
          </label>
          <input
            id="club-pais"
            name="pais"
            type="text"
            required
            maxLength={80}
            defaultValue="Costa Rica"
            autoComplete="country-name"
            className={inputCls}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="confirma10"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
        />
        <span>Confirmo que al menos 10 personas participarían.</span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="confirma2x"
          required
          className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
        />
        <span>Podemos correr al menos 2 veces al mes.</span>
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
        {loading ? "Enviando…" : "Abrí tu club"}
      </button>
    </form>
  );
}

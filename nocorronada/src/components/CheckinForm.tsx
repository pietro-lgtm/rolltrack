"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { VoltLink, GhostLink } from "@/components/ui";

const EMAIL_KEY = "ncn_checkin_email";
const NOMBRE_KEY = "ncn_checkin_nombre";

const inputCls =
  "w-full border hairline bg-black px-4 py-4 text-lg text-ink outline-none transition-colors placeholder:text-muted focus:border-volt";

type CheckinSuccess = {
  firstTime: boolean;
  personalTotal: number;
  sessionCount: number;
  already: boolean;
};

export function CheckinForm({ code }: { code: string }) {
  const [showTelefono, setShowTelefono] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CheckinSuccess | null>(null);

  const nombreRef = useRef<HTMLInputElement | null>(null);
  const correoRef = useRef<HTMLInputElement | null>(null);
  const telefonoRef = useRef<HTMLInputElement | null>(null);

  // Regulars: prefill from the last check-in on this phone. Written straight to
  // the DOM (inputs are uncontrolled) so there's no hydration mismatch.
  useEffect(() => {
    try {
      const email = localStorage.getItem(EMAIL_KEY);
      const name = localStorage.getItem(NOMBRE_KEY);
      if (email && correoRef.current && !correoRef.current.value) {
        correoRef.current.value = email;
      }
      if (name && nombreRef.current && !nombreRef.current.value) {
        nombreRef.current.value = name;
      }
    } catch {
      // Private mode / storage blocked — the form still works, just no prefill.
    }
  }, []);

  useEffect(() => {
    if (showTelefono) telefonoRef.current?.focus();
  }, [showTelefono]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const data = new FormData(e.currentTarget);
    const nombre = String(data.get("nombre") ?? "").trim();
    const correo = String(data.get("correo") ?? "").trim();
    const telefono = String(data.get("telefono") ?? "").trim();
    const website = String(data.get("website") ?? "");

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, nombre, correo, telefono, website }),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.ok) {
        try {
          localStorage.setItem(EMAIL_KEY, correo.toLowerCase());
          localStorage.setItem(NOMBRE_KEY, nombre);
        } catch {
          // Storage is a convenience, not a requirement.
        }
        setSuccess({
          firstTime: json.firstTime === true,
          personalTotal:
            typeof json.personalTotal === "number" ? json.personalTotal : 1,
          sessionCount:
            typeof json.sessionCount === "number" ? json.sessionCount : 1,
          already: json.already === true,
        });
        return;
      }

      setError(
        typeof json?.error === "string"
          ? json.error
          : "Algo salió mal de nuestro lado. Intentá de nuevo.",
      );
    } catch {
      setError(
        "No pudimos marcar tu llegada. Revisá tu señal e intentá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div>
        <p className="display flex items-baseline gap-4 text-6xl sm:text-7xl">
          Ya estás.
          <span className="text-volt" aria-hidden>
            ✓
          </span>
        </p>

        <p className="label-mono mt-8 text-volt">
          Asistencia #{success.personalTotal}
        </p>

        {success.firstTime ? (
          <div className="mt-6 border-t hairline pt-6">
            <p className="text-lg">
              Bienvenid@ al club — completá tu registro (exoneración +
              WhatsApp):
            </p>
            <div className="mt-6">
              <VoltLink href="/unite?source=checkin">
                Completar registro
              </VoltLink>
            </div>
          </div>
        ) : (
          <div className="mt-6 border-t hairline pt-6">
            <p className="text-lg text-muted">
              La #{success.personalTotal}. Buena actitud y cero excusas.
            </p>
            <div className="mt-6">
              <GhostLink href="/corridas">Ver la próxima</GhostLink>
            </div>
          </div>
        )}

        <p className="label-mono mt-10 border-t hairline pt-6 text-muted">
          {success.sessionCount === 1
            ? "Hoy ya llegó 1."
            : `Hoy ya llegaron ${success.sessionCount}.`}
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
          autoComplete="name"
          autoCapitalize="words"
          ref={nombreRef}
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
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          ref={correoRef}
          className={inputCls}
        />
      </div>

      {showTelefono ? (
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
            ref={telefonoRef}
            className={inputCls}
          />
          <p className="label-mono text-muted">para el grupo de WhatsApp</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowTelefono(true)}
          className="label-mono self-start py-2 text-muted underline underline-offset-4 transition-colors hover:text-volt"
        >
          + agregar teléfono
        </button>
      )}

      {error && (
        <div
          role="alert"
          className="border-l-2 border-l-volt bg-asphalt px-4 py-3"
        >
          <p className="text-ink">{error}</p>
          <p className="label-mono mt-2 text-muted">
            Volvé a tocar el botón. ¿Sigue fallando?{" "}
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
        className="label-mono w-full bg-volt px-6 py-6 text-black transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Marcando…" : "Ya llegué"}
      </button>
    </form>
  );
}

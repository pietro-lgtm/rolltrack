"use client";

import { useMemo, useState } from "react";
import { site } from "@/config/site";
import { GhostLink } from "@/components/ui";
import {
  paceToSeconds,
  secondsToPace,
  spreadSeconds,
  varietyLabel,
} from "@/lib/pace";

const inputCls =
  "w-full border hairline bg-black px-4 py-3 text-ink outline-none transition-colors placeholder:text-muted focus:border-volt";

type Member = {
  nombre: string;
  correo: string;
  cedula: string;
  pace: string;
};

const emptyMember: Member = { nombre: "", correo: "", cedula: "", pace: "" };

function makeEmptyMembers(): Member[] {
  return Array.from({ length: site.race.teamSize }, () => ({ ...emptyMember }));
}

export function TeamSignupForm() {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>(makeEmptyMembers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    teamName: string;
    captainEmail: string;
  } | null>(null);

  function updateMember(index: number, field: keyof Member, value: string) {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  }

  const variety = useMemo(() => {
    const validSeconds = members
      .map((m) => paceToSeconds(m.pace))
      .filter((s): s is number => s !== null);

    if (validSeconds.length < 2) {
      return { ready: false as const };
    }

    const fastest = secondsToPace(Math.min(...validSeconds));
    const slowest = secondsToPace(Math.max(...validSeconds));
    const spread = spreadSeconds(members.map((m) => m.pace));
    return { ready: true as const, fastest, slowest, ...varietyLabel(spread) };
  }, [members]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const website = String(data.get("website") ?? "");
    const captainEmail = members[0]?.correo.trim() ?? "";
    const submittedTeamName = teamName;

    try {
      const res = await fetch("/api/race-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamName, members, website }),
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.ok) {
        setSuccess({ teamName: submittedTeamName, captainEmail });
        return;
      }

      setError(
        typeof json?.error === "string"
          ? json.error
          : "Algo salió mal de nuestro lado. Intentá de nuevo en un momento.",
      );
    } catch {
      setError(
        "No pudimos enviar la inscripción. Revisá tu conexión e intentá de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div>
        <p className="label-mono text-muted">Inscripción recibida</p>
        <p className="display mt-4 text-5xl sm:text-6xl">EQUIPO INSCRITO.</p>
        <p className="mt-6 max-w-md text-ink">
          {success.teamName} quedó en la lista.
        </p>
        <p className="mt-4 max-w-md text-muted">
          Si hay cupo, la invitación le llega a {success.captainEmail} antes de
          la carrera.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <GhostLink href="/bunker-gp">Volver al BUNKER GP</GhostLink>
          <GhostLink href="/corridas">Ver todas las corridas</GhostLink>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative flex flex-col gap-8">
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
        <label htmlFor="teamName" className="label-mono text-muted">
          Nombre del equipo
        </label>
        <input
          id="teamName"
          name="teamName"
          type="text"
          required
          minLength={2}
          maxLength={60}
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Live pace-variety strip */}
      <div className="sticky top-0 z-10 border hairline bg-asphalt px-5 py-4">
        <p className="label-mono text-muted">Mezcla de ritmos</p>
        {variety.ready ? (
          <p className="display mt-2 text-2xl sm:text-3xl">
            <span className={variety.good ? "text-volt" : "text-ink"}>
              {variety.fastest}–{variety.slowest} min/km
            </span>
            <span
              className={`label-mono ml-3 align-middle text-xs normal-case ${
                variety.good ? "text-volt" : "text-muted"
              }`}
            >
              {variety.label}
            </span>
          </p>
        ) : (
          <p className="label-mono mt-2 text-muted">Completá los ritmos</p>
        )}
      </div>

      {members.map((member, i) => (
        <div key={i} className="border hairline bg-asphalt p-6 sm:p-8">
          <p className="label-mono text-volt">
            Corredor {String(i + 1).padStart(2, "0")}
            {i === 0 ? " · Capitán/a" : ""}
          </p>
          {i === 0 && (
            <p className="label-mono mt-2 text-muted">
              La invitación del equipo llega a este correo.
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor={`nombre-${i}`}
                className="label-mono text-muted"
              >
                Nombre completo
              </label>
              <input
                id={`nombre-${i}`}
                name={`nombre-${i}`}
                type="text"
                required
                minLength={2}
                maxLength={60}
                autoComplete="name"
                value={member.nombre}
                onChange={(e) => updateMember(i, "nombre", e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={`correo-${i}`} className="label-mono text-muted">
                Correo
              </label>
              <input
                id={`correo-${i}`}
                name={`correo-${i}`}
                type="email"
                required
                autoComplete="email"
                value={member.correo}
                onChange={(e) => updateMember(i, "correo", e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={`cedula-${i}`} className="label-mono text-muted">
                Cédula
              </label>
              <input
                id={`cedula-${i}`}
                name={`cedula-${i}`}
                type="text"
                required
                inputMode="numeric"
                autoComplete="off"
                value={member.cedula}
                onChange={(e) => updateMember(i, "cedula", e.target.value)}
                className={inputCls}
              />
              <p className="label-mono text-muted">8–12 dígitos</p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor={`pace-${i}`} className="label-mono text-muted">
                Ritmo promedio
              </label>
              <input
                id={`pace-${i}`}
                name={`pace-${i}`}
                type="text"
                required
                placeholder="6:30"
                value={member.pace}
                onChange={(e) => updateMember(i, "pace", e.target.value)}
                className={inputCls}
              />
              <p className="label-mono text-muted">min/km</p>
            </div>
          </div>
        </div>
      ))}

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
        {loading ? "Inscribiendo…" : "Inscribir equipo"}
      </button>
    </form>
  );
}

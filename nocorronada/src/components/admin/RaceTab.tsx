"use client";

import { useCallback, useEffect, useState } from "react";
import type { RaceTeam } from "@/lib/store";
import { secondsToPace } from "@/lib/pace";
import { thCls, tdCls, btnGhost } from "@/components/admin/styles";

type Totals = { teams: number; runners: number; invited: number };

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return iso;
  return d.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function csvCell(v: string | number | undefined) {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** One row per runner: equipo,estado,corredor,nombre,correo,cedula,ritmo,fecha */
function downloadTeamsCsv(teams: RaceTeam[]) {
  const rows = [
    ["equipo", "estado", "corredor", "nombre", "correo", "cedula", "ritmo", "fecha"],
    ...teams.flatMap((t) =>
      t.members.map((m, i) => [
        csvCell(t.teamName),
        csvCell(t.status === "invited" ? "invitado" : "pendiente"),
        csvCell(i === 0 ? "capitán" : `corredor ${i + 1}`),
        csvCell(m.nombre),
        csvCell(m.correo),
        csvCell(m.cedula),
        csvCell(m.pace),
        csvCell(fmtDate(t.submittedAt)),
      ]),
    ),
  ];
  const csv = rows.map((r) => r.join(",")).join("\r\n");
  // BOM so Excel reads the tildes right.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bunker-gp-equipos.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function TeamCard({
  team,
  onStatusChange,
}: {
  team: RaceTeam;
  onStatusChange: (id: string, status: "pending" | "invited") => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const invited = team.status === "invited";

  async function toggleStatus() {
    setBusy(true);
    try {
      await onStatusChange(team.id, invited ? "pending" : "invited");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border hairline bg-asphalt">
      <div className="flex flex-wrap items-center gap-4 p-6">
        <span className="display text-xl">{team.teamName}</span>
        <span className="label-mono text-muted">{fmtDate(team.submittedAt)}</span>
        <span className="label-mono border hairline px-2 py-1 text-muted">
          Mezcla {secondsToPace(team.paceSpreadSeconds)}
        </span>
        <span
          className={`label-mono border px-2 py-1 ${
            invited ? "border-volt text-volt" : "border-line text-muted"
          }`}
        >
          {invited ? "Invitado" : "Pendiente"}
        </span>
        <button
          type="button"
          onClick={toggleStatus}
          disabled={busy}
          className={`${btnGhost} ml-auto`}
        >
          {busy ? "Guardando…" : invited ? "Marcar pendiente" : "Marcar invitado"}
        </button>
      </div>

      <details className="group border-t hairline">
        <summary className="label-mono flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-muted transition-colors hover:text-volt [&::-webkit-details-marker]:hidden">
          <span>Corredores ({team.members.length})</span>
          <span aria-hidden className="text-volt">
            <span className="group-open:hidden">+</span>
            <span className="hidden group-open:inline">−</span>
          </span>
        </summary>
        <div className="overflow-x-auto border-t hairline">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}>#</th>
                <th className={thCls}>Nombre</th>
                <th className={thCls}>Correo</th>
                <th className={thCls}>Cédula</th>
                <th className={thCls}>Ritmo</th>
              </tr>
            </thead>
            <tbody>
              {team.members.map((m, i) => (
                <tr key={`${team.id}-${i}`}>
                  <td className={`${tdCls} label-mono text-muted`}>{i + 1}</td>
                  <td className={tdCls}>
                    {m.nombre}
                    {i === 0 && (
                      <span className="label-mono ml-2 text-volt">Capitán</span>
                    )}
                  </td>
                  <td className={tdCls}>{m.correo}</td>
                  <td className={tdCls}>{m.cedula}</td>
                  <td className={`${tdCls} label-mono`}>{m.pace}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

export function RaceTab() {
  const [teams, setTeams] = useState<RaceTeam[] | null>(null);
  const [totals, setTotals] = useState<Totals>({ teams: 0, runners: 0, invited: 0 });
  const [error, setError] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/race-teams");
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "No pudimos cargar los equipos.");
        return;
      }
      setError(null);
      setTeams(json.teams as RaceTeam[]);
      setTotals(json.totals as Totals);
    } catch {
      setError("Error de conexión.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = useCallback(
    async (id: string, status: "pending" | "invited") => {
      try {
        const res = await fetch("/api/admin/race-teams", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json?.ok) await load();
      } catch {
        /* row keeps its old status; the admin can retry */
      }
    },
    [load],
  );

  async function copyPendingCaptains() {
    if (!teams) return;
    const emails = teams
      .filter((t) => t.status === "pending")
      .map((t) => t.captainEmail);
    if (emails.length === 0) {
      setCopyMsg("No hay capitanes pendientes.");
      return;
    }
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setCopyMsg(`${emails.length} correo${emails.length === 1 ? "" : "s"} copiado${emails.length === 1 ? "" : "s"}.`);
    } catch {
      setCopyMsg("No pudimos copiar. Seleccioná manualmente.");
    }
  }

  if (error) return <p className="text-muted">{error}</p>;
  if (teams === null) return <p className="label-mono text-muted">Cargando…</p>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="label-mono text-muted">
          {totals.teams} {totals.teams === 1 ? "equipo" : "equipos"} ·{" "}
          {totals.runners} {totals.runners === 1 ? "corredor" : "corredores"} ·{" "}
          {totals.invited} {totals.invited === 1 ? "invitado" : "invitados"}
        </p>
        {teams.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={copyPendingCaptains} className={btnGhost}>
              Copiar correos de capitanes
            </button>
            <button type="button" onClick={() => downloadTeamsCsv(teams)} className={btnGhost}>
              Descargar CSV
            </button>
          </div>
        )}
      </div>

      {copyMsg && <p className="label-mono text-volt">{copyMsg}</p>}

      {teams.length === 0 ? (
        <p className="text-muted">Todavía no hay equipos inscritos.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} onStatusChange={setStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

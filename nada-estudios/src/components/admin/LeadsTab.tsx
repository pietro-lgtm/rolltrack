"use client";

import { Fragment, useEffect, useState } from "react";
import type { Lead } from "@/lib/store";
import { inputCls, thCls, tdCls } from "@/components/admin/styles";

const STATUSES: Lead["status"][] = ["nuevo", "contactado", "propuesta", "cerrado", "descartado"];

const ANSWER_LABELS: Record<keyof Lead["answers"], string> = {
  need: "Necesidad",
  industry: "Industria",
  companySize: "Tamaño de empresa",
  currentContent: "Contenido actual",
  timeline: "Timeline",
  investment: "Inversión",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return iso;
  return d.toLocaleString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SegmentBadge({ segment }: { segment: Lead["segment"] }) {
  const cls =
    segment === "hot"
      ? "bg-accent text-ink"
      : segment === "warm"
        ? "bg-ink text-paper"
        : "border-2 border-ink bg-paper text-ink";
  return <span className={`label-mono inline-block px-2 py-1 ${cls}`}>{segment}</span>;
}

export function LeadsTab() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/leads");
        const json = await res.json().catch(() => null);
        if (!alive) return;
        if (res.ok && json?.ok) setLeads(json.leads as Lead[]);
        else setError(json?.error ?? "No pudimos cargar los leads.");
      } catch {
        if (alive) setError("Error de conexión.");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function patchLead(id: string, patch: { status?: Lead["status"]; notes?: string }) {
    setSavingId(id);
    setLeads((prev) => (prev ? prev.map((l) => (l.id === id ? { ...l, ...patch } : l)) : prev));
    try {
      await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
    } catch {
      // best-effort; the row already reflects the optimistic value
    } finally {
      setSavingId(null);
    }
  }

  if (error) return <p className="text-mid">{error}</p>;
  if (leads === null) return <p className="label-mono text-mid">Cargando…</p>;
  if (leads.length === 0) return <p className="text-mid">Sin leads todavía.</p>;

  return (
    <div className="overflow-x-auto border-2 border-ink">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Fecha</th>
            <th className={thCls}>Nombre / empresa</th>
            <th className={thCls}>Contacto</th>
            <th className={thCls}>Source</th>
            <th className={thCls}>Score</th>
            <th className={thCls}>Segmento</th>
            <th className={thCls}>Recomendación</th>
            <th className={thCls}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => {
            const isOpen = expanded === l.id;
            return (
              <Fragment key={l.id}>
                <tr onClick={() => setExpanded(isOpen ? null : l.id)} className="cursor-pointer hover:bg-smoke">
                  <td className={`${tdCls} label-mono text-mid`}>{fmtDate(l.createdAt)}</td>
                  <td className={tdCls}>
                    <p>{l.contact.name || "—"}</p>
                    <p className="text-mid">{l.contact.company || "—"}</p>
                  </td>
                  <td className={tdCls}>
                    <p>{l.contact.email || "—"}</p>
                    <p className="text-mid">{l.contact.phone || "—"}</p>
                  </td>
                  <td className={`${tdCls} label-mono text-mid`}>{l.source ?? "—"}</td>
                  <td className={tdCls}>{l.score}</td>
                  <td className={tdCls}>
                    <SegmentBadge segment={l.segment} />
                  </td>
                  <td className={tdCls}>{l.recommendation}</td>
                  <td className={tdCls} onClick={(e) => e.stopPropagation()}>
                    <select
                      value={l.status}
                      disabled={savingId === l.id}
                      onChange={(e) => patchLead(l.id, { status: e.target.value as Lead["status"] })}
                      className={inputCls}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={8} className="border-b-2 border-ink bg-smoke px-4 py-6">
                      <div className="grid gap-4 sm:grid-cols-3">
                        {(Object.keys(ANSWER_LABELS) as (keyof Lead["answers"])[]).map((k) => (
                          <div key={k}>
                            <p className="label-mono text-mid">{ANSWER_LABELS[k]}</p>
                            <p className="mt-1 text-sm">{l.answers[k] || "—"}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6">
                        <label className="label-mono text-mid" htmlFor={`notes-${l.id}`}>
                          Notas
                        </label>
                        <textarea
                          id={`notes-${l.id}`}
                          defaultValue={l.notes ?? ""}
                          rows={3}
                          onBlur={(e) => patchLead(l.id, { notes: e.target.value })}
                          className={`${inputCls} mt-2`}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

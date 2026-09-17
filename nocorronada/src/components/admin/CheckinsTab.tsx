"use client";

/* eslint-disable @next/next/no-img-element -- the QR is a client-generated data URL, already at final size */

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  inputCls,
  btnPrimary,
  btnGhost,
  thCls,
  tdCls,
} from "@/components/admin/styles";

const CHECKIN_BASE = "https://nocorronada.com/checkin";
const OTHER = "__otro__";

type EventLite = { slug: string; title: string; type: string };

type SessionRow = {
  id: string;
  eventSlug?: string;
  title: string;
  openedAt: string;
  expiresAt: string;
  openedBy: string;
};

type MemberRow = {
  email: string;
  nombre: string;
  telefono?: string;
  firstSeenAt: string;
  checkins: number;
  lastCheckinAt?: string;
};

type Data = {
  sessions: SessionRow[];
  counts: Record<string, number>;
  members: MemberRow[];
  totalCheckins: number;
};

function fmtDateTime(iso: string) {
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

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return iso;
  return d.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const isOpen = (s: SessionRow) => +new Date(s.expiresAt) > Date.now();

function csvCell(v: string | number | undefined) {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadMembersCsv(members: MemberRow[]) {
  const rows = [
    ["nombre", "email", "telefono", "checkins", "ultima"],
    ...members.map((m) => [
      csvCell(m.nombre),
      csvCell(m.email),
      csvCell(m.telefono),
      csvCell(m.checkins),
      csvCell(m.lastCheckinAt ? fmtDate(m.lastCheckinAt) : ""),
    ]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\r\n");
  // BOM so Excel reads the tildes right.
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ncn-miembros.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function CheckinsTab() {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [events, setEvents] = useState<EventLite[]>([]);
  const [pick, setPick] = useState<string>(OTHER);
  const [customTitle, setCustomTitle] = useState("");
  const [opening, setOpening] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [active, setActive] = useState<{ session: SessionRow; url: string } | null>(null);
  /** Keyed by url so a stale QR never shows next to a new code. */
  const [qr, setQr] = useState<{ url: string; dataUrl: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/checkins");
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setLoadError(json?.error ?? "No pudimos cargar los check-ins.");
        return;
      }
      setLoadError(null);
      setData({
        sessions: json.sessions as SessionRow[],
        counts: (json.counts ?? {}) as Record<string, number>,
        members: json.members as MemberRow[],
        totalCheckins: json.totalCheckins as number,
      });
    } catch {
      setLoadError("Error de conexión.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Event list for the picker (weekly runs + races).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/content");
        const json = await res.json().catch(() => null);
        if (!alive || !res.ok || !json?.ok) return;
        const source: EventLite[] =
          (json.overrides?.events?.length ? json.overrides.events : json.defaults?.events) ?? [];
        const list = source.filter((e) => e.type === "weekly" || e.type === "race");
        setEvents(list);
        if (list.length > 0) setPick(list[0].slug);
      } catch {
        /* picker falls back to free text */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Render the QR whenever the active session changes.
  useEffect(() => {
    if (!active) return;
    const url = active.url;
    let alive = true;
    QRCode.toDataURL(url, {
      width: 640,
      margin: 2,
      color: { dark: "#0a0a0a", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (alive) setQr({ url, dataUrl });
      })
      .catch(() => {
        /* no QR — the code and the URL below still work */
      });
    return () => {
      alive = false;
    };
  }, [active]);

  const qrSrc = active && qr?.url === active.url ? qr.dataUrl : null;

  async function openCheckin() {
    setMsg(null);
    const usingEvent = pick !== OTHER;
    const title = customTitle.trim();
    if (!usingEvent && title.length === 0) {
      setMsg({ ok: false, text: "Escribí un título para el check-in." });
      return;
    }
    setOpening(true);
    try {
      const res = await fetch("/api/admin/checkin-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          usingEvent
            ? { eventSlug: pick, ...(title ? { title } : {}) }
            : { title },
        ),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setMsg({ ok: false, text: json?.error ?? "No pudimos abrir el check-in." });
        return;
      }
      setActive({ session: json.session as SessionRow, url: json.url as string });
      setMsg({ ok: true, text: "Check-in abierto. Mostrá el QR en la corrida." });
      await load();
    } catch {
      setMsg({ ok: false, text: "Error de conexión." });
    } finally {
      setOpening(false);
    }
  }

  async function closeCheckin(id: string) {
    setMsg(null);
    try {
      const res = await fetch("/api/admin/checkin-session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "close" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setMsg({ ok: false, text: json?.error ?? "No pudimos cerrar el check-in." });
        return;
      }
      setActive(null);
      setMsg({ ok: true, text: `Check-in ${id} cerrado.` });
      await load();
    } catch {
      setMsg({ ok: false, text: "Error de conexión." });
    }
  }

  const qrBox = { width: "min(70vw, 320px)" } as const;

  return (
    <div className="flex flex-col gap-16">
      {/* ── Abrir check-in ─────────────────────────────────────────── */}
      <section>
        <p className="label-mono text-muted">Abrir check-in</p>
        <p className="mt-3 max-w-prose text-sm text-muted">
          Abrí un check-in antes de salir a correr. El QR vive 12 horas: mostralo en la
          pantalla o tomale foto, la gente lo escanea y queda registrada.
        </p>

        <div className="mt-6 flex max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="ci-event" className="label-mono text-muted">
              Corrida
            </label>
            <select
              id="ci-event"
              className={inputCls}
              value={pick}
              onChange={(e) => setPick(e.target.value)}
            >
              {events.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.title}
                </option>
              ))}
              <option value={OTHER}>Otro título…</option>
            </select>
          </div>

          {pick === OTHER && (
            <div className="flex flex-col gap-2">
              <label htmlFor="ci-title" className="label-mono text-muted">
                Título
              </label>
              <input
                id="ci-title"
                className={inputCls}
                placeholder="Corrida de la Sabana"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>
          )}

          {msg && (
            <p className={`label-mono ${msg.ok ? "text-volt" : "text-ink"}`}>{msg.text}</p>
          )}

          <button
            type="button"
            onClick={openCheckin}
            disabled={opening}
            className={btnPrimary}
          >
            {opening ? "Abriendo…" : "Abrir check-in"}
          </button>
        </div>

        {/* QR panel — this is the screen you show at the run */}
        {active && (
          <div className="mt-10 border hairline p-6">
            <p className="label-mono text-muted">{active.session.title}</p>

            <div className="mt-6 inline-block bg-white p-4">
              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt={`QR de check-in ${active.session.id}`}
                  style={qrBox}
                  className="block h-auto"
                />
              ) : (
                <div style={qrBox} className="aspect-square" />
              )}
            </div>

            <p
              className="label-mono mt-6 break-all text-ink select-all"
              style={{ fontSize: "clamp(0.95rem, 4.5vw, 1.35rem)" }}
            >
              {active.url}
            </p>
            <p className="display mt-3 text-5xl text-volt">{active.session.id}</p>
            <p className="label-mono mt-3 text-muted">
              Cierra {fmtDateTime(active.session.expiresAt)}
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => closeCheckin(active.session.id)}
                className={btnGhost}
              >
                Cerrar check-in
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Sesiones ───────────────────────────────────────────────── */}
      <section className="border-t hairline pt-16">
        <p className="label-mono text-muted">Sesiones</p>

        {loadError && <p className="mt-6 text-muted">{loadError}</p>}
        {!loadError && data === null && (
          <p className="mt-6 label-mono text-muted">Cargando…</p>
        )}
        {data !== null && data.sessions.length === 0 && (
          <p className="mt-6 text-muted">Todavía no abriste ningún check-in.</p>
        )}

        {data !== null && data.sessions.length > 0 && (
          <div className="mt-6 overflow-x-auto border hairline">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thCls}>Fecha</th>
                  <th className={thCls}>Título</th>
                  <th className={thCls}>Código</th>
                  <th className={thCls}>Estado</th>
                  <th className={thCls}>Asistencias</th>
                </tr>
              </thead>
              <tbody>
                {data.sessions.map((s) => {
                  const open = isOpen(s);
                  return (
                    <tr key={s.id}>
                      <td className={`${tdCls} label-mono text-muted`}>
                        {fmtDateTime(s.openedAt)}
                      </td>
                      <td className={tdCls}>{s.title}</td>
                      <td className={tdCls}>
                        {open ? (
                          <button
                            type="button"
                            onClick={() =>
                              setActive({ session: s, url: `${CHECKIN_BASE}/${s.id}` })
                            }
                            className="label-mono text-volt underline decoration-line underline-offset-4 hover:decoration-volt"
                            title="Ver el QR de esta sesión"
                          >
                            {s.id}
                          </button>
                        ) : (
                          <span className="label-mono text-muted">{s.id}</span>
                        )}
                      </td>
                      <td className={tdCls}>
                        {open ? (
                          <span className="label-mono flex items-center gap-2 text-ink">
                            <span className="inline-block h-2 w-2 bg-volt" aria-hidden />
                            Abierto
                          </span>
                        ) : (
                          <span className="label-mono text-muted">Cerrado</span>
                        )}
                      </td>
                      <td className={`${tdCls} label-mono`}>{data.counts[s.id] ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Miembros ───────────────────────────────────────────────── */}
      <section className="border-t hairline pt-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="label-mono text-muted">
            {data
              ? `${data.members.length} miembros · ${data.totalCheckins} check-ins totales`
              : "Miembros"}
          </p>
          {data !== null && data.members.length > 0 && (
            <button
              type="button"
              onClick={() => downloadMembersCsv(data.members)}
              className={btnGhost}
            >
              Descargar CSV
            </button>
          )}
        </div>

        {data !== null && data.members.length === 0 && (
          <p className="mt-6 text-muted">
            Nadie se ha registrado todavía. Abrí un check-in y que escaneen.
          </p>
        )}

        {data !== null && data.members.length > 0 && (
          <div className="mt-6 overflow-x-auto border hairline">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thCls}>Nombre</th>
                  <th className={thCls}>Correo</th>
                  <th className={thCls}>Teléfono</th>
                  <th className={thCls}>Check-ins</th>
                  <th className={thCls}>Última</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((m) => (
                  <tr key={m.email}>
                    <td className={tdCls}>{m.nombre}</td>
                    <td className={tdCls}>{m.email}</td>
                    <td className={tdCls}>{m.telefono || "—"}</td>
                    <td className={`${tdCls} label-mono text-volt`}>{m.checkins}</td>
                    <td className={`${tdCls} label-mono text-muted`}>
                      {fmtDate(m.lastCheckinAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

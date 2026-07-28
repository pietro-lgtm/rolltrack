"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClubEvent } from "@/data/events";
import { btnPrimary, btnGhost } from "@/components/admin/styles";
import { EventCard } from "@/components/admin/EventCard";
import {
  blankEvent,
  newRowId,
  slugify,
  uniqueSlug,
} from "@/components/admin/eventHelpers";

const REVALIDATE_NOTE = "Los cambios aparecen en el sitio en ~1 minuto.";

type Film = { title: string; subtitle: string; videoUrl: string };
type ContentResp = {
  ok?: boolean;
  overrides: { film?: Film; events?: ClubEvent[] };
  defaults: { film: Film; events: ClubEvent[] };
  error?: string;
};

type Row = { id: string; ev: ClubEvent };

async function putEvents(events: ClubEvent[] | null) {
  const res = await fetch("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(typeof json?.error === "string" ? json.error : "No se pudo guardar.");
  }
}

/** Strip empty optional fields so ClubEvent defaults (e.g. /unite, /faq) still apply. */
function cleanEvent(ev: ClubEvent, slug: string): ClubEvent {
  const out: ClubEvent = {
    slug,
    title: ev.title.trim(),
    type: ev.type,
    zone: ev.zone,
    location: { name: ev.location.name.trim() },
    description: ev.description.trim(),
    status: ev.status,
  };
  if (ev.dateISO) out.dateISO = ev.dateISO;
  if (ev.recurrence?.trim()) out.recurrence = ev.recurrence.trim();
  if (ev.location.mapsUrl?.trim()) out.location.mapsUrl = ev.location.mapsUrl.trim();
  if (typeof ev.distanceKm === "number") out.distanceKm = ev.distanceKm;
  if (typeof ev.priceCRC === "number") out.priceCRC = ev.priceCRC;
  if (ev.stravaRouteUrl?.trim()) out.stravaRouteUrl = ev.stravaRouteUrl.trim();
  if (ev.image?.trim()) out.image = ev.image.trim();
  if (ev.signupUrl?.trim()) out.signupUrl = ev.signupUrl.trim();
  if (ev.faqUrl?.trim()) out.faqUrl = ev.faqUrl.trim();
  if (ev.featured) out.featured = true;
  return out;
}

export function EventsEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [lockedSlugs, setLockedSlugs] = useState<Set<string>>(new Set());
  const [overridden, setOverridden] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content");
      const json = (await res.json().catch(() => null)) as ContentResp | null;
      if (!res.ok || !json?.ok) {
        setLoadError(json?.error ?? "No pudimos cargar las corridas.");
        return;
      }
      const list = json.overrides.events ?? json.defaults.events;
      setRows(list.map((ev) => ({ id: newRowId(), ev })));
      setLockedSlugs(new Set(list.map((ev) => ev.slug).filter(Boolean)));
      setOverridden(Boolean(json.overrides.events));
      setExpanded(new Set());
    } catch {
      setLoadError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patchRow(id: string, patch: Partial<ClubEvent>) {
    setRows((rs) =>
      rs.map((r) => {
        if (r.id === id) return { ...r, ev: { ...r.ev, ...patch } };
        // "Featured" is single-select: flagging one run unflags the rest.
        if (patch.featured === true && r.ev.featured) {
          return { ...r, ev: { ...r.ev, featured: false } };
        }
        return r;
      }),
    );
  }

  function removeRow(id: string) {
    setRows((rs) => rs.filter((r) => r.id !== id));
    setExpanded((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  }

  function toggle(id: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addEvent() {
    const id = newRowId();
    setRows((rs) => [...rs, { id, ev: blankEvent() }]);
    setExpanded((s) => new Set(s).add(id));
    setMsg(null);
  }

  async function save() {
    setMsg(null);
    // Validate required fields per event.
    for (let i = 0; i < rows.length; i++) {
      const ev = rows[i].ev;
      if (
        !ev.title.trim() ||
        !ev.description.trim() ||
        !ev.location.name.trim()
      ) {
        setExpanded((s) => new Set(s).add(rows[i].id));
        setMsg({
          ok: false,
          text: `La corrida #${i + 1} (${ev.title.trim() || "sin título"}) necesita título, descripción y dónde es.`,
        });
        return;
      }
    }

    // Derive slugs: keep existing (locked), generate unique ones for new events.
    const taken = new Set<string>(lockedSlugs);
    const events = rows.map((r) => {
      let slug = r.ev.slug;
      if (!slug || !lockedSlugs.has(slug)) {
        slug = uniqueSlug(slugify(r.ev.title), taken);
        taken.add(slug);
      }
      return cleanEvent(r.ev, slug);
    });

    setBusy(true);
    try {
      await putEvents(events);
      await load();
      setMsg({ ok: true, text: `Guardado. ${REVALIDATE_NOTE}` });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    if (!confirm("¿Restaurar las corridas por defecto? Se pierden tus cambios guardados.")) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await putEvents(null);
      await load();
      setMsg({ ok: true, text: `Restaurado por defecto. ${REVALIDATE_NOTE}` });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (loadError) return <p className="text-muted">{loadError}</p>;
  if (loading) return <p className="label-mono text-muted">Cargando…</p>;

  return (
    <section className="border-t hairline pt-16">
      <div className="flex items-center gap-3">
        <p className="label-mono text-muted">Eventos / Corridas</p>
        <span className="label-mono text-muted">
          {overridden ? "· editado" : "· por defecto"}
        </span>
      </div>

      <p className="mt-4 max-w-2xl text-sm text-muted">
        Cada corrida es una tarjeta. Tocá para abrir y editar. El slug (link) se
        genera solo con el título y no cambia después.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {rows.map((r) => (
          <EventCard
            key={r.id}
            ev={r.ev}
            open={expanded.has(r.id)}
            onToggle={() => toggle(r.id)}
            onChange={(patch) => patchRow(r.id, patch)}
            onRemove={() => removeRow(r.id)}
          />
        ))}

        {rows.length === 0 && (
          <p className="label-mono text-muted">
            No hay corridas. Agregá la primera.
          </p>
        )}

        <button
          type="button"
          onClick={addEvent}
          className={`${btnPrimary} self-start`}
        >
          ＋ Agregar corrida
        </button>
      </div>

      {msg && (
        <div
          role={msg.ok ? undefined : "alert"}
          className={
            msg.ok
              ? "mt-6 text-volt"
              : "mt-6 border-l-2 border-l-volt bg-asphalt px-4 py-3 text-ink"
          }
        >
          <span className="label-mono">{msg.text}</span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        <button type="button" onClick={save} disabled={busy} className={btnPrimary}>
          {busy ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={restore}
          disabled={busy || !overridden}
          className={btnGhost}
        >
          Restaurar por defecto
        </button>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { inputCls, btnPrimary, btnGhost } from "@/components/admin/styles";

type Film = { title: string; subtitle: string; videoUrl: string };

type ContentPayload = {
  overrides: { film?: Film; events?: unknown[] };
  defaults: { film: Film; events: unknown[] };
};

const REVALIDATE_NOTE = "Los cambios aparecen en el sitio en ~1 minuto.";

async function putContent(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(typeof json?.error === "string" ? json.error : "No se pudo guardar.");
  }
}

/** Client-side check mirroring the API: each item needs slug/title/type/zone/status. */
function validateEvents(raw: string): { events: unknown[] } | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { error: `JSON inválido: ${(e as Error).message}` };
  }
  if (!Array.isArray(parsed)) return { error: "El contenido debe ser una lista (array)." };
  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i] as Record<string, unknown>;
    if (!item || typeof item !== "object") {
      return { error: `El evento #${i + 1} no es un objeto válido.` };
    }
    for (const key of ["slug", "title", "type", "zone", "status"]) {
      const v = item[key];
      if (typeof v !== "string" || v.length === 0) {
        return { error: `El evento #${i + 1} necesita "${key}" como texto.` };
      }
    }
  }
  return { events: parsed };
}

export function ContenidoTab() {
  const [data, setData] = useState<ContentPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Film editor state
  const [film, setFilm] = useState<Film>({ title: "", subtitle: "", videoUrl: "" });
  const [filmMsg, setFilmMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [filmBusy, setFilmBusy] = useState(false);

  // Events editor state
  const [eventsText, setEventsText] = useState("");
  const [eventsMsg, setEventsMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [eventsBusy, setEventsBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content");
      const json = (await res.json().catch(() => null)) as
        | (ContentPayload & { ok: boolean; error?: string })
        | null;
      if (!res.ok || !json?.ok) {
        setLoadError(json?.error ?? "No pudimos cargar el contenido.");
        return;
      }
      setData(json);
      setFilm(json.overrides.film ?? json.defaults.film);
      setEventsText(
        JSON.stringify(json.overrides.events ?? json.defaults.events, null, 2),
      );
    } catch {
      setLoadError("Error de conexión.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveFilm() {
    setFilmBusy(true);
    setFilmMsg(null);
    try {
      await putContent({ film });
      setFilmMsg({ ok: true, text: `Guardado. ${REVALIDATE_NOTE}` });
    } catch (e) {
      setFilmMsg({ ok: false, text: (e as Error).message });
    } finally {
      setFilmBusy(false);
    }
  }

  async function restoreFilm() {
    setFilmBusy(true);
    setFilmMsg(null);
    try {
      await putContent({ film: null });
      await load();
      setFilmMsg({ ok: true, text: `Restaurado por defecto. ${REVALIDATE_NOTE}` });
    } catch (e) {
      setFilmMsg({ ok: false, text: (e as Error).message });
    } finally {
      setFilmBusy(false);
    }
  }

  async function saveEvents() {
    setEventsMsg(null);
    const check = validateEvents(eventsText);
    if ("error" in check) {
      setEventsMsg({ ok: false, text: check.error });
      return;
    }
    setEventsBusy(true);
    try {
      await putContent({ events: check.events });
      setEventsMsg({ ok: true, text: `Guardado. ${REVALIDATE_NOTE}` });
    } catch (e) {
      setEventsMsg({ ok: false, text: (e as Error).message });
    } finally {
      setEventsBusy(false);
    }
  }

  async function restoreEvents() {
    setEventsBusy(true);
    setEventsMsg(null);
    try {
      await putContent({ events: null });
      await load();
      setEventsMsg({ ok: true, text: `Restaurado por defecto. ${REVALIDATE_NOTE}` });
    } catch (e) {
      setEventsMsg({ ok: false, text: (e as Error).message });
    } finally {
      setEventsBusy(false);
    }
  }

  if (loadError) return <p className="text-muted">{loadError}</p>;
  if (data === null) return <p className="label-mono text-muted">Cargando…</p>;

  const filmOverridden = Boolean(data.overrides.film);
  const eventsOverridden = Boolean(data.overrides.events);

  return (
    <div className="flex flex-col gap-16">
      {/* FILM editor */}
      <section>
        <div className="flex items-center gap-3">
          <p className="label-mono text-muted">Film destacado</p>
          <span className="label-mono text-muted">
            {filmOverridden ? "· editado" : "· por defecto"}
          </span>
        </div>

        <div className="mt-6 flex max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="film-title" className="label-mono text-muted">
              Título
            </label>
            <input
              id="film-title"
              className={inputCls}
              value={film.title}
              onChange={(e) => setFilm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="film-subtitle" className="label-mono text-muted">
              Subtítulo
            </label>
            <input
              id="film-subtitle"
              className={inputCls}
              value={film.subtitle}
              onChange={(e) => setFilm((f) => ({ ...f, subtitle: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="film-video" className="label-mono text-muted">
              Video URL
            </label>
            <input
              id="film-video"
              className={inputCls}
              value={film.videoUrl}
              placeholder="YouTube / Vimeo / .mp4 — vacío = PRONTO"
              onChange={(e) => setFilm((f) => ({ ...f, videoUrl: e.target.value }))}
            />
          </div>

          {filmMsg && (
            <p className={filmMsg.ok ? "text-volt" : "text-ink"}>
              <span className="label-mono">{filmMsg.text}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            <button type="button" onClick={saveFilm} disabled={filmBusy} className={btnPrimary}>
              {filmBusy ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={restoreFilm}
              disabled={filmBusy || !filmOverridden}
              className={btnGhost}
            >
              Restaurar por defecto
            </button>
          </div>
        </div>
      </section>

      {/* EVENTS editor */}
      <section className="border-t hairline pt-16">
        <div className="flex items-center gap-3">
          <p className="label-mono text-muted">Eventos / Corridas</p>
          <span className="label-mono text-muted">
            {eventsOverridden ? "· editado" : "· por defecto"}
          </span>
        </div>

        <p className="mt-4 max-w-2xl text-sm text-muted">
          Editá el JSON de las corridas. Cada evento necesita{" "}
          <span className="font-mono text-ink">slug</span>,{" "}
          <span className="font-mono text-ink">title</span>,{" "}
          <span className="font-mono text-ink">type</span>,{" "}
          <span className="font-mono text-ink">zone</span> y{" "}
          <span className="font-mono text-ink">status</span>.{" "}
          zone: san-jose | cartago | guanacaste | puntarenas; status: upcoming | announced |
          soon | past | soldout; dateISO opcional.
        </p>

        <div className="mt-6 flex flex-col gap-6">
          <textarea
            rows={20}
            spellCheck={false}
            className={`${inputCls} font-mono text-xs leading-relaxed`}
            value={eventsText}
            onChange={(e) => setEventsText(e.target.value)}
          />

          {eventsMsg && (
            <div
              role={eventsMsg.ok ? undefined : "alert"}
              className={
                eventsMsg.ok
                  ? "text-volt"
                  : "border-l-2 border-l-volt bg-asphalt px-4 py-3 text-ink"
              }
            >
              <span className="label-mono">{eventsMsg.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={saveEvents}
              disabled={eventsBusy}
              className={btnPrimary}
            >
              {eventsBusy ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={restoreEvents}
              disabled={eventsBusy || !eventsOverridden}
              className={btnGhost}
            >
              Restaurar por defecto
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

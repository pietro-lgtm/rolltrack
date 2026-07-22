"use client";

import { useCallback, useEffect, useState } from "react";
import { inputCls, btnPrimary, btnGhost } from "@/components/admin/styles";
import { EventsEditor } from "@/components/admin/EventsEditor";

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

export function ContenidoTab() {
  const [data, setData] = useState<ContentPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Film editor state
  const [film, setFilm] = useState<Film>({ title: "", subtitle: "", videoUrl: "" });
  const [filmMsg, setFilmMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [filmBusy, setFilmBusy] = useState(false);

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

  if (loadError) return <p className="text-muted">{loadError}</p>;
  if (data === null) return <p className="label-mono text-muted">Cargando…</p>;

  const filmOverridden = Boolean(data.overrides.film);

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

      {/* EVENTS editor — structured multi-event cards */}
      <EventsEditor />
    </div>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/data/media";
import { inputCls, btnPrimary, btnGhost } from "@/components/admin/styles";

/** Resize an image file on a canvas (max 1600px long edge) and return a JPEG data URL. */
async function fileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const MAX = 1600;
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function MediaTab() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => setItems(d.overrides?.media ?? d.defaults?.media ?? []))
      .catch(() => setError("No pudimos cargar la media."));
  }, []);

  if (items === null) {
    return <p className="label-mono text-muted">Cargando…</p>;
  }

  const update = (i: number, patch: Partial<MediaItem>) =>
    setItems(items.map((m, j) => (j === i ? { ...m, ...patch } : m)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  async function uploadPhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const added: MediaItem[] = [];
    for (const file of Array.from(files)) {
      try {
        const dataUrl = await fileToDataUrl(file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, dataUrl, folder: "media" }),
        });
        const json = await res.json();
        if (res.ok && json.ok) {
          added.push({ type: "image", src: json.path });
        } else {
          setError(json.error ?? `No se pudo subir ${file.name}.`);
        }
      } catch {
        setError(`No se pudo procesar ${file.name}.`);
      }
    }
    if (added.length) setItems((prev) => [...(prev ?? []), ...added]);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addVideo() {
    const src = videoUrl.trim();
    if (!/youtu\.?be|vimeo\.com|\.mp4$/.test(src)) {
      setError("Pegá un link de YouTube, Vimeo o un .mp4.");
      return;
    }
    setError(null);
    setItems((prev) => [...(prev ?? []), { type: "video", src }]);
    setVideoUrl("");
  }

  async function save(payload: MediaItem[] | null) {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ media: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "No se pudo guardar.");
      } else {
        setStatus("Guardado. Los cambios aparecen en el sitio en ~1 minuto.");
        if (payload === null) {
          setItems(json.overrides?.media ?? []);
        }
      }
    } catch {
      setError("No se pudo guardar. Revisá tu conexión.");
    }
    setBusy(false);
  }

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <div>
        <p className="label-mono text-muted">Fotos y videos · /media</p>
        <p className="mt-2 text-sm text-muted">
          Las fotos se comprimen y suben solas. Los videos van por link (subilo a
          YouTube — puede ser oculto/unlisted — y pegá el link acá).
        </p>
      </div>

      {/* Add photos */}
      <div className="flex flex-col gap-3">
        <p className="label-mono text-muted">Subir fotos</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          onChange={(e) => uploadPhotos(e.target.files)}
          className="label-mono block w-full cursor-pointer border hairline bg-black px-4 py-3 text-muted file:mr-4 file:cursor-pointer file:border-0 file:bg-volt file:px-4 file:py-2 file:text-black file:label-mono"
        />
      </div>

      {/* Add video */}
      <div className="flex flex-col gap-3">
        <p className="label-mono text-muted">Agregar video</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtu.be/…"
            className={inputCls}
          />
          <button type="button" onClick={addVideo} disabled={busy} className={btnGhost}>
            Agregar
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3">
        <p className="label-mono text-muted">
          El archivo · {items.length} {items.length === 1 ? "ítem" : "ítems"}
        </p>
        {items.length === 0 && (
          <p className="text-sm text-muted">
            Vacío — la página /media muestra el estado &ldquo;el archivo abre
            pronto&rdquo;.
          </p>
        )}
        {items.map((m, i) => (
          <div key={`${m.src}-${i}`} className="border hairline bg-asphalt p-4">
            <div className="flex flex-wrap items-start gap-4">
              {m.type === "image" ? (
                <img
                  src={m.src}
                  alt={m.caption ?? "foto"}
                  className="h-20 w-20 shrink-0 border hairline object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center border hairline bg-black">
                  <span className="label-mono text-volt">Video</span>
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="label-mono truncate text-muted">{m.src}</p>
                <input
                  type="text"
                  value={m.caption ?? ""}
                  onChange={(e) => update(i, { caption: e.target.value })}
                  placeholder="Caption (opcional)"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={m.tag ?? ""}
                  onChange={(e) => update(i, { tag: e.target.value })}
                  placeholder="Tag, ej. San José (opcional)"
                  className={inputCls}
                />
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={btnGhost} aria-label="Subir">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className={btnGhost} aria-label="Bajar">
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("¿Quitar este ítem del archivo?")) {
                      setItems(items.filter((_, j) => j !== i));
                    }
                  }}
                  className={btnGhost}
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="border-l-2 border-l-volt bg-asphalt px-4 py-3 text-sm text-ink">{error}</p>
      )}
      {status && <p className="label-mono text-volt">{status}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => save(items)} disabled={busy} className={btnPrimary}>
          {busy ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("¿Restaurar la media por defecto (archivo del código)?")) save(null);
          }}
          disabled={busy}
          className={btnGhost}
        >
          Restaurar por defecto
        </button>
      </div>
    </div>
  );
}

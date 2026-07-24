"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import type { PortfolioItem } from "@/lib/content";
import { inputCls, iconBtnCls } from "@/components/admin/styles";
import { fetchContent, saveContentSlice } from "@/components/admin/contentApi";
import { uploadImage } from "@/components/admin/imageUpload";

function emptyItem(order: number): PortfolioItem {
  return {
    slug: "",
    client: "",
    title: "",
    description: "",
    tags: [],
    year: String(new Date().getFullYear()),
    metrics: [],
    image: null,
    videoUrl: null,
    featured: false,
    order,
  };
}

export function PortafolioTab() {
  const [items, setItems] = useState<PortfolioItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchContent()
      .then((c) => {
        if (alive) setItems([...c.portfolio].sort((a, b) => a.order - b.order));
      })
      .catch(() => alive && setError("No pudimos cargar el portafolio."));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <p className="text-mid">{error}</p>;
  if (items === null) return <p className="label-mono text-mid">Cargando…</p>;

  function update(i: number, patch: Partial<PortfolioItem>) {
    setItems((prev) => (prev ? prev.map((it, j) => (j === i ? { ...it, ...patch } : it)) : prev));
  }

  function addItem() {
    setItems((prev) => [...(prev ?? []), emptyItem((prev?.length ?? 0) + 1)]);
  }

  function removeItem(i: number) {
    if (!confirm("¿Eliminar este proyecto del portafolio?")) return;
    setItems((prev) => (prev ? prev.filter((_, j) => j !== i) : prev));
  }

  function updateMetric(i: number, mi: number, patch: Partial<{ label: string; value: string }>) {
    if (!items) return;
    const metrics = items[i].metrics.map((m, j) => (j === mi ? { ...m, ...patch } : m));
    update(i, { metrics });
  }

  function addMetric(i: number) {
    if (!items) return;
    update(i, { metrics: [...items[i].metrics, { label: "", value: "" }] });
  }

  function removeMetric(i: number, mi: number) {
    if (!items) return;
    update(i, { metrics: items[i].metrics.filter((_, j) => j !== mi) });
  }

  async function uploadCover(i: number, file: File) {
    setBusy(true);
    setError(null);
    try {
      const path = await uploadImage(file, "portfolio");
      update(i, { image: path });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!items) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await saveContentSlice("portfolio", items);
      setStatus("Guardado. Los cambios aparecen en el sitio en ~1 minuto.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <p className="label-mono text-mid">Portafolio · {items.length} proyectos</p>

      <div className="flex flex-col gap-6">
        {items.map((item, i) => (
          <div key={i} className="border-2 border-ink p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Slug</label>
                <input className={inputCls} value={item.slug} onChange={(e) => update(i, { slug: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Cliente</label>
                <input className={inputCls} value={item.client} onChange={(e) => update(i, { client: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Título</label>
                <input className={inputCls} value={item.title} onChange={(e) => update(i, { title: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Descripción</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={item.description}
                  onChange={(e) => update(i, { description: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Tags (separados por coma)</label>
                <input
                  className={inputCls}
                  value={item.tags.join(", ")}
                  onChange={(e) =>
                    update(i, {
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Año</label>
                <input className={inputCls} value={item.year} onChange={(e) => update(i, { year: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Video URL</label>
                <input
                  className={inputCls}
                  value={item.videoUrl ?? ""}
                  onChange={(e) => update(i, { videoUrl: e.target.value || null })}
                  placeholder="https://…"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Orden</label>
                <input
                  type="number"
                  className={inputCls}
                  value={item.order}
                  onChange={(e) => update(i, { order: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => update(i, { featured: !item.featured })}
                  className={`btn ${item.featured ? "btn-accent" : "btn-ghost"}`}
                >
                  {item.featured ? "Destacado ✓" : "Marcar destacado"}
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              {item.image && <img src={item.image} alt="" className="h-20 w-20 border-2 border-ink object-cover" />}
              <label className={`${iconBtnCls} cursor-pointer ${busy ? "pointer-events-none opacity-40" : ""}`}>
                {busy ? "Subiendo…" : "Subir imagen"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCover(i, f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="mt-4">
              <p className="label-mono text-mid">Métricas</p>
              <div className="mt-2 flex flex-col gap-2">
                {item.metrics.map((m, mi) => (
                  <div key={mi} className="flex gap-2">
                    <input
                      className={inputCls}
                      placeholder="Label"
                      value={m.label}
                      onChange={(e) => updateMetric(i, mi, { label: e.target.value })}
                    />
                    <input
                      className={inputCls}
                      placeholder="Valor"
                      value={m.value}
                      onChange={(e) => updateMetric(i, mi, { value: e.target.value })}
                    />
                    <button type="button" onClick={() => removeMetric(i, mi)} className={iconBtnCls}>
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addMetric(i)} className={`${iconBtnCls} w-fit`}>
                  + Métrica
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => removeItem(i)} className={iconBtnCls}>
                Eliminar proyecto
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="border-2 border-ink bg-smoke px-4 py-3 text-sm text-ink">{error}</p>}
      {status && <p className="label-mono text-ink">{status}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addItem} className="btn btn-ghost">
          + Agregar proyecto
        </button>
        <button type="button" onClick={save} disabled={busy} className="btn disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

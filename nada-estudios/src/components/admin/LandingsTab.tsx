"use client";

import { useEffect, useState } from "react";
import type { LandingPage } from "@/lib/content";
import { inputCls, iconBtnCls } from "@/components/admin/styles";
import { fetchContent, saveContentSlice } from "@/components/admin/contentApi";

function emptyLanding(): LandingPage {
  return {
    slug: "",
    headline: "",
    subhead: "",
    body: "",
    proof: [],
    ctaLabel: "Ver mi paquete ideal",
    published: false,
  };
}

export function LandingsTab() {
  const [landings, setLandings] = useState<LandingPage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchContent()
      .then((c) => alive && setLandings(c.landings))
      .catch(() => alive && setError("No pudimos cargar las landings."));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <p className="text-mid">{error}</p>;
  if (landings === null) return <p className="label-mono text-mid">Cargando…</p>;

  function update(i: number, patch: Partial<LandingPage>) {
    setLandings((prev) => (prev ? prev.map((l, j) => (j === i ? { ...l, ...patch } : l)) : prev));
  }

  function addLanding() {
    setLandings((prev) => [...(prev ?? []), emptyLanding()]);
  }

  function removeLanding(i: number) {
    if (!confirm("¿Eliminar esta landing?")) return;
    setLandings((prev) => (prev ? prev.filter((_, j) => j !== i) : prev));
  }

  async function save() {
    if (!landings) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await saveContentSlice("landings", landings);
      setStatus("Guardado.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <p className="label-mono text-mid">Landings · {landings.length}</p>

      <div className="flex flex-col gap-6">
        {landings.map((l, i) => (
          <div key={i} className="border-2 border-ink p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Slug</label>
                <input className={inputCls} value={l.slug} onChange={(e) => update(i, { slug: e.target.value })} />
                <p className="label-mono text-mid">
                  URL: <span className="text-ink">/l/{l.slug || "…"}</span>
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">CTA label</label>
                <input className={inputCls} value={l.ctaLabel} onChange={(e) => update(i, { ctaLabel: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Headline</label>
                <input className={inputCls} value={l.headline} onChange={(e) => update(i, { headline: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Subhead</label>
                <textarea rows={2} className={inputCls} value={l.subhead} onChange={(e) => update(i, { subhead: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Body</label>
                <textarea rows={2} className={inputCls} value={l.body} onChange={(e) => update(i, { body: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Proof (clientes, separados por coma)</label>
                <input
                  className={inputCls}
                  value={l.proof.join(", ")}
                  onChange={(e) =>
                    update(i, {
                      proof: e.target.value
                        .split(",")
                        .map((p) => p.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => update(i, { published: !l.published })}
                className={`btn ${l.published ? "btn-accent" : "btn-ghost"}`}
              >
                {l.published ? "Publicada ✓" : "Borrador"}
              </button>
              <button type="button" onClick={() => removeLanding(i)} className={iconBtnCls}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="border-2 border-ink bg-smoke px-4 py-3 text-sm text-ink">{error}</p>}
      {status && <p className="label-mono text-ink">{status}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addLanding} className="btn btn-ghost">
          + Agregar landing
        </button>
        <button type="button" onClick={save} disabled={busy} className="btn disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

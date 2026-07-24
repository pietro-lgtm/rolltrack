"use client";

import { useEffect, useState } from "react";
import type { OnboardingStep } from "@/lib/content";
import { inputCls, iconBtnCls } from "@/components/admin/styles";
import { fetchContent, saveContentSlice } from "@/components/admin/contentApi";

function emptyStep(order: number): OnboardingStep {
  return { title: "", description: "", videoUrl: null, order };
}

export function OnboardingTab() {
  const [intro, setIntro] = useState<string | null>(null);
  const [steps, setSteps] = useState<OnboardingStep[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchContent()
      .then((c) => {
        if (!alive) return;
        setIntro(c.onboarding.intro);
        setSteps([...c.onboarding.steps].sort((a, b) => a.order - b.order));
      })
      .catch(() => alive && setError("No pudimos cargar el onboarding."));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <p className="text-mid">{error}</p>;
  if (intro === null || steps === null) return <p className="label-mono text-mid">Cargando…</p>;

  function updateStep(i: number, patch: Partial<OnboardingStep>) {
    setSteps((prev) => (prev ? prev.map((s, j) => (j === i ? { ...s, ...patch } : s)) : prev));
  }

  function addStep() {
    setSteps((prev) => [...(prev ?? []), emptyStep((prev?.length ?? 0) + 1)]);
  }

  function removeStep(i: number) {
    if (!confirm("¿Eliminar este paso?")) return;
    setSteps((prev) => (prev ? prev.filter((_, j) => j !== i) : prev));
  }

  async function save() {
    if (intro === null || !steps) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await saveContentSlice("onboarding", { intro, steps });
      setStatus("Guardado.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label className="label-mono text-mid">Intro (/bienvenida)</label>
        <textarea rows={3} className={inputCls} value={intro} onChange={(e) => setIntro(e.target.value)} />
      </div>

      <div className="flex flex-col gap-6">
        <p className="label-mono text-mid">Pasos · {steps.length}</p>
        {steps.map((s, i) => (
          <div key={i} className="border-2 border-ink p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Título</label>
                <input className={inputCls} value={s.title} onChange={(e) => updateStep(i, { title: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Descripción</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={s.description}
                  onChange={(e) => updateStep(i, { description: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Video URL</label>
                <input
                  className={inputCls}
                  value={s.videoUrl ?? ""}
                  onChange={(e) => updateStep(i, { videoUrl: e.target.value || null })}
                  placeholder="https://…"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Orden</label>
                <input
                  type="number"
                  className={inputCls}
                  value={s.order}
                  onChange={(e) => updateStep(i, { order: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => removeStep(i)} className={iconBtnCls}>
                Eliminar paso
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="border-2 border-ink bg-smoke px-4 py-3 text-sm text-ink">{error}</p>}
      {status && <p className="label-mono text-ink">{status}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addStep} className="btn btn-ghost">
          + Agregar paso
        </button>
        <button type="button" onClick={save} disabled={busy} className="btn disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

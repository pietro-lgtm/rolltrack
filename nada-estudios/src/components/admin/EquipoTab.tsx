"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import type { TeamMember } from "@/lib/content";
import { inputCls, iconBtnCls } from "@/components/admin/styles";
import { fetchContent, saveContentSlice } from "@/components/admin/contentApi";
import { uploadImage } from "@/components/admin/imageUpload";

function emptyMember(order: number): TeamMember {
  return { name: "", role: "", photo: null, bio: "", order };
}

export function EquipoTab() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchContent()
      .then((c) => alive && setMembers([...c.team].sort((a, b) => a.order - b.order)))
      .catch(() => alive && setError("No pudimos cargar el equipo."));
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <p className="text-mid">{error}</p>;
  if (members === null) return <p className="label-mono text-mid">Cargando…</p>;

  function update(i: number, patch: Partial<TeamMember>) {
    setMembers((prev) => (prev ? prev.map((m, j) => (j === i ? { ...m, ...patch } : m)) : prev));
  }

  function addMember() {
    setMembers((prev) => [...(prev ?? []), emptyMember((prev?.length ?? 0) + 1)]);
  }

  function removeMember(i: number) {
    if (!confirm("¿Eliminar a esta persona del equipo?")) return;
    setMembers((prev) => (prev ? prev.filter((_, j) => j !== i) : prev));
  }

  async function uploadPhoto(i: number, file: File) {
    setBusy(true);
    setError(null);
    try {
      const path = await uploadImage(file, "team");
      update(i, { photo: path });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!members) return;
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await saveContentSlice("team", members);
      setStatus("Guardado. Los cambios aparecen en el sitio en ~1 minuto.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <p className="label-mono text-mid">Equipo · {members.length} personas</p>

      <div className="flex flex-col gap-6">
        {members.map((m, i) => (
          <div key={i} className="flex flex-wrap items-start gap-4 border-2 border-ink p-5">
            {m.photo ? (
              <img src={m.photo} alt="" className="h-20 w-20 shrink-0 border-2 border-ink object-cover" />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-ink bg-smoke">
                <span className="label-mono text-mid">Sin foto</span>
              </div>
            )}
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Nombre</label>
                <input className={inputCls} value={m.name} onChange={(e) => update(i, { name: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Rol</label>
                <input className={inputCls} value={m.role} onChange={(e) => update(i, { role: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="label-mono text-mid">Bio</label>
                <textarea rows={2} className={inputCls} value={m.bio} onChange={(e) => update(i, { bio: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label-mono text-mid">Orden</label>
                <input
                  type="number"
                  className={inputCls}
                  value={m.order}
                  onChange={(e) => update(i, { order: Number(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end gap-2">
                <label className={`${iconBtnCls} cursor-pointer ${busy ? "pointer-events-none opacity-40" : ""}`}>
                  {busy ? "Subiendo…" : "Subir foto"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busy}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadPhoto(i, f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button type="button" onClick={() => removeMember(i)} className={iconBtnCls}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="border-2 border-ink bg-smoke px-4 py-3 text-sm text-ink">{error}</p>}
      {status && <p className="label-mono text-ink">{status}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addMember} className="btn btn-ghost">
          + Agregar persona
        </button>
        <button type="button" onClick={save} disabled={busy} className="btn disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

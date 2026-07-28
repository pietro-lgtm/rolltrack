"use client";

import { useEffect, useState } from "react";
import { thCls, tdCls } from "@/components/admin/styles";

type Waiver = {
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  acceptedAt: string;
  waiverVersion: string;
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

export function WaiversTab() {
  const [waivers, setWaivers] = useState<Waiver[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/waivers");
        const json = await res.json().catch(() => null);
        if (!alive) return;
        if (res.ok && json?.ok) setWaivers(json.waivers as Waiver[]);
        else setError(json?.error ?? "No pudimos cargar los waivers.");
      } catch {
        if (alive) setError("Error de conexión.");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <p className="text-muted">{error}</p>;
  if (waivers === null) return <p className="label-mono text-muted">Cargando…</p>;
  if (waivers.length === 0) return <p className="text-muted">Sin waivers todavía.</p>;

  return (
    <div className="overflow-x-auto border hairline">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Nombre</th>
            <th className={thCls}>Apellido</th>
            <th className={thCls}>Cédula</th>
            <th className={thCls}>Correo</th>
            <th className={thCls}>Fecha</th>
            <th className={thCls}>Versión</th>
          </tr>
        </thead>
        <tbody>
          {waivers.map((w, i) => (
            <tr key={`${w.cedula}-${w.acceptedAt}-${i}`}>
              <td className={tdCls}>{w.nombre}</td>
              <td className={tdCls}>{w.apellido}</td>
              <td className={tdCls}>{w.cedula}</td>
              <td className={tdCls}>{w.correo}</td>
              <td className={`${tdCls} label-mono text-muted`}>{fmtDate(w.acceptedAt)}</td>
              <td className={`${tdCls} label-mono text-muted`}>{w.waiverVersion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

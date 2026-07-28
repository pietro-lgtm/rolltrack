"use client";

import { useEffect, useState } from "react";
import { thCls, tdCls } from "@/components/admin/styles";

type ClubApp = {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  ciudad: string;
  pais: string;
  confirma10: boolean;
  confirma2x: boolean;
  submittedAt: string;
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

function Check({ on }: { on: boolean }) {
  return (
    <span className={on ? "text-volt" : "text-muted"} aria-label={on ? "sí" : "no"}>
      {on ? "✓" : "✗"}
    </span>
  );
}

export function SolicitudesTab() {
  const [apps, setApps] = useState<ClubApp[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/club-apps");
        const json = await res.json().catch(() => null);
        if (!alive) return;
        if (res.ok && json?.ok) setApps(json.apps as ClubApp[]);
        else setError(json?.error ?? "No pudimos cargar las solicitudes.");
      } catch {
        if (alive) setError("Error de conexión.");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (error) return <p className="text-muted">{error}</p>;
  if (apps === null) return <p className="label-mono text-muted">Cargando…</p>;
  if (apps.length === 0) return <p className="text-muted">Sin solicitudes todavía.</p>;

  return (
    <div className="overflow-x-auto border hairline">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Nombre</th>
            <th className={thCls}>Apellido</th>
            <th className={thCls}>Correo</th>
            <th className={thCls}>Teléfono</th>
            <th className={thCls}>Ciudad / País</th>
            <th className={thCls}>10 pers.</th>
            <th className={thCls}>2×/sem</th>
            <th className={thCls}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a, i) => (
            <tr key={`${a.correo}-${a.submittedAt}-${i}`}>
              <td className={tdCls}>{a.nombre}</td>
              <td className={tdCls}>{a.apellido}</td>
              <td className={tdCls}>{a.correo}</td>
              <td className={tdCls}>{a.telefono}</td>
              <td className={tdCls}>
                {[a.ciudad, a.pais].filter(Boolean).join(", ") || "—"}
              </td>
              <td className={tdCls}>
                <Check on={a.confirma10} />
              </td>
              <td className={tdCls}>
                <Check on={a.confirma2x} />
              </td>
              <td className={`${tdCls} label-mono text-muted`}>{fmtDate(a.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

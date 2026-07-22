"use client";

import { useState } from "react";
import { SolicitudesTab } from "@/components/admin/SolicitudesTab";
import { WaiversTab } from "@/components/admin/WaiversTab";
import { ContenidoTab } from "@/components/admin/ContenidoTab";
import { UsuariosTab } from "@/components/admin/UsuariosTab";

type TabId = "solicitudes" | "waivers" | "contenido" | "usuarios";

const TABS: { id: TabId; label: string }[] = [
  { id: "solicitudes", label: "Solicitudes" },
  { id: "waivers", label: "Waivers" },
  { id: "contenido", label: "Contenido" },
  { id: "usuarios", label: "Usuarios" },
];

export function AdminPanel() {
  const [tab, setTab] = useState<TabId>("solicitudes");

  return (
    <div>
      {/* Tab row */}
      <div className="flex flex-wrap gap-2 border-b hairline" role="tablist">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`label-mono -mb-px border-b-2 px-4 py-4 transition-colors ${
                active
                  ? "border-b-volt text-volt"
                  : "border-b-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="py-10">
        {tab === "solicitudes" && <SolicitudesTab />}
        {tab === "waivers" && <WaiversTab />}
        {tab === "contenido" && <ContenidoTab />}
        {tab === "usuarios" && <UsuariosTab />}
      </div>
    </div>
  );
}

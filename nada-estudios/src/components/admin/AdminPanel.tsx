"use client";

import { useState } from "react";
import { LeadsTab } from "@/components/admin/LeadsTab";
import { PedidosTab } from "@/components/admin/PedidosTab";
import { PortafolioTab } from "@/components/admin/PortafolioTab";
import { EquipoTab } from "@/components/admin/EquipoTab";
import { LandingsTab } from "@/components/admin/LandingsTab";
import { OnboardingTab } from "@/components/admin/OnboardingTab";
import { UsuariosTab } from "@/components/admin/UsuariosTab";

type TabId = "leads" | "pedidos" | "portafolio" | "equipo" | "landings" | "onboarding" | "usuarios";

const TABS: { id: TabId; label: string }[] = [
  { id: "leads", label: "Leads" },
  { id: "pedidos", label: "Pedidos" },
  { id: "portafolio", label: "Portafolio" },
  { id: "equipo", label: "Equipo" },
  { id: "landings", label: "Landings" },
  { id: "onboarding", label: "Onboarding" },
  { id: "usuarios", label: "Usuarios" },
];

export function AdminPanel() {
  const [tab, setTab] = useState<TabId>("leads");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b-2 border-ink" role="tablist">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`label-mono -mb-0.5 border-b-2 px-4 py-3 transition-colors ${
                active ? "border-ink text-ink" : "border-transparent text-mid hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="py-10">
        {tab === "leads" && <LeadsTab />}
        {tab === "pedidos" && <PedidosTab />}
        {tab === "portafolio" && <PortafolioTab />}
        {tab === "equipo" && <EquipoTab />}
        {tab === "landings" && <LandingsTab />}
        {tab === "onboarding" && <OnboardingTab />}
        {tab === "usuarios" && <UsuariosTab />}
      </div>
    </div>
  );
}

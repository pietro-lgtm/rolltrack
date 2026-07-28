"use client";

import { useEffect, useState } from "react";

const CITIES = [
  { name: "San José", tz: "America/Costa_Rica" },
  { name: "Ciudad de México", tz: "America/Mexico_City" },
  { name: "Nueva York", tz: "America/New_York" },
];

function timeIn(tz: string): string {
  return new Intl.DateTimeFormat("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(new Date());
}

/** Live local clocks for the three offices — quiet "we're global" flex. */
export function CityClocks() {
  const [now, setNow] = useState<string[] | null>(null);

  useEffect(() => {
    const tick = () => setNow(CITIES.map((c) => timeIn(c.tz)));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <p className="label-mono mb-4 text-paper/50">Oficinas</p>
      <ul className="space-y-2">
        {CITIES.map((c, i) => (
          <li key={c.name} className="label-mono flex items-baseline gap-3">
            <span>{c.name}</span>
            <span className="text-accent tabular-nums">{now ? now[i] : "--:--"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

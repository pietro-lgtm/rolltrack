"use client";

import { useEffect, useState } from "react";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function timeLeft(target: number): TimeLeft {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="border hairline bg-asphalt">
      <div className="display px-2 py-6 text-center text-4xl tabular-nums sm:text-6xl">
        {value}
      </div>
      <div className="label-mono border-t hairline py-2 text-center text-muted">
        {label}
      </div>
    </div>
  );
}

/**
 * BUNKER GP countdown.
 * - No date yet: renders the "FECHA POR ANUNCIAR" announcement block.
 * - Date set (future-proof): live D/H/M/S tiles, computed after mount to
 *   avoid a hydration mismatch (server has no clock).
 */
export function Countdown({ dateISO }: { dateISO?: string }) {
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!dateISO) return;
    const target = new Date(dateISO).getTime();
    setLeft(timeLeft(target));
    const id = setInterval(() => setLeft(timeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [dateISO]);

  if (!dateISO) {
    return (
      <div className="border hairline bg-asphalt p-8 sm:p-12">
        <p className="display text-4xl leading-none sm:text-6xl">
          Fecha por anunciar
        </p>
        <p className="mt-5 max-w-md text-muted">
          El newsletter y el WhatsApp se enteran primero. Después el resto del
          mundo.
        </p>
        <div className="mt-8 grid grid-cols-4 gap-px hairline border bg-line">
          {["Días", "Horas", "Min", "Seg"].map((l) => (
            <div key={l} className="bg-black">
              <div className="display px-2 py-5 text-center text-3xl text-muted sm:text-5xl">
                --
              </div>
              <div className="label-mono py-2 text-center text-muted">{l}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      <Tile value={left ? String(left.days) : "--"} label="Días" />
      <Tile value={left ? pad(left.hours) : "--"} label="Horas" />
      <Tile value={left ? pad(left.minutes) : "--"} label="Min" />
      <Tile value={left ? pad(left.seconds) : "--"} label="Seg" />
    </div>
  );
}

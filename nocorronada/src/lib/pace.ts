/** Average pace helpers. Paces are entered as "M:SS" per kilometer. */

/** 2:00 – 19:59 min/km. Anything outside that is a typo, not a runner. */
export const PACE_RE = /^([2-9]|1\d):[0-5]\d$/;

export function paceToSeconds(pace: string): number | null {
  const clean = pace.trim();
  if (!PACE_RE.test(clean)) return null;
  const [min, sec] = clean.split(":");
  return Number(min) * 60 + Number(sec);
}

export function secondsToPace(total: number): string {
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Seconds between the fastest and slowest pace in a team. */
export function spreadSeconds(paces: string[]): number {
  const secs = paces.map(paceToSeconds).filter((s): s is number => s !== null);
  if (secs.length < 2) return 0;
  return Math.max(...secs) - Math.min(...secs);
}

/** How mixed a team is. We want variety — not six copies of the same runner. */
export function varietyLabel(spread: number): {
  label: string;
  good: boolean;
} {
  if (spread === 0) return { label: "Faltan ritmos", good: false };
  if (spread < 60) return { label: "Muy parejo — meté gente más lenta o más rápida", good: false };
  if (spread < 120) return { label: "Mezcla aceptable", good: true };
  return { label: "Buena mezcla de ritmos", good: true };
}

/** Helpers for the structured events editor: slugs, dates, defaults, image crop. */

import type { ClubEvent, EventStatus } from "@/data/events";

/** Status <select> options with Spanish labels (values stay the ClubEvent union). */
export const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "upcoming", label: "Confirmado" },
  { value: "announced", label: "Inscripciones pronto" },
  { value: "soon", label: "Próximamente" },
  { value: "soldout", label: "Agotado" },
  { value: "past", label: "Finalizado" },
];

/** Type <select> options with Spanish labels. */
export const TYPE_OPTIONS: { value: ClubEvent["type"]; label: string }[] = [
  { value: "weekly", label: "Semanal" },
  { value: "race", label: "Carrera" },
  { value: "special", label: "Especial" },
];

export const statusLabel = (s: EventStatus) =>
  STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;

/** Client-only stable id for list rows (events have no id of their own). */
let _counter = 0;
export function newRowId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `row-${Date.now()}-${_counter++}`;
}

/** Título → url-safe slug base (lowercase, accent-stripped, dashed). */
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base || "corrida";
}

/** Append -2, -3… until the slug is free within `taken`. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** A blank event for the "＋ AGREGAR CORRIDA" flow (slug derived at save). */
export function blankEvent(): ClubEvent {
  return {
    slug: "",
    title: "",
    type: "special",
    zone: "san-jose",
    location: { name: "" },
    description: "",
    status: "upcoming",
  };
}

/** dateISO ("2026-08-15T18:00:00-06:00") → datetime-local value ("2026-08-15T18:00"). */
export function isoToLocalInput(iso?: string): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return m ? m[1] : "";
}

/** datetime-local value → dateISO stamped with Costa Rica's -06:00 offset. */
export function localInputToIso(local: string): string | undefined {
  if (!local) return undefined;
  const withSecs = local.length === 16 ? `${local}:00` : local;
  return `${withSecs}-06:00`;
}

/**
 * Draw a picked image onto a 1080x1350 (IG portrait 4:5) canvas, cover-fit and
 * centered, exported as a JPEG data URL at quality 0.85. Runs in the browser.
 */
export async function fileToPortraitJpeg(file: File): Promise<string> {
  const img = await loadImage(file);
  const TW = 1080;
  const TH = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = TW;
  canvas.height = TH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  const scale = Math.max(TW / img.width, TH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (TW - dw) / 2, (TH - dh) / 2, dw, dh);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    img.src = url;
  });
}

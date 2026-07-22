"use client";

import { useRef, useState } from "react";
import { ZONES, zoneLabel, type ClubEvent } from "@/data/events";
import { gmapsUrl, wazeUrl, isNavigable } from "@/lib/maps";
import { inputCls, btnGhost } from "@/components/admin/styles";
import {
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  statusLabel,
  isoToLocalInput,
  localInputToIso,
  fileToPortraitJpeg,
} from "@/components/admin/eventHelpers";

const labelCls = "label-mono text-muted";
const fieldWrap = "flex flex-col gap-2";

export function EventCard({
  ev,
  open,
  onToggle,
  onChange,
  onRemove,
}: {
  ev: ClubEvent;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<ClubEvent>) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState<string | null>(null);

  const place = ev.location.name;
  const navOk = isNavigable(place);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUpErr(null);
    setUploading(true);
    try {
      const dataUrl = await fileToPortraitJpeg(file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, dataUrl }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; path?: string; error?: string }
        | null;
      if (!res.ok || !json?.ok || typeof json.path !== "string") {
        throw new Error(json?.error ?? "No se pudo subir la imagen.");
      }
      onChange({ image: json.path });
    } catch (e) {
      setUpErr((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="border hairline">
      {/* Summary row — click to expand/collapse */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-asphalt"
      >
        <span className="display truncate text-lg text-ink">
          {ev.title.trim() || "Nueva corrida"}
        </span>
        <span className={`${labelCls} hidden shrink-0 sm:inline`}>
          {zoneLabel(ev.zone)}
        </span>
        <span className={`${labelCls} shrink-0 border hairline px-2 py-1 text-ink`}>
          {statusLabel(ev.status)}
        </span>
        <span className={`${labelCls} ml-auto shrink-0 text-volt`}>
          {open ? "Cerrar" : "Editar"}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-6 border-t hairline px-4 py-6">
          {/* Título */}
          <div className={fieldWrap}>
            <label className={labelCls}>Título*</label>
            <input
              className={inputCls}
              value={ev.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Corrida Nocturna"
            />
          </div>

          {/* Descripción */}
          <div className={fieldWrap}>
            <label className={labelCls}>Descripción corta*</label>
            <textarea
              rows={3}
              className={inputCls}
              value={ev.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Qué es, qué llevar, qué esperar."
            />
          </div>

          {/* Dónde es */}
          <div className={fieldWrap}>
            <label className={labelCls}>Dónde es*</label>
            <input
              className={inputCls}
              value={ev.location.name}
              onChange={(e) =>
                onChange({ location: { ...ev.location, name: e.target.value } })
              }
              placeholder="Parque La Sabana, San José"
            />
            {navOk && (
              <span className="flex flex-wrap gap-4">
                <a
                  href={gmapsUrl(place)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${labelCls} hover:text-volt`}
                >
                  Google Maps ↗
                </a>
                <a
                  href={wazeUrl(place)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${labelCls} hover:text-volt`}
                >
                  Waze ↗
                </a>
              </span>
            )}
            <span className={labelCls}>los links de navegación se generan solos</span>
          </div>

          {/* Arte del evento */}
          <div className={fieldWrap}>
            <label className={labelCls}>Arte del evento</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {ev.image ? (
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ev.image}
                  alt="Arte del evento"
                  className="w-28 shrink-0 border hairline object-cover"
                  style={{ aspectRatio: "4 / 5" }}
                />
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    className={btnGhost}
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? "Subiendo…" : "Cambiar"}
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    disabled={uploading}
                    onClick={() => onChange({ image: undefined })}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={btnGhost}
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? "Subiendo…" : "Subir arte (1080×1350)"}
              </button>
            )}
            {upErr && (
              <span className={`${labelCls} text-ink`} role="alert">
                {upErr}
              </span>
            )}
          </div>

          {/* Links */}
          <div className={fieldWrap}>
            <label className={labelCls}>Link de inscripción</label>
            <input
              className={inputCls}
              value={ev.signupUrl ?? ""}
              onChange={(e) => onChange({ signupUrl: e.target.value })}
              placeholder="/unite o un link externo"
            />
          </div>
          <div className={fieldWrap}>
            <label className={labelCls}>Link de Strava</label>
            <input
              className={inputCls}
              value={ev.stravaRouteUrl ?? ""}
              onChange={(e) => onChange({ stravaRouteUrl: e.target.value })}
              placeholder="https://www.strava.com/routes/…"
            />
          </div>
          <div className={fieldWrap}>
            <label className={labelCls}>Link de FAQ</label>
            <input
              className={inputCls}
              value={ev.faqUrl ?? ""}
              onChange={(e) => onChange({ faqUrl: e.target.value })}
              placeholder="/faq"
            />
          </div>

          {/* Compact row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className={fieldWrap}>
              <label className={labelCls}>Zona</label>
              <select
                className={inputCls}
                value={ev.zone}
                onChange={(e) =>
                  onChange({ zone: e.target.value as ClubEvent["zone"] })
                }
              >
                {ZONES.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={fieldWrap}>
              <label className={labelCls}>Tipo</label>
              <select
                className={inputCls}
                value={ev.type}
                onChange={(e) =>
                  onChange({ type: e.target.value as ClubEvent["type"] })
                }
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={fieldWrap}>
              <label className={labelCls}>Estado</label>
              <select
                className={inputCls}
                value={ev.status}
                onChange={(e) =>
                  onChange({ status: e.target.value as ClubEvent["status"] })
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={fieldWrap}>
              <label className={labelCls}>Fecha y hora</label>
              <input
                type="datetime-local"
                className={inputCls}
                value={isoToLocalInput(ev.dateISO)}
                onChange={(e) =>
                  onChange({ dateISO: localInputToIso(e.target.value) })
                }
              />
              <span className={labelCls}>vacío = por anunciar</span>
            </div>

            <div className={`${fieldWrap} sm:col-span-2`}>
              <label className={labelCls}>Recurrencia</label>
              <input
                className={inputCls}
                value={ev.recurrence ?? ""}
                onChange={(e) => onChange({ recurrence: e.target.value })}
                placeholder="Todos los domingos · 8:00 AM"
              />
            </div>
          </div>

          {/* Delete */}
          <div className="border-t hairline pt-6">
            <button
              type="button"
              className={btnGhost}
              onClick={() => {
                if (
                  confirm(
                    `¿Eliminar "${ev.title.trim() || "esta corrida"}"? No se puede deshacer.`,
                  )
                ) {
                  onRemove();
                }
              }}
            >
              Eliminar corrida
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

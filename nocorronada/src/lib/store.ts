import { get, put } from "@vercel/blob";

/**
 * Tiny JSON-document store on Vercel Blob (private store "ncn-data").
 * Requires BLOB_READ_WRITE_TOKEN (auto-set on Vercel; in .env.local for dev).
 *
 * Documents:
 *  admin/users.json     -> AdminUser[]
 *  data/waivers.json    -> WaiverRecord[]
 *  data/club-apps.json  -> ClubApplication[]
 *  data/overrides.json  -> ContentOverrides
 */

export async function readJson<T>(pathname: string): Promise<T | null> {
  try {
    const res = await get(pathname, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200 || !res.stream) return null;
    const text = await new Response(res.stream).text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "private" as never, // SDK typing lags; private stores accept this
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

/** Append an item to a JSON-array document (read-modify-write; fine at club scale). */
export async function appendJson<T>(pathname: string, item: T): Promise<T[]> {
  const arr = (await readJson<T[]>(pathname)) ?? [];
  arr.push(item);
  await writeJson(pathname, arr);
  return arr;
}

// ---- Typed documents -------------------------------------------------------

export type AdminUser = {
  username: string;
  /** scrypt hash, hex */
  hash: string;
  salt: string;
  createdAt: string;
};

export type WaiverRecord = {
  nombre: string;
  apellido: string;
  cedula: string;
  correo: string;
  acceptedAt: string;
  /** which waiver text version they accepted */
  waiverVersion: string;
};

export type Member = {
  /** Lowercased email — the member key. */
  email: string;
  nombre: string;
  telefono?: string;
  firstSeenAt: string;
  /** Denormalized attendance count (kept in sync by /api/checkin). */
  checkins: number;
  lastCheckinAt?: string;
};

export type CheckinSession = {
  /** Short id used in the QR URL, e.g. "a7f3k9". */
  id: string;
  /** Which corrida this session is for (slug from events, or free title). */
  eventSlug?: string;
  title: string;
  openedAt: string;
  /** Check-ins rejected after this moment. */
  expiresAt: string;
  openedBy: string;
};

export type Checkin = {
  sessionId: string;
  email: string;
  nombre: string;
  at: string;
  /** True when this check-in created the member record. */
  firstTime: boolean;
};

export type ClubApplication = {
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

export const USERS_DOC = "admin/users.json";
export const WAIVERS_DOC = "data/waivers.json";
export const CLUB_APPS_DOC = "data/club-apps.json";
export const OVERRIDES_DOC = "data/overrides.json";
export const MEMBERS_DOC = "data/members.json";
export const CHECKIN_SESSIONS_DOC = "data/checkin-sessions.json";
export const CHECKINS_DOC = "data/checkins.json";

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

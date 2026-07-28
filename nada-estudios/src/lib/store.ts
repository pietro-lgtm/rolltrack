import { get, put } from "@vercel/blob";

/**
 * Tiny JSON-document store on Vercel Blob (private store "nada-data").
 * Requires BLOB_READ_WRITE_TOKEN (auto-set on Vercel; in .env.local for dev).
 *
 * Documents:
 *  admin/users.json      -> AdminUser[]
 *  data/leads.json       -> Lead[]           (questionnaire submissions)
 *  data/orders.json      -> Order[]          (service-page checkouts)
 *  data/content.json     -> SiteContent      (portfolio, team, landing pages, onboarding)
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

/** Append an item to a JSON-array document (read-modify-write; fine at studio scale). */
export async function appendJson<T>(pathname: string, item: T): Promise<T[]> {
  const arr = (await readJson<T[]>(pathname)) ?? [];
  arr.push(item);
  await writeJson(pathname, arr);
  return arr;
}

export const USERS_DOC = "admin/users.json";
export const LEADS_DOC = "data/leads.json";
export const ORDERS_DOC = "data/orders.json";
export const CONTENT_DOC = "data/content.json";

// ---- Typed documents -------------------------------------------------------

export type AdminUser = {
  username: string;
  /** scrypt hash, hex */
  hash: string;
  salt: string;
  createdAt: string;
};

/** Questionnaire submission with computed qualification. */
export type Lead = {
  id: string;
  createdAt: string;
  /** ad/landing source, e.g. "meta-reels-junio" from /empezar?src=... */
  source: string | null;
  answers: {
    need: string; // campana | retainer | evento | fotos | no-se
    industry: string;
    companySize: string; // solo | 2-10 | 11-50 | 51-200 | 200+
    currentContent: string; // in-house | agencia | nadie
    timeline: string; // ya | este-mes | trimestre | explorando
    investment: string; // <1k | 1-2.5k | 2.5-5k | 5k+ | hablar
  };
  contact: { name: string; company: string; email: string; phone: string };
  /** computed on submit */
  score: number;
  segment: "hot" | "warm" | "nurture" | "oneoff";
  recommendation: string; // e.g. "Paquete B"
  status: "nuevo" | "contactado" | "propuesta" | "cerrado" | "descartado";
  notes?: string;
};

export type OrderItem = {
  id: string; // addOn id or "paquete-a" | "paquete-b" | "paquete-c"
  name: string;
  price: number | null;
  priceLabel: string;
  qty: number;
};

export type Order = {
  id: string;
  createdAt: string;
  items: OrderItem[];
  /** sum of priced items; null-priced items excluded and flagged */
  subtotal: number;
  hasQuoteItems: boolean;
  contact: { name: string; company: string; email: string; phone: string; notes: string };
  status: "nuevo" | "contactado" | "facturado" | "cerrado" | "descartado";
};

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { readJson, writeJson, USERS_DOC, type AdminUser } from "@/lib/store";

const COOKIE = "ncn_admin";
const SESSION_HOURS = 12;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

// ---- Passwords (scrypt) ----------------------------------------------------

export function hashPassword(password: string, salt?: string) {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 64).toString("hex");
  return { hash, salt: s };
}

export function verifyPassword(password: string, user: AdminUser): boolean {
  const candidate = scryptSync(password, user.salt, 64);
  const stored = Buffer.from(user.hash, "hex");
  return candidate.length === stored.length && timingSafeEqual(candidate, stored);
}

// ---- Users (stored in Blob; seeded on first read) --------------------------

export async function getUsers(): Promise<AdminUser[]> {
  const users = await readJson<AdminUser[]>(USERS_DOC);
  if (users && users.length > 0) return users;
  // First run: seed the initial admin. CHANGE THIS PASSWORD after first login
  // (Admin → Usuarios → cambiar contraseña).
  const { hash, salt } = hashPassword("ncn202601");
  const seeded: AdminUser[] = [
    { username: "pietro", hash, salt, createdAt: new Date().toISOString() },
  ];
  await writeJson(USERS_DOC, seeded);
  return seeded;
}

export async function saveUsers(users: AdminUser[]): Promise<void> {
  await writeJson(USERS_DOC, users);
}

// ---- Sessions (HMAC-signed cookie) ------------------------------------------

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeSessionValue(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 3600_000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseSessionValue(value: string): { username: string } | null {
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.u !== "string" || typeof data.exp !== "number") return null;
    if (Date.now() > data.exp) return null;
    return { username: data.u };
  } catch {
    return null;
  }
}

export const sessionCookie = {
  name: COOKIE,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  },
};

/** Server-side gate. Returns the session or null (pages redirect, APIs 401). */
export async function getSession(): Promise<{ username: string } | null> {
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  if (!value) return null;
  return parseSessionValue(value);
}

// ---- Naive login rate limit (per lambda instance; best-effort) -------------

const attempts = new Map<string, { n: number; until: number }>();

export function loginAllowed(key: string): boolean {
  const a = attempts.get(key);
  if (!a) return true;
  if (Date.now() > a.until) {
    attempts.delete(key);
    return true;
  }
  return a.n < 8;
}

export function recordLoginFailure(key: string): void {
  const a = attempts.get(key) ?? { n: 0, until: Date.now() + 15 * 60_000 };
  a.n += 1;
  attempts.set(key, a);
}

import { NextResponse } from "next/server";
import {
  getUsers,
  verifyPassword,
  loginAllowed,
  recordLoginFailure,
  makeSessionValue,
  sessionCookie,
} from "@/lib/auth";

export const runtime = "nodejs";

type LoginBody = { username?: unknown; password?: unknown };

export async function POST(req: Request) {
  // Best-effort per-instance rate limit, keyed by client IP.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!loginAllowed(ip)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados intentos. Esperá unos minutos." },
      { status: 429 },
    );
  }

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pudimos leer tu solicitud." },
      { status: 400 },
    );
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    recordLoginFailure(ip);
    return NextResponse.json(
      { ok: false, error: "Usuario o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const users = await getUsers(); // seeds pietro on first call
  const user = users.find((u) => u.username === username);

  if (!user || !verifyPassword(password, user)) {
    recordLoginFailure(ip);
    return NextResponse.json(
      { ok: false, error: "Usuario o contraseña incorrectos." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    sessionCookie.name,
    makeSessionValue(username),
    sessionCookie.options,
  );
  return res;
}

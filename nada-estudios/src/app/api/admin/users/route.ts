import { NextResponse } from "next/server";
import { getSession, getUsers, saveUsers, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET() {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  const users = await getUsers();
  return NextResponse.json({
    ok: true,
    me: s.username,
    users: users.map((u) => ({ username: u.username, createdAt: u.createdAt })),
  });
}

type PostBody = { username?: unknown; password?: unknown };

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!USERNAME_RE.test(username)) {
    return bad("Usuario inválido (3–32 caracteres: letras, números, . _ -).");
  }
  if (password.length < 8) {
    return bad("La contraseña debe tener al menos 8 caracteres.");
  }

  const users = await getUsers();
  if (users.some((u) => u.username === username)) {
    return bad("Ese usuario ya existe.");
  }

  const { hash, salt } = hashPassword(password);
  users.push({ username, hash, salt, createdAt: new Date().toISOString() });
  await saveUsers(users);
  return NextResponse.json({ ok: true });
}

type PatchBody = { password?: unknown };

/** Change the logged-in user's own password. */
export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) {
    return bad("La contraseña debe tener al menos 8 caracteres.");
  }

  const users = await getUsers();
  const me = users.find((u) => u.username === s.username);
  if (!me) return bad("Usuario no encontrado.", 404);

  const { hash, salt } = hashPassword(password);
  me.hash = hash;
  me.salt = salt;
  await saveUsers(users);
  return NextResponse.json({ ok: true });
}

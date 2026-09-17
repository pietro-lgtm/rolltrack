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

type UsersBody = {
  action?: unknown;
  username?: unknown;
  password?: unknown;
};

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: UsersBody;
  try {
    body = (await req.json()) as UsersBody;
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  const action = typeof body.action === "string" ? body.action : "";
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const users = await getUsers();

  if (action === "add") {
    if (!USERNAME_RE.test(username)) {
      return bad("Usuario inválido (3–32 caracteres: letras, números, . _ -).");
    }
    if (password.length < 8) {
      return bad("La contraseña debe tener al menos 8 caracteres.");
    }
    if (users.some((u) => u.username === username)) {
      return bad("Ese usuario ya existe.");
    }
    const { hash, salt } = hashPassword(password);
    users.push({ username, hash, salt, createdAt: new Date().toISOString() });
    await saveUsers(users);
    return NextResponse.json({ ok: true });
  }

  if (action === "setPassword") {
    if (password.length < 8) {
      return bad("La contraseña debe tener al menos 8 caracteres.");
    }
    const target = users.find((u) => u.username === username);
    if (!target) return bad("Ese usuario no existe.", 404);
    const { hash, salt } = hashPassword(password);
    target.hash = hash;
    target.salt = salt;
    await saveUsers(users);
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    if (username === s.username) {
      return bad("No podés eliminar tu propio usuario.");
    }
    if (users.length <= 1) {
      return bad("No podés eliminar el último usuario.");
    }
    const next = users.filter((u) => u.username !== username);
    if (next.length === users.length) return bad("Ese usuario no existe.", 404);
    await saveUsers(next);
    return NextResponse.json({ ok: true });
  }

  return bad("Acción no reconocida.");
}

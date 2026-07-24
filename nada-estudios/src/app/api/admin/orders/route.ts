import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readJson, writeJson, ORDERS_DOC, type Order } from "@/lib/store";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

const STATUSES: Order["status"][] = ["nuevo", "contactado", "facturado", "cerrado", "descartado"];

export async function GET() {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  const orders = (await readJson<Order[]>(ORDERS_DOC)) ?? [];
  const sorted = [...orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json({ ok: true, orders: sorted });
}

type PatchBody = { id?: unknown; status?: unknown };

export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s) return bad("No autorizado.", 401);

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return bad("No pudimos leer tu solicitud.");
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return bad("Falta el id del pedido.");

  if (typeof body.status !== "string" || !STATUSES.includes(body.status as Order["status"])) {
    return bad("Estado inválido.");
  }

  const orders = (await readJson<Order[]>(ORDERS_DOC)) ?? [];
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return bad("Ese pedido no existe.", 404);

  orders[idx].status = body.status as Order["status"];
  await writeJson(ORDERS_DOC, orders);
  return NextResponse.json({ ok: true, order: orders[idx] });
}

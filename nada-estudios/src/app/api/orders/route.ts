import { NextResponse } from "next/server";
import { appendJson, ORDERS_DOC, type Order, type OrderItem } from "@/lib/store";
import { packages, addOns, formatUsd } from "@/data/services";

/**
 * POST /api/orders — checkout submission from /servicios.
 * Prices are never trusted from the client: every item id is re-resolved
 * against @/data/services and the subtotal is recomputed server-side.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function catalogItem(
  id: string,
): { name: string; price: number | null; priceLabel: string } | null {
  if (id.startsWith("paquete-")) {
    const pkgId = id.slice("paquete-".length);
    const pkg = packages.find((p) => p.id === pkgId);
    if (!pkg) return null;
    return { name: pkg.name, price: pkg.price, priceLabel: `${formatUsd(pkg.price)} /mes` };
  }
  const addOn = addOns.find((a) => a.id === id);
  if (!addOn) return null;
  return { name: addOn.name, price: addOn.price, priceLabel: addOn.priceLabel };
}

type RawItem = { id?: unknown; qty?: unknown };
type RawContact = {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  notes?: unknown;
};
type RawBody = { items?: unknown; contact?: RawContact };

export async function POST(request: Request) {
  let body: RawBody;
  try {
    body = (await request.json()) as RawBody;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? (body.items as RawItem[]) : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ ok: false, error: "El carrito está vacío." }, { status: 400 });
  }

  const items: OrderItem[] = [];
  for (const raw of rawItems) {
    if (typeof raw.id !== "string" || raw.id.length === 0) {
      return NextResponse.json({ ok: false, error: "Ítem inválido." }, { status: 400 });
    }
    const qty = typeof raw.qty === "number" ? Math.floor(raw.qty) : NaN;
    if (!Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ ok: false, error: "Cantidad inválida." }, { status: 400 });
    }
    const catalog = catalogItem(raw.id);
    if (!catalog) {
      return NextResponse.json({ ok: false, error: "Ítem desconocido." }, { status: 400 });
    }
    items.push({
      id: raw.id,
      name: catalog.name,
      price: catalog.price,
      priceLabel: catalog.priceLabel,
      qty,
    });
  }

  const contact = body.contact ?? {};
  const name = typeof contact.name === "string" ? contact.name.trim() : "";
  const company = typeof contact.company === "string" ? contact.company.trim() : "";
  const email = typeof contact.email === "string" ? contact.email.trim() : "";
  const phone = typeof contact.phone === "string" ? contact.phone.trim() : "";
  const notes = typeof contact.notes === "string" ? contact.notes.trim() : "";

  if (!name || !email || !phone) {
    return NextResponse.json(
      { ok: false, error: "Faltan datos de contacto (nombre, email y teléfono son obligatorios)." },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Email inválido." }, { status: 400 });
  }

  const subtotal = items.reduce((n, i) => n + (i.price ?? 0) * i.qty, 0);
  const hasQuoteItems = items.some((i) => i.price === null);

  const order: Order = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    items,
    subtotal,
    hasQuoteItems,
    contact: { name, company, email, phone, notes },
    status: "nuevo",
  };

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("[/api/orders] dev order:", JSON.stringify(order, null, 2));
    return NextResponse.json({ ok: true, dev: true });
  }

  await appendJson(ORDERS_DOC, order);
  return NextResponse.json({ ok: true });
}

"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/store";
import { formatUsd } from "@/data/services";
import { inputCls, thCls, tdCls } from "@/components/admin/styles";

const STATUSES: Order["status"][] = ["nuevo", "contactado", "facturado", "cerrado", "descartado"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return iso;
  return d.toLocaleString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function itemsSummary(order: Order) {
  return order.items.map((i) => `${i.qty}× ${i.name}`).join(", ") || "—";
}

export function PedidosTab() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/orders");
        const json = await res.json().catch(() => null);
        if (!alive) return;
        if (res.ok && json?.ok) setOrders(json.orders as Order[]);
        else setError(json?.error ?? "No pudimos cargar los pedidos.");
      } catch {
        if (alive) setError("Error de conexión.");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function patchStatus(id: string, status: Order["status"]) {
    setSavingId(id);
    setOrders((prev) => (prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev));
    try {
      await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      // best-effort; row already reflects the optimistic value
    } finally {
      setSavingId(null);
    }
  }

  if (error) return <p className="text-mid">{error}</p>;
  if (orders === null) return <p className="label-mono text-mid">Cargando…</p>;
  if (orders.length === 0) return <p className="text-mid">Sin pedidos todavía.</p>;

  return (
    <div className="overflow-x-auto border-2 border-ink">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}>Fecha</th>
            <th className={thCls}>Contacto</th>
            <th className={thCls}>Items</th>
            <th className={thCls}>Subtotal</th>
            <th className={thCls}>Cotización</th>
            <th className={thCls}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className={`${tdCls} label-mono text-mid`}>{fmtDate(o.createdAt)}</td>
              <td className={tdCls}>
                <p>{o.contact.name || "—"}</p>
                <p className="text-mid">{o.contact.company || o.contact.email || "—"}</p>
              </td>
              <td className={`${tdCls} max-w-xs whitespace-normal`}>{itemsSummary(o)}</td>
              <td className={tdCls}>{formatUsd(o.subtotal)}</td>
              <td className={tdCls}>{o.hasQuoteItems ? "sí" : "no"}</td>
              <td className={tdCls}>
                <select
                  value={o.status}
                  disabled={savingId === o.id}
                  onChange={(e) => patchStatus(o.id, e.target.value as Order["status"])}
                  className={inputCls}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

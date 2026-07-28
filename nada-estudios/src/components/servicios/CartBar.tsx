"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/data/services";

export function CartBar() {
  const { items, count, subtotal, hasQuoteItems, remove, setQty } = useCart();
  const [open, setOpen] = useState(false);

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper">
      {open && (
        <div className="mx-auto max-h-[45vh] max-w-7xl overflow-y-auto border-b-2 border-ink px-4 py-4 sm:px-6">
          <ul className="divide-y-2 divide-ink/10">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="label-mono">{item.name}</p>
                  <p className="label-mono text-mid">{item.priceLabel}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="label-mono border-2 border-ink px-2 py-0.5"
                    aria-label={`Restar ${item.name}`}
                  >
                    −
                  </button>
                  <span className="label-mono w-5 text-center">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="label-mono border-2 border-ink px-2 py-0.5"
                    aria-label={`Sumar ${item.name}`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="label-mono link-under ml-2 text-mid"
                  >
                    quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {hasQuoteItems && (
            <p className="label-mono mt-4 text-mid">
              incluye ítems por cotización — confirmamos precio antes de facturar
            </p>
          )}
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="label-mono text-left"
        >
          carrito — {count} {count === 1 ? "item" : "items"} — {formatUsd(subtotal)}
          {hasQuoteItems ? "+" : ""}
          <span className="ml-2 text-mid">{open ? "[ cerrar ]" : "[ ver ]"}</span>
        </button>
        <Link href="/servicios/checkout" className="btn btn-accent shrink-0">
          Finalizar →
        </Link>
      </div>
    </div>
  );
}

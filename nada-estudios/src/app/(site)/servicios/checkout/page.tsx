"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd } from "@/data/services";
import { site } from "@/config/site";
import { Reveal } from "@/components/site/Reveal";

type Status = "idle" | "submitting" | "success" | "error";

type ContactForm = {
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
};

const EMPTY_FORM: ContactForm = { name: "", company: "", email: "", phone: "", notes: "" };

export default function CheckoutPage() {
  const { items, subtotal, hasQuoteItems, setQty, remove, clear } = useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);

  function updateField<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          contact: form,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setErrorMsg(
          typeof data.error === "string"
            ? data.error
            : "Algo falló. Intentá de nuevo o escribinos por WhatsApp.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      clear();
    } catch {
      setErrorMsg("Algo falló. Intentá de nuevo o escribinos por WhatsApp.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6">
        <Reveal>
          <p className="label-mono mb-4 text-mid">pedido enviado</p>
          <h1 className="display mb-6 text-5xl">Listo. Te contactamos hoy.</h1>
          <p className="label-mono mb-8 text-mid">
            Revisamos tu pedido y te escribimos con la propuesta y la forma de pago
            (50% al firmar, 50% al inicio de mes).
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href={site.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent"
            >
              Escribinos por WhatsApp →
            </a>
            <Link href="/servicios" className="btn btn-ghost border-2 border-ink">
              Volver a servicios
            </Link>
          </div>
        </Reveal>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6">
        <p className="label-mono mb-4 text-mid">carrito vacío</p>
        <h1 className="display mb-6 text-4xl">Todavía no agregaste nada.</h1>
        <Link href="/servicios" className="btn btn-accent">
          Ver servicios →
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="label-mono mb-4 text-mid">checkout</p>
        <h1 className="display mb-10 text-4xl sm:text-5xl">Confirmá tu pedido.</h1>
      </Reveal>

      <div className="grid gap-10 md:grid-cols-2">
        <Reveal>
          <div>
            <p className="label-mono mb-4">Tu pedido</p>
            <ul className="mb-6 divide-y-2 divide-ink/10 border-2 border-ink">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="label-mono">{item.name}</p>
                    <p className="label-mono text-mid">{item.priceLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
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

            <div className="leader mb-2 text-lg">
              <span className="leader-name">Subtotal</span>
              <span className="leader-price">
                {formatUsd(subtotal)}
                {hasQuoteItems ? "+" : ""}
              </span>
            </div>
            {hasQuoteItems && (
              <p className="label-mono text-mid">
                Si incluye ítems por cotización te confirmamos precio antes de facturar.
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="label-mono mb-2">Tus datos</p>

            <label className="flex flex-col gap-1">
              <span className="label-mono text-mid">Nombre *</span>
              <input
                required
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="border-2 border-ink bg-paper px-3 py-2 focus:outline-none focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="label-mono text-mid">Empresa</span>
              <input
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
                className="border-2 border-ink bg-paper px-3 py-2 focus:outline-none focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="label-mono text-mid">Email *</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="border-2 border-ink bg-paper px-3 py-2 focus:outline-none focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="label-mono text-mid">Teléfono *</span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="border-2 border-ink bg-paper px-3 py-2 focus:outline-none focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="label-mono text-mid">Notas</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="border-2 border-ink bg-paper px-3 py-2 focus:outline-none focus:border-accent"
              />
            </label>

            {status === "error" && <p className="label-mono text-mid">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn btn-accent mt-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "submitting" ? "Enviando..." : "Enviar pedido →"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

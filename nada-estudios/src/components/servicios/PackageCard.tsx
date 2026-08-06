"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatUsd, type Package } from "@/data/services";

export function PackageCard({ pkg }: { pkg: Package }) {
  const { add } = useCart();

  return (
    <div
      className={`relative flex h-full flex-col border-2 bg-paper p-6 sm:p-8 ${
        pkg.featured ? "border-accent" : "border-ink"
      }`}
    >
      {pkg.featured && (
        <span className="label-mono absolute -top-3 left-6 border-2 border-ink bg-accent px-2 py-1 text-ink">
          más elegido
        </span>
      )}

      <p className="display mb-2 text-3xl sm:text-4xl">{pkg.name}</p>

      <p className="label-mono mb-6 text-mid">{pkg.summary}</p>

      <ul className="mb-6 flex-1 space-y-2.5 text-sm leading-snug">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex gap-2.5">
            <span aria-hidden className="text-mid">
              —
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() =>
            add({
              id: `paquete-${pkg.id}`,
              name: pkg.name,
              price: pkg.price,
              priceLabel: `desde ${formatUsd(pkg.price)} /mes`,
            })
          }
          className={`btn w-full ${pkg.featured ? "btn-accent" : ""}`}
        >
          Me interesa
        </button>
        <Link
          href="/empezar?src=servicios"
          className="btn btn-ghost w-full border-2 border-ink"
        >
          ¿Es para mí?
        </Link>
      </div>
    </div>
  );
}

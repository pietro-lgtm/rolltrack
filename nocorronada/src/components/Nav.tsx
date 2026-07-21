"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/eventos", label: "Eventos" },
  { href: "/bunker-gp", label: "Bunker GP" },
  { href: "/faq", label: "FAQ" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b hairline bg-black/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="display text-lg text-ink transition-colors hover:text-volt"
          onClick={() => setOpen(false)}
        >
          NO CORRO NADA
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`label-mono transition-colors hover:text-volt ${
                pathname === l.href ? "text-volt" : "text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/unite"
            className="label-mono bg-volt px-4 py-2 text-black transition-colors hover:bg-ink"
          >
            Unite al club
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="label-mono text-ink sm:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </nav>

      {open && (
        <div className="border-t hairline sm:hidden">
          <div className="flex flex-col px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="label-mono border-b hairline py-4 text-ink"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/unite"
              className="label-mono my-4 bg-volt px-4 py-3 text-center text-black"
              onClick={() => setOpen(false)}
            >
              Unite al club
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

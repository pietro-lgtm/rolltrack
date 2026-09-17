"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav, site } from "@/config/site";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-ink text-paper">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="label-mono border border-paper/40 px-3 py-1.5 hover:bg-accent hover:text-ink hover:border-accent transition-colors"
          onClick={() => setOpen(false)}
        >
          NADA estudios
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.main.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`label-mono link-under ${
                pathname.startsWith(item.href) ? "text-accent" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link href={nav.cta.href} className="btn btn-accent !py-2 !px-4">
            {nav.cta.label} →
          </Link>
        </nav>

        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="label-mono md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "[ cerrar ]" : "[ menú ]"}
        </button>
      </div>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="fixed inset-0 top-14 z-40 flex flex-col bg-ink md:hidden">
          <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
            {nav.main.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="display text-5xl text-paper hover:text-accent transition-colors"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={nav.cta.href}
              onClick={() => setOpen(false)}
              className="display mt-4 text-5xl text-accent"
            >
              {nav.cta.label} →
            </Link>
          </nav>
          <div className="px-6 pb-10">
            <p className="label-mono text-paper/50">
              {site.cities.join(" · ")}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

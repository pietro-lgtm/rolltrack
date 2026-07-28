import Link from "next/link";
import { nav, site } from "@/config/site";
import { CityClocks } from "@/components/site/CityClocks";

export function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="label-mono mb-4 text-paper/50">Estudio</p>
            <ul className="space-y-2">
              {nav.main.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="label-mono link-under">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/empezar" className="label-mono link-under text-accent">
                  Empezar un proyecto →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="label-mono mb-4 text-paper/50">Contacto</p>
            <ul className="space-y-2">
              <li>
                <a href={`mailto:${site.email}`} className="label-mono link-under">
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-mono link-under"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-mono link-under"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          <CityClocks />
        </div>

        <p className="display mt-16 text-[18vw] leading-none text-paper/95 md:text-[13rem]" aria-hidden>
          NADA
        </p>

        <div className="mt-8 flex flex-col gap-2 border-t border-paper/20 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="label-mono text-paper/50">
            © {new Date().getFullYear()} {site.legalName} — {site.parent}
          </p>
          <p className="label-mono text-paper/50">Precios en USD + IVA</p>
        </div>
      </div>
    </footer>
  );
}

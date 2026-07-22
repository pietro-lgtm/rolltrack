import Link from "next/link";
import { site } from "@/config/site";
import { Marquee } from "@/components/Marquee";
import { SponsorStrip } from "@/components/SponsorStrip";

export function Footer() {
  return (
    <footer className="border-t hairline">
      {/* Official sponsors — on every page */}
      <div className="border-b hairline">
        <SponsorStrip compact />
      </div>
      <Marquee
        text="NO CORRO NADA"
        className="border-b hairline py-3 text-muted"
        durationSeconds={60}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="display text-2xl">NCN</p>
          <p className="label-mono mt-3 text-muted">{site.city}</p>
          <p className="label-mono mt-1 text-muted">Un club de No Pasa Nada</p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="label-mono text-muted">Club</p>
          <Link href="/corridas" className="label-mono text-ink hover:text-volt">
            Corridas
          </Link>
          <Link href="/bunker-gp" className="label-mono text-ink hover:text-volt">
            Bunker GP
          </Link>
          <Link href="/media" className="label-mono text-ink hover:text-volt">
            Media
          </Link>
          <Link href="/unite" className="label-mono text-ink hover:text-volt">
            Unite al club
          </Link>
          <Link href="/faq" className="label-mono text-ink hover:text-volt">
            FAQ
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <p className="label-mono text-muted">Seguinos</p>
          <a
            href={site.social.strava}
            target="_blank"
            rel="noopener noreferrer"
            className="label-mono text-ink hover:text-volt"
          >
            Strava ↗
          </a>
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="label-mono text-ink hover:text-volt"
          >
            Instagram ↗
          </a>
          <a
            href={site.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="label-mono text-ink hover:text-volt"
          >
            TikTok ↗
          </a>
          <a
            href={site.merchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label-mono text-ink hover:text-volt"
          >
            Merch ↗
          </a>
        </div>
      </div>
      <div className="border-t hairline">
        <p className="label-mono mx-auto max-w-6xl px-4 py-4 text-muted sm:px-6">
          © {new Date().getFullYear()} No Corro Nada · No Pasa Nada
        </p>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { GhostLink } from "@/components/ui";
import { CheckinForm } from "@/components/CheckinForm";
import {
  readJson,
  CHECKIN_SESSIONS_DOC,
  type CheckinSession,
} from "@/lib/store";

export const metadata: Metadata = {
  title: "Check-in",
  robots: { index: false, follow: false },
};

// Session state (open / expired) changes minute to minute — never cache this.
export const dynamic = "force-dynamic";

/** Closed sessions (and unparseable dates) reject check-ins. */
function isClosed(expiresAt: string): boolean {
  const t = new Date(expiresAt).getTime();
  return Number.isNaN(t) || Date.now() > t;
}

/** es-CR long date, computed in Costa Rica time so server and client agree. */
function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-CR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Costa_Rica",
  }).format(d);
}

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const wanted = decodeURIComponent(code).trim().toLowerCase();

  const sessions = (await readJson<CheckinSession[]>(CHECKIN_SESSIONS_DOC)) ?? [];
  const session = sessions.find((s) => s.id.toLowerCase() === wanted);

  if (!session) {
    return (
      <Shell>
        <p className="label-mono text-muted">Check-in</p>
        <h1 className="display mt-6 text-5xl sm:text-7xl">Código inválido</h1>
        <p className="mt-8 text-lg text-muted">
          Pedile el QR de hoy a la organización.
        </p>
        <div className="mt-10">
          <GhostLink href="/">Volver al inicio</GhostLink>
        </div>
      </Shell>
    );
  }

  if (isClosed(session.expiresAt)) {
    return (
      <Shell>
        <p className="label-mono text-muted">Check-in cerrado</p>
        <h1 className="display mt-6 text-5xl sm:text-7xl">
          Este check-in ya cerró
        </h1>
        <p className="mt-8 text-lg text-muted">
          Nos vemos la próxima — domingos 8:00 AM.
        </p>
        <div className="mt-10">
          <GhostLink href="/corridas">Ver las corridas</GhostLink>
        </div>
      </Shell>
    );
  }

  const day = formatDay(session.openedAt);

  return (
    <Shell>
      <p className="label-mono text-volt">
        Check-in{day ? ` · ${day}` : ""}
      </p>
      <h1 className="display mt-6 text-5xl sm:text-7xl">{session.title}</h1>
      <p className="mt-6 text-lg text-muted">
        Decinos que llegaste. 20 segundos y listo.
      </p>

      <div className="mt-12">
        <CheckinForm code={session.id} />
      </div>
    </Shell>
  );
}

/** Event-moment chrome: volt finish-line strip, big type, thumb-reachable body. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="checker-volt" aria-hidden />
      <div className="mx-auto max-w-lg px-5 pt-12 pb-24 sm:px-6 sm:pt-16">
        {children}
      </div>
    </div>
  );
}

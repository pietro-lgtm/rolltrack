import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin — NADA Estudios" },
  robots: { index: false, follow: false },
};

/** Bare admin chrome: black top bar, no public Nav/Footer. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-4 text-paper sm:px-6">
        <Link href="/admin" className="label-mono text-paper">
          NADA admin
        </Link>
        {session && (
          <div className="flex items-center gap-4">
            <span className="label-mono hidden text-paper/60 sm:inline">{session.username}</span>
            <LogoutButton />
          </div>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}

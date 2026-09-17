import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default async function PanelPage() {
  const s = await getSession();
  if (!s) redirect("/admin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b hairline pb-8">
        <div>
          <p className="label-mono text-muted">No Corro Nada</p>
          <h1 className="display mt-2 text-3xl sm:text-4xl">
            Panel · <span className="text-volt">{s.username}</span>
          </h1>
        </div>
        <LogoutButton />
      </header>

      <div className="mt-10">
        <AdminPanel />
      </div>
    </div>
  );
}

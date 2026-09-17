import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Panel",
};

export default async function PanelPage() {
  const session = await getSession();
  if (!session) redirect("/admin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="label-mono text-mid">Panel</p>
      <h1 className="display mt-2 text-3xl sm:text-4xl">
        Hola, <span className="text-ink">{session.username}</span>
      </h1>
      <div className="mt-8">
        <AdminPanel />
      </div>
    </div>
  );
}

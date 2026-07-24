import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Ingresar",
};

export default async function AdminPage() {
  const session = await getSession();
  if (session) redirect("/admin/panel");
  return <AdminLogin />;
}

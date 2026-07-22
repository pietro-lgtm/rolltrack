"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { btnGhost } from "@/components/admin/styles";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Even if the request fails, send the user back to the login screen.
    } finally {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={logout} disabled={loading} className={btnGhost}>
      {loading ? "Saliendo…" : "Salir"}
    </button>
  );
}

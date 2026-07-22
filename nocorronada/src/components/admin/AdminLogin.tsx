"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inputCls, btnPrimary } from "@/components/admin/styles";

export function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const payload = {
      username: String(data.get("username") ?? ""),
      password: String(data.get("password") ?? ""),
    };

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push("/admin/panel");
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => null);
      setError(
        typeof json?.error === "string"
          ? json.error
          : "No pudimos iniciar sesión. Intentá de nuevo.",
      );
    } catch {
      setError("Revisá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <p className="label-mono text-muted">No Corro Nada</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Admin</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-12 flex max-w-sm flex-col gap-6"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="label-mono text-muted">
            Usuario
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            className={inputCls}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="label-mono text-muted">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputCls}
          />
        </div>

        {error && (
          <div role="alert" className="border-l-2 border-l-volt bg-asphalt px-4 py-3">
            <p className="text-ink">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

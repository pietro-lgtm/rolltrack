"use client";

import { useCallback, useEffect, useState } from "react";
import { inputCls, thCls, tdCls } from "@/components/admin/styles";

type UserRow = { username: string; createdAt: string };

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return iso;
  return d.toLocaleDateString("es-CR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function UsuariosTab() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [me, setMe] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [addName, setAddName] = useState("");
  const [addPass, setAddPass] = useState("");
  const [addMsg, setAddMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [addBusy, setAddBusy] = useState(false);

  const [pwPass, setPwPass] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setLoadError(json?.error ?? "No pudimos cargar los usuarios.");
        return;
      }
      setUsers(json.users as UserRow[]);
      setMe(json.me as string);
    } catch {
      setLoadError("Error de conexión.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setAddMsg(null);
    if (addPass.length < 8) {
      setAddMsg({ ok: false, text: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    setAddBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: addName, password: addPass }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? "No se pudo crear el usuario.");
      setAddName("");
      setAddPass("");
      setAddMsg({ ok: true, text: "Usuario creado." });
      await load();
    } catch (err) {
      setAddMsg({ ok: false, text: (err as Error).message });
    } finally {
      setAddBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pwPass.length < 8) {
      setPwMsg({ ok: false, text: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    setPwBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwPass }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? "No se pudo actualizar.");
      setPwPass("");
      setPwMsg({ ok: true, text: "Contraseña actualizada." });
    } catch (err) {
      setPwMsg({ ok: false, text: (err as Error).message });
    } finally {
      setPwBusy(false);
    }
  }

  if (loadError) return <p className="text-mid">{loadError}</p>;
  if (users === null) return <p className="label-mono text-mid">Cargando…</p>;

  return (
    <div className="flex max-w-md flex-col gap-16">
      <section>
        <p className="label-mono text-mid">Usuarios ({users.length})</p>
        <div className="mt-6 overflow-x-auto border-2 border-ink">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}>Usuario</th>
                <th className={thCls}>Creado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username}>
                  <td className={tdCls}>
                    {u.username}
                    {u.username === me && <span className="label-mono ml-2 text-mid">· vos</span>}
                  </td>
                  <td className={`${tdCls} label-mono text-mid`}>{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t-2 border-ink pt-16">
        <p className="label-mono text-mid">Agregar usuario</p>
        <form onSubmit={addUser} className="mt-6 flex flex-col gap-6" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="add-user" className="label-mono text-mid">
              Usuario
            </label>
            <input
              id="add-user"
              className={inputCls}
              value={addName}
              autoCapitalize="none"
              spellCheck={false}
              onChange={(e) => setAddName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="add-pass" className="label-mono text-mid">
              Contraseña (mín. 8)
            </label>
            <input
              id="add-pass"
              type="password"
              className={inputCls}
              value={addPass}
              onChange={(e) => setAddPass(e.target.value)}
            />
          </div>
          {addMsg && <p className="label-mono text-ink">{addMsg.text}</p>}
          <button type="submit" disabled={addBusy} className="btn disabled:cursor-not-allowed disabled:opacity-60">
            {addBusy ? "Creando…" : "Crear usuario"}
          </button>
        </form>
      </section>

      <section className="border-t-2 border-ink pt-16">
        <p className="label-mono text-mid">Cambiar mi contraseña</p>
        <form onSubmit={changePassword} className="mt-6 flex flex-col gap-6" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="pw-pass" className="label-mono text-mid">
              Nueva contraseña (mín. 8)
            </label>
            <input
              id="pw-pass"
              type="password"
              className={inputCls}
              value={pwPass}
              onChange={(e) => setPwPass(e.target.value)}
            />
          </div>
          {pwMsg && <p className="label-mono text-ink">{pwMsg.text}</p>}
          <button type="submit" disabled={pwBusy} className="btn disabled:cursor-not-allowed disabled:opacity-60">
            {pwBusy ? "Guardando…" : "Actualizar contraseña"}
          </button>
        </form>
      </section>
    </div>
  );
}

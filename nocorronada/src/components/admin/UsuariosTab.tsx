"use client";

import { useCallback, useEffect, useState } from "react";
import { inputCls, btnPrimary, btnGhost, thCls, tdCls } from "@/components/admin/styles";

type UserRow = { username: string; createdAt: string };

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return iso;
  return d.toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

async function postUsers(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new Error(typeof json?.error === "string" ? json.error : "No se pudo completar.");
  }
}

export function UsuariosTab() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [me, setMe] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [addName, setAddName] = useState("");
  const [addPass, setAddPass] = useState("");
  const [addMsg, setAddMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [addBusy, setAddBusy] = useState(false);

  const [pwUser, setPwUser] = useState("");
  const [pwPass, setPwPass] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const [rowMsg, setRowMsg] = useState<{ ok: boolean; text: string } | null>(null);

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
      setPwUser((prev) => prev || (json.me as string));
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
      await postUsers({ action: "add", username: addName, password: addPass });
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

  async function setPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pwPass.length < 8) {
      setPwMsg({ ok: false, text: "La contraseña debe tener al menos 8 caracteres." });
      return;
    }
    setPwBusy(true);
    try {
      await postUsers({ action: "setPassword", username: pwUser, password: pwPass });
      setPwPass("");
      setPwMsg({ ok: true, text: `Contraseña actualizada para ${pwUser}.` });
    } catch (err) {
      setPwMsg({ ok: false, text: (err as Error).message });
    } finally {
      setPwBusy(false);
    }
  }

  async function deleteUser(username: string) {
    setRowMsg(null);
    try {
      await postUsers({ action: "delete", username });
      setRowMsg({ ok: true, text: `Usuario ${username} eliminado.` });
      await load();
    } catch (err) {
      setRowMsg({ ok: false, text: (err as Error).message });
    }
  }

  if (loadError) return <p className="text-muted">{loadError}</p>;
  if (users === null) return <p className="label-mono text-muted">Cargando…</p>;

  return (
    <div className="flex flex-col gap-16">
      {/* User list */}
      <section>
        <p className="label-mono text-muted">Usuarios ({users.length})</p>
        <div className="mt-6 overflow-x-auto border hairline">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}>Usuario</th>
                <th className={thCls}>Creado</th>
                <th className={thCls}>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.username === me;
                const isLast = users.length <= 1;
                return (
                  <tr key={u.username}>
                    <td className={tdCls}>
                      {u.username}
                      {isSelf && <span className="label-mono ml-2 text-volt">· vos</span>}
                    </td>
                    <td className={`${tdCls} label-mono text-muted`}>{fmtDate(u.createdAt)}</td>
                    <td className={tdCls}>
                      <button
                        type="button"
                        onClick={() => deleteUser(u.username)}
                        disabled={isSelf || isLast}
                        className={btnGhost}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rowMsg && (
          <p className={`mt-4 label-mono ${rowMsg.ok ? "text-volt" : "text-ink"}`}>
            {rowMsg.text}
          </p>
        )}
      </section>

      {/* Add user */}
      <section className="border-t hairline pt-16">
        <p className="label-mono text-muted">Agregar usuario</p>
        <form onSubmit={addUser} className="mt-6 flex max-w-sm flex-col gap-6" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="add-user" className="label-mono text-muted">
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
            <label htmlFor="add-pass" className="label-mono text-muted">
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
          {addMsg && (
            <p className={`label-mono ${addMsg.ok ? "text-volt" : "text-ink"}`}>{addMsg.text}</p>
          )}
          <button type="submit" disabled={addBusy} className={btnPrimary}>
            {addBusy ? "Creando…" : "Crear usuario"}
          </button>
        </form>
      </section>

      {/* Change password */}
      <section className="border-t hairline pt-16">
        <p className="label-mono text-muted">Cambiar contraseña</p>
        <form onSubmit={setPassword} className="mt-6 flex max-w-sm flex-col gap-6" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="pw-user" className="label-mono text-muted">
              Usuario
            </label>
            <select
              id="pw-user"
              className={inputCls}
              value={pwUser}
              onChange={(e) => setPwUser(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username}
                  {u.username === me ? " (vos)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="pw-pass" className="label-mono text-muted">
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
          {pwMsg && (
            <p className={`label-mono ${pwMsg.ok ? "text-volt" : "text-ink"}`}>{pwMsg.text}</p>
          )}
          <button type="submit" disabled={pwBusy} className={btnPrimary}>
            {pwBusy ? "Guardando…" : "Actualizar contraseña"}
          </button>
        </form>
      </section>
    </div>
  );
}

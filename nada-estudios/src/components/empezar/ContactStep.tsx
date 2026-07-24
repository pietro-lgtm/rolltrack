"use client";

import { useState } from "react";

export type ContactValue = { name: string; company: string; email: string; phone: string };

/** Contact step. Always last per BUILD_BRIEF — payoff (result screen) comes right after. */
export function ContactStep({
  initial,
  error,
  submitting = false,
  onSubmit,
}: {
  initial: ContactValue;
  error: string | null;
  submitting?: boolean;
  onSubmit: (value: ContactValue) => void;
}) {
  const [value, setValue] = useState(initial);

  function update<K extends keyof ContactValue>(key: K, v: string) {
    setValue((prev) => ({ ...prev, [key]: v }));
  }

  return (
    <div>
      <h1 className="display text-3xl sm:text-5xl">
        Última cosa. ¿A dónde te mandamos la recomendación?
      </h1>

      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value);
        }}
      >
        <Field
          label="Nombre"
          value={value.name}
          onChange={(v) => update("name", v)}
          autoComplete="name"
        />
        <Field
          label="Empresa"
          value={value.company}
          onChange={(v) => update("company", v)}
          autoComplete="organization"
        />
        <Field
          label="Email"
          type="email"
          value={value.email}
          onChange={(v) => update("email", v)}
          autoComplete="email"
        />
        <Field
          label="Teléfono / WhatsApp"
          type="tel"
          value={value.phone}
          onChange={(v) => update("phone", v)}
          autoComplete="tel"
        />

        {error && (
          <p className="label-mono inline-block w-fit bg-accent px-3 py-2 text-ink">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-accent mt-2 self-start disabled:opacity-50">
          {submitting ? "Un momento…" : "Ver mi recomendación →"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="label-mono block text-mid">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="mt-2 w-full border-2 border-ink bg-paper px-4 py-3 text-lg outline-none focus:bg-smoke"
      />
    </label>
  );
}

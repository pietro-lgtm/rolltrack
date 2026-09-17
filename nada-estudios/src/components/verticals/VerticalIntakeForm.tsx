"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { site } from "@/config/site";
import { loadSavedContact, saveContact } from "@/lib/savedContact";
import { VERTICAL_INTAKES, type Vertical, type VerticalIntakeQuestion } from "@/data/verticals";

type ContactValue = { name: string; company: string; email: string; phone: string };
type AnswerState = Partial<Record<VerticalIntakeQuestion["key"], string>>;

const EMPTY_CONTACT: ContactValue = { name: "", company: "", email: "", phone: "" };

/**
 * Compact single-page intake for a vertical landing page (not the 7-step
 * /empezar quiz). Posts straight to /api/leads with a fixed `industry`
 * (from the vertical) and a `vertical-<slug>` source tag.
 */
export function VerticalIntakeForm({ vertical }: { vertical: Vertical }) {
  const questions = VERTICAL_INTAKES[vertical.slug];
  const [answers, setAnswers] = useState<AnswerState>({});
  const [contact, setContact] = useState<ContactValue>(EMPTY_CONTACT);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Prefill from a previously saved contact (another vertical intake, the
  // /empezar quiz, checkout). Only fills fields still empty — runs after
  // mount so the server-rendered form never mismatches on hydration.
  useEffect(() => {
    const saved = loadSavedContact();
    if (!saved) return;
    setContact((prev) => ({
      name: prev.name || saved.name,
      company: prev.company || saved.company,
      email: prev.email || saved.email,
      phone: prev.phone || saved.phone,
    }));
  }, []);

  function selectAnswer(key: VerticalIntakeQuestion["key"], value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function updateContact<K extends keyof ContactValue>(key: K, value: string) {
    setContact((prev) => ({ ...prev, [key]: value }));
  }

  const allQuestionsAnswered = questions.every((q) => Boolean(answers[q.key]));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!allQuestionsAnswered) {
      setError("Falta responder alguna pregunta.");
      return;
    }
    const { name, company, email, phone } = contact;
    if (!name.trim() || !company.trim() || !email.trim() || !phone.trim()) {
      setError("Completá todos los campos de contacto.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            need: answers.need,
            companySize: answers.companySize,
            currentContent: answers.currentContent,
            timeline: answers.timeline,
            investment: answers.investment,
            industry: vertical.industry,
          },
          contact,
          source: `vertical-${vertical.slug}`,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      const ok = Boolean(res.ok && data && typeof data === "object" && (data as { ok?: boolean }).ok);
      if (!ok) throw new Error("submit-failed");

      saveContact(contact);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("No pudimos enviar el formulario. Probá de nuevo o escribinos por WhatsApp.");
    }
  }

  if (status === "success") {
    const waText = `Hola, soy ${contact.name} de ${contact.company}, necesito contenido ${vertical.name.toLowerCase()}`;
    const waUrl = `${site.whatsappUrl}?text=${encodeURIComponent(waText)}`;
    return (
      <div className="mt-10">
        <p className="display text-3xl sm:text-4xl">Listo. Te contactamos hoy.</p>
        <p className="mt-4 max-w-md text-paper/70">
          Ya tenemos tu info. Si querés adelantar, escribinos directo por WhatsApp.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
            Hablar por WhatsApp →
          </a>
          <Link
            href="/trabajo"
            className="btn btn-ghost !border-paper !text-paper hover:!bg-paper hover:!text-ink"
          >
            Ver trabajo
          </Link>
        </div>
      </div>
    );
  }

  const companyLabel = vertical.slug === "restaurantes" ? "Restaurante" : "Empresa";

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-10">
      {questions.map((q) => (
        <div key={q.key}>
          <p className="label-mono text-paper/50">{q.label}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {q.options.map((opt) => {
              const selected = answers[q.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectAnswer(q.key, opt.value)}
                  className={
                    selected
                      ? "border-2 border-ink bg-accent px-4 py-2 text-sm font-semibold text-ink transition-colors"
                      : "border-2 border-paper/40 px-4 py-2 text-sm text-paper transition-colors hover:border-accent"
                  }
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ContactField
          label="Nombre"
          value={contact.name}
          onChange={(v) => updateContact("name", v)}
          autoComplete="name"
        />
        <ContactField
          label={companyLabel}
          value={contact.company}
          onChange={(v) => updateContact("company", v)}
          autoComplete="organization"
        />
        <ContactField
          label="Email"
          type="email"
          value={contact.email}
          onChange={(v) => updateContact("email", v)}
          autoComplete="email"
        />
        <ContactField
          label="Teléfono"
          type="tel"
          value={contact.phone}
          onChange={(v) => updateContact("phone", v)}
          autoComplete="tel"
        />
      </div>

      {error && (
        <p className="label-mono inline-block w-fit bg-accent px-3 py-2 text-ink">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn btn-accent self-start disabled:opacity-50"
      >
        {status === "submitting" ? "Enviando…" : vertical.formCta}
      </button>
    </form>
  );
}

function ContactField({
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
      <span className="label-mono block text-paper/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="mt-2 w-full border-2 border-paper/40 bg-transparent px-3 py-2.5 text-paper outline-none focus:border-accent"
      />
    </label>
  );
}

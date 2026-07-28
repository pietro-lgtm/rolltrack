"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OptionCard } from "./OptionCard";
import { ProgressBar } from "./ProgressBar";
import { ContactStep, type ContactValue } from "./ContactStep";
import { ResultScreen } from "./ResultScreen";
import { QUESTIONS, TOTAL_STEPS } from "./questions";
import { qualify, parseAnswers, type Answers, type Recommendation } from "./scoring";
import styles from "./empezar.module.css";

type AnswersState = Partial<Record<keyof Answers, string>>;

const EMPTY_CONTACT: ContactValue = { name: "", company: "", email: "", phone: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Questionnaire({ src }: { src: string | null }) {
  // 0..QUESTIONS.length-1 = questions, QUESTIONS.length = contact, +1 = result.
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [contact, setContact] = useState<ContactValue>(EMPTY_CONTACT);
  const [contactError, setContactError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [animKey, setAnimKey] = useState(0);
  // Guards the auto-advance timeout below: a rapid double-click/tap on an
  // option card (or a mis-click followed by a quick correction) would
  // otherwise schedule two independent timeouts and skip a whole question.
  const advanceTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimeout.current !== null) window.clearTimeout(advanceTimeout.current);
    };
  }, []);

  const totalQuestions = QUESTIONS.length;
  const isContactStep = step === totalQuestions;
  const isResultStep = step === totalQuestions + 1;
  const currentQuestion = !isContactStep && !isResultStep ? QUESTIONS[step] : null;

  const selectOption = useCallback((key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    // Big-card research pattern: click advances automatically, brief pause so
    // the selected (yellow) state is visible before the step transitions.
    // Only the first click in a burst schedules the advance — later clicks
    // (double-click, quick re-selection) still update the answer above but
    // don't stack up extra step increments.
    if (advanceTimeout.current !== null) return;
    advanceTimeout.current = window.setTimeout(() => {
      // Clamp: an auto-advance can only ever land on a question or the contact
      // step. A late-firing timeout (throttled background tab) must never push
      // the state machine past contact into a blank out-of-range step.
      setStep((s) => Math.min(s + 1, QUESTIONS.length));
      setAnimKey((k) => k + 1);
      advanceTimeout.current = null;
    }, 150);
  }, []);

  const goBack = useCallback(() => {
    if (advanceTimeout.current !== null) {
      window.clearTimeout(advanceTimeout.current);
      advanceTimeout.current = null;
    }
    setStep((s) => Math.max(0, s - 1));
    setAnimKey((k) => k + 1);
  }, []);

  async function handleContactSubmit(value: ContactValue) {
    // A pending auto-advance from the last question must not fire after we
    // move to the result step.
    if (advanceTimeout.current !== null) {
      window.clearTimeout(advanceTimeout.current);
      advanceTimeout.current = null;
    }
    setContactError(null);

    if (!value.name.trim() || !value.company.trim() || !value.email.trim() || !value.phone.trim()) {
      setContactError("Completá los cuatro campos.");
      return;
    }
    if (!EMAIL_RE.test(value.email.trim())) {
      setContactError("Revisá el email, algo no cuadra.");
      return;
    }

    const parsed = parseAnswers(answers);
    if (!parsed) {
      setContactError("Algo salió mal con tus respuestas. Volvé al inicio e intentá de nuevo.");
      return;
    }

    const { recommendation: rec } = qualify(parsed);
    setContact(value);
    setRecommendation(rec);
    setStep(totalQuestions + 1);
    setAnimKey((k) => k + 1);

    setSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: parsed, contact: value, source: src }),
      });
    } catch {
      // Result screen already shown from the client-side computation; a
      // failed background save doesn't block the user's instant payoff.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {!isResultStep && <ProgressBar step={step + 1} total={TOTAL_STEPS} />}

      <div key={animKey} className={styles.step}>
        {currentQuestion && (
          <div>
            <h1 className="display text-3xl sm:text-5xl">{currentQuestion.title}</h1>
            {currentQuestion.subtitle && (
              <p className="label-mono mt-3 text-mid">{currentQuestion.subtitle}</p>
            )}
            <div className="mt-8 flex flex-col gap-3">
              {currentQuestion.options.map((opt, i) => (
                <OptionCard
                  key={opt.value}
                  index={i}
                  label={opt.label}
                  sub={opt.sub}
                  selected={answers[currentQuestion.key] === opt.value}
                  onClick={() => selectOption(currentQuestion.key, opt.value)}
                />
              ))}
            </div>
          </div>
        )}

        {isContactStep && (
          <ContactStep
            initial={contact}
            error={contactError}
            submitting={submitting}
            onSubmit={handleContactSubmit}
          />
        )}

        {isResultStep && recommendation && (
          <ResultScreen recommendation={recommendation} contact={contact} pending={submitting} />
        )}
      </div>

      {!isResultStep && step > 0 && (
        <button type="button" onClick={goBack} className="label-mono mt-8 block link-under">
          ← atrás
        </button>
      )}
    </div>
  );
}

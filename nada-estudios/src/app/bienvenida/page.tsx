import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { site } from "@/config/site";
import { Reveal } from "@/components/site/Reveal";
import { StepVideo } from "@/components/landings/StepVideo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bienvenida",
  robots: { index: false, follow: false },
};

export default async function BienvenidaPage() {
  const content = await getContent();
  const { intro, steps } = content.onboarding;
  const orderedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Slim black top bar — links home, this is a client-facing page. */}
      <header className="bg-ink text-paper">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="label-mono inline-block border border-paper/40 px-3 py-1.5 transition-colors hover:border-accent hover:bg-accent hover:text-ink"
          >
            NADA estudios
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24">
          <Reveal>
            <h1 className="display mb-6 text-5xl sm:text-6xl md:text-7xl">
              Bienvenido a NADA.
            </h1>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-2xl text-lg text-mid md:text-xl">{intro}</p>
          </Reveal>
        </section>

        {/* Numbered steps */}
        {orderedSteps.length > 0 && (
          <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
            <div className="flex flex-col gap-16">
              {orderedSteps.map((step, i) => (
                <Reveal key={`${step.order}-${step.title}`} delay={i * 0.05}>
                  <div className="border-t-2 border-ink pt-8">
                    <div className="mb-4 flex items-baseline gap-4">
                      <span className="font-mono text-4xl font-semibold text-mid md:text-5xl">
                        {String(step.order).padStart(2, "0")}
                      </span>
                      <h2 className="display text-2xl md:text-3xl">
                        {step.title}
                      </h2>
                    </div>
                    <p className="mb-6 max-w-xl text-mid">
                      {step.description}
                    </p>
                    <StepVideo url={step.videoUrl} />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Dudas */}
        <section className="bg-ink py-16 text-paper">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <Reveal>
              <p className="display mb-4 text-3xl md:text-4xl">¿Dudas?</p>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="label-mono mb-8 text-paper/60">
                Escribinos, con gusto te ayudamos.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={`mailto:${site.email}`}
                  className="label-mono border-2 border-paper px-6 py-3 text-center transition-colors hover:bg-paper hover:text-ink"
                >
                  {site.email}
                </a>
                <a
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-accent text-center"
                >
                  WhatsApp →
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}

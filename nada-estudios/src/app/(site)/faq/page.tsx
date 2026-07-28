import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { packages, addOns, terms, formatUsd } from "@/data/services";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd, faqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Preguntas y precios",
  description:
    "Cuánto cuesta manejar las redes de una empresa en Costa Rica, cuánto cuesta un video para redes, cómo funciona el contrato. Precios reales, sin cotizar.",
  alternates: { canonical: `${site.url}/faq` },
};

const paqueteA = packages.find((p) => p.id === "a")!;
const paqueteC = packages.find((p) => p.id === "c")!;
const grabacionMedioDia = addOns.find((a) => a.id === "medio-dia-grabacion")!;
const edicionMin = addOns.find((a) => a.id === "edicion-1")!;
const fotosCorp = addOns.find((a) => a.id === "fotos-corp-15")!;

const faqs = [
  {
    question: "¿Cuánto cuesta manejar las redes de una empresa en Costa Rica?",
    answer: `Si andás averiguando cuánto cobra una agencia de marketing en Costa Rica, la respuesta honesta es que casi ninguna te lo dice — nosotros sí. Depende de cuánto contenido necesitás al mes, no de cuánto "vale tu marca" — así que no cotizamos por teléfono, publicamos precios. Nuestros paquetes mensuales van de ${formatUsd(
      paqueteA.price,
    )} a ${formatUsd(paqueteC.price)} al mes (contrato mínimo 3 meses), e incluyen video, foto y piezas gráficas. Si solo necesitás algo puntual, los add-ons empiezan desde ${formatUsd(
      edicionMin.price!,
    )}. Todo con precio publicado en /servicios — nada de "contanos tu presupuesto".`,
  },
  {
    question: "¿Cuánto cuesta un video para redes?",
    answer: `Como pieza suelta: edición de un video corto (1–119 seg) desde ${formatUsd(
      edicionMin.price!,
    )}, un día de grabación completo desde ${formatUsd(
      addOns.find((a) => a.id === "dia-grabacion")!.price!,
    )}, medio día desde ${formatUsd(
      grabacionMedioDia.price!,
    )}. Si necesitás varios videos al mes de forma constante, sale más barato en un paquete: el Paquete A (${formatUsd(
      paqueteA.price,
    )}/mes) ya incluye 8 videos verticales, foto y gráfica.`,
  },
  {
    question: "¿Cómo funciona el contrato?",
    answer: `${terms.join(". ")}. Sin letra chiquita: firmás, pagás el 50%, empezamos a producir. El resto se paga al inicio del mes de servicio.`,
  },
  {
    question: "¿Trabajan fuera de Costa Rica?",
    answer:
      "Sí. Tenemos oficinas en San José, Ciudad de México y Nueva York. Producimos en CR y MX para marcas de toda la región, y para marcas de Estados Unidos que buscan producción nearshore: mismo huso horario, calidad de mercado gringo, costo de LatAm.",
  },
  {
    question: "¿Qué incluye un retainer?",
    answer:
      "Un retainer es el paquete mensual: un volumen fijo de videos, fotos y piezas gráficas cada mes, más días de grabación incluidos, revisiones y (según el paquete) consultoría estratégica y reporte de rendimiento. Es la forma más económica de tener contenido constante — ver el detalle exacto de cada paquete en /servicios.",
  },
  {
    question: "¿Hacen solo una sesión de fotos?",
    answer: `Sí, no todo tiene que ser retainer. Fotos corporativas van desde ${formatUsd(
      fotosCorp.price!,
    )} (15 fotos editadas), y fotos de producto desde ${
      addOns.find((a) => a.id === "fotos-prod-studio")!.priceLabel
    } en estudio. Cobertura de un evento puntual: desde ${
      addOns.find((a) => a.id === "cobertura-evento")!.priceLabel
    }.`,
  },
  {
    question: "¿Por qué publican precios si nadie más lo hace?",
    answer:
      "Porque la mayoría de agencias en Costa Rica y México te hacen agendar una llamada para 'entender tu necesidad' antes de hablar de plata — y eso casi siempre significa que el precio depende de cuánto creen que podés pagar. Nosotros tenemos un rate card fijo. Vos decidís si te sirve sin perder una semana en reuniones.",
  },
  {
    question: "¿Qué pasa si necesito más de lo que incluye mi paquete?",
    answer:
      "Los entregables del paquete no son acumulables mes a mes, pero podés agregar cualquier add-on del rate card (grabación extra, edición extra, fotos, campañas especiales) al precio publicado. Revisiones adicionales a las incluidas: $75 c/u.",
  },
  {
    question: "¿Cuánto se demora en empezar un proyecto?",
    answer:
      "Después de firmar y pagar el 50% inicial, arrancamos la producción del primer mes de inmediato. Para campañas puntuales el tiempo depende del alcance — lo definimos en la llamada de kickoff, no antes de tener contrato.",
  },
  {
    question: "¿Trabajan con marcas pequeñas o solo con clientes grandes?",
    answer:
      "Trabajamos con Heineken, Dos Pinos y Banco Promerica, pero el Paquete A y los add-ons individuales están pensados también para empresas más chicas que necesitan contenido consistente sin el overhead de una agencia tradicional.",
  },
];

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs.map(({ question, answer }) => ({ question, answer })))} />

      <section className="border-b-2 border-ink px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="label-mono mb-4 text-mid">Preguntas y precios</p>
            <h1 className="display text-5xl sm:text-6xl md:text-7xl">
              Lo que preguntan
              <br />
              antes de escribirnos.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-mid">
              Sin llamada de descubrimiento para saber cuánto cuesta. Las
              respuestas están acá, con números reales.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl divide-y-2 divide-ink">
          {faqs.map((f, i) => (
            <Reveal key={f.question} delay={Math.min(i * 0.04, 0.3)} as="div">
              <div className="py-10">
                <h2 className="display text-2xl sm:text-3xl">{f.question}</h2>
                <p className="mt-4 max-w-3xl text-mid">{f.answer}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t-2 border-ink bg-ink px-4 py-16 text-paper sm:px-6 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label-mono mb-2 text-accent">¿Algo más?</p>
            <h2 className="display text-3xl sm:text-4xl">
              Mirá el rate card completo.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/servicios" className="btn btn-accent">
              Ver precios →
            </Link>
            <Link href="/empezar" className="btn btn-ghost !border-paper !text-paper hover:!bg-paper hover:!text-ink">
              Empezar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

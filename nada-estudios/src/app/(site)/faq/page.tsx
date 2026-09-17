import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd, faqJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Cómo funciona un retainer, qué incluye, cómo armamos una propuesta y en cuánto tiempo. Producción de video, foto y social media en San José, CDMX y Nueva York.",
  alternates: { canonical: `${site.url}/faq` },
};

const faqs = [
  {
    question: "¿Cuánto cuesta manejar las redes de una empresa en Costa Rica?",
    answer:
      'Depende de cuánto contenido necesitás al mes, no de cuánto "vale tu marca" — por eso no tenemos una tarifa genérica que aplicar a ciegas. Contanos tu proyecto en /empezar (2 minutos) y te armamos una propuesta a tu medida, normalmente en 24–48 horas. Nada de llamada de descubrimiento para llegar a esa respuesta.',
  },
  {
    question: "¿Cuánto cuesta un video para redes?",
    answer:
      "Varía según duración, cantidad de tomas y si es una pieza suelta o parte de un volumen mensual constante (que siempre sale más eficiente en un retainer). Contanos qué necesitás y te cotizamos exactamente eso — sin sorpresas.",
  },
  {
    question: "¿Cómo funciona el contrato?",
    answer:
      "Contrato mínimo 3 meses, 50% al firmar y 50% al inicio de cada mes de servicio, cancelación con 30 días de anticipación. Sin letra chiquita: firmás, pagás el primer 50%, empezamos a producir.",
  },
  {
    question: "¿Trabajan fuera de Costa Rica?",
    answer:
      "Sí. Tenemos oficinas en San José, Ciudad de México y Nueva York. Producimos en CR y MX para marcas de toda la región, y para marcas de Estados Unidos que buscan producción nearshore: mismo huso horario, calidad de mercado gringo, costo de LatAm.",
  },
  {
    question: "¿Qué incluye un retainer?",
    answer:
      "Un retainer es el paquete mensual: un volumen fijo de videos, fotos y piezas gráficas cada mes, más días de grabación incluidos, revisiones y (según el paquete) consultoría estratégica y reporte de rendimiento. Es la forma más eficiente de tener contenido constante — ver el detalle de cada paquete en /servicios.",
  },
  {
    question: "¿Hacen solo una sesión de fotos?",
    answer:
      "Sí, no todo tiene que ser retainer. Fotos corporativas, fotos de producto en estudio o afuera, cobertura de un evento puntual — todo disponible como servicio individual, sin contrato.",
  },
  {
    question: "¿Cómo sé cuánto me va a costar?",
    answer:
      "Nos contás qué necesitás en /empezar y te armamos una propuesta a tu medida — normalmente en 24–48 horas. Preferimos entender bien el proyecto antes de tirar un número, para que la propuesta se ajuste a lo que realmente necesitás, no a un paquete genérico.",
  },
  {
    question: "¿Qué pasa si necesito más de lo que incluye mi paquete?",
    answer:
      "Los entregables del paquete no son acumulables mes a mes, pero podés agregar cualquier add-on (grabación extra, edición extra, fotos, campañas especiales) a tu retainer. Lo cotizamos junto con tu propuesta.",
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
            <p className="label-mono mb-4 text-mid">Preguntas frecuentes</p>
            <h1 className="display text-5xl sm:text-6xl md:text-7xl">
              Lo que preguntan
              <br />
              antes de escribirnos.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-mid">
              Respuestas directas, sin necesidad de agendar una llamada primero.
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
              Mirá todos los servicios.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/servicios" className="btn btn-accent">
              Ver servicios →
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

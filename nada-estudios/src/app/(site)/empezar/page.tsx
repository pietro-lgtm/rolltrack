import type { Metadata } from "next";
import { Questionnaire } from "@/components/empezar/Questionnaire";

export const metadata: Metadata = {
  title: "Empezar",
  description:
    "Siete preguntas, dos minutos. Te decimos qué paquete te conviene y te conectamos por WhatsApp.",
};

export default async function EmpezarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const raw = params.src;
  const src = typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? null) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-24">
      <Questionnaire src={src} />
    </div>
  );
}

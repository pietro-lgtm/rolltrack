import Image from "next/image";
import Link from "next/link";
import type { PortfolioItem } from "@/lib/content";

type Treatment = "paper" | "ink" | "accent";

const TREATMENT_CLASSES: Record<Treatment, string> = {
  paper: "bg-paper text-ink",
  ink: "bg-ink text-paper",
  accent: "bg-accent text-ink",
};

const TREATMENT_MUTED: Record<Treatment, string> = {
  paper: "text-mid",
  ink: "text-paper/60",
  accent: "text-ink/60",
};

/** One /trabajo grid card. Typographic if there's no image, otherwise a photo
 * with a hover-invert client overlay. */
export function PortfolioCard({
  item,
  index,
  treatment,
}: {
  item: PortfolioItem;
  index: number;
  treatment: Treatment;
}) {
  if (item.image) {
    return (
      <Link
        href={`/trabajo/${item.slug}`}
        className="group relative block aspect-[4/5] w-full overflow-hidden border-2 border-ink"
      >
        <Image
          src={`/api/img?p=${encodeURIComponent(item.image)}`}
          alt={item.client}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-ink/0 p-6 transition-colors duration-200 group-hover:bg-ink/85">
          <p className="display translate-y-2 text-3xl text-paper opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:text-4xl">
            {item.client}
          </p>
          <p className="label-mono mt-2 translate-y-2 text-paper/0 opacity-0 transition-all delay-75 duration-200 group-hover:translate-y-0 group-hover:text-paper/70 group-hover:opacity-100">
            {item.tags.join(" · ")} — {item.year}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/trabajo/${item.slug}`}
      className={`group flex h-full min-h-[300px] flex-col justify-between border-2 border-ink p-6 transition-colors sm:p-8 ${TREATMENT_CLASSES[treatment]}`}
    >
      <div className="label-mono flex items-start justify-between gap-4">
        <span className={TREATMENT_MUTED[treatment]}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={TREATMENT_MUTED[treatment]}>{item.year}</span>
      </div>

      <p className="display text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
        {item.client}
      </p>

      <div className="label-mono flex flex-wrap items-center justify-between gap-3">
        <span className={TREATMENT_MUTED[treatment]}>{item.tags.join(" · ")}</span>
        <span className="link-under shrink-0">
          Ver caso <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}

"use client";

const LETTERS = "ABCDEFGH".split("");

/**
 * Big option card: 2px border, mono key letter, hover invert to black,
 * selected = yellow fill. Native <button> so it's keyboard-accessible
 * (Tab + Enter/Space) with no extra wiring.
 */
export function OptionCard({
  index,
  label,
  sub,
  selected = false,
  onClick,
}: {
  index: number;
  label: string;
  sub?: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        selected
          ? "flex w-full items-start gap-4 border-2 border-ink bg-accent px-5 py-4 text-left text-ink transition-colors duration-150"
          : "flex w-full items-start gap-4 border-2 border-ink bg-paper px-5 py-4 text-left text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
      }
    >
      <span className="label-mono mt-0.5 shrink-0 border-2 border-current px-2 py-0.5">
        {LETTERS[index] ?? index + 1}
      </span>
      <span className="flex-1">
        <span className="block text-lg font-semibold sm:text-xl">{label}</span>
        {sub && <span className="label-mono mt-1 block opacity-70">{sub}</span>}
      </span>
    </button>
  );
}

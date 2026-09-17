/** "2 / 7" mono label + thin black progress bar. */
export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.min(100, Math.round((step / total) * 100));
  return (
    <div className="mb-10 sm:mb-14">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="label-mono">
          {step} / {total}
        </span>
        <span className="label-mono text-mid">{pct}%</span>
      </div>
      <div className="h-[3px] w-full bg-smoke">
        <div
          className="h-full bg-ink transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

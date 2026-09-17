import Link from "next/link";

/** Mono uppercase section label with a volt tick — the recurring editorial device. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="label-mono flex items-center gap-2 text-muted">
      <span className="inline-block h-2 w-2 bg-volt" aria-hidden />
      {children}
    </p>
  );
}

const buttonBase =
  "label-mono inline-block px-6 py-4 text-center transition-colors";

export function VoltLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls = `${buttonBase} bg-volt text-black hover:bg-ink`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function GhostLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const cls = `${buttonBase} border border-line text-ink hover:border-volt hover:text-volt`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/** Race-bib style number block. */
export function Bib({ n, label }: { n: string; label?: string }) {
  return (
    <div className="inline-flex flex-col border border-line">
      <span className="display px-4 pt-2 text-4xl text-volt">{n}</span>
      {label && (
        <span className="label-mono border-t hairline px-4 py-1 text-muted">
          {label}
        </span>
      )}
    </div>
  );
}

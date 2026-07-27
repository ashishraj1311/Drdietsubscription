import { cn } from "@/lib/cn";

/**
 * Logo — Dr Diet brand lockup.
 *
 * ⚠️ PLACEHOLDER MARK: the symbol below is a faithful *interpretation* of the
 * guideline's description (a "D" formed from a leaf + a bitten round shape).
 * The official vector could not be traced from the PDF in this environment —
 * replace `LogoSymbol` with the exported asset from `Brand Guideline Dr Diet.pdf`
 * once available. Wordmark + tagline typography already follow the brand.
 *
 * variant: "full" (symbol + wordmark + tagline) | "symbol" | "wordmark"
 * Always renders in --color-primary on light backgrounds (per brand rules).
 */
export function LogoSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("text-primary", className)}
      role="img"
      aria-label="Dr Diet logo mark"
      fill="none"
    >
      {/* Bitten round shape forming the bowl of the "D" */}
      <path
        d="M14 8h16c15 0 26 10 26 24S45 56 30 56H14V8Z"
        fill="currentColor"
      />
      {/* Bite / counter cut-out */}
      <path
        d="M28 18c9 0 15 6 15 14s-6 14-15 14H26V18h2Z"
        fill="var(--color-primary-light)"
      />
      {/* Leaf motif nestled in the counter */}
      <path
        d="M40 24c-9 1-14 6-14 13 6 1 12-2 14-7 1-2 1-4 0-6Z"
        fill="var(--color-accent)"
      />
      <path
        d="M40 24c-6 3-10 7-12 12"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  variant = "full",
  className,
  symbolClassName,
}: {
  variant?: "full" | "symbol" | "wordmark";
  className?: string;
  symbolClassName?: string;
}) {
  if (variant === "symbol") {
    return <LogoSymbol className={cn("h-8 w-8", symbolClassName, className)} />;
  }

  const wordmark = (
    <span className="flex flex-col leading-none">
      <span className="text-[0.6em] font-semibold uppercase tracking-[0.25em] text-primary/70">
        Eat What&apos;s Right
      </span>
      <span className="text-[1.4em] font-bold uppercase tracking-tight text-primary">
        Dr. Diet
      </span>
    </span>
  );

  if (variant === "wordmark") {
    return <div className={cn("text-2xl", className)}>{wordmark}</div>;
  }

  return (
    <div className={cn("flex items-center gap-2.5 text-2xl", className)}>
      <LogoSymbol className={cn("h-10 w-10 shrink-0", symbolClassName)} />
      {wordmark}
    </div>
  );
}

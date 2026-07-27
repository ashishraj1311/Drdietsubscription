import { cn } from "@/lib/cn";

/**
 * SegmentedProgress — the wizard step indicator (Delicut pattern worth adopting).
 * Renders `total` segments; the first `current` are filled with the accent.
 */
export function SegmentedProgress({
  total,
  current,
  className,
  label,
}: {
  total: number;
  current: number;
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={label ?? `Step ${current} of ${total}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < current ? "bg-accent" : "bg-neutral/40",
            )}
          />
        ))}
      </div>
      {label && (
        <p className="text-xs text-muted">
          {label} · Step {current} of {total}
        </p>
      )}
    </div>
  );
}

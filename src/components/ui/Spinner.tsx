import { cn } from "@/lib/cn";

/** Brand spinner — olive ring with an accent arc. */
export function Spinner({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-neutral/30 border-t-primary",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}

/** Full-height centered loader for page/route loading states. */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <Spinner size={28} />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

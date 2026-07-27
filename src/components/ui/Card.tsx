import { cn } from "@/lib/cn";

/**
 * Card — the standard content surface. Hairline border, generous radius, no
 * heavy shadow (per brand: organic/earthy, not glossy-tech).
 *
 * `surface`  = white raised card (default)
 * `canvas`   = cream, blends into the page for nested/secondary panels
 * `selected` = accent-ring emphasis for active/selected states
 */
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "surface" | "canvas";
  interactive?: boolean;
  selected?: boolean;
};

export function Card({
  className,
  tone = "surface",
  interactive = false,
  selected = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden transition-all duration-200",
        // white cards lift off the cream canvas; cream/canvas cards stay flat
        tone === "surface" ? "bg-surface shadow-[var(--shadow-card)]" : "bg-primary-light",
        selected
          ? "border-primary ring-2 ring-accent"
          : "border-border",
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-neutral hover:shadow-[var(--shadow-card-hover)] focus-visible:border-primary",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-4 py-3 border-b border-border", className)}
      {...props}
    />
  );
}

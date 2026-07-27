import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Badge / Tag — small status or metadata label.
 * Used for allergen tags, trust badges (FSSAI), plan states, serviceability, etc.
 */
const badge = cva(
  "inline-flex items-center gap-1 rounded-sm font-semibold leading-none",
  {
    variants: {
      variant: {
        accent: "bg-accent text-primary",
        neutral: "bg-neutral/25 text-primary",
        outline: "border border-border bg-primary-light text-primary",
        success: "bg-success text-primary-light",
        danger: "bg-danger text-primary-light",
        surface: "bg-surface text-muted border border-border",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badge({ variant, size }), className)} {...props} />;
}

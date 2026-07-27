import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Button — the primary interactive control.
 * Variants map to the Dr Diet brand roles:
 *  - primary : olive fill, cream text        (main CTA)
 *  - accent  : chartreuse fill, olive text   (CTA that must pop against olive)
 *  - outline : hairline olive border         (secondary)
 *  - ghost   : text-only                     (tertiary / nav)
 *  - danger  : brick fill                    (destructive, used sparingly)
 */
const button = cva(
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-md transition-colors select-none disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-light hover:bg-primary-hover",
        accent: "bg-accent text-primary hover:bg-accent-hover",
        outline:
          "border border-primary text-primary bg-transparent hover:bg-primary/5",
        ghost: "text-primary bg-transparent hover:bg-primary/5",
        danger: "bg-danger text-primary-light hover:brightness-95",
      },
      size: {
        sm: "h-9 px-3.5 text-xs",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-6 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(button({ variant, size, fullWidth }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

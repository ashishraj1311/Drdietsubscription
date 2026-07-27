import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Logo — Dr Diet brand lockup.
 *
 * Uses the official brand asset (dark-green mark + "DR. DIET" wordmark with the
 * curved "EAT WHAT'S RIGHT" tagline), exported to /public:
 *   - /logo.png          full lockup (mark + wordmark)
 *   - /logo-mark.png     leaf-"D" symbol only
 *   - /logo-wordmark.png "DR. DIET" wordmark only
 *
 * The artwork is a single dark-green colour on transparency, so it sits on the
 * light brand surfaces used throughout the app.
 *
 * variant: "full" (mark + wordmark) | "symbol" | "wordmark"
 */
export function LogoSymbol({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="Dr Diet"
      width={320}
      height={284}
      priority
      className={cn("h-8 w-auto", className)}
    />
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
    return <LogoSymbol className={cn("h-7 w-auto", symbolClassName, className)} />;
  }

  if (variant === "wordmark") {
    return (
      <Image
        src="/logo-wordmark.png"
        alt="Dr Diet"
        width={321}
        height={284}
        priority
        className={cn("h-8 w-auto", className)}
      />
    );
  }

  return (
    <Image
      src="/logo.png"
      alt="Dr Diet — Eat What's Right"
      width={661}
      height={284}
      priority
      className={cn("h-10 w-auto", className)}
    />
  );
}

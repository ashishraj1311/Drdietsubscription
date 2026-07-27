import Link from "next/link";
import { Logo } from "@/components/ui";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-lg items-center justify-between px-4">
          <Link href="/" aria-label="Dr Diet home">
            <Logo variant="symbol" symbolClassName="h-7 w-7" />
          </Link>
          <span className="text-sm font-semibold text-primary">Checkout</span>
          <Link href="/build" className="text-sm text-muted hover:text-primary">
            ← Edit plan
          </Link>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

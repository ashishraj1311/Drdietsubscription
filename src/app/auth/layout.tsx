import Link from "next/link";
import { Logo } from "@/components/ui";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" aria-label="Dr Diet home">
          <Logo variant="full" className="text-lg" />
        </Link>
        <Link href="/" className="text-sm text-muted hover:text-primary">
          ← Back to home
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </div>
    </div>
  );
}

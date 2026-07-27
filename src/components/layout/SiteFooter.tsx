import Link from "next/link";
import { Logo } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <Logo variant="full" className="text-lg" />
          <p className="mt-3 max-w-xs text-xs text-muted">
            Nutritionally balanced meals, delivered on your schedule. Eat what&apos;s
            right — every day.
          </p>
        </div>
        <FooterCol
          title="Explore"
          links={[
            { href: "/explore", label: "Plans" },
            { href: "/menu", label: "This week's menu" },
            { href: "/compare", label: "Compare plans" },
            { href: "/build", label: "Build my plan" },
          ]}
        />
        <FooterCol
          title="Trust"
          links={[
            { href: "/reviews", label: "Reviews" },
            { href: "/faqs", label: "FAQs" },
            { href: "/faqs", label: "FSSAI & safety" },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { href: "/auth", label: "Log in / Sign up" },
            { href: "/dashboard", label: "My dashboard" },
            { href: "/dashboard/support", label: "Contact support" },
          ]}
        />
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Dr Diet · Prices in ₹ (INR) · FSSAI Lic.
        (placeholder)
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map((l, i) => (
          <li key={`${l.href}-${i}`}>
            <Link
              href={l.href}
              className="text-sm text-primary hover:text-muted"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

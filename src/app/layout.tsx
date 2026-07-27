import type { Metadata } from "next";
import { Barlow, Baloo_2 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

// Primary brand font — Barlow (headings, buttons, nav, numerals, body).
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Accent display font. Brand spec calls for "Quity" (paid/licensed). Until the
// Quity license is confirmed, Baloo 2 is a rounded stand-in — swap once licensed.
// See docs/03-DESIGN-SYSTEM.md (Typography).
const baloo2 = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dr Diet — Eat What's Right",
  description:
    "Healthy meal subscriptions for India. Nutritionally balanced meals delivered on a schedule that fits your life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${baloo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

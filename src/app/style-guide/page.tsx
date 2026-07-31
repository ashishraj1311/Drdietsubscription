"use client";

import { useState } from "react";
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Logo,
  LogoSymbol,
  SegmentedProgress,
  Select,
} from "@/components/ui";

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */

const palette = [
  { name: "Primary", token: "primary", hex: "#3E5A33", on: "text-white" },
  { name: "Primary Light", token: "primary-light", hex: "#EEF5EA", on: "text-primary" },
  { name: "Neutral", token: "neutral", hex: "#98A2B3", on: "text-primary" },
  { name: "Accent", token: "accent", hex: "#B8D6A8", on: "text-primary" },
  { name: "Success", token: "success", hex: "#067647", on: "text-white" },
  { name: "Danger", token: "danger", hex: "#D92D20", on: "text-white" },
  { name: "Muted", token: "muted", hex: "#667085", on: "text-white" },
  { name: "Border", token: "border", hex: "#EAECF0", on: "text-primary" },
];

const typeScale = [
  { role: "Display / Hero", cls: "text-4xl font-bold", note: "Barlow Bold · 36px" },
  { role: "Screen title", cls: "text-2xl font-bold", note: "Barlow Bold · 24px" },
  { role: "Section header", cls: "text-lg font-semibold", note: "Barlow SemiBold · 18px" },
  { role: "Body", cls: "text-sm", note: "Barlow Regular · 14px" },
  { role: "Caption / meta", cls: "text-xs text-muted", note: "Barlow Regular · 12px" },
];

const dietTypes = ["Veg", "Non-Veg", "Vegan", "Eggetarian"];

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

function Section({
  title,
  children,
  id,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mb-4 text-lg font-semibold text-primary">{title}</h2>
      <Card>
        <CardBody className="space-y-6">{children}</CardBody>
      </Card>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      <span className="w-32 shrink-0 text-xs uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function StyleGuide() {
  const [selectedDiets, setSelectedDiets] = useState<string[]>(["Veg"]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const toggleDiet = (d: string) =>
    setSelectedDiets((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      {/* Header */}
      <header className="mb-10">
        <Logo variant="full" className="mb-6 text-2xl" />
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Design System
        </h1>
        <p className="mt-2 max-w-prose text-sm text-muted">
          The Dr Diet component library and brand tokens, sourced from{" "}
          <em>Brand Guideline Dr Diet.pdf</em>. Every screen is built from these
          primitives — no ad-hoc hex codes or one-off components.
        </p>
      </header>

      <div className="space-y-10">
        {/* Logo */}
        <Section id="logo" title="Logo">
          <div className="flex flex-wrap items-end gap-10">
            <div className="text-center">
              <Logo variant="full" className="text-2xl" />
              <p className="mt-3 text-xs text-muted">Full lockup</p>
            </div>
            <div className="text-center">
              <LogoSymbol className="h-14 w-auto" />
              <p className="mt-3 text-xs text-muted">Symbol</p>
            </div>
            <div className="text-center">
              <Logo variant="wordmark" className="text-2xl" />
              <p className="mt-3 text-xs text-muted">Wordmark</p>
            </div>
          </div>
        </Section>

        {/* Color */}
        <Section id="color" title="Color palette">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {palette.map((c) => (
              <div
                key={c.token}
                className="overflow-hidden rounded-md border border-border"
              >
                <div
                  className={`flex h-16 items-end p-2 ${c.on}`}
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="text-[11px] font-semibold">{c.hex}</span>
                </div>
                <div className="bg-surface p-2">
                  <p className="text-xs font-semibold text-primary">{c.name}</p>
                  <code className="text-[11px] text-muted">bg-{c.token}</code>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section id="type" title="Typography — Barlow + Quity (Baloo 2 stand-in)">
          <div className="divide-y divide-border">
            {typeScale.map((t) => (
              <div
                key={t.role}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="w-36 shrink-0 text-xs uppercase tracking-wide text-muted">
                  {t.role}
                </span>
                <span className={t.cls}>Eat What&apos;s Right</span>
                <span className="ml-auto text-[11px] text-muted">{t.note}</span>
              </div>
            ))}
            <div className="flex items-baseline gap-6 py-3">
              <span className="w-36 shrink-0 text-xs uppercase tracking-wide text-muted">
                Accent (Quity)
              </span>
              <span className="font-accent text-3xl text-primary">
                Eat What&apos;s Right
              </span>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section id="buttons" title="Buttons">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="States">
            <Button disabled>Disabled</Button>
            <Button variant="accent" disabled>
              Disabled
            </Button>
          </Row>
          <Row label="Full width">
            <div className="w-full sm:w-80">
              <Button fullWidth>Continue to checkout</Button>
            </div>
          </Row>
        </Section>

        {/* Badges */}
        <Section id="badges" title="Badges & tags">
          <Row label="Variants">
            <Badge variant="accent">Trial available</Badge>
            <Badge variant="outline">FSSAI certified</Badge>
            <Badge variant="success">Serviceable</Badge>
            <Badge variant="danger">Not serviceable</Badge>
            <Badge variant="neutral">Vegan</Badge>
            <Badge variant="surface">Contains dairy</Badge>
          </Row>
        </Section>

        {/* Chips */}
        <Section id="chips" title="Chips (selectable)">
          <Row label="Diet type">
            {dietTypes.map((d) => (
              <Chip
                key={d}
                selected={selectedDiets.includes(d)}
                onClick={() => toggleDiet(d)}
              >
                {d}
              </Chip>
            ))}
          </Row>
          <Row label="Locked">
            <Chip selected disabled>
              Lunch (required)
            </Chip>
            <Chip selected disabled>
              Dinner (required)
            </Chip>
            <Chip>Breakfast</Chip>
            <Chip>Evening Snack</Chip>
          </Row>
          <p className="text-xs text-muted">
            Selected: {selectedDiets.join(", ") || "none"}
          </p>
        </Section>

        {/* Cards */}
        <Section id="cards" title="Cards">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardBody>
                <p className="text-sm font-semibold">Surface</p>
                <p className="mt-1 text-xs text-muted">White raised card</p>
              </CardBody>
            </Card>
            <Card tone="canvas">
              <CardBody>
                <p className="text-sm font-semibold">Canvas</p>
                <p className="mt-1 text-xs text-muted">Cream nested panel</p>
              </CardBody>
            </Card>
            <Card selected>
              <CardBody>
                <p className="text-sm font-semibold">Selected</p>
                <p className="mt-1 text-xs text-muted">Active / chosen state</p>
              </CardBody>
            </Card>
          </div>

          {/* Sample meal card */}
          <Card tone="canvas" className="max-w-xs">
            <div className="flex h-28 items-center justify-center bg-neutral/40 text-xs text-muted">
              meal image
            </div>
            <CardBody>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Paneer Power Bowl</h3>
                <span className="text-base font-bold">₹1,760</span>
              </div>
              <p className="mt-1 text-xs text-muted">520 kcal · 38g protein · Lunch</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="surface" size="sm">
                  Contains dairy
                </Badge>
                <Badge variant="neutral" size="sm">
                  Veg
                </Badge>
              </div>
            </CardBody>
          </Card>
        </Section>

        {/* Forms */}
        <Section id="forms" title="Form fields">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" placeholder="Raj Mehta" />
            <Input
              label="Mobile number"
              placeholder="98765 43210"
              hint="We'll send an OTP to verify"
              inputMode="numeric"
            />
            <Input
              label="Pincode"
              placeholder="400001"
              error="We don't deliver to this area yet"
              defaultValue="999999"
            />
            <Select label="City" defaultValue="">
              <option value="" disabled>
                Select city
              </option>
              <option>Mumbai</option>
              <option>Pune</option>
              <option>Bengaluru</option>
            </Select>
          </div>
        </Section>

        {/* Progress */}
        <Section id="progress" title="Wizard progress">
          <SegmentedProgress total={9} current={4} label="Allergies" />
        </Section>

        {/* Bottom sheet */}
        <Section id="sheet" title="Bottom sheet">
          <p className="text-sm text-muted">
            Contextual modal for delivery instructions, filters, payment method, etc.
          </p>
          <Button variant="outline" onClick={() => setSheetOpen(true)}>
            Open delivery instructions
          </Button>
          <BottomSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title="Delivery instructions"
          >
            <div className="flex flex-wrap gap-2">
              {[
                "Don't ring the bell",
                "Leave at door",
                "Avoid calling",
                "Leave with guard",
              ].map((p) => (
                <Chip key={p}>{p}</Chip>
              ))}
            </div>
            <div className="mt-4">
              <Input
                label="Anything else?"
                placeholder="e.g. Flat 4B, blue door on the left"
              />
            </div>
            <div className="mt-5">
              <Button fullWidth onClick={() => setSheetOpen(false)}>
                Save instructions
              </Button>
            </div>
          </BottomSheet>
        </Section>

        {/* Radii */}
        <Section id="radii" title="Corner radii">
          <div className="flex flex-wrap gap-6">
            {[
              { label: "sm · 8px", cls: "rounded-sm" },
              { label: "md · 14px", cls: "rounded-md" },
              { label: "lg · 20px", cls: "rounded-lg" },
            ].map((r) => (
              <div key={r.label} className="text-center">
                <div className={`h-16 w-16 border border-border bg-accent ${r.cls}`} />
                <p className="mt-2 text-xs text-muted">{r.label}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}

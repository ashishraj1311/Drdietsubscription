"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheckBig, HelpCircle, Phone } from "lucide-react";
import { Button, Card, CardBody, Select } from "@/components/ui";

export default function SupportPage() {
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact support</h1>
        <p className="text-sm text-muted">We usually reply within a few hours.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card tone="canvas">
          <CardBody>
            <Phone size={22} className="text-primary" aria-hidden />
            <p className="mt-2 font-bold">Book a free call</p>
            <p className="text-xs text-muted">A 10-minute chat with our nutrition team.</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => alert("Demo — scheduling not wired.")}
            >
              Pick a time
            </Button>
          </CardBody>
        </Card>
        <Card tone="canvas">
          <CardBody>
            <HelpCircle size={22} className="text-primary" aria-hidden />
            <p className="mt-2 font-bold">Browse FAQs</p>
            <p className="text-xs text-muted">Delivery, nutrition, billing and more.</p>
            <Link href="/faqs">
              <Button size="sm" variant="outline" className="mt-3">Open FAQs</Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          {sent ? (
            <div className="py-6 text-center">
              <CircleCheckBig size={36} className="mx-auto text-success" aria-hidden />
              <p className="mt-3 font-bold">Message sent</p>
              <p className="text-sm text-muted">
                Thanks — we&apos;ll get back to you by email shortly.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => setSent(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-3"
            >
              <Select label="Topic" value={subject} onChange={(e) => setSubject(e.target.value)} required>
                <option value="">Select a topic</option>
                <option>Delivery issue</option>
                <option>Change my plan</option>
                <option>Billing question</option>
                <option>Something else</option>
              </Select>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary" htmlFor="msg">
                  Message
                </label>
                <textarea
                  id="msg"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral focus:outline-none focus-visible:border-primary"
                  placeholder="How can we help?"
                />
              </div>
              <Button type="submit" disabled={!subject || !message.trim()}>
                Send message
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

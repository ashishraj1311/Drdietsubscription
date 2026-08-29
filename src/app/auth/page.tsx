"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardBody, Input, PageLoader } from "@/components/ui";
import { TrustBadges } from "@/components/shared/bits";
import { useAuth } from "@/lib/providers";

export default function AuthPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthClient />
    </Suspense>
  );
}

function AuthClient() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/build";
  const { requestOtp, verifyOtp, sendEmailLink } = useAuth();

  const [step, setStep] = useState<"method" | "otp" | "emailSent">("method");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<null | "otp" | "email" | "verify">(null);
  const [error, setError] = useState<string | null>(null);

  const cleanPhone = phone.replace(/\D/g, "");
  const phoneValid = cleanPhone.length === 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function emailLink() {
    setError(null);
    setLoading("email");
    try {
      const res = await sendEmailLink(email.trim());
      if (res.user) {
        // Mock backend signs in immediately.
        router.push(redirect);
        return;
      }
      setStep("emailSent"); // real backend: await the link click
    } catch {
      setError("Couldn't send the email. Check the address and try again.");
    } finally {
      setLoading(null);
    }
  }

  async function sendOtp() {
    setError(null);
    setLoading("otp");
    try {
      const { devCode } = await requestOtp(cleanPhone);
      setDevCode(devCode);
      setStep("otp");
    } catch {
      setError("Couldn't send the code. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function verify() {
    setError(null);
    setLoading("verify");
    try {
      await verifyOtp(cleanPhone, code.trim());
      router.push(redirect);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setLoading(null);
    }
  }

  const heading =
    step === "otp"
      ? "Verify your number"
      : step === "emailSent"
        ? "Check your inbox"
        : "Log in or sign up";
  const subheading =
    step === "otp"
      ? `We sent a code to +91 ${cleanPhone}`
      : step === "emailSent"
        ? `We emailed a sign-in link to ${email.trim()}`
        : "Sign in with your email or mobile number to continue.";

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <p className="font-accent text-2xl text-primary/80">Welcome to Dr Diet</p>
        <h1 className="text-2xl font-bold">{heading}</h1>
        <p className="mt-1 text-sm text-muted">{subheading}</p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          {step === "method" && (
            <>
              <Input
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="We'll email you a one-tap sign-in link."
                error={error ?? undefined}
              />
              <Button
                fullWidth
                disabled={!emailValid || loading === "email"}
                onClick={emailLink}
              >
                {loading === "email" ? "Emailing link…" : "Email me a sign-in link"}
              </Button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Input
                label="Mobile number"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                hint="India (+91). We'll send a one-time password."
              />
              <Button
                fullWidth
                variant="outline"
                disabled={!phoneValid || loading === "otp"}
                onClick={sendOtp}
              >
                {loading === "otp" ? "Sending code…" : "Send OTP"}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              {devCode && (
                <div className="rounded-md border border-border bg-primary-light p-3 text-center text-sm">
                  Demo mode — your code is{" "}
                  <span className="font-bold tracking-widest">{devCode}</span>
                </div>
              )}
              <Input
                label="Enter OTP"
                inputMode="numeric"
                placeholder="one-time code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={error ?? undefined}
                maxLength={6}
              />
              <Button
                fullWidth
                disabled={code.trim().length < 4 || loading === "verify"}
                onClick={verify}
              >
                {loading === "verify" ? "Verifying…" : "Verify & continue"}
              </Button>
              <button
                className="w-full text-center text-sm text-muted hover:text-primary"
                onClick={() => {
                  setStep("method");
                  setCode("");
                  setError(null);
                }}
              >
                ← Use a different number
              </button>
            </>
          )}

          {step === "emailSent" && (
            <>
              <div className="rounded-md border border-border bg-primary-light p-4 text-center text-sm text-primary">
                Open the email <span className="font-semibold">on this device</span> and
                tap the sign-in link. You&apos;ll come back here already logged in.
              </div>
              <p className="text-center text-xs text-muted">
                No email after a minute? Check spam, or try again — free-tier email is
                rate-limited to a few per hour.
              </p>
              <button
                className="w-full text-center text-sm text-muted hover:text-primary"
                onClick={() => {
                  setStep("method");
                  setError(null);
                }}
              >
                ← Use a different email
              </button>
            </>
          )}
        </CardBody>
      </Card>

      <p className="mt-4 text-center text-[11px] text-muted">
        Browse Explore &amp; Compare freely — sign in to build and order your plan.
      </p>
      <TrustBadges className="mt-4 justify-center" />
    </div>
  );
}

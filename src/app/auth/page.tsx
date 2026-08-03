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
  const { requestOtp, verifyOtp, requestEmailOtp, verifyEmailOtp, googleSignIn, continueAsGuest } =
    useAuth();

  const [step, setStep] = useState<"method" | "otp">("method");
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<
    null | "otp" | "email" | "verify" | "google" | "guest"
  >(null);
  const [error, setError] = useState<string | null>(null);

  const cleanPhone = phone.replace(/\D/g, "");
  const phoneValid = cleanPhone.length === 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const destination = channel === "phone" ? `+91 ${cleanPhone}` : email.trim();

  async function sendOtp() {
    setError(null);
    setChannel("phone");
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

  async function sendEmailOtp() {
    setError(null);
    setChannel("email");
    setLoading("email");
    try {
      const { devCode } = await requestEmailOtp(email.trim());
      setDevCode(devCode);
      setStep("otp");
    } catch {
      setError("Couldn't send the code. Please check the email and try again.");
    } finally {
      setLoading(null);
    }
  }

  async function verify() {
    setError(null);
    setLoading("verify");
    try {
      if (channel === "email") await verifyEmailOtp(email.trim(), code.trim());
      else await verifyOtp(cleanPhone, code.trim());
      router.push(redirect);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setLoading(null);
    }
  }

  async function google() {
    setLoading("google");
    try {
      await googleSignIn();
      router.push(redirect);
    } finally {
      setLoading(null);
    }
  }

  async function guest() {
    setLoading("guest");
    try {
      await continueAsGuest();
      router.push(redirect);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <p className="font-accent text-2xl text-primary/80">Welcome to Dr Diet</p>
        <h1 className="text-2xl font-bold">
          {step === "method" ? "Log in or sign up" : "Verify it's you"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {step === "method"
            ? "Sign in with email or mobile. You can also browse as a guest."
            : `We sent a code to ${destination}`}
        </p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          {step === "method" ? (
            <>
              <Input
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="We'll email you a one-time code."
                error={channel === "email" ? error ?? undefined : undefined}
              />
              <Button
                fullWidth
                disabled={!emailValid || loading === "email"}
                onClick={sendEmailOtp}
              >
                {loading === "email" ? "Emailing code…" : "Email me a code"}
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
                error={channel === "phone" ? error ?? undefined : undefined}
              />
              <Button
                fullWidth
                variant="outline"
                disabled={!phoneValid || loading === "otp"}
                onClick={sendOtp}
              >
                {loading === "otp" ? "Sending code…" : "Send OTP"}
              </Button>

              <Button
                fullWidth
                variant="outline"
                disabled={loading === "google"}
                onClick={google}
              >
                {loading === "google" ? "Connecting…" : "Continue with Google"}
              </Button>
              <Button
                fullWidth
                variant="ghost"
                disabled={loading === "guest"}
                onClick={guest}
              >
                {loading === "guest" ? "One sec…" : "Continue as guest"}
              </Button>
            </>
          ) : (
            <>
              {devCode && (
                <div className="rounded-md border border-border bg-primary-light p-3 text-center text-sm">
                  Demo mode — your code is{" "}
                  <span className="font-bold tracking-widest">{devCode}</span>
                </div>
              )}
              <Input
                label="Enter code"
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
                ← Use a different {channel === "email" ? "email" : "number"}
              </button>
            </>
          )}
        </CardBody>
      </Card>

      <p className="mt-4 text-center text-[11px] text-muted">
        Guest browsing is open through Explore & Compare. You&apos;ll be asked to
        verify only at checkout.
      </p>
      <TrustBadges className="mt-4 justify-center" />
    </div>
  );
}

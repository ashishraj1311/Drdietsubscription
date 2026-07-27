"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardBody, Input } from "@/components/ui";
import { TrustBadges } from "@/components/shared/bits";
import { useAuth } from "@/lib/providers";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
      <AuthClient />
    </Suspense>
  );
}

function AuthClient() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/build";
  const { requestOtp, verifyOtp, googleSignIn, continueAsGuest } = useAuth();

  const [step, setStep] = useState<"method" | "otp">("method");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<null | "otp" | "verify" | "google" | "guest">(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const cleanPhone = phone.replace(/\D/g, "");
  const phoneValid = cleanPhone.length === 10;

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
          {step === "method" ? "Log in or sign up" : "Verify your number"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {step === "method"
            ? "Mobile OTP is fastest. You can also browse as a guest."
            : `We sent a 4-digit code to +91 ${cleanPhone}`}
        </p>
      </div>

      <Card>
        <CardBody className="space-y-4">
          {step === "method" ? (
            <>
              <Input
                label="Mobile number"
                inputMode="numeric"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                hint="India (+91). We'll send a one-time password."
                error={error ?? undefined}
              />
              <Button
                fullWidth
                disabled={!phoneValid || loading === "otp"}
                onClick={sendOtp}
              >
                {loading === "otp" ? "Sending code…" : "Send OTP"}
              </Button>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>

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
                label="Enter OTP"
                inputMode="numeric"
                placeholder="4-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                error={error ?? undefined}
                maxLength={4}
              />
              <Button
                fullWidth
                disabled={code.trim().length !== 4 || loading === "verify"}
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

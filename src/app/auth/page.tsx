"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, CardBody, Input, OtpInput, PageLoader } from "@/components/ui";
import { TrustBadges } from "@/components/shared/bits";
import { useAuth } from "@/lib/providers";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

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
  const { requestOtp, verifyOtp, requestEmailOtp, verifyEmailOtp } = useAuth();

  const [step, setStep] = useState<"method" | "otp">("method");
  const [channel, setChannel] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<null | "otp" | "email" | "verify" | "resend">(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const cleanPhone = phone.replace(/\D/g, "");
  const phoneValid = cleanPhone.length === 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const destination = channel === "phone" ? `+91 ${cleanPhone}` : email.trim();

  // Resend countdown tick.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function request(ch: "phone" | "email") {
    setError(null);
    setChannel(ch);
    setLoading(ch === "phone" ? "otp" : "email");
    try {
      const { devCode } =
        ch === "phone" ? await requestOtp(cleanPhone) : await requestEmailOtp(email.trim());
      setDevCode(devCode || null);
      setCode("");
      setStep("otp");
      setCooldown(RESEND_SECONDS);
    } catch {
      setError(
        ch === "phone"
          ? "Couldn't send the code. Please try again."
          : "Couldn't send the code. Check the email and try again.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setError(null);
    setLoading("resend");
    try {
      const { devCode } =
        channel === "phone"
          ? await requestOtp(cleanPhone)
          : await requestEmailOtp(email.trim());
      setDevCode(devCode || null);
      setCode("");
      setCooldown(RESEND_SECONDS);
    } catch {
      setError("Couldn't resend the code. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function verify(submitCode = code) {
    if (submitCode.trim().length < CODE_LENGTH || loading === "verify") return;
    setError(null);
    setLoading("verify");
    try {
      if (channel === "email") await verifyEmailOtp(email.trim(), submitCode.trim());
      else await verifyOtp(cleanPhone, submitCode.trim());
      router.push(redirect);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That code didn't work. Please try again.");
      setCode("");
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
            ? "Sign in with a one-time code by email or mobile."
            : `Enter the ${CODE_LENGTH}-digit code sent to ${destination}`}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && emailValid) request("email");
                }}
              />
              <Button
                fullWidth
                disabled={!emailValid || loading === "email"}
                onClick={() => request("email")}
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
                hint="India (+91). We'll text you a one-time code."
                error={channel === "phone" ? error ?? undefined : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && phoneValid) request("phone");
                }}
              />
              <Button
                fullWidth
                variant="outline"
                disabled={!phoneValid || loading === "otp"}
                onClick={() => request("phone")}
              >
                {loading === "otp" ? "Sending code…" : "Send OTP"}
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

              <OtpInput
                value={code}
                onChange={setCode}
                onComplete={(c) => verify(c)}
                length={CODE_LENGTH}
                disabled={loading === "verify"}
                error={!!error}
                autoFocus
              />
              {error && <p className="text-center text-xs text-danger">{error}</p>}

              <Button
                fullWidth
                disabled={code.trim().length < CODE_LENGTH || loading === "verify"}
                onClick={() => verify()}
              >
                {loading === "verify" ? "Verifying…" : "Verify & continue"}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  className="text-muted hover:text-primary"
                  onClick={() => {
                    setStep("method");
                    setCode("");
                    setError(null);
                    setCooldown(0);
                  }}
                >
                  ← Change {channel === "email" ? "email" : "number"}
                </button>
                <button
                  className="font-semibold text-primary disabled:text-muted disabled:no-underline hover:underline"
                  disabled={cooldown > 0 || loading === "resend"}
                  onClick={resend}
                >
                  {loading === "resend"
                    ? "Resending…"
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "Resend code"}
                </button>
              </div>
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

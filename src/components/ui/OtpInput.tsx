"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

/**
 * Segmented one-time-code input: one box per digit, numeric-only, with
 * auto-advance, backspace-to-previous, arrow-key nav, and full-code paste.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled,
  error,
  autoFocus,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  function commit(next: string) {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  }

  function handleChange(i: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const arr = value.split("");
    arr[i] = digit;
    commit(arr.join(""));
    inputs.current[Math.min(i + 1, length - 1)]?.focus();
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = value.split("");
      if (arr[i]) {
        arr[i] = "";
        commit(arr.join(""));
      } else if (i > 0) {
        arr[i - 1] = "";
        commit(arr.join(""));
        inputs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      inputs.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    const clean = commit(pasted);
    inputs.current[Math.min(clean.length, length - 1)]?.focus();
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="One-time code">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={!!error}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 w-full min-w-0 rounded-md border bg-surface text-center text-lg font-bold text-primary transition-shadow focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:opacity-55 disabled:cursor-not-allowed",
            error ? "border-danger" : "border-border",
          )}
        />
      ))}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

/**
 * BottomSheet — contextual modal that slides up from the bottom edge.
 * Brand-specified pattern for delivery instructions, filters, payment method,
 * "why you'll love our menu", etc. Controlled via `open` / `onClose`.
 * Closes on Escape and backdrop click; locks body scroll while open.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center transition-opacity",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className="absolute inset-0 bg-primary/40"
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full max-w-md rounded-t-lg bg-surface shadow-[var(--shadow-sheet)] transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
          className,
        )}
      >
        {/* Grabber */}
        <div className="flex justify-center pt-3">
          <span className="h-1 w-10 rounded-full bg-neutral/50" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pb-2 pt-3">
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-muted hover:text-primary"
            >
              ✕
            </button>
          </div>
        )}
        <div className="max-h-[75vh] overflow-y-auto px-5 pb-6 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

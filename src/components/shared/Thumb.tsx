"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Thumb — image tile for meal/plan/goal cards.
 *
 * Renders the real photo at `src`; if that file doesn't exist yet (or fails to
 * load) it silently falls back to a branded gradient tile with the dish emoji.
 * This lets you drop photos into /public and have them appear automatically,
 * with no broken-image icons in the meantime.
 *
 * Convention (see /public/meals/README.txt and /public/plans/README.txt):
 *   meal m-poha  -> /public/meals/m-poha.jpg
 *   plan p-lean  -> /public/plans/p-lean.jpg
 */
export function Thumb({
  src,
  emoji,
  alt,
  className,
}: {
  src?: string;
  emoji: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // Catch a 404 that resolved before hydration attached the onError handler
  // (syncs React state with the <img> element's actual load result).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setFailed(false);
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [src]);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={src}
        alt={alt ?? ""}
        onError={() => setFailed(true)}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-primary-light to-neutral/30 text-5xl select-none",
        className,
      )}
      aria-hidden
    >
      {emoji}
    </div>
  );
}

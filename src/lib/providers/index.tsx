"use client";

import { AuthProvider } from "./AuthProvider";
import { BuilderProvider } from "./BuilderProvider";

/** Composes all client-side context providers. Mounted once in the root layout. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BuilderProvider>{children}</BuilderProvider>
    </AuthProvider>
  );
}

export { useAuth } from "./AuthProvider";
export { useBuilder } from "./BuilderProvider";

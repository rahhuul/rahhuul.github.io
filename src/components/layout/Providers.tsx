"use client";

import { ReactNode } from "react";
import { SmoothScrollProvider } from "@/hooks/useLenis";

/**
 * Providers  client-side wrapper for all context providers.
 * Keeps layout.tsx as a server component while enabling client features.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}

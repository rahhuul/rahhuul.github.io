"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  createElement,
} from "react";
import { ReactLenis, useLenis as useLenisHook, LenisRef } from "lenis/react";
import { ScrollTrigger, gsap } from "@/lib/gsap-config";
import { LENIS_OPTIONS } from "@/lib/lenis-config";

// ─────────────────────────────────────────────
// Context  exposes programmatic scrollTo
// ─────────────────────────────────────────────

interface SmoothScrollContextValue {
  scrollTo: (
    target: string | number | HTMLElement,
    options?: Record<string, unknown>
  ) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  scrollTo: () => {},
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

// ─────────────────────────────────────────────
// GSAP ↔ Lenis sync  must be inside ReactLenis tree
// ─────────────────────────────────────────────

function GsapLenisSync() {
  const lenisInstance = useLenisHook();
  const rafRef = useRef<((time: number) => void) | null>(null);

  // Keep ScrollTrigger in sync on every Lenis scroll event
  useLenisHook(() => {
    ScrollTrigger.update();
  });

  // Drive Lenis RAF from GSAP ticker for frame-perfect sync
  useEffect(() => {
    if (!lenisInstance) return;

    rafRef.current = (time: number) => {
      lenisInstance.raf(time * 1000);
    };

    gsap.ticker.add(rafRef.current);
    gsap.ticker.lagSmoothing(0);

    return () => {
      if (rafRef.current) {
        gsap.ticker.remove(rafRef.current);
      }
    };
  }, [lenisInstance]);

  return null;
}

// ─────────────────────────────────────────────
// Provider  createElement avoids needing .tsx extension
// ─────────────────────────────────────────────

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<LenisRef>(null);

  const scrollTo: SmoothScrollContextValue["scrollTo"] = (target, options) => {
    if (lenisRef.current?.lenis) {
      lenisRef.current.lenis.scrollTo(
        target as Parameters<typeof lenisRef.current.lenis.scrollTo>[0],
        options
      );
    }
  };

  // ReactLenis wraps everything; GsapLenisSync lives inside it
  const lenisChildren = [
    createElement(GsapLenisSync, { key: "gsap-sync" }),
    children,
  ];

  return createElement(
    SmoothScrollContext.Provider,
    { value: { scrollTo } },
    createElement(
      ReactLenis,
      { root: true, ref: lenisRef, options: LENIS_OPTIONS },
      ...lenisChildren
    )
  );
}

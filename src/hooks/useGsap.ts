"use client";

import { useEffect, useRef, DependencyList, RefObject } from "react";
import { gsap } from "@/lib/gsap-config";

/**
 * useGsap  scoped GSAP context that auto-reverts on unmount.
 *
 * Usage:
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   useGsap((ctx) => {
 *     gsap.from('.my-element', { opacity: 0, y: 20 });
 *   }, containerRef, [dependency]);
 *
 * All GSAP selectors inside the callback are scoped to `scopeRef`,
 * so they don't accidentally target elements outside the component.
 */
export function useGsap(
  callback: (context: gsap.Context) => void | (() => void),
  scopeRef: RefObject<HTMLElement | null>,
  deps: DependencyList = []
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    // Don't run during SSR
    if (typeof window === "undefined") return;
    if (!scopeRef.current) return;

    const ctx = gsap.context((self) => {
      callbackRef.current(self);
    }, scopeRef);

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * useGsapTimeline  returns a timeline that auto-kills on unmount.
 * Useful for sequenced entry animations.
 */
export function useGsapTimeline(deps: DependencyList = []) {
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const getTimeline = () => {
    if (!tlRef.current) {
      tlRef.current = gsap.timeline();
    }
    return tlRef.current;
  };

  return getTimeline;
}

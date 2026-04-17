"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

/**
 * ScrollProgress  2px bar fixed at the very top of the viewport.
 * Fills left-to-right as the user scrolls down the page.
 * Always visible on all screen sizes.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const bar = barRef.current;
    if (!bar) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Still show progress, just no smooth animation
      const handler = () => {
        const el = document.documentElement;
        const progress = window.scrollY / (el.scrollHeight - el.clientHeight);
        const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
        bar.style.transform = `scaleX(${pct / 100})`;
        setProgressValue(pct);
      };
      window.addEventListener("scroll", handler, { passive: true });
      return () => window.removeEventListener("scroll", handler);
    }

    // Track percentage for aria-valuenow
    const scrollHandler = () => {
      const el = document.documentElement;
      const pct = Math.round(
        Math.min(1, Math.max(0, window.scrollY / (el.scrollHeight - el.clientHeight))) * 100
      );
      setProgressValue(pct);
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });

    // GSAP scrub  pixel-perfect sync with scroll
    const tween = gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0,
        },
      }
    );

    return () => {
      window.removeEventListener("scroll", scrollHandler);
      tween.kill();
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === document.body)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progressValue}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        transformOrigin: "left",
        transform: "scaleX(0)",
        zIndex: 1000,
        background: "var(--color-accent)",
        pointerEvents: "none",
      }}
      ref={barRef}
    />
  );
}

"use client";

import { useState, useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * useScrollProgress  returns current page scroll progress as a value 0–1.
 * Driven by Lenis scroll events for accuracy with smooth scroll.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useLenis(({ progress: p }) => {
    setProgress(p);
  });

  // Fallback for cases where Lenis isn't mounted yet
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = window.scrollY;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;
      setProgress(scrollTop / maxScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

/**
 * useScrollDirection  returns 'up' or 'down' based on scroll direction.
 */
export function useScrollDirection(): "up" | "down" {
  const [direction, setDirection] = useState<"up" | "down">("down");

  useLenis(({ direction: d }) => {
    if (d === 1) setDirection("down");
    else if (d === -1) setDirection("up");
  });

  return direction;
}

/**
 * useScrollY  returns raw scroll Y position.
 */
export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0);

  useLenis(({ scroll }) => {
    setScrollY(scroll);
  });

  return scrollY;
}

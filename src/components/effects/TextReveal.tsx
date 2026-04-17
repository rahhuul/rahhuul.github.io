"use client";

import React, {
  useEffect,
  useRef,
  ElementType,
  ReactNode,
  HTMLAttributes,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

interface TextRevealProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  staggerSpeed?: number;
  /** If true, animates immediately on mount (no scroll trigger) */
  immediate?: boolean;
  /** ScrollTrigger start offset, default "top 85%" */
  start?: string;
}

/**
 * TextReveal  splits text into characters and staggers them in on scroll.
 * Uses Splitting.js for the char split, GSAP for animation.
 *
 * IMPORTANT: `children` should be a plain string for splitting to work.
 * For multi-line strings, use \n in the string  it will be preserved.
 */
export function TextReveal({
  children,
  as: Tag = "div",
  delay = 0,
  staggerSpeed = 0.03,
  immediate = false,
  start = "top 85%",
  className = "",
  ...rest
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = containerRef.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    // Dynamically import Splitting.js (client-only)
    import("splitting").then(({ default: Splitting }) => {
      if (!el) return;

      // Run Splitting on the element
      const results = Splitting({ target: el, by: "chars" });
      const chars = results[0]?.chars ?? [];

      if (chars.length === 0) return;

      // Initial state  hide all chars
      gsap.set(chars, { opacity: 0, y: 20, rotateX: -15 });

      if (immediate) {
        // Animate immediately (used for hero section)
        animationRef.current = gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: staggerSpeed,
          delay,
        });
      } else {
        // Animate when scrolled into view
        animationRef.current = gsap.to(chars, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: staggerSpeed,
          delay,
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: "play none none none",
            onEnter: () => {
              // Ensure it plays
            },
          },
        });

        // Keep a reference to the ScrollTrigger for cleanup
        const st = ScrollTrigger.getAll().at(-1);
        if (st) triggerRef.current = st;
      }
    });

    return () => {
      animationRef.current?.kill();
      triggerRef.current?.kill();
    };
  }, [delay, staggerSpeed, immediate, start]);

  const TagEl = Tag as React.ElementType;

  return (
    <TagEl
      ref={containerRef}
      className={`text-reveal ${className}`}
      {...rest}
    >
      {children}
    </TagEl>
  );
}

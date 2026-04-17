"use client";

import React, {
  useEffect,
  useRef,
  ReactNode,
  HTMLAttributes,
  ElementType,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

type Direction = "up" | "down" | "left" | "right";

interface FadeInOnScrollProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  duration?: number;
  direction?: Direction;
  /** ScrollTrigger start offset, default "top 88%" */
  start?: string;
  /** Distance to move (px), default 30 */
  distance?: number;
  /** If true, animates immediately on mount (no scroll trigger) */
  immediate?: boolean;
}

function getFromVars(
  direction: Direction,
  distance: number
): gsap.TweenVars {
  const map: Record<Direction, gsap.TweenVars> = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };
  return { ...map[direction], opacity: 0 };
}

/**
 * FadeInOnScroll  fades children into view as they enter the viewport.
 * Respects prefers-reduced-motion.
 */
export function FadeInOnScroll({
  children,
  as: Tag = "div",
  delay = 0,
  duration = 0.8,
  direction = "up",
  start = "top 88%",
  distance = 30,
  immediate = false,
  className = "",
  style,
  ...rest
}: FadeInOnScrollProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Content is already visible  CSS .fade-in-scroll rule handles it
      return;
    }

    // Hide then animate in  only in motion-ok environments
    const fromVars = getFromVars(direction, distance);
    gsap.set(el, fromVars);

    const tweenVars: gsap.TweenVars = {
      opacity: 1,
      x: 0,
      y: 0,
      duration,
      ease: "power2.out",
      delay,
    };

    if (!immediate) {
      tweenVars.scrollTrigger = {
        trigger: el,
        start,
        toggleActions: "play none none none",
      };
    }

    const tween = gsap.to(el, tweenVars);

    return () => {
      tween.kill();
      // Kill associated ScrollTrigger
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === el)
        .forEach((st) => st.kill());
    };
  }, [delay, duration, direction, start, distance, immediate]);

  const TagEl = Tag as React.ElementType;

  return (
    <TagEl
      ref={ref}
      className={`fade-in-scroll ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </TagEl>
  );
}

"use client";

import { useEffect, useRef, ReactNode, HTMLAttributes } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

interface ParallaxLayerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * Speed multiplier. Range: -50 to 50.
   * Positive = moves slower than scroll (recedes)
   * Negative = moves faster than scroll (advances)
   * 0 = no parallax
   * Default: 20
   */
  speed?: number;
  /** ScrollTrigger trigger element  defaults to this component's parent */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * ParallaxLayer  moves children at a different scroll speed.
 * Only transforms Y position; never touches layout properties.
 * Disabled on mobile (< 768px) and with prefers-reduced-motion.
 */
export function ParallaxLayer({
  children,
  speed = 20,
  triggerRef,
  className = "",
  ...rest
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.innerWidth < 768;

    if (prefersReducedMotion || isMobile) return;

    // Amount to shift: positive speed = shift up (negative y) as you scroll down
    const yMovement = speed * -1;

    const tween = gsap.to(el, {
      y: `${yMovement}%`,
      ease: "none",
      scrollTrigger: {
        trigger: triggerRef?.current ?? el.parentElement ?? el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          stRef.current = self;
        },
      },
    });

    return () => {
      tween.kill();
      stRef.current?.kill();
      gsap.set(el, { y: 0 });
    };
  }, [speed, triggerRef]);

  return (
    <div
      ref={ref}
      className={`parallax-layer will-change-transform ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

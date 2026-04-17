"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

export function Chapter01Hook() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  // Guard against React 18 StrictMode double-invocation, which causes
  // Splitting.js to run twice → nested .char spans → animation targets
  // already-animated (opacity ~0) elements and never reaches opacity:1.
  const didInit = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (didInit.current) return;
    didInit.current = true;

    const section = sectionRef.current;
    const content = contentRef.current;
    const headline = headlineRef.current;
    const name = nameRef.current;
    const indicator = indicatorRef.current;
    const watermark = watermarkRef.current;

    if (!section || !content || !headline || !name || !indicator) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set([headline, name, indicator], { opacity: 1, y: 0 });
      return;
    }

    // ── Initial states ──
    gsap.set(headline, { opacity: 0 });
    gsap.set(name, { opacity: 0, y: 30 });
    gsap.set(indicator, { opacity: 0 });

    // ── Entry sequence ──
    import("splitting").then(({ default: Splitting }) => {
      if (!headline) return;

      // Strip any previous split before re-splitting (safety for HMR)
      headline.innerHTML = headline.textContent ?? headline.innerHTML;
      Splitting({ target: headline, by: "chars" });
      const chars = headline.querySelectorAll<HTMLElement>(".char");

      const tl = gsap.timeline({ delay: 0.5 });

      tl.set(headline, { opacity: 1 })
        // Use fromTo so the end state is always opacity:1  immune to cascade issues.
        .fromTo(
          chars,
          { opacity: 0, y: 16, rotateX: -20 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.036,
          }
        )
        .to(
          name,
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "+=0.8"
        )
        .to(
          indicator,
          { opacity: 1, duration: 0.6, ease: "power2.out" },
          "+=0.35"
        );
    });

    // ── Parallax: inner content wrapper drifts up on scroll exit ──
    gsap.to(content, {
      y: -60,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // ── RP watermark: slower counter-drift ──
    if (watermark) {
      gsap.to(watermark, {
        y: 80,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    // Section has overflow:hidden to clip the watermark  but we no longer
    // apply y to this element, so the clip doesn't break parallax.
    <section
      ref={sectionRef}
      id="chapter-hook"
      aria-labelledby="hook-heading"
      style={{
        minHeight: "100dvh",
        background: "#141414",
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* FIX 2: Watermark  absolute, gets its own slower parallax */}
      <div
        ref={watermarkRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          userSelect: "none",
          fontFamily: "var(--font-playfair)",
          fontSize: "clamp(10rem, 28vw, 26rem)",
          color: "rgba(255,255,255,0.022)",
          lineHeight: 1,
          zIndex: 0,
          willChange: "transform",
        }}
      >
        RP
      </div>

      {/* FIX 1: Inner content wrapper  this is what scrolls/fades on exit */}
      <div
        ref={contentRef}
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(2rem, 5vw, 5rem)",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          willChange: "transform, opacity",
        }}
      >
        {/* Headline */}
        <p
          ref={headlineRef}
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(1.35rem, 3.2vw, 2.6rem)",
            fontStyle: "italic",
            color: "#e8e0d4",
            lineHeight: 1.38,
            maxWidth: "660px",
            opacity: 0,
          }}
        >
          I&apos;ve been writing code since smartphones were still just phones.
        </p>

        {/* Name + role */}
        <div
          ref={nameRef}
          style={{
            marginTop: "2.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            alignItems: "center",
            opacity: 0,
          }}
        >
          <h1
            id="hook-heading"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              fontWeight: 700,
              color: "#e8e0d4",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Rahul Patel
          </h1>
          <span
            style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "clamp(0.875rem, 1.8vw, 1.05rem)",
              color: "rgba(232,224,212,0.5)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Tech Lead · Full-Stack Developer · 12+ Years
          </span>
        </div>

        {/* FIX 3: Scroll indicator  outer div positions it, inner div bounces.
            This prevents the CSS bounce animation from overwriting translateX(-50%). */}
        <div
          style={{
            position: "absolute",
            bottom: "clamp(1.75rem, 4vh, 2.75rem)",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            ref={indicatorRef}
            aria-hidden="true"
            className="scroll-indicator"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              opacity: 0,
              animation: "bounce-soft 2.2s ease-in-out infinite",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "0.8rem",
                color: "rgba(232,224,212,0.28)",
                letterSpacing: "0.04em",
              }}
            >
              scroll to begin
            </span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <path
                d="M7 1v15M1 10l6 7 6-7"
                stroke="rgba(232,224,212,0.28)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

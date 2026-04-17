"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { TextReveal } from "@/components/effects/TextReveal";
import { JOURNAL_ENTRIES } from "@/data/experience";

const ROTATIONS = [-1.5, 0.8, -0.6, 1.4, -1.0, 0.5, -1.8, 0.9, -0.4, 1.2, -0.7];
const INK_COLORS = ["var(--color-annotation-red)", "var(--color-annotation-blue)"];

export function Chapter02Origin() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 1024) return;

    const outer = outerRef.current;
    const inner = innerRef.current;
    const line = lineRef.current;
    if (!outer || !inner) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const init = () => {
      // Total horizontal distance to travel
      const trackWidth = inner.scrollWidth;
      const viewportWidth = window.innerWidth;
      const distance = trackWidth - viewportWidth;

      if (distance <= 0) return;

      const mainTween = gsap.to(inner, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: outer,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${distance}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (line) gsap.set(line, { scaleX: self.progress });
          },
        },
      });

      // Stagger cards in as they enter horizontal viewport
      inner.querySelectorAll<HTMLElement>(".timeline-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            containerAnimation: mainTween,
            start: "left 90%",
            toggleActions: "play none none none",
          },
        });
      });
    };

    const t = setTimeout(init, 150);

    return () => {
      clearTimeout(t);
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === outer)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      id="chapter-origin"
      aria-label="The Origin Story"
      style={{ background: "var(--color-bg)", position: "relative" }}
    >

      {/* ══════════════════════════════════════════
          DESKTOP: pinned horizontal scroll (≥ 1024px)
          Header is INSIDE the pinned container so it stays visible
          during the entire horizontal scroll phase.
      ══════════════════════════════════════════ */}
      <div
        ref={outerRef}
        className="hscroll-outer"
        style={{
          height: "100dvh",
          overflowX: "hidden",
          overflowY: "visible",   // rotated cards extend ±a few px vertically  don't clip
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Section header  pinned with the rest ── */}
        <div style={{
          padding: "clamp(4.5rem,9vh,7rem) clamp(1.5rem,5vw,4rem) clamp(1.25rem,2vh,2rem)",
          textAlign: "center",
          flexShrink: 0,
        }}>
          <FadeInOnScroll>
            <p style={{
              fontFamily: "var(--font-caveat)",
              color: "var(--color-annotation-red)",
              fontSize: "1.1rem",
              display: "inline-block",
              transform: "rotate(-1.5deg)",
              marginBottom: "0.75rem",
            }}>
               Chapter Two
            </p>
          </FadeInOnScroll>

          <TextReveal
            as="h2"
            id="chapter-origin-heading"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem,4vw,3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-fg)",
            }}
          >
            The Origin Story
          </TextReveal>

          <FadeInOnScroll delay={0.2}>
            <p style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "1rem",
              color: "var(--color-fg-muted)",
              maxWidth: "420px",
              margin: "0.75rem auto 0",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}>
              Scroll through 12 years of building.
            </p>
          </FadeInOnScroll>
        </div>

        {/* Cards track  fills remaining height of the 100dvh container */}
        <div
          ref={innerRef}
          className="hscroll-inner"
          style={{
            display: "flex",
            alignItems: "center",           // vertically centre cards
            gap: "clamp(1.25rem,2.5vw,2rem)",
            padding: "0 clamp(2rem,5vw,5rem)",
            width: "max-content",
            flex: 1,                        // fill remaining height after header
            willChange: "transform",
          }}
        >
          {JOURNAL_ENTRIES.map((entry, i) => (
            <article
              key={entry.year}
              className="timeline-card"
              style={{
                width: "clamp(280px,28vw,380px)",
                flexShrink: 0,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "1.75rem 1.75rem 2rem",
                position: "relative",
                transform: `rotate(${ROTATIONS[i % ROTATIONS.length]}deg)`,
                boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              {/* Watermark */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: "-0.75rem",
                  right: "-0.25rem",
                  fontFamily: "var(--font-playfair)",
                  fontWeight: 700,
                  fontSize: "clamp(4rem,9vw,7rem)",
                  color: "var(--color-ink)",
                  opacity: 0.042,
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                  letterSpacing: "-0.03em",
                }}
              >
                {entry.year}
              </span>

              {/* Year label */}
              <p style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "1.05rem",
                fontWeight: 600,
                color: INK_COLORS[i % 2],
                transform: "rotate(-1.2deg)",
                display: "inline-block",
                marginBottom: "0.85rem",
              }}>
                {entry.year}
              </p>

              {/* Entry text */}
              <p style={{
                fontFamily: "var(--font-source-serif)",
                fontSize: "clamp(0.875rem,1.3vw,1rem)",
                color: "var(--color-fg)",
                lineHeight: 1.8,
                position: "relative",
                zIndex: 1,
              }}>
                &ldquo;{entry.entry}&rdquo;
              </p>

              {/* Ink dot */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: INK_COLORS[i % 2],
                  opacity: 0.35,
                }}
              />
            </article>
          ))}
        </div>

        {/* Timeline progress line  sits at bottom of the 100dvh container */}
        <div style={{
          position: "absolute",
          bottom: "2rem",
          left: "clamp(2rem,5vw,5rem)",
          right: "clamp(2rem,5vw,5rem)",
          height: "1px",
          background: "var(--color-border-strong)",
        }}>
          <div
            ref={lineRef}
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--color-accent)",
              transformOrigin: "left",
              transform: "scaleX(0)",
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE: vertical stack (< 1024px)
      ══════════════════════════════════════════ */}
      <div
        className="vscroll-mobile"
        style={{
          display: "none",
          padding: "0 clamp(1.25rem,4vw,2rem) clamp(4rem,8vh,6rem)",
          position: "relative",
        }}
      >
        {/* Mobile-only header */}
        <div style={{
          padding: "clamp(3.5rem,8vh,6rem) 0 clamp(2rem,4vh,3rem)",
          textAlign: "center",
        }}>
          <FadeInOnScroll>
            <p style={{
              fontFamily: "var(--font-caveat)",
              color: "var(--color-annotation-red)",
              fontSize: "1.1rem",
              display: "inline-block",
              transform: "rotate(-1.5deg)",
              marginBottom: "0.75rem",
            }}>
               Chapter Two
            </p>
          </FadeInOnScroll>
          <TextReveal
            as="h2"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem,6vw,3rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-fg)",
            }}
          >
            The Origin Story
          </TextReveal>
          <FadeInOnScroll delay={0.2}>
            <p style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "1rem",
              color: "var(--color-fg-muted)",
              maxWidth: "380px",
              margin: "0.75rem auto 0",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}>
              12 years of building.
            </p>
          </FadeInOnScroll>
        </div>
        {/* Vertical spine */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "calc(clamp(1.25rem,4vw,2rem) + 9px)",
            top: 0,
            bottom: 0,
            width: "1px",
            background: "var(--color-border-strong)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingLeft: "2.25rem" }}>
          {JOURNAL_ENTRIES.map((entry, i) => (
            <FadeInOnScroll key={`mob-${entry.year}`} delay={Math.min(i * 0.04, 0.28)}>
              <div style={{ position: "relative" }}>
                {/* Spine dot */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-2.25rem",
                    top: "0.4rem",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: INK_COLORS[i % 2],
                    transform: "translateX(-3px)",
                  }}
                />
                <div style={{
                  background: "var(--color-bg-alt)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  padding: "1.1rem 1.35rem",
                }}>
                  <p style={{
                    fontFamily: "var(--font-caveat)",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: INK_COLORS[i % 2],
                    marginBottom: "0.4rem",
                  }}>
                    {entry.year}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-source-serif)",
                    fontSize: "0.925rem",
                    color: "var(--color-fg)",
                    lineHeight: 1.72,
                  }}>
                    &ldquo;{entry.entry}&rdquo;
                  </p>
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .hscroll-outer { display: none !important; }
          .vscroll-mobile { display: block !important; }
        }
      `}</style>
    </section>
  );
}

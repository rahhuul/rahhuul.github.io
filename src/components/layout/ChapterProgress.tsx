"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap-config";
import { useSmoothScroll } from "@/hooks/useLenis";
import { CHAPTERS } from "@/lib/constants";

/**
 * ChapterProgress  fixed left-side dot indicator.
 * 6 dots connected by a line; active dot updates via IntersectionObserver.
 * Fades in after 100px of scroll. Hidden on mobile (< 1024px).
 * Each dot scrolls to its chapter on click.
 */
export function ChapterProgress() {
  const [activeChapter, setActiveChapter] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  // Fade in after 100px scroll
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // GSAP fade in/out
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = containerRef.current;
    if (!el) return;

    gsap.to(el, {
      opacity: visible ? 1 : 0,
      x: visible ? 0 : -10,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [visible]);

  // Track active chapter by which section contains the viewport center.
  // IntersectionObserver with a threshold fails on tall sections (Chapter 3, etc.)
  // because they are never N% visible. Scroll-position is reliable for any height.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const centerY = window.scrollY + window.innerHeight / 2;

      let best = 0;
      CHAPTERS.forEach((chapter, i) => {
        const section = document.getElementById(chapter.sectionId);
        if (!section) return;
        const top = section.getBoundingClientRect().top + window.scrollY;
        const bottom = top + section.offsetHeight;
        if (centerY >= top && centerY < bottom) best = i;
      });

      setActiveChapter(best);
    };

    window.addEventListener("scroll", update, { passive: true });
    update(); // run once on mount
    return () => window.removeEventListener("scroll", update);
  }, []);

  const handleDotClick = (chapter: (typeof CHAPTERS)[0]) => {
    const section = document.getElementById(chapter.sectionId);
    if (section) {
      scrollTo(section, { offset: 0 });
    }
  };

  return (
    <nav
      ref={containerRef}
      aria-label="Chapter navigation"
      style={{
        position: "fixed",
        left: "clamp(1rem, 2.5vw, 2rem)",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 50,
        opacity: 0,
        display: "none",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
      className="chapter-progress-nav"
    >
      {CHAPTERS.map((chapter, i) => {
        const isActive = activeChapter === i;
        const isHovered = hoveredDot === i;

        return (
          <div
            key={chapter.id}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            {/* Dot + label row */}
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {/* Label  appears on hover, to the right */}
              <span
                style={{
                  position: "absolute",
                  left: "calc(100% + 14px)",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-caveat)",
                  fontSize: "0.8rem",
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-fg-muted)",
                  opacity: isHovered || isActive ? 1 : 0,
                  transform: isHovered || isActive ? "translateX(0)" : "translateX(-6px)",
                  transition: "opacity 0.25s ease, transform 0.25s ease",
                  pointerEvents: "none",
                }}
              >
                {chapter.label}
              </span>

              {/* Dot */}
              <button
                onClick={() => handleDotClick(chapter)}
                onMouseEnter={() => setHoveredDot(i)}
                onMouseLeave={() => setHoveredDot(null)}
                aria-label={`Navigate to ${chapter.title}`}
                aria-current={isActive ? "true" : undefined}
                style={{
                  width: isActive ? "10px" : "7px",
                  height: isActive ? "10px" : "7px",
                  borderRadius: "50%",
                  background: isActive
                    ? "var(--color-accent)"
                    : "transparent",
                  border: isActive
                    ? "2px solid var(--color-accent)"
                    : "1.5px solid var(--color-ink-muted)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s ease",
                  display: "block",
                  flexShrink: 0,
                }}
              />
            </div>

            {/* Connector line between dots (not after last) */}
            {i < CHAPTERS.length - 1 && (
              <div
                style={{
                  width: "1px",
                  height: "32px",
                  background: "var(--color-border-strong)",
                  flexShrink: 0,
                  margin: "4px 0",
                }}
              />
            )}
          </div>
        );
      })}

      {/* CSS to show only on desktop */}
      <style>{`
        @media (min-width: 1024px) {
          .chapter-progress-nav {
            display: flex !important;
          }
        }
      `}</style>
    </nav>
  );
}

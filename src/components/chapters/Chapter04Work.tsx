"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { TextReveal } from "@/components/effects/TextReveal";
import { PolaroidCard } from "@/components/ui/PolaroidCard";
import { MarginNote } from "@/components/ui/MarginNote";
import { PROJECTS } from "@/data/projects";

// One rotation per project  alternates the slight tilt on each polaroid
const ROTATIONS = [-2, 1.5, -1, 2];

// Placeholder gradient colors when project images are missing
const PLACEHOLDER_COLORS = [
  "linear-gradient(135deg,#f0ebe0 0%,#ddd6c8 100%)",
  "linear-gradient(135deg,#e8eef5 0%,#c8d4e0 100%)",
  "linear-gradient(135deg,#f5ede8 0%,#e0c8c0 100%)",
  "linear-gradient(135deg,#edf5e8 0%,#c8dcc0 100%)",
];

export function Chapter04Work() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // Animate each project row: polaroid slides in from alternating sides
    const rows = sectionRef.current?.querySelectorAll<HTMLElement>(".project-row");
    if (!rows) return;

    rows.forEach((row, i) => {
      const polaroid = row.querySelector<HTMLElement>(".polaroid-wrapper");
      const textSide = row.querySelector<HTMLElement>(".project-text");
      const isImageLeft = i % 2 === 0;

      if (polaroid) {
        gsap.fromTo(
          polaroid,
          { opacity: 0, x: isImageLeft ? -60 : 60 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: row,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (textSide) {
        gsap.fromTo(
          textSide,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.15,
            scrollTrigger: {
              trigger: row,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => {
          const trigger = st.vars.trigger as HTMLElement | undefined;
          return trigger && sectionRef.current?.contains(trigger);
        })
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="chapter-work"
      aria-labelledby="chapter-work-heading"
      style={{
        background: "var(--color-bg)",
        position: "relative",
        overflowX: "hidden",  // prevent GSAP x-slide from creating horizontal scroll
      }}
    >
      {/* ── Section header ── */}
      <div
        style={{
          padding:
            "clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,4rem) clamp(2.5rem,4vh,3.5rem)",
          textAlign: "center",
        }}
      >
        <FadeInOnScroll>
          <p
            style={{
              fontFamily: "var(--font-caveat)",
              color: "var(--color-annotation-red)",
              fontSize: "1.1rem",
              display: "inline-block",
              transform: "rotate(-1deg)",
              marginBottom: "0.75rem",
            }}
          >
             Chapter Four
          </p>
        </FadeInOnScroll>

        <TextReveal
          as="h2"
          id="chapter-work-heading"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2.5rem,5vw,4.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
          }}
        >
          The Work
        </TextReveal>

        <FadeInOnScroll delay={0.2}>
          <p
            style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "1.1rem",
              color: "var(--color-fg-muted)",
              maxWidth: "520px",
              margin: "1.25rem auto 0",
              lineHeight: 1.7,
              fontStyle: "italic",
            }}
          >
            Not just projects. Each one taught me something I couldn&apos;t
            learn any other way.
          </p>
        </FadeInOnScroll>
      </div>

      {/* ── Project rows ── */}
      <div
        style={{
          padding:
            "clamp(1rem,2vh,2rem) clamp(2rem,5vw,5rem) clamp(5rem,10vh,8rem)",
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(5rem,12vh,9rem)",
        }}
      >
        {PROJECTS.map((project, i) => {
          const isImageLeft = i % 2 === 0;
          const noteColor: "red" | "blue" = i % 2 === 0 ? "red" : "blue";
          const noteRotation = i % 2 === 0 ? -2.5 : -1.5;

          const polaroidEl = (
            <div
              className="polaroid-wrapper"
              style={{
                flex: "0 0 auto",
                width: "clamp(260px,38vw,460px)",
                alignSelf: "flex-start",
              }}
            >
              <PolaroidCard
                image={project.image}
                alt={project.name}
                rotation={ROTATIONS[i % ROTATIONS.length]}
                placeholderColor={PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]}
                placeholderLabel={project.name}
              />
            </div>
          );

          const textEl = (
            <div
              className="project-text"
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "1.25rem",
                paddingTop: "1rem",
              }}
            >
              {/* Project type badge */}
              <span
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-fg-subtle)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "3px",
                  padding: "3px 8px",
                  display: "inline-block",
                  alignSelf: "flex-start",
                }}
              >
                {project.type === "in-progress"
                  ? "In Progress"
                  : project.type === "open-source"
                  ? "Open Source"
                  : project.type === "saas"
                  ? "SaaS"
                  : "Client Work"}{" "}
                · {project.year}
              </span>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(1.6rem,2.8vw,2.4rem)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  color: "var(--color-fg)",
                  margin: 0,
                }}
              >
                {project.name}
              </h3>

              {/* Tagline */}
              <p
                style={{
                  fontFamily: "var(--font-source-serif)",
                  fontSize: "clamp(0.95rem,1.4vw,1.1rem)",
                  color: "var(--color-fg-muted)",
                  fontStyle: "italic",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {project.tagline}
              </p>

              {/* Story */}
              <p
                style={{
                  fontFamily: "var(--font-source-serif)",
                  fontSize: "clamp(0.9rem,1.3vw,1rem)",
                  color: "var(--color-fg-muted)",
                  lineHeight: 1.85,
                  margin: 0,
                  maxWidth: "520px",
                }}
              >
                {project.story}
              </p>

              {/* Tech tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {project.tech.slice(0, 6).map((t) => (
                  <span
                    key={t}
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: "0.68rem",
                      padding: "3px 9px",
                      borderRadius: "4px",
                      background: "var(--color-bg-alt)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-fg-muted)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  paddingTop: "0.25rem",
                }}
              >
                {project.stats.map((stat) => (
                  <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--color-fg)",
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-source-serif)",
                        fontSize: "0.72rem",
                        color: "var(--color-fg-subtle)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Links */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${project.name} (opens in new tab)`}
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.82rem",
                      color: "var(--color-accent)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      borderBottom: "1px solid var(--color-accent)",
                      paddingBottom: "1px",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.opacity = "0.7")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.opacity = "1")
                    }
                  >
                    View Project ↗
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.name} on GitHub (opens in new tab)`}
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.82rem",
                      color: "var(--color-fg-muted)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      borderBottom: "1px solid var(--color-border-strong)",
                      paddingBottom: "1px",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.opacity = "0.7")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.opacity = "1")
                    }
                  >
                    GitHub ↗
                  </a>
                )}
              </div>

              {/* Case study link */}
              {(project.id === 'apilens' || project.id === 'cms-mcp-hub') && (
                <Link
                  href={`/case-study/${project.id}`}
                  style={{
                    fontFamily: 'var(--font-caveat)',
                    fontSize: '1rem',
                    color: 'var(--color-annotation-red)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                >
                  Read the full story →
                </Link>
              )}

              {/* Margin note */}
              <MarginNote color={noteColor} rotation={noteRotation} delay={0.4}>
                {project.marginNote}
              </MarginNote>
            </div>
          );

          return (
            <div
              key={project.id}
              className="project-row"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "clamp(2.5rem,5vw,5rem)",
              }}
            >
              {isImageLeft ? (
                <>
                  {polaroidEl}
                  {textEl}
                </>
              ) : (
                <>
                  {textEl}
                  {polaroidEl}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Mobile overrides ── */}
      <style>{`
        @media (max-width: 1023px) {
          .project-row {
            flex-direction: column !important;
            align-items: center !important;
          }
          .polaroid-wrapper {
            width: 100% !important;
            max-width: 420px !important;
          }
          .polaroid-card {
            transform: rotate(0deg) !important;
          }
          .project-text {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

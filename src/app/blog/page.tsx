"use client";

import { useState } from "react";
import Link from "next/link";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { Footer } from "@/components/layout/Footer";
import { BLOG_POSTS, PILLAR_LABELS, type BlogPillar } from "@/data/blog-posts";

// Format ISO date → "March 15, 2026"
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const FILTERS: { value: "all" | BlogPillar; label: string }[] = [
  { value: "all", label: "All" },
  { value: "building", label: "Building" },
  { value: "technical", label: "Technical" },
  { value: "career", label: "Career" },
  { value: "tutorial", label: "Tutorial" },
  { value: "opinion", label: "Opinion" },
];

// Pillar accent colors
const PILLAR_COLORS: Record<BlogPillar, string> = {
  building: "#8B6914",
  technical: "#2c3e6b",
  career: "#2d5016",
  tutorial: "#c23616",
  opinion: "#6b4c8a",
};

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | BlogPillar>("all");

  const filtered =
    activeFilter === "all"
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.pillar === activeFilter);

  return (
    <>
      {/* ── Sticky top nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          padding: "0 clamp(1.5rem,5vw,4rem)",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/#chapter-proof"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-caveat)",
            fontSize: "1rem",
            color: "var(--color-annotation-red)",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 19l-7-7 7-7" /></svg>
          Back to the journal
        </Link>
        <span style={{ fontFamily: "var(--font-caveat)", fontSize: "0.85rem", color: "var(--color-fg-subtle)" }}>
          The Notebook
        </span>
      </nav>

      <main style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

        {/* ── Hero ── */}
        <div style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "clamp(4rem,8vh,6rem) clamp(1.5rem,5vw,3rem) clamp(2rem,4vh,3rem)",
        }}>
          <FadeInOnScroll immediate>
            <p style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "0.9rem",
              color: "var(--color-annotation-blue)",
              transform: "rotate(-1deg)",
              display: "inline-block",
              marginBottom: "0.75rem",
            }}>
               from the notebook
            </p>
          </FadeInOnScroll>

          <FadeInOnScroll immediate delay={0.05}>
            <h1 style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2.5rem,5vw,4rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--color-fg)",
              margin: "0 0 1rem 0",
            }}>
              The Notebook
            </h1>
          </FadeInOnScroll>

          <FadeInOnScroll immediate delay={0.1}>
            <p style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "clamp(1rem,1.4vw,1.1rem)",
              color: "var(--color-fg-muted)",
              lineHeight: 1.75,
              fontStyle: "italic",
              margin: 0,
            }}>
              Technical deep dives, building in public, and lessons from 12 years of shipping code.
            </p>
          </FadeInOnScroll>
        </div>

        {/* ── Filter pills ── */}
        <div style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "0 clamp(1.5rem,5vw,3rem) 2.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.78rem",
                  letterSpacing: "0.04em",
                  padding: "5px 14px",
                  borderRadius: "999px",
                  border: isActive
                    ? "1.5px solid var(--color-accent)"
                    : "1.5px solid var(--color-border-strong)",
                  background: isActive ? "var(--color-accent)" : "transparent",
                  color: isActive ? "#FAF8F5" : "var(--color-fg-muted)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ── Post list ── */}
        <div style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "0 clamp(1.5rem,5vw,3rem) clamp(5rem,10vh,7rem)",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}>
          {filtered.map((post, i) => {
            const accentColor = PILLAR_COLORS[post.pillar];
            const href = post.externalUrl ?? `/blog/${post.slug}`;
            const isExternal = !!post.externalUrl;

            return (
              <FadeInOnScroll key={post.slug} delay={Math.min(i * 0.06, 0.3)}>
                <article
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    padding: "2rem 0 2rem",
                    position: "relative",
                  }}
                >
                  {/* Featured accent bar */}
                  {post.featured && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: "-1.5rem",
                        top: "2rem",
                        width: "3px",
                        height: "calc(100% - 4rem)",
                        background: accentColor,
                        borderRadius: "2px",
                        opacity: 0.7,
                      }}
                    />
                  )}

                  {/* Date + read time */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.6rem" }}>
                    <span style={{
                      fontFamily: "var(--font-caveat)",
                      fontSize: "0.88rem",
                      color: "var(--color-fg-subtle)",
                    }}>
                      {formatDate(post.date)}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: "0.68rem",
                      color: "var(--color-fg-subtle)",
                      letterSpacing: "0.04em",
                    }}>
                      {post.readTime}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.68rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: accentColor,
                      padding: "2px 8px",
                      border: `1px solid ${accentColor}`,
                      borderRadius: "3px",
                      opacity: 0.85,
                    }}>
                      {PILLAR_LABELS[post.pillar]}
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    style={{ textDecoration: "none" }}
                  >
                    <h2
                      className="blog-post-title"
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: post.featured
                          ? "clamp(1.3rem,2.2vw,1.7rem)"
                          : "clamp(1.1rem,1.8vw,1.4rem)",
                        fontWeight: 700,
                        lineHeight: 1.25,
                        letterSpacing: "-0.01em",
                        color: "var(--color-fg)",
                        margin: "0 0 0.6rem 0",
                        transition: "color 0.2s",
                      }}
                    >
                      {post.title}
                      {isExternal && (
                        <span style={{ fontSize: "0.75em", marginLeft: "6px", opacity: 0.5 }}>↗</span>
                      )}
                    </h2>
                  </Link>

                  {/* Description */}
                  <p style={{
                    fontFamily: "var(--font-source-serif)",
                    fontSize: "clamp(0.88rem,1.2vw,0.95rem)",
                    color: "var(--color-fg-muted)",
                    lineHeight: 1.75,
                    margin: "0 0 1rem 0",
                    maxWidth: "620px",
                  }}>
                    {post.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: "var(--font-jetbrains)",
                          fontSize: "0.65rem",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          background: "var(--color-bg-alt)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-fg-subtle)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </FadeInOnScroll>
            );
          })}

          {filtered.length === 0 && (
            <p style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "1rem",
              color: "var(--color-fg-muted)",
              fontStyle: "italic",
              paddingTop: "2rem",
              textAlign: "center",
            }}>
              No posts in this category yet.
            </p>
          )}

          {/* Last border */}
          <div style={{ borderTop: "1px solid var(--color-border)" }} />
        </div>
      </main>

      <Footer />

      <style>{`
        .blog-post-title:hover {
          color: var(--color-accent) !important;
        }
        @media (max-width: 639px) {
          article [style*="position: absolute"] {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

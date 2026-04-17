"use client";

import Link from "next/link";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { getFeaturedPosts, PILLAR_LABELS, type BlogPillar } from "@/data/blog-posts";

// Format ISO date → "March 15, 2026"
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const PILLAR_COLORS: Record<BlogPillar, string> = {
  building: "#8B6914",
  technical: "#2c3e6b",
  career: "#2d5016",
  tutorial: "#c23616",
  opinion: "#6b4c8a",
};

export function ChapterNotebook() {
  const posts = getFeaturedPosts().slice(0, 3);

  return (
    <section
      id="chapter-notebook"
      style={{
        background: "var(--color-bg)",
        padding: "clamp(5rem,10vh,7rem) clamp(1.5rem,5vw,4rem)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: "var(--max-content)", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "3.5rem",
        }}>
          <div>
            <FadeInOnScroll>
              <p style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "0.9rem",
                color: "var(--color-annotation-blue)",
                transform: "rotate(-1deg)",
                display: "inline-block",
                marginBottom: "0.5rem",
              }}>
                 from the notebook
              </p>
            </FadeInOnScroll>

            <FadeInOnScroll delay={0.05}>
              <h2 style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(2rem,3.5vw,2.8rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "var(--color-fg)",
                margin: 0,
              }}>
                The Notebook
              </h2>
            </FadeInOnScroll>
          </div>

          <FadeInOnScroll delay={0.1}>
            <Link
              href="/blog"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.82rem",
                letterSpacing: "0.04em",
                color: "var(--color-fg-muted)",
                textDecoration: "none",
                padding: "7px 18px",
                border: "1.5px solid var(--color-border-strong)",
                borderRadius: "4px",
                transition: "color 0.2s, border-color 0.2s",
                display: "inline-block",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-fg)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-fg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-fg-muted)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-strong)";
              }}
            >
              All posts →
            </Link>
          </FadeInOnScroll>
        </div>

        {/* ── Posts grid ── */}
        <div
          className="notebook-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0",
          }}
        >
          {posts.map((post, i) => {
            const accent = PILLAR_COLORS[post.pillar];
            const href = post.externalUrl ?? `/blog/${post.slug}`;
            const isExternal = !!post.externalUrl;

            return (
              <FadeInOnScroll key={post.slug} delay={i * 0.08}>
                <article
                  className="notebook-card"
                  style={{
                    padding: "2rem clamp(1rem,2vw,1.75rem)",
                    borderLeft: i > 0 ? "1px solid var(--color-border)" : "none",
                    borderTop: "3px solid transparent",
                    position: "relative",
                    transition: "background 0.2s",
                    height: "100%",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                  style-hover-accent={accent}
                >
                  {/* Accent top border on hover via inline var */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      background: accent,
                      borderRadius: "2px 2px 0 0",
                      opacity: 0,
                      transition: "opacity 0.25s",
                    }}
                    className="notebook-accent-bar"
                  />

                  {/* Meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: "var(--font-caveat)",
                      fontSize: "0.85rem",
                      color: "var(--color-fg-subtle)",
                    }}>
                      {formatDate(post.date)}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.62rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: accent,
                      padding: "1px 7px",
                      border: `1px solid ${accent}`,
                      borderRadius: "3px",
                      opacity: 0.9,
                    }}>
                      {PILLAR_LABELS[post.pillar]}
                    </span>
                  </div>

                  {/* Title */}
                  <Link href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} style={{ textDecoration: "none" }}>
                    <h3
                      className="notebook-title"
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "clamp(1rem,1.5vw,1.2rem)",
                        fontWeight: 700,
                        lineHeight: 1.3,
                        letterSpacing: "-0.01em",
                        color: "var(--color-fg)",
                        margin: 0,
                        transition: "color 0.2s",
                      }}
                    >
                      {post.title}
                      {isExternal && <span style={{ fontSize: "0.75em", marginLeft: "5px", opacity: 0.5 }}>↗</span>}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p style={{
                    fontFamily: "var(--font-source-serif)",
                    fontSize: "clamp(0.82rem,1.1vw,0.9rem)",
                    color: "var(--color-fg-muted)",
                    lineHeight: 1.7,
                    margin: 0,
                    flex: 1,
                  }}>
                    {post.description.length > 115 ? post.description.slice(0, 115) + "…" : post.description}
                  </p>

                  {/* Read time */}
                  <span style={{
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: "0.65rem",
                    color: "var(--color-fg-subtle)",
                    letterSpacing: "0.04em",
                  }}>
                    {post.readTime}
                  </span>
                </article>
              </FadeInOnScroll>
            );
          })}
        </div>

        {/* Bottom border */}
        <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 0 }} />

      </div>

      <style>{`
        .notebook-card:hover .notebook-title { color: var(--color-accent) !important; }
        .notebook-card:hover .notebook-accent-bar { opacity: 1 !important; }
        .notebook-card:hover { background: var(--color-bg-alt); }

        @media (max-width: 767px) {
          .notebook-grid {
            grid-template-columns: 1fr !important;
          }
          .notebook-card {
            border-left: none !important;
            border-top: 1px solid var(--color-border) !important;
            padding-top: 1.75rem !important;
          }
          .notebook-card:first-child {
            border-top: none !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .notebook-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .notebook-card:nth-child(n+3) {
            border-top: 1px solid var(--color-border);
            margin-top: 0;
          }
        }
      `}</style>
    </section>
  );
}

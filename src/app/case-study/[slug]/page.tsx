import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCaseStudy, CASE_STUDIES } from "@/data/case-studies";
import { Footer } from "@/components/layout/Footer";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { TextReveal } from "@/components/effects/TextReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { TechBadge } from "@/components/ui/TechBadge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import type { CsArchSection } from "@/data/case-studies";
import React from "react";

// ── Static params ────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return CASE_STUDIES.map((cs) => ({ slug: cs.slug }));
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return { title: "Not Found" };

  return {
    title: `${cs.title} | Rahul Patel`,
    description: cs.lede,
    openGraph: {
      title: cs.title,
      description: cs.lede,
      type: "article",
    },
  };
}

// ── Helper: render text with inline `code` spans ─────────────────────────────
function renderWithCode(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "0.88em",
            background: "var(--color-bg-alt)",
            border: "1px solid var(--color-border)",
            borderRadius: "3px",
            padding: "1px 5px",
            color: "var(--color-fg)",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// ── Shared inline styles ──────────────────────────────────────────────────────
const sectionLabelStyle = (index: number): React.CSSProperties => ({
  fontFamily: "var(--font-caveat)",
  color:
    index % 2 === 0
      ? "var(--color-annotation-red)"
      : "var(--color-annotation-blue)",
  fontSize: "0.85rem",
  transform: "rotate(-1deg)",
  display: "inline-block",
  marginBottom: "0.75rem",
});

const sectionH2Style: React.CSSProperties = {
  fontFamily: "var(--font-playfair)",
  fontSize: "clamp(1.5rem,2.5vw,2rem)",
  color: "var(--color-fg)",
  lineHeight: 1.2,
  marginBottom: "1.25rem",
  marginTop: 0,
};

const bodyPStyle: React.CSSProperties = {
  fontFamily: "var(--font-source-serif)",
  fontSize: "clamp(0.95rem,1.3vw,1.05rem)",
  color: "var(--color-fg-muted)",
  lineHeight: 1.85,
  marginBottom: "1rem",
};

const sectionDividerStyle: React.CSSProperties = {
  borderTop: "1px solid var(--color-border)",
  margin: "3.5rem 0 2.5rem",
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();

  return (
    <>
      {/* ── 1. Top navigation bar ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: "60px",
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(1.5rem,5vw,3rem)",
        }}
      >
        <Link
          href="/#chapter-work"
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "1rem",
            color: "var(--color-annotation-red)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to the journal
        </Link>

        <span
          style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "0.7rem",
            color: "var(--color-fg-subtle)",
            letterSpacing: "0.06em",
          }}
        >
          case-study / {cs.slug}
        </span>
      </nav>

      {/* ── 2. Hero section ── */}
      <header
        style={{
          paddingTop: "6rem",
          paddingBottom: "4rem",
          maxWidth: "860px",
          margin: "0 auto",
          padding: "6rem clamp(1.5rem,5vw,3rem) 4rem",
        }}
      >
        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.9rem",
            color: "var(--color-annotation-blue)",
            transform: "rotate(-1deg)",
            display: "inline-block",
            marginBottom: "1rem",
            marginTop: 0,
          }}
        >
          {cs.eyebrow}
        </p>

        {/* H1 */}
        <TextReveal
          as="h1"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2.2rem,5vw,3.8rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
            margin: "0 0 0 0",
          }}
        >
          {cs.title}
        </TextReveal>

        {/* Lede */}
        <p
          style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "clamp(1rem,1.4vw,1.15rem)",
            color: "var(--color-fg-muted)",
            lineHeight: 1.8,
            maxWidth: "680px",
            marginTop: "1.5rem",
            fontStyle: "italic",
          }}
        >
          {cs.lede}
        </p>

        {/* Stats row */}
        <div
          className="cs-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
            marginTop: "2.5rem",
          }}
        >
          {cs.stats.map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontWeight: 700,
                  fontSize: "clamp(2rem,4vw,3rem)",
                  color: "var(--color-fg)",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "baseline",
                  gap: "2px",
                }}
              >
                <AnimatedCounter target={stat.value} duration={1200} />
                {stat.suffix && (
                  <span style={{ fontSize: "0.6em" }}>{stat.suffix}</span>
                )}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-source-serif)",
                  fontSize: "0.8rem",
                  color: "var(--color-fg-subtle)",
                  marginTop: "0.25rem",
                  marginBottom: 0,
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            marginTop: "2rem",
          }}
        >
          {cs.meta.map((m) => (
            <div key={m.label}>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "0.68rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  color: "var(--color-fg-muted)",
                  display: "block",
                }}
              >
                {m.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-source-serif)",
                  fontSize: "0.9rem",
                  color: "var(--color-fg)",
                }}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid var(--color-border)",
            margin: "1.75rem 0 0",
          }}
        />

        {/* Links */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1.5rem",
          }}
        >
          {cs.links.map((link) =>
            link.primary ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.85rem",
                  background: "var(--color-accent)",
                  color: "#faf8f5",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                {link.label} ↗
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.85rem",
                  border: "1px solid var(--color-border-strong)",
                  color: "var(--color-fg-muted)",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                {link.label} ↗
              </a>
            )
          )}
        </div>
      </header>

      {/* ── 3. Article body ── */}
      <article
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "0 clamp(1.5rem,5vw,3rem)",
        }}
      >
        {/* ── Section 01: The Problem ── */}
        <FadeInOnScroll>
          <div>
            <hr style={sectionDividerStyle} />
            <span style={sectionLabelStyle(0)}>01  The Problem</span>
            <h2 style={sectionH2Style}>{cs.problem.heading}</h2>
            {cs.problem.paragraphs.map((p, i) => (
              <p key={i} style={bodyPStyle}>
                {p}
              </p>
            ))}
          </div>
        </FadeInOnScroll>

        {/* Margin note  after Problem */}
        <FadeInOnScroll>
          <blockquote
            style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "1.05rem",
              color: "var(--color-annotation-red)",
              transform: "rotate(-1.5deg)",
              display: "inline-block",
              borderLeft: "2px solid var(--color-annotation-red)",
              paddingLeft: "1rem",
              marginTop: "1.5rem",
              marginBottom: "0.5rem",
              marginLeft: 0,
            }}
          >
            {cs.marginNote}
          </blockquote>
        </FadeInOnScroll>

        {/* ── Section 02: The Solution ── */}
        <FadeInOnScroll>
          <div>
            <hr style={sectionDividerStyle} />
            <span style={sectionLabelStyle(1)}>02  The Solution</span>
            <h2 style={sectionH2Style}>{cs.solution.heading}</h2>
            {cs.solution.paragraphs.map((p, i) => (
              <p key={i} style={bodyPStyle}>
                {p}
              </p>
            ))}

            {cs.solution.codeBlock && (
              <CodeBlock
                code={cs.solution.codeBlock.code}
                filename={cs.solution.codeBlock.filename}
              />
            )}

            {cs.solution.platforms && (
              <div
                className="cs-platforms-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "0.75rem",
                  marginTop: "1.5rem",
                }}
              >
                {cs.solution.platforms.map((platform) => (
                  <div
                    key={platform.name}
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "0.95rem",
                        color: "var(--color-fg)",
                      }}
                    >
                      {platform.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-caveat)",
                        fontSize: "0.9rem",
                        color: "var(--color-annotation-red)",
                      }}
                    >
                      {platform.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeInOnScroll>

        {/* ── Section 03: Architecture ── */}
        <FadeInOnScroll>
          <div>
            <hr style={sectionDividerStyle} />
            <span style={sectionLabelStyle(2)}>03  Architecture</span>
            <h2 style={sectionH2Style}>{cs.architecture.heading}</h2>
            {cs.architecture.sections.map((section: CsArchSection) => (
              <div key={section.title}>
                <h3
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--color-fg)",
                    marginTop: "1.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {section.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-source-serif)",
                    fontSize: "clamp(0.95rem,1.3vw,1.05rem)",
                    color: "var(--color-fg-muted)",
                    lineHeight: 1.8,
                    marginBottom: "1rem",
                    marginTop: 0,
                  }}
                >
                  {renderWithCode(section.body)}
                </p>
              </div>
            ))}
          </div>
        </FadeInOnScroll>

        {/* ── Section 04: Tech Stack ── */}
        <FadeInOnScroll>
          <div>
            <hr style={sectionDividerStyle} />
            <span style={sectionLabelStyle(3)}>04  Tech Stack</span>
            <h2 style={sectionH2Style}>Built with</h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              {cs.stack.map((badge) => (
                <TechBadge
                  key={badge.name}
                  name={badge.name}
                  icon={badge.icon}
                  color={badge.color}
                />
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* ── Section 05: Outcome ── */}
        <FadeInOnScroll>
          <div>
            <hr style={sectionDividerStyle} />
            <span style={sectionLabelStyle(4)}>05  Outcome</span>
            <h2 style={sectionH2Style}>{cs.outcome.heading}</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {cs.outcome.items.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      minWidth: "6px",
                      borderRadius: "50%",
                      background: "var(--color-accent)",
                      marginTop: "0.45em",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-source-serif)",
                      fontSize: "clamp(0.95rem,1.3vw,1.05rem)",
                      color: "var(--color-fg-muted)",
                      lineHeight: 1.75,
                    }}
                  >
                    {renderWithCode(item)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </FadeInOnScroll>
      </article>

      {/* ── 4. Next case study card ── */}
      <section
        style={{
          marginTop: "5rem",
          background: "var(--color-bg-alt)",
          padding: "4rem clamp(1.5rem,5vw,3rem)",
        }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "1rem",
              color: "var(--color-fg-subtle)",
              marginBottom: "0.75rem",
              marginTop: 0,
            }}
          >
             Next case study
          </p>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.8rem,3vw,2.5rem)",
              color: "var(--color-fg)",
              lineHeight: 1.15,
              margin: "0 0 0.75rem",
            }}
          >
            {cs.nextCaseStudy.title}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "clamp(0.95rem,1.3vw,1.05rem)",
              color: "var(--color-fg-muted)",
              fontStyle: "italic",
              lineHeight: 1.7,
              maxWidth: "560px",
              marginTop: 0,
            }}
          >
            {cs.nextCaseStudy.teaser}
          </p>
          <Link
            href={`/case-study/${cs.nextCaseStudy.slug}`}
            style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "1rem",
              color: "var(--color-annotation-red)",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "1.5rem",
            }}
          >
            Read the full story →
          </Link>
        </div>
      </section>

      {/* ── 5. Footer ── */}
      <Footer />

      {/* ── Mobile overrides ── */}
      <style>{`
        @media (max-width: 767px) {
          .cs-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .cs-platforms-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}

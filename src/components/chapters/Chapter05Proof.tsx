"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { TextReveal } from "@/components/effects/TextReveal";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

// ── Tech evolution data ─────────────────────────────────────────────
const TECH_EVOLUTION = [
  {
    period: "2011–2013",
    techs: "PHP · MySQL",
    width: 18,
    color: "#c8b89a",
  },
  {
    period: "2013–2016",
    techs: "PHP · CodeIgniter · jQuery · JavaScript",
    width: 36,
    color: "#b8a882",
  },
  {
    period: "2016–2018",
    techs: "WordPress · Joomla · Laravel · Angular · Node.js",
    width: 54,
    color: "#9e8e6a",
  },
  {
    period: "2018–2022",
    techs: "React · Node.js · MongoDB · AWS · Web3 · Solidity · Laravel · WordPress",
    width: 76,
    color: "#7a6e58",
  },
  {
    period: "2022–2026",
    techs: "React · Next.js · TypeScript · GSAP · Docker · Web3 · Laravel · Node.js",
    width: 100,
    color: "#5a5244",
  },
];

// ── Shared card style ───────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "12px",
  padding: "clamp(1.25rem,2.5vw,2rem)",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const cardLarge: React.CSSProperties = {
  ...card,
  padding: "clamp(1.5rem,3vw,2.5rem)",
};

// ── Tech Evolution Bar Chart ────────────────────────────────────────
function TechEvolution() {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = barsRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const bars = el.querySelectorAll<HTMLElement>(".evo-bar-fill");

    if (prefersReducedMotion) {
      bars.forEach((b) => (b.style.width = b.dataset.target ?? "100%"));
      return;
    }

    bars.forEach((bar) => (bar.style.width = "0%"));

    gsap.to(bars, {
      width: (i) => bars[i].dataset.target ?? "100%",
      duration: 1,
      ease: "power2.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === el)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <div ref={barsRef} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {/* Screen-reader summary of the chart */}
      <p className="sr-only">
        Technology stack evolution: 2011–2013 PHP and MySQL; 2013–2016 PHP, CodeIgniter, jQuery; 2016–2018 WordPress, Laravel, Angular, Node.js; 2018–2022 React, Node.js, MongoDB, AWS, Web3, Solidity; 2022–2026 React, Next.js, TypeScript, Docker, GSAP, Web3.
      </p>
      <p
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-caveat)",
          fontSize: "0.9rem",
          color: "var(--color-annotation-blue)",
          transform: "rotate(-0.5deg)",
          display: "inline-block",
          marginBottom: "0.25rem",
        }}>
        Stack evolution →
      </p>
      {TECH_EVOLUTION.map((row) => (
        <div key={row.period} aria-hidden="true" className="evo-row">
          {/* Period label  stays on same line, condensed on mobile */}
          <span className="evo-period" style={{
            fontFamily: "var(--font-jetbrains)",
            fontSize: "0.65rem",
            color: "var(--color-fg-subtle)",
            letterSpacing: "0.02em",
            flexShrink: 0,
          }}>
            {row.period}
          </span>
          {/* Bar track */}
          <div className="evo-track" style={{
            flex: 1,
            background: "var(--color-bg-alt)",
            borderRadius: "4px",
            overflow: "hidden",
            position: "relative",
          }}>
            <div
              className="evo-bar-fill"
              data-target={`${row.width}%`}
              style={{
                height: "100%",
                background: row.color,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                paddingLeft: "0.5rem",
                overflow: "hidden",
                whiteSpace: "nowrap",
                width: 0,
              }}
            >
              <span className="evo-label" style={{
                fontFamily: "var(--font-source-serif)",
                fontSize: "0.68rem",
                color: "#FAF8F5",
                opacity: 0.9,
              }}>
                {row.techs}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────

export function Chapter05Proof() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = gridRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const cards = el.querySelectorAll<HTMLElement>(".bento-card");

    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === el)
        .forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      id="chapter-proof"
      aria-labelledby="chapter-proof-heading"
      style={{ background: "var(--color-bg-alt)", position: "relative", overflowX: "hidden" }}
    >
      {/* ── Section header ── */}
      <div style={{
        padding: "clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,4rem) clamp(2.5rem,4vh,3.5rem)",
        textAlign: "center",
      }}>
        <FadeInOnScroll>
          <p style={{
            fontFamily: "var(--font-caveat)",
            color: "var(--color-annotation-red)",
            fontSize: "1.1rem",
            display: "inline-block",
            transform: "rotate(-0.5deg)",
            marginBottom: "0.75rem",
          }}>
             Chapter Five
          </p>
        </FadeInOnScroll>

        <TextReveal
          as="h2"
          id="chapter-proof-heading"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2.5rem,5vw,4.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
          }}
        >
          The Proof
        </TextReveal>

        <FadeInOnScroll delay={0.2}>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "1.1rem",
            color: "var(--color-fg-muted)",
            maxWidth: "440px",
            margin: "1.25rem auto 0",
            lineHeight: 1.7,
            fontStyle: "italic",
          }}>
            Numbers don&apos;t tell the whole story. But they&apos;re a good start.
          </p>
        </FadeInOnScroll>
      </div>

      {/* ── Bento grid ── */}
      <div
        ref={gridRef}
        style={{
          padding: "0 clamp(1.5rem,5vw,4rem) clamp(5rem,10vh,8rem)",
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gap: "clamp(0.75rem,1.5vw,1.25rem)",
        }}
        className="bento-grid"
      >
        {/* ── Row 1: two large cards ── */}

        {/* Card A  12+ Years */}
        <div
          className="bento-card bento-span-2"
          style={{ ...cardLarge, gridColumn: "span 2" }}
        >
          <span className="bento-stat-large" style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(3rem,6vw,5rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "var(--color-fg)",
          }}>
            <AnimatedCounter target={12} suffix="+" duration={1600} />
          </span>
          <span style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "clamp(0.95rem,1.3vw,1.05rem)",
            color: "var(--color-fg-muted)",
            fontWeight: 600,
          }}>
            Years of Production Code
          </span>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "clamp(0.8rem,1.1vw,0.9rem)",
            color: "var(--color-fg-subtle)",
            lineHeight: 1.7,
            marginTop: "0.25rem",
          }}>
            Writing production code since 2011. PHP → Laravel → Node.js → React → building my own SaaS.
          </p>
          <p style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.9rem",
            color: "var(--color-annotation-red)",
            transform: "rotate(-1deg)",
            display: "inline-block",
            marginTop: "auto",
            paddingTop: "0.75rem",
          }}>
            Still learning. Still building.
          </p>
        </div>

        {/* Card B  50+ Projects */}
        <div
          className="bento-card bento-span-2"
          style={{ ...cardLarge, gridColumn: "span 2" }}
        >
          <span className="bento-stat-large" style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(3rem,6vw,5rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "var(--color-fg)",
          }}>
            <AnimatedCounter target={50} suffix="+" duration={1800} />
          </span>
          <span style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "clamp(0.95rem,1.3vw,1.05rem)",
            color: "var(--color-fg-muted)",
            fontWeight: 600,
          }}>
            Projects Delivered
          </span>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "clamp(0.8rem,1.1vw,0.9rem)",
            color: "var(--color-fg-subtle)",
            lineHeight: 1.7,
            marginTop: "0.25rem",
          }}>
            SaaS platforms, marketplaces, e-commerce, healthcare, education, booking systems, blockchain apps.
          </p>
          <p style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.9rem",
            color: "var(--color-annotation-blue)",
            transform: "rotate(0.8deg)",
            display: "inline-block",
            marginTop: "auto",
            paddingTop: "0.75rem",
          }}>
            Across 5+ industries.
          </p>
        </div>

        {/* ── Row 2: four small cards ── */}

        {/* Card C  Team */}
        <div className="bento-card" style={{ ...card, gridColumn: "span 1" }}>
          <span className="bento-stat-medium" style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2rem,3.5vw,2.75rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
          }}>
            7–10
          </span>
          <span style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.82rem",
            color: "var(--color-fg-muted)",
            fontWeight: 600,
          }}>
            Developers Led
          </span>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.78rem",
            color: "var(--color-fg-subtle)",
            lineHeight: 1.65,
          }}>
            Sprint planning, code reviews, architecture decisions.
          </p>
        </div>

        {/* Card D  Products */}
        <div className="bento-card" style={{ ...card, gridColumn: "span 1" }}>
          <span className="bento-stat-medium" style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2rem,3.5vw,2.75rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
          }}>
            3
          </span>
          <span style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.82rem",
            color: "var(--color-fg-muted)",
            fontWeight: 600,
          }}>
            Own Products
          </span>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.78rem",
            color: "var(--color-fg-subtle)",
            lineHeight: 1.65,
          }}>
            APILens · CMS MCP Hub · CodePulse AI
          </p>
        </div>

        {/* Card E  Clients */}
        <div className="bento-card" style={{ ...card, gridColumn: "span 1" }}>
          <span className="bento-stat-medium" style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2rem,3.5vw,2.75rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
          }}>
            <AnimatedCounter target={30} suffix="+" duration={1400} />
          </span>
          <span style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.82rem",
            color: "var(--color-fg-muted)",
            fontWeight: 600,
          }}>
            Clients Served
          </span>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.78rem",
            color: "var(--color-fg-subtle)",
            lineHeight: 1.65,
          }}>
            From startups to established businesses.
          </p>
        </div>

        {/* Card F  Remote */}
        <div className="bento-card" style={{ ...card, gridColumn: "span 1" }}>
          <span style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(1.4rem,2vw,1.75rem)",
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
          }}>
            Remote-First
          </span>
          <span style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.82rem",
            color: "var(--color-fg-muted)",
            fontWeight: 600,
          }}>
            Any timezone, any team
          </span>
          {[
            { tz: "IST", hours: "9 AM – 1:30 AM" },
            { tz: "US Eastern", hours: "10:30 PM – 4 PM" },
            { tz: "US Pacific", hours: "7:30 PM – 1 PM" },
            { tz: "UK / GMT", hours: "3:30 AM – 9 PM" },
            { tz: "CET / EU", hours: "4:30 AM – 10 PM" },
          ].map(({ tz, hours }) => (
            <div key={tz} className="remote-tz-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
              <span style={{
                fontFamily: "var(--font-jetbrains)",
                fontSize: "0.65rem",
                color: "var(--color-fg-subtle)",
                letterSpacing: "0.03em",
                flexShrink: 0,
              }}>
                {tz}
              </span>
              <span style={{
                fontFamily: "var(--font-source-serif)",
                fontSize: "0.72rem",
                color: "var(--color-fg-muted)",
                textAlign: "right",
              }}>
                {hours}
              </span>
            </div>
          ))}
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.72rem",
            color: "var(--color-fg-subtle)",
            lineHeight: 1.5,
            marginTop: "0.25rem",
            borderTop: "1px solid var(--color-border)",
            paddingTop: "0.5rem",
          }}>
            Async-first · Jira · Slack · GitHub
          </p>
        </div>

        {/* ── Row 3: Project Management + Tech Lead skills ── */}

        {/* Card PM  Project Management */}
        <div
          className="bento-card bento-span-2"
          style={{ ...card, gridColumn: "span 2" }}
        >
          <p style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.88rem",
            color: "var(--color-annotation-red)",
            transform: "rotate(-1deg)",
            display: "inline-block",
            marginBottom: "0.5rem",
          }}>
            PM skills →
          </p>
          <span style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(1.1rem,1.8vw,1.4rem)",
            fontWeight: 700,
            color: "var(--color-fg)",
            letterSpacing: "-0.01em",
            marginBottom: "0.25rem",
          }}>
            Project Management
          </span>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.82rem",
            color: "var(--color-fg-subtle)",
            fontStyle: "italic",
            marginBottom: "1rem",
            lineHeight: 1.5,
          }}>
            Delivered 50+ projects on time  from kickoff to production.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {[
              "Agile / Scrum",
              "Sprint Planning",
              "Backlog Grooming",
              "Jira",
              "Trello",
              "Stakeholder Communication",
              "Risk Assessment",
              "Delivery Ownership",
              "Roadmapping",
              "Estimation",
              "Cross-team Coordination",
              "Client Management",
            ].map((skill) => (
              <span
                key={skill}
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "0.68rem",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  background: "var(--color-bg-alt)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-fg-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Card TL  Tech Leadership */}
        <div
          className="bento-card bento-span-2"
          style={{ ...card, gridColumn: "span 2" }}
        >
          <p style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.88rem",
            color: "var(--color-annotation-blue)",
            transform: "rotate(0.8deg)",
            display: "inline-block",
            marginBottom: "0.5rem",
          }}>
            Lead skills →
          </p>
          <span style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(1.1rem,1.8vw,1.4rem)",
            fontWeight: 700,
            color: "var(--color-fg)",
            letterSpacing: "-0.01em",
            marginBottom: "0.25rem",
          }}>
            Tech Leadership
          </span>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.82rem",
            color: "var(--color-fg-subtle)",
            fontStyle: "italic",
            marginBottom: "1rem",
            lineHeight: 1.5,
          }}>
            Led 7–10 engineers. Set the architecture. Raised the bar.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {[
              "System Architecture",
              "Code Reviews",
              "Technical Mentoring",
              "Tech Roadmapping",
              "Team Building",
              "1:1s & Growth Plans",
              "Engineering Standards",
              "Performance Reviews",
              "Technical Interviews",
              "Documentation",
              "Incident Response",
              "Knowledge Transfer",
            ].map((skill) => (
              <span
                key={skill}
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "0.68rem",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  background: "var(--color-bg-alt)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-fg-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* ── Row 4: Tech evolution (span 3) + certifications (span 1) ── */}

        {/* Card G  Tech evolution */}
        <div
          className="bento-card bento-span-3"
          style={{ ...card, gridColumn: "span 3" }}
        >
          <TechEvolution />
        </div>

        {/* Card H  Certifications */}
        <div
          className="bento-card"
          style={{
            ...card,
            gridColumn: "span 1",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "0.9rem",
              color: "var(--color-annotation-blue)",
              transform: "rotate(-1deg)",
              display: "inline-block",
              marginBottom: "0.75rem",
            }}>
              Certified →
            </p>
            <p style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "var(--color-fg)",
              marginBottom: "0.75rem",
            }}>
              HackerRank
            </p>
            {[
              { label: "JavaScript · Basic", url: "https://www.hackerrank.com/certificates/5084e81ec190" },
              { label: "JavaScript · Intermediate", url: "https://www.hackerrank.com/certificates/780fbabd5935" },
              { label: "Node.js · Intermediate", url: "https://www.hackerrank.com/certificates/4ce1abb19a9e" },
              { label: "Frontend Developer (React)", url: "https://www.hackerrank.com/certificates/abeef6bd59d4" },
              { label: "Software Engineer", url: "https://www.hackerrank.com/certificates/ab1829379548" },
            ].map((cert) => (
              <div
                key={cert.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.45rem",
                }}
              >
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--color-accent)",
                  flexShrink: 0,
                }} />
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${cert.label} certificate on HackerRank (opens in new tab)`}
                  style={{
                    fontFamily: "var(--font-source-serif)",
                    fontSize: "0.78rem",
                    color: "var(--color-fg-muted)",
                    textDecoration: "none",
                    borderBottom: "1px solid transparent",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "var(--color-accent)";
                    el.style.borderBottomColor = "var(--color-accent)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.color = "var(--color-fg-muted)";
                    el.style.borderBottomColor = "transparent";
                  }}
                >
                  {cert.label} ↗
                </a>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--color-border)",
          }}>
            <p style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "0.65rem",
              color: "var(--color-fg-subtle)",
              letterSpacing: "0.04em",
              lineHeight: 1.6,
            }}>
              Open Source Contributor
              <br />
              <span style={{ color: "var(--color-accent)" }}>
                @rahhuul
              </span>{" "}
              on GitHub
            </p>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Base: 4-column grid ── */
        .bento-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        /* ── Tablet 640–1023px: 2-column grid ── */
        @media (max-width: 1023px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          /* bento-span-3 cards have inline gridColumn:"span 3"  needs !important */
          .bento-span-2, .bento-span-3 {
            grid-column: span 2 !important;
          }
        }

        /* ── Mobile < 640px: single-column ── */
        @media (max-width: 639px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
          /* All cards have inline gridColumn styles  !important required to override */
          .bento-grid > * {
            grid-column: 1 / -1 !important;
          }
          /* Scale down oversized stat numbers on small phones */
          .bento-stat-large {
            font-size: clamp(2.5rem, 12vw, 3.5rem) !important;
          }
          .bento-stat-medium {
            font-size: clamp(1.75rem, 8vw, 2.25rem) !important;
          }
        }

        /* ── TechEvolution rows ── */
        .evo-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .evo-period {
          width: 5.5rem;
        }
        .evo-track {
          height: 30px;
        }

        /* Tablet: slightly smaller bars */
        @media (max-width: 1023px) {
          .evo-track {
            height: 26px;
          }
        }

        /* Mobile: stack period above bar, taller touch target */
        @media (max-width: 639px) {
          .evo-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.3rem;
          }
          .evo-period {
            width: auto;
            font-size: 0.72rem !important;
          }
          .evo-track {
            width: 100%;
            height: 22px;
          }
          /* Hide verbose tech label on mobile  bar length tells the story */
          .evo-label {
            display: none;
          }
        }

        /* ── Remote-First timezone table ── */
        @media (max-width: 1023px) {
          .remote-tz-row span {
            font-size: 0.62rem;
          }
        }
      `}</style>
    </section>
  );
}

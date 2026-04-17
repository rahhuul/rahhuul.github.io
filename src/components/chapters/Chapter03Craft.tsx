"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";
import { TextReveal } from "@/components/effects/TextReveal";
import { InteractiveTerminal } from "@/components/ui/InteractiveTerminal";
import { BentoGrid } from "@/components/ui/BentoGrid";
import { ExpertiseCard } from "@/components/ui/ExpertiseCard";
import { StackWall } from "@/components/ui/StackWall";
import { SKILL_DOMAINS } from "@/data/skills";

// ── Expertise cards data ────────────────────────────────────────────

const EXPERTISE_CARDS = [
  {
    title: "AI & MCP Products",
    accent: "#8B6914",
    bullets: [
      "Production Claude API integrations with multi-agent orchestration",
      "Custom MCP server development for CMS platforms and internal tooling",
      "RAG pipelines with Qdrant for context-aware, retrieval-augmented AI",
      "Structured prompt design for consistent, production-quality outputs",
      "Autonomous tool-use agents that handle real business workflows end-to-end",
    ],
  },
  {
    title: "Laravel & PHP",
    accent: "#c23616",
    bullets: [
      "High-throughput REST APIs with Laravel, Lumen & Sanctum authentication",
      "Multi-tenant SaaS architecture with isolated data and role-based access",
      "Schema design, query optimization & Eloquent ORM at production scale",
      "Async job queues, scheduled workers & multi-layer Redis caching",
      "Stripe, PayPal & complex third-party API integrations shipped to production",
    ],
  },
  {
    title: "React & Next.js",
    accent: "#2c3e6b",
    bullets: [
      "Full-stack apps with Next.js App Router, SSR, ISR & edge rendering",
      "React Server Components, streaming & Suspense for performance-first UIs",
      "Scalable state management with Zustand, Redux Toolkit & React Query",
      "Reusable design systems and component libraries built from first principles",
      "Lighthouse 90+ through code-splitting, lazy loading & bundle optimization",
    ],
  },
  {
    title: "Node.js & Backend",
    accent: "#2d5016",
    bullets: [
      "High-performance REST & GraphQL APIs with Express and Fastify",
      "Real-time systems using WebSockets and Socket.io handling thousands of connections",
      "Event-driven microservices with Kafka and RabbitMQ message brokers",
      "Polyglot persistence across PostgreSQL, MongoDB, MySQL & Redis",
      "Secure auth flows: JWT, OAuth 2.0, refresh token rotation & RBAC",
    ],
  },
  {
    title: "WordPress & WooCommerce",
    accent: "#6b4c8a",
    bullets: [
      "Bespoke theme and plugin development built to precise client specifications",
      "Complex WooCommerce stores with custom checkout flows and pricing logic",
      "Headless WordPress architecture with REST API and decoupled React frontends",
      "Custom Gutenberg blocks with dynamic data sources and full FSE support",
      "Core Web Vitals optimization, caching strategy, hardening & security audits",
    ],
  },
  {
    title: "AWS & DevOps",
    accent: "#b8650a",
    bullets: [
      "Infrastructure provisioning across EC2, S3, RDS, Lambda & CloudFront",
      "Automated CI/CD pipelines with GitHub Actions and zero-downtime blue/green deploys",
      "Dockerized multi-service environments with compose and container orchestration",
      "Proactive monitoring, auto-scaling groups & cost-optimized cloud architecture",
      "SSL/TLS management, DNS configuration, WAF rules & CDN delivery tuning",
    ],
  },
];

// ── Visual components ───────────────────────────────────────────────

function TerminalVisual({ lines }: { lines: string[] }) {
  return (
    <InteractiveTerminal
      lines={lines}
      style={{ width: "100%", maxWidth: "520px" }}
    />
  );
}

function CodeEditorVisual({ code }: { code: string }) {
  // Compute highlighted HTML only on the client to avoid SSR/hydration mismatch.
  // On the server we render plain lines; after mount we swap in the highlighted version.
  const [lines, setLines] = useState<string[]>(() => code.split("\n").map(() => ""));

  useEffect(() => {
    const highlighted = code
      .replace(/\b(function|return|const|let|var|import|from|export|default)\b/g,
        '<span style="color:#c792ea">$1</span>')
      .replace(/\b(true|false|null|undefined)\b/g,
        '<span style="color:#ff9cac">$1</span>')
      .replace(/(".*?"|'.*?'|`.*?`)/g,
        '<span style="color:#c3e88d">$1</span>')
      .replace(/(\{|\}|\(|\)|\[|\])/g,
        '<span style="color:#89ddff">$1</span>')
      .replace(/(<[A-Z]\w*|<\/[A-Z]\w*>|\/>)/g,
        '<span style="color:#f07178">$1</span>');
    setLines(highlighted.split("\n"));
  }, [code]);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        background: "#0d1117",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
        fontFamily: "var(--font-jetbrains)",
        fontSize: "clamp(0.72rem, 1.1vw, 0.82rem)",
        lineHeight: 1.7,
        width: "100%",
        maxWidth: "520px",
      }}>
      {/* Editor chrome */}
      <div style={{
        background: "#1c2128",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        gap: "0",
      }}>
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: "6px", padding: "10px 14px" }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
        </div>
        {/* File tab */}
        <div style={{
          padding: "7px 16px",
          background: "#0d1117",
          color: "rgba(232,224,212,0.7)",
          fontSize: "0.72rem",
          borderTop: "1px solid rgba(199,146,234,0.4)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}>
          App.tsx
        </div>
      </div>

      {/* Code body */}
      <div style={{ padding: "1.25rem 0", overflow: "auto" }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex", minHeight: "1.7em" }}>
            {/* Line number */}
            <span style={{
              minWidth: "2.8rem",
              paddingRight: "1rem",
              textAlign: "right",
              color: "rgba(255,255,255,0.15)",
              userSelect: "none",
              flexShrink: 0,
            }}>
              {i + 1}
            </span>
            {/* Code line */}
            <span
              style={{ color: "rgba(232,224,212,0.85)", paddingRight: "1.5rem" }}
              dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BentoVisual() {
  return (
    <BentoGrid
      stats={[
        { value: 12, suffix: "+", label: "Years Shipping Code" },
        { value: 50, suffix: "+", label: "Projects Delivered" },
        { value: 10, suffix: "", label: "Developers Led" },
        { value: 3, suffix: "", label: "Own Products Built" },
      ]}
      style={{ width: "100%", maxWidth: "520px" }}
    />
  );
}

// ── Visual registry ─────────────────────────────────────────────────

function Visual({ domain }: { domain: typeof SKILL_DOMAINS[0] }) {
  if (domain.visual === "terminal" && domain.terminalCommands) {
    return <TerminalVisual lines={domain.terminalCommands} />;
  }
  if (domain.visual === "docker" && domain.terminalCommands) {
    return <TerminalVisual lines={domain.terminalCommands} />;
  }
  if (domain.visual === "code-editor" && domain.codeSnippet) {
    return <CodeEditorVisual code={domain.codeSnippet} />;
  }
  if (domain.visual === "bento") {
    return <BentoVisual />;
  }
  return null;
}

// ── Main component ──────────────────────────────────────────────────

export function Chapter03Craft() {
  // -1 = nothing shown yet; ≥0 = visual for that domain is shown.
  const [activeIndex, setActiveIndex] = useState(-1);
  // mountKey increments each time activeIndex changes so AnimatePresence
  // always unmounts + remounts the visual, guaranteeing a fresh animation.
  const [mountKey, setMountKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── Fallback: activate first visual as soon as the section is 15% visible.
  // This prevents the left panel from staying blank when the user scrolls
  // quickly past the center-band trigger zone.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const section = sectionRef.current;
    if (!section) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveIndex((prev) => {
            if (prev === -1) {
              setMountKey((k) => k + 1);
              return 0;
            }
            return prev;
          });
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  // ── Per-block observer: update active visual when a block enters the
  // centre band of the viewport (rootMargin shrinks the hot-zone to the
  // middle 40% of the viewport height  more forgiving than 20%).
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observers: IntersectionObserver[] = [];

    blockRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex((prev) => {
              if (prev !== i) setMountKey((k) => k + 1);
              return i;
            });
          }
        },
        {
          // Centre 40% of viewport (was 20%  too narrow for fast scrollers)
          rootMargin: "-30% 0px -30% 0px",
          threshold: 0,
        }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section
      ref={sectionRef}
      id="chapter-craft"
      aria-labelledby="chapter-craft-heading"
      style={{
        background: "var(--color-bg-alt)",
        position: "relative",
      }}
    >
      {/* ── Section header ── */}
      <div style={{
        padding: "clamp(5rem,10vh,8rem) clamp(1.5rem,5vw,4rem) clamp(2.5rem,4vh,3.5rem)",
        textAlign: "center",
      }}>
        <FadeInOnScroll>
          <p style={{
            fontFamily: "var(--font-caveat)",
            color: "var(--color-annotation-blue)",
            fontSize: "1.1rem",
            display: "inline-block",
            transform: "rotate(1deg)",
            marginBottom: "0.75rem",
          }}>
             Chapter Three
          </p>
        </FadeInOnScroll>

        <TextReveal
          as="h2"
          id="chapter-craft-heading"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2.5rem,5vw,4.5rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
          }}
        >
          The Craft
        </TextReveal>

        <FadeInOnScroll delay={0.2}>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "1.1rem",
            color: "var(--color-fg-muted)",
            maxWidth: "420px",
            margin: "1.25rem auto 0",
            lineHeight: 1.7,
            fontStyle: "italic",
          }}>
            Not a list of tools. A way of thinking.
          </p>
        </FadeInOnScroll>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP: sticky left visual + scrolling right text
      ══════════════════════════════════════════ */}
      <div
        className="craft-desktop"
        style={{
          display: "grid",
          gridTemplateColumns: "45% 55%",
          gap: "0",
          alignItems: "start",
          padding: "0 clamp(2rem,5vw,5rem) clamp(4rem,8vh,6rem)",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        {/* Left: sticky visual panel */}
        <div style={{
          position: "sticky",
          top: "20vh",
          paddingRight: "clamp(1.5rem,3vw,3rem)",
          paddingBottom: "2rem",
        }}>
          <AnimatePresence mode="wait">
            {activeIndex >= 0 && (
              <motion.div
                key={mountKey}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <Visual domain={SKILL_DOMAINS[activeIndex]} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active block indicator dots */}
          <div style={{
            display: "flex",
            gap: "8px",
            marginTop: "1.75rem",
            paddingLeft: "2px",
          }}>
            {SKILL_DOMAINS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === activeIndex ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: i === activeIndex
                    ? "var(--color-accent)"
                    : "var(--color-border-strong)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: scrolling text blocks */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {SKILL_DOMAINS.map((domain, i) => (
            <div
              key={domain.id}
              ref={(el) => { blockRefs.current[i] = el; }}
              style={{
                minHeight: "65vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "clamp(2rem,4vh,3rem) 0 clamp(2rem,4vh,3rem) clamp(1.5rem,3vw,2.5rem)",
                borderLeft: "1px solid var(--color-border)",
              }}
            >
              <FadeInOnScroll>
                {/* Block number */}
                <p style={{
                  fontFamily: "var(--font-caveat)",
                  fontSize: "0.9rem",
                  color: i % 2 === 0
                    ? "var(--color-annotation-red)"
                    : "var(--color-annotation-blue)",
                  transform: `rotate(${i % 2 === 0 ? "-1" : "0.8"}deg)`,
                  display: "inline-block",
                  marginBottom: "0.75rem",
                }}>
                  0{i + 1} /
                </p>
              </FadeInOnScroll>

              <FadeInOnScroll delay={0.1}>
                <h3 style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(1.5rem,2.5vw,2.25rem)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: "var(--color-fg)",
                  marginBottom: "1.25rem",
                }}>
                  {domain.title}
                </h3>
              </FadeInOnScroll>

              <FadeInOnScroll delay={0.2}>
                <p style={{
                  fontFamily: "var(--font-source-serif)",
                  fontSize: "clamp(1rem,1.4vw,1.1rem)",
                  color: "var(--color-fg-muted)",
                  lineHeight: 1.8,
                  maxWidth: "480px",
                  marginBottom: "1.75rem",
                }}>
                  {domain.narrative}
                </p>
              </FadeInOnScroll>

              {/* Skill tags */}
              <FadeInOnScroll delay={0.3}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {domain.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: "0.72rem",
                        padding: "4px 10px",
                        borderRadius: "4px",
                        background: "var(--color-bg)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-fg-muted)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </FadeInOnScroll>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE: stacked blocks  visual above text
      ══════════════════════════════════════════ */}
      <div
        className="craft-mobile"
        style={{
          display: "none",
          padding: "0 clamp(1.25rem,4vw,2rem) clamp(4rem,8vh,6rem)",
          flexDirection: "column",
          gap: "3rem",
        }}
      >
        {SKILL_DOMAINS.map((domain, i) => (
          <FadeInOnScroll key={domain.id} delay={0.1}>
            <div>
              {/* Visual above */}
              <div style={{ marginBottom: "1.5rem" }}>
                <Visual domain={domain} />
              </div>

              {/* Text below */}
              <p style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "0.9rem",
                color: i % 2 === 0
                  ? "var(--color-annotation-red)"
                  : "var(--color-annotation-blue)",
                marginBottom: "0.5rem",
              }}>
                0{i + 1} /
              </p>
              <h3 style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(1.4rem,5vw,1.85rem)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "var(--color-fg)",
                marginBottom: "1rem",
              }}>
                {domain.title}
              </h3>
              <p style={{
                fontFamily: "var(--font-source-serif)",
                fontSize: "1rem",
                color: "var(--color-fg-muted)",
                lineHeight: 1.8,
                marginBottom: "1.25rem",
              }}>
                {domain.narrative}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {domain.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      fontFamily: "var(--font-jetbrains)",
                      fontSize: "0.72rem",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      background: "var(--color-bg-alt)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-fg-muted)",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </FadeInOnScroll>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          SUB-SECTION B: Expertise Cards
      ══════════════════════════════════════════ */}

      {/* Divider annotation */}
      <div style={{
        padding: "clamp(3rem,6vh,5rem) clamp(1.5rem,5vw,4rem) clamp(1.5rem,3vh,2.5rem)",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-caveat)",
          fontSize: "1rem",
          color: "var(--color-annotation-blue)",
          display: "inline-block",
          transform: "rotate(-1.2deg)",
          opacity: 0.8,
        }}>
           areas of expertise
        </p>
      </div>

      {/* 3-column card grid */}
      <div style={{
        padding: "0 clamp(1.5rem,5vw,4rem) clamp(3rem,6vh,5rem)",
        maxWidth: "1280px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "clamp(1rem,2vw,1.5rem)",
      }}
      className="expertise-grid"
      >
        {EXPERTISE_CARDS.map((card, i) => (
          <ExpertiseCard
            key={card.title}
            number={`0${i + 1}`}
            title={card.title}
            accent={card.accent}
            bullets={card.bullets}
            delay={i * 0.08}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════
          SUB-SECTION C: Stack Wall
      ══════════════════════════════════════════ */}

      {/* Divider annotation */}
      <div style={{
        padding: "clamp(2rem,4vh,3.5rem) clamp(1.5rem,5vw,4rem) clamp(1.5rem,3vh,2.5rem)",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-caveat)",
          fontSize: "1rem",
          color: "var(--color-annotation-red)",
          display: "inline-block",
          transform: "rotate(-1deg)",
          opacity: 0.8,
        }}>
           tools of the trade
        </p>
      </div>

      <div style={{
        padding: "0 clamp(1.5rem,5vw,4rem) clamp(4rem,8vh,6rem)",
        maxWidth: "1100px",
        margin: "0 auto",
      }}>
        <StackWall />
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .craft-desktop { display: none !important; }
          .craft-mobile  { display: flex !important; }
          .expertise-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 639px) {
          .expertise-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

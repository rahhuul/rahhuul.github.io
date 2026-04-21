"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { MagneticButton } from "@/components/ui/MagneticButton";


const BG = "#1c1915";
const CREAM = "#e8e0d4";

// ── Icon components (inline SVG  avoids Lucide bundle if tree-shaking misses) ──
function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function Chapter06Invitation() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const section = sectionRef.current;
    const heading = headingRef.current;
    const subtitle = subtitleRef.current;
    const cards = cardsRef.current;
    const social = socialRef.current;
    const status = statusRef.current;
    const signature = signatureRef.current;
    if (!section || !heading || !subtitle || !cards || !social || !status || !signature) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      [heading, subtitle, cards, social, status, signature].forEach((el) =>
        Object.assign(el.style, { opacity: "1", transform: "none" })
      );
      return;
    }

    // Initial hidden states
    gsap.set([heading, subtitle, cardsRef.current?.children ?? [], social, status, signature], {
      opacity: 0,
      y: 24,
    });

    // Word-by-word heading reveal using Splitting.js
    import("splitting").then(({ default: Splitting }) => {
      if (!heading) return;
      heading.innerHTML = heading.textContent ?? "";
      Splitting({ target: heading, by: "words" });
      const words = heading.querySelectorAll<HTMLElement>(".word");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      tl.set(heading, { opacity: 1, y: 0 })
        .fromTo(
          words,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
          }
        )
        .fromTo(
          subtitle,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
          "+=0.1"
        )
        .fromTo(
          Array.from(cardsRef.current?.children ?? []),
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.15 },
          "+=0.15"
        )
        .fromTo(
          social,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "+=0.1"
        )
        .fromTo(
          status,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          "-=0.2"
        )
        .fromTo(
          signature,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "+=0.5"
        );
    });

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === section)
        .forEach((st) => st.kill());
    };
  }, []);

  // ── Contact card shared style ──
  const contactCard: React.CSSProperties = {
    border: "1px solid rgba(232,224,212,0.15)",
    borderRadius: "14px",
    padding: "clamp(1.25rem,2.5vw,1.75rem) clamp(1.5rem,3vw,2rem)",
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    textDecoration: "none",
    transition: "border-color 0.25s ease, background 0.25s ease",
    cursor: "pointer",
    flex: "1 1 0",
    minWidth: "260px",
  };

  return (
    <section
      ref={sectionRef}
      id="chapter-invitation"
      aria-labelledby="chapter-invitation-heading"
      style={{
        background: BG,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(4rem,10vh,8rem) clamp(1.5rem,5vw,4rem)",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Chapter label */}
      <p style={{
        fontFamily: "var(--font-caveat)",
        color: "rgba(184,150,62,0.65)",
        fontSize: "1.1rem",
        display: "inline-block",
        transform: "rotate(1deg)",
        marginBottom: "1.5rem",
      }}>
         Chapter Six
      </p>

      {/* Heading  word-by-word reveal */}
      <h2
        ref={headingRef}
        id="chapter-invitation-heading"
        style={{
          fontFamily: "var(--font-playfair)",
          fontSize: "clamp(1.9rem,4.5vw,3.75rem)",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          color: CREAM,
          maxWidth: "740px",
          margin: "0 auto",
        }}
      >
        The next chapter starts with a conversation.
      </h2>

      {/* Subtitle */}
      <p
        ref={subtitleRef}
        style={{
          fontFamily: "var(--font-source-serif)",
          fontSize: "clamp(1rem,1.6vw,1.2rem)",
          color: "rgba(232,224,212,0.6)",
          maxWidth: "540px",
          margin: "1.5rem auto 3rem",
          lineHeight: 1.75,
          fontStyle: "italic",
        }}
      >
        Senior engineering roles, architecture consulting, or a product you
        need shipped  I&apos;ll reply within a day.
      </p>

      {/* Contact cards */}
      <div
        ref={cardsRef}
        style={{
          display: "flex",
          gap: "clamp(0.75rem,2vw,1.25rem)",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: "660px",
          marginBottom: "3rem",
        }}
      >
        {/* Email */}
        <MagneticButton style={{ flex: "1 1 0", minWidth: "260px" }}>
          <a
            href="mailto:rahul.patel786@gmail.com"
            style={contactCard}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(232,224,212,0.35)";
              el.style.background = "rgba(232,224,212,0.05)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(232,224,212,0.15)";
              el.style.background = "transparent";
            }}
          >
            <span style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(232,224,212,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <MailIcon />
            </span>
            <div style={{ textAlign: "left" }}>
              <p style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.78rem",
                color: "rgba(232,224,212,0.45)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}>
                Email
              </p>
              <p style={{
                fontFamily: "var(--font-source-serif)",
                fontSize: "clamp(0.82rem,1.2vw,0.92rem)",
                color: CREAM,
                letterSpacing: "0.01em",
              }}>
                rahul.patel786@gmail.com
              </p>
              <p style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "0.82rem",
                color: "rgba(184,150,62,0.7)",
                marginTop: "2px",
              }}>
                Write to me →
              </p>
            </div>
          </a>
        </MagneticButton>

        {/* Phone */}
        <MagneticButton style={{ flex: "1 1 0", minWidth: "260px" }}>
          <a
            href="tel:+919033043379"
            style={contactCard}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(232,224,212,0.35)";
              el.style.background = "rgba(232,224,212,0.05)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(232,224,212,0.15)";
              el.style.background = "transparent";
            }}
          >
            <span style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "rgba(232,224,212,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <PhoneIcon />
            </span>
            <div style={{ textAlign: "left" }}>
              <p style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.78rem",
                color: "rgba(232,224,212,0.45)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}>
                Phone
              </p>
              <p style={{
                fontFamily: "var(--font-source-serif)",
                fontSize: "clamp(0.82rem,1.2vw,0.92rem)",
                color: CREAM,
                letterSpacing: "0.01em",
              }}>
                +91 903-304-3379
              </p>
              <p style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "0.82rem",
                color: "rgba(184,150,62,0.7)",
                marginTop: "2px",
              }}>
                Give me a call →
              </p>
            </div>
          </a>
        </MagneticButton>
      </div>

      {/* Social links */}
      <div
        ref={socialRef}
        style={{
          display: "flex",
          gap: "2rem",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "GitHub", href: "https://github.com/rahhuul" },
          { label: "LinkedIn", href: "https://www.linkedin.com/in/rahhuul" },
          { label: "Twitter", href: "https://x.com/rahhuul310" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.82rem",
              color: "rgba(232,224,212,0.45)",
              textDecoration: "none",
              letterSpacing: "0.04em",
              position: "relative",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "rgba(232,224,212,0.85)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "rgba(232,224,212,0.45)")
            }
          >
            {label}
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        ))}
      </div>

      {/* Status badge */}
      <div
        ref={statusRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.35rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Pulsing green dot */}
          <span style={{ position: "relative", display: "inline-flex" }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#4ade80",
              display: "block",
              animation: "pulse-dot 2s ease-in-out infinite",
            }} />
            <span style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "#4ade80",
              animation: "pulse-ring 2s ease-in-out infinite",
              opacity: 0,
            }} />
          </span>
          <span style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.88rem",
            color: "rgba(232,224,212,0.7)",
            fontWeight: 600,
          }}>
            Open for work
          </span>
        </div>
        <p style={{
          fontFamily: "var(--font-source-serif)",
          fontSize: "0.78rem",
          color: "rgba(232,224,212,0.35)",
          letterSpacing: "0.03em",
        }}>
          Full-time · Contract · Freelance
        </p>
        <p style={{
          fontFamily: "var(--font-source-serif)",
          fontSize: "0.75rem",
          color: "rgba(232,224,212,0.25)",
          letterSpacing: "0.03em",
        }}>
          Ahmedabad, India · Remote worldwide
        </p>
      </div>

      {/* Signature */}
      <p
        ref={signatureRef}
        style={{
          fontFamily: "var(--font-caveat)",
          fontSize: "clamp(1rem,1.6vw,1.2rem)",
          color: "rgba(232,224,212,0.28)",
          marginTop: "clamp(3rem,6vh,5rem)",
          lineHeight: 1.6,
        }}
      >
        Thanks for reading.
        <br /> Rahul, 2026
      </p>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        /* Mobile: stack cards vertically */
        @media (max-width: 639px) {
          #chapter-invitation [style*="flex-wrap: wrap"] > * {
            min-width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}

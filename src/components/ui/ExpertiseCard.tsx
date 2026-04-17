"use client";

import { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";

interface ExpertiseCardProps {
  number: string;
  title: string;
  accent: string; // hex e.g. "#8B6914"
  bullets: string[];
  delay?: number;
}

export function ExpertiseCard({
  number,
  title,
  accent,
  bullets,
  delay = 0,
}: ExpertiseCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [glare, setGlare] = useState({ x: 50, y: 50 });

  // Hex → rgb for dynamic rgba()
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);

  // Spring physics for tilt  feels physical, not linear
  const rotateX = useSpring(0, { stiffness: 260, damping: 28 });
  const rotateY = useSpring(0, { stiffness: 260, damping: 28 });
  const scale   = useSpring(1,  { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    // Normalised -1 → +1 from center
    const px = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const py = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);

    rotateY.set(px *  14);   // tilt left/right  max ±14°
    rotateX.set(py * -14);   // tilt up/down     max ±14°

    // Glare position as % within the card
    setGlare({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);
    scale.set(1.03);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  };

  return (
    <FadeInOnScroll delay={delay}>
      {/* Perspective wrapper  must be separate from the rotating element */}
      <div style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            scale,
            transformStyle: "preserve-3d",
            position: "relative",
            borderRadius: "14px",
            overflow: "hidden",
            background: "var(--color-surface)",
            border: `1px solid var(--color-border)`,
            cursor: "default",
            // Dynamic shadow shifts in the opposite direction of the tilt
            boxShadow: hovered
              ? `0 24px 48px rgba(0,0,0,0.14), 0 4px 16px rgba(${r},${g},${b},0.18)`
              : `0 2px 8px rgba(0,0,0,0.05)`,
            transition: "box-shadow 0.35s ease",
            willChange: "transform",
          }}
        >
          {/* ── Accent left border ── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "4px",
              background: `linear-gradient(180deg, ${accent} 0%, rgba(${r},${g},${b},0.4) 100%)`,
              zIndex: 2,
            }}
          />

          {/* ── Glare overlay  the key visual effect ── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              pointerEvents: "none",
              borderRadius: "14px",
              background: hovered
                ? `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)`
                : "none",
              transition: "opacity 0.2s ease",
            }}
          />

          {/* ── Watermark number  deep z, purely decorative ── */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-0.15em",
              right: "0.5rem",
              fontFamily: "var(--font-playfair)",
              fontSize: "6rem",
              fontWeight: 700,
              lineHeight: 1,
              color: `rgba(${r},${g},${b},${hovered ? 0.1 : 0.055})`,
              transition: "color 0.4s ease",
              userSelect: "none",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            {number}
          </div>

          {/* ── Card content ── */}
          <div style={{ position: "relative", zIndex: 1, padding: "1.5rem 1.5rem 1.5rem 1.85rem" }}>

            {/* Number label */}
            <p style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "0.8rem",
              color: accent,
              marginBottom: "0.4rem",
              opacity: 0.8,
              letterSpacing: "0.04em",
            }}>
              {number}
            </p>

            {/* Title */}
            <h3 style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1.05rem, 1.5vw, 1.2rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "var(--color-fg)",
              margin: "0 0 1.1rem 0",
            }}>
              {title}
            </h3>

            {/* Divider */}
            <div style={{
              height: "1px",
              background: `linear-gradient(90deg, rgba(${r},${g},${b},0.4) 0%, transparent 80%)`,
              marginBottom: "1rem",
            }} />

            {/* Bullets */}
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {bullets.map((point, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                  <span style={{
                    display: "inline-block",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: accent,
                    flexShrink: 0,
                    marginTop: "0.48em",
                    opacity: 0.85,
                  }} />
                  <span style={{
                    fontFamily: "var(--font-source-serif)",
                    fontSize: "clamp(0.78rem, 1vw, 0.86rem)",
                    color: "var(--color-fg-muted)",
                    lineHeight: 1.65,
                  }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </FadeInOnScroll>
  );
}

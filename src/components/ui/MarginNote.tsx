"use client";

import { FadeInOnScroll } from "@/components/effects/FadeInOnScroll";

interface MarginNoteProps {
  children: React.ReactNode;
  color?: "red" | "blue";
  rotation?: number;
  delay?: number;
  style?: React.CSSProperties;
}

export function MarginNote({
  children,
  color = "red",
  rotation = -2,
  delay = 0.3,
  style,
}: MarginNoteProps) {
  const inkColor =
    color === "red"
      ? "var(--color-annotation-red)"
      : "var(--color-annotation-blue)";

  return (
    <FadeInOnScroll delay={delay}>
      <p
        style={{
          fontFamily: "var(--font-caveat)",
          fontSize: "clamp(0.9rem,1.4vw,1.05rem)",
          color: inkColor,
          transform: `rotate(${rotation}deg)`,
          display: "inline-block",
          lineHeight: 1.5,
          maxWidth: "220px",
          position: "relative",
          paddingLeft: "1.1rem",
          ...style,
        }}
      >
        {/* Ink dot decoration */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: "0.45em",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: inkColor,
            opacity: 0.5,
            display: "inline-block",
          }}
        />
        {children}
      </p>
    </FadeInOnScroll>
  );
}

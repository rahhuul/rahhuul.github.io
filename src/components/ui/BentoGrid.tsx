"use client";

import { AnimatedCounter } from "./AnimatedCounter";

interface BentoStat {
  value: number;
  suffix?: string;
  label: string;
  span?: "full" | "half"; // grid span
}

interface BentoGridProps {
  stats: BentoStat[];
  style?: React.CSSProperties;
}

export function BentoGrid({ stats, style }: BentoGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(0.75rem,1.5vw,1rem)",
        ...style,
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            gridColumn: stat.span === "full" ? "1 / -1" : "span 1",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "10px",
            padding: "clamp(1.25rem,2.5vw,1.75rem)",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
          }}
        >
          <AnimatedCounter
            target={stat.value}
            suffix={stat.suffix ?? "+"}
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(2rem,4vw,3rem)",
              fontWeight: 700,
              color: "var(--color-fg)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          />
          <span style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "clamp(0.8rem,1.2vw,0.9rem)",
            color: "var(--color-fg-muted)",
            lineHeight: 1.4,
          }}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

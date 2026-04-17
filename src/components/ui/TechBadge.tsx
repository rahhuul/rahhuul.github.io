"use client";

interface TechBadgeProps {
  name: string;
  icon?: string;   // Simple Icons slug, e.g. "react"
  color: string;   // hex WITHOUT #, e.g. "61DAFB"
}

export function TechBadge({ name, icon, color }: TechBadgeProps) {
  const r = parseInt(color.slice(0,2), 16);
  const g = parseInt(color.slice(2,4), 16);
  const b = parseInt(color.slice(4,6), 16);

  return (
    <div
      data-badge="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 12px",
        borderRadius: "999px",
        background: `rgba(${r},${g},${b},0.08)`,
        border: `1px solid rgba(${r},${g},${b},0.22)`,
        cursor: "default",
        transition: "background 0.2s ease, transform 0.18s ease",
        userSelect: "none" as const,
        whiteSpace: "nowrap" as const,
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = `rgba(${r},${g},${b},0.18)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = `rgba(${r},${g},${b},0.08)`;
      }}
    >
      {icon && (
        <img
          src={`https://cdn.simpleicons.org/${icon}/${color}`}
          width={14}
          height={14}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          style={{ display: "block", flexShrink: 0 }}
        />
      )}
      <span style={{
        fontFamily: "var(--font-jetbrains)",
        fontSize: "0.72rem",
        color: "var(--color-fg)",
        letterSpacing: "0.02em",
      }}>
        {name}
      </span>
    </div>
  );
}

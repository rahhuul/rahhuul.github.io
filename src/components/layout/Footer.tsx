"use client";

/**
 * Footer  minimal sign-off below Chapter 6.
 * Deliberately understated  the contact chapter IS the ending.
 */
export function Footer() {
  return (
    <footer
      style={{
        background: "#111110",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "2.5rem clamp(1.5rem, 5vw, 4rem)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}
    >
      {/* Tagline */}
      <p
        style={{
          fontFamily: "var(--font-caveat)",
          fontSize: "1rem",
          color: "rgba(232, 224, 212, 0.35)",
          transform: "rotate(-0.5deg)",
          display: "inline-block",
        }}
      >
        © 2026 Rahul Patel. Designed as a story, built with code.
      </p>

      {/* Links */}
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
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
              fontSize: "0.8125rem",
              color: "rgba(232, 224, 212, 0.4)",
              textDecoration: "none",
              transition: "color 0.2s",
              letterSpacing: "0.03em",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "rgba(184, 150, 62, 0.9)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "rgba(232, 224, 212, 0.4)";
            }}
          >
            {label}
            <span className="sr-only"> (opens in new tab)</span>
          </a>
        ))}
      </div>
    </footer>
  );
}

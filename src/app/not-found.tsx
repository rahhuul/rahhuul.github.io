import Link from "next/link";

/**
 * 404 - journal-styled "page missing" screen.
 * Renders inside the root layout (no <html>/<body> needed).
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Chapter-style annotation */}
        <p
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "1rem",
            color: "var(--color-annotation-red)",
            display: "inline-block",
            transform: "rotate(-1.5deg)",
            marginBottom: "1rem",
          }}
        >
          - Page not found
        </p>

        {/* Ghost 404 watermark */}
        <p
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(5rem, 18vw, 9rem)",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: "var(--color-fg)",
            opacity: 0.06,
            margin: "0 0 -1.5rem",
            userSelect: "none",
          }}
        >
          404
        </p>

        {/* Main message */}
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
            marginBottom: "1.25rem",
          }}
        >
          This page seems to be missing
          <br />
          from the journal.
        </h1>

        {/* Sub-text */}
        <p
          style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "1rem",
            color: "var(--color-fg-muted)",
            lineHeight: 1.75,
            fontStyle: "italic",
            marginBottom: "2.5rem",
          }}
        >
          Maybe it was torn out. Maybe it never existed.
          <br />
          Either way - the story continues from the beginning.
        </p>

        {/* Back home link */}
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--color-fg)",
            textDecoration: "none",
            padding: "10px 24px",
            border: "1.5px solid var(--color-border-strong)",
            borderRadius: "4px",
            display: "inline-block",
            letterSpacing: "0.03em",
          }}
        >
          ← Back to the beginning
        </Link>

        {/* Signature */}
        <p
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "0.875rem",
            color: "var(--color-fg-subtle)",
            marginTop: "3rem",
            opacity: 0.6,
          }}
        >
          - Rahul, 2026
        </p>
      </div>
    </div>
  );
}

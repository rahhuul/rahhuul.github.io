"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        top: "-100px",
        left: "1rem",
        zIndex: 200,
        padding: "8px 16px",
        background: "var(--color-accent)",
        color: "#FAF8F5",
        fontFamily: "var(--font-inter)",
        fontSize: "0.875rem",
        borderRadius: "4px",
        textDecoration: "none",
        transition: "top 0.2s",
      }}
      onFocus={(e) => {
        (e.target as HTMLElement).style.top = "1rem";
      }}
      onBlur={(e) => {
        (e.target as HTMLElement).style.top = "-100px";
      }}
    >
      Skip to main content
    </a>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/hooks/useLenis";

function ArrowUpIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => scrollTo(0, { duration: 1.2 })}
      aria-label="Scroll to top"
      style={{
        position: "fixed",
        bottom: "clamp(1.25rem, 3vw, 2rem)",
        right: "clamp(1.25rem, 3vw, 2rem)",
        zIndex: 90,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "var(--color-fg)",
        color: "var(--color-bg)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.9)",
        pointerEvents: visible ? "all" : "none",
        transition: "opacity 0.3s ease, transform 0.3s ease, background 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--color-accent)";
        (e.currentTarget as HTMLElement).style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "var(--color-fg)";
        (e.currentTarget as HTMLElement).style.color = "var(--color-bg)";
      }}
    >
      <ArrowUpIcon />
    </button>
  );
}

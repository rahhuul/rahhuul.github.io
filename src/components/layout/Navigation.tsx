"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap-config";
import { useSmoothScroll } from "@/hooks/useLenis";
import { useTheme } from "@/hooks/useTheme";
import { CHAPTERS } from "@/lib/constants";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}

/**
 * Navigation  fixed top bar.
 * - Transparent initially; gains backdrop blur after 50px scroll
 * - Fades in only after 100px scroll (hidden on hero chapter)
 * - Desktop: chapter name links + Resume button
 * - Mobile: hamburger → slide-out overlay menu
 */
export function Navigation() {
  const navRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isOnMainPage = pathname === "/" || pathname === "";
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const { scrollTo } = useSmoothScroll();
  const { theme, toggle: toggleTheme } = useTheme();

  // Show nav after 100px on main page; always visible on other pages
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isOnMainPage) {
      setVisible(true);
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      const y = window.scrollY;
      setVisible(y > 100);
      setScrolled(y > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOnMainPage]);

  // GSAP fade nav in/out
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = navRef.current;
    if (!el) return;

    gsap.to(el, {
      opacity: visible ? 1 : 0,
      y: visible ? 0 : -12,
      duration: 0.45,
      ease: "power2.out",
      pointerEvents: visible ? "all" : "none",
    });
  }, [visible]);

  // Track active chapter by which section contains the viewport center
  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const centerY = window.scrollY + window.innerHeight / 2;

      let best = 0;
      CHAPTERS.forEach((chapter, i) => {
        const section = document.getElementById(chapter.sectionId);
        if (!section) return;
        const top = section.getBoundingClientRect().top + window.scrollY;
        const bottom = top + section.offsetHeight;
        if (centerY >= top && centerY < bottom) best = i;
      });

      setActiveChapter(best);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Close menu on Escape + trap focus inside mobile menu
  useEffect(() => {
    if (!menuOpen) return;

    const menu = document.getElementById("mobile-menu");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab" || !menu) return;

      const focusable = Array.from(
        menu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Move focus into menu on open
    const firstItem = menu?.querySelector<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    firstItem?.focus();

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleChapterClick = (chapter: (typeof CHAPTERS)[0]) => {
    const section = document.getElementById(chapter.sectionId);
    if (section) scrollTo(section, { offset: 0 });
    setMenuOpen(false);
  };

  const handleLogoClick = () => {
    scrollTo(0);
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Main navigation"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          opacity: 0,
          transform: "translateY(-12px)",
          pointerEvents: "none",
          transition: "background 0.3s ease",
          background: scrolled
            ? "color-mix(in srgb, var(--color-bg) 88%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid var(--color-border)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: "var(--max-content)",
            margin: "0 auto",
            padding: "0 clamp(1.5rem, 4vw, 3rem)",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo / monogram */}
          <button
            onClick={handleLogoClick}
            aria-label="Scroll to top"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              fontFamily: "var(--font-playfair)",
              fontSize: "1rem",
              color: "var(--color-fg)",
              letterSpacing: "0.05em",
            }}
          >
            rahul · patel
          </button>

          {/* Desktop: chapter links + resume */}
          <div
            className="nav-desktop"
            style={{
              display: "none",
              alignItems: "center",
              gap: "2rem",
            }}
          >
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
              {CHAPTERS.map((chapter, i) => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterClick(chapter)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.8125rem",
                    letterSpacing: "0.04em",
                    textTransform: "lowercase",
                    color:
                      activeChapter === i
                        ? "var(--color-accent)"
                        : "var(--color-fg-muted)",
                    borderBottom:
                      activeChapter === i
                        ? "1.5px solid var(--color-accent)"
                        : "1.5px solid transparent",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                >
                  {chapter.slug}
                </button>
              ))}
            </div>

            <Link
              href="/blog"
              style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "1rem",
                color: pathname.startsWith("/blog") ? "var(--color-accent)" : "var(--color-fg-muted)",
                textDecoration: "none",
                borderBottom: pathname.startsWith("/blog") ? "1.5px solid var(--color-accent)" : "1.5px solid transparent",
                transition: "color 0.2s, border-color 0.2s",
                paddingBottom: "1px",
              }}
            >
              notebook
            </Link>

            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-fg)",
                textDecoration: "none",
                padding: "6px 16px",
                border: "1.5px solid var(--color-border-strong)",
                borderRadius: "4px",
                transition: "border-color 0.2s, color 0.2s",
                letterSpacing: "0.03em",
              }}
            >
              Resume
              <span className="sr-only"> (opens in new tab)</span>
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                background: "none",
                border: "1.5px solid var(--color-border-strong)",
                borderRadius: "4px",
                cursor: "pointer",
                padding: "6px 8px",
                color: "var(--color-fg-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s, border-color 0.2s",
                minWidth: "32px",
                minHeight: "32px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-fg)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-fg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-fg-muted)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-strong)";
              }}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "11px",           // 22px icon + 22px padding = 44px touch target
              minWidth: "44px",
              minHeight: "44px",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              style={{
                display: "block",
                width: "22px",
                height: "1.5px",
                background: "var(--color-fg)",
                transition: "transform 0.25s ease, opacity 0.25s ease",
                transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: "22px",
                height: "1.5px",
                background: "var(--color-fg)",
                transition: "opacity 0.25s ease",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block",
                width: "22px",
                height: "1.5px",
                background: "var(--color-fg)",
                transition: "transform 0.25s ease, opacity 0.25s ease",
                transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>

        {/* CSS for responsive visibility */}
        <style>{`
          @media (min-width: 1024px) {
            .nav-desktop { display: flex !important; }
            .nav-hamburger { display: none !important; }
          }
          @media (max-width: 1023px) {
            .nav-desktop { display: none !important; }
            .nav-hamburger { display: flex !important; }
          }
        `}</style>
      </nav>

      {/* Mobile slide-out menu overlay */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Mobile navigation menu"
        aria-modal="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99,
          background: "var(--color-bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2rem",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? "translateY(0)" : "translateY(-100%)",
          pointerEvents: menuOpen ? "all" : "none",
        }}
      >
        {/* Close backdrop tap */}
        <button
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
          {CHAPTERS.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => handleChapterClick(chapter)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-playfair)",
                fontSize: "2rem",
                color: "var(--color-fg)",
                padding: "4px 12px",
                minHeight: "44px",
                transition: "color 0.2s",
              }}
            >
              {chapter.title}
            </button>
          ))}

          <Link
            href="/blog"
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "2rem",
              color: "var(--color-annotation-blue)",
              textDecoration: "none",
              padding: "4px 12px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s",
            }}
          >
            The Notebook
          </Link>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: "1rem",
              fontFamily: "var(--font-inter)",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: "var(--color-fg)",
              textDecoration: "none",
              padding: "10px 24px",
              border: "1.5px solid var(--color-border-strong)",
              borderRadius: "4px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
            }}
          >
            Download Resume
              <span className="sr-only"> (opens in new tab)</span>
          </a>

          {/* Theme toggle  mobile */}
          <button
            onClick={() => { toggleTheme(); setMenuOpen(false); }}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              background: "none",
              border: "1.5px solid var(--color-border-strong)",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "10px 24px",
              color: "var(--color-fg)",
              fontFamily: "var(--font-inter)",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "44px",
            }}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </div>
    </>
  );
}

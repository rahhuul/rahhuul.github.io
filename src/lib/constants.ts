// ─────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────

export const COLORS = {
  // Light
  cream: "#FAF8F5",
  creamAlt: "#F0EBE3",
  ink: "#1a1a1a",
  inkLight: "#2d2d2d",
  inkFaded: "#4a4a4a",
  inkMuted: "#6b6b6b",
  accentBrown: "#8B6914",
  accentBrownLight: "#b8963e",
  annotationRed: "#c23616",
  annotationBlue: "#2c3e6b",
  codeGreen: "#2d5016",
  // Dark
  charcoal: "#141414",
  charcoalAlt: "#1e1e1e",
  warmCream: "#e8e0d4",
  mutedAmber: "#b8963e",
} as const;

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1440,
} as const;

// ─────────────────────────────────────────────
// Chapter Metadata
// ─────────────────────────────────────────────

export type ChapterSlug =
  | "hook"
  | "origin"
  | "craft"
  | "work"
  | "proof"
  | "invitation";

export interface Chapter {
  id: number;
  slug: ChapterSlug;
  label: string;
  title: string;
  subtitle: string;
  sectionId: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    slug: "hook",
    label: "Hook",
    title: "The Hook",
    subtitle: "Where it begins",
    sectionId: "chapter-hook",
  },
  {
    id: 2,
    slug: "origin",
    label: "Origin",
    title: "The Origin",
    subtitle: "How I got here",
    sectionId: "chapter-origin",
  },
  {
    id: 3,
    slug: "craft",
    label: "Craft",
    title: "The Craft",
    subtitle: "What I build with",
    sectionId: "chapter-craft",
  },
  {
    id: 4,
    slug: "work",
    label: "Work",
    title: "The Work",
    subtitle: "What I've shipped",
    sectionId: "chapter-work",
  },
  {
    id: 5,
    slug: "proof",
    label: "Proof",
    title: "The Proof",
    subtitle: "By the numbers",
    sectionId: "chapter-proof",
  },
  {
    id: 6,
    slug: "invitation",
    label: "Contact",
    title: "The Invitation",
    subtitle: "Let's write the next chapter",
    sectionId: "chapter-invitation",
  },
];

// ─────────────────────────────────────────────
// Animation Constants
// ─────────────────────────────────────────────

export const ANIMATION = {
  // GSAP easing
  ease: {
    out: "power2.out",
    inOut: "power3.inOut",
    elastic: "elastic.out(1, 0.75)",
    back: "back.out(1.5)",
  },
  // Durations (seconds, for GSAP)
  duration: {
    fast: 0.2,
    base: 0.4,
    slow: 0.7,
    xslow: 1.1,
  },
  // Stagger amounts
  stagger: {
    char: 0.03,
    word: 0.08,
    item: 0.1,
    card: 0.15,
  },
} as const;

// ─────────────────────────────────────────────
// Site Metadata
// ─────────────────────────────────────────────

export const SITE = {
  name: "Rahul Patel",
  title: "Rahul Patel  Tech Lead & Full-Stack Developer (Node.js · React · Laravel)",
  description:
    "Tech Lead with 12+ years building scalable web applications. Node.js, React, Laravel, AWS. Creator of APILens and CMS MCP Hub. Available for remote roles.",
  url: "https://rahhuul.github.io",
  twitterHandle: "@rahhuul310",
} as const;

// Shared TypeScript types

export type ColorScheme = "light" | "dark";

export type BreakpointKey = "mobile" | "tablet" | "desktop" | "wide";

// GSAP-related
export interface GSAPAnimationOptions {
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number | object;
}

// Scroll-related
export interface ScrollState {
  progress: number; // 0–1
  direction: "up" | "down";
  velocity: number;
}

export interface InViewOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

// Chapter-related
export interface ChapterState {
  activeChapterId: number;
  previousChapterId: number | null;
}

// Contact
export interface ContactInfo {
  label: string;
  value: string;
  href: string;
  icon: string;
}

// Stat display
export interface Stat {
  value: string;
  numericValue?: number;
  label: string;
  sublabel?: string;
  suffix?: string;
  prefix?: string;
}

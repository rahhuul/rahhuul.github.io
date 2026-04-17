import type { LenisOptions } from "lenis";

// Default Lenis options  tuned for the journal's deliberate, immersive feel
export const LENIS_OPTIONS: LenisOptions = {
  lerp: 0.1,           // 0.1 = natural, weighted feel (lower = more butter)
  duration: 1.2,       // Scroll animation duration in seconds
  smoothWheel: true,   // Enable smooth mouse wheel scroll
  wheelMultiplier: 1,  // Wheel speed multiplier
  touchMultiplier: 2,  // Touch scroll multiplier
  infinite: false,     // No infinite scroll
  autoRaf: false,      // We drive RAF via GSAP ticker for synchronization
};

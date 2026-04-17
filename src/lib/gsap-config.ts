"use client";

// Lazy-initialize GSAP only on the client.
// Importing this module on the server is safe  it exports stubs that no-op.

import { gsap as _gsap } from "gsap";
import { ScrollTrigger as _ScrollTrigger } from "gsap/ScrollTrigger";

// Register and configure on client only
if (typeof window !== "undefined") {
  _gsap.registerPlugin(_ScrollTrigger);

  _gsap.defaults({
    ease: "power2.out",
    duration: 0.8,
  });

  _ScrollTrigger.config({
    ignoreMobileResize: true,
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
  });
}

export const gsap = _gsap;
export const ScrollTrigger = _ScrollTrigger;

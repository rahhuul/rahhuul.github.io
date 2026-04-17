import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light mode  paper/journal palette
        cream: {
          DEFAULT: "#FAF8F5",
          50: "#FEFEFE",
          100: "#FAF8F5",
          200: "#F0EBE3",
          300: "#E2D9CE",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          light: "#2d2d2d",
          faded: "#4a4a4a",
          muted: "#6b6b6b",
        },
        accent: {
          brown: "#8B6914",
          "brown-light": "#b8963e",
          "brown-muted": "#c4a96b",
        },
        annotation: {
          red: "#c23616",
          blue: "#2c3e6b",
        },
        code: {
          green: "#2d5016",
          "green-light": "#3d6b1e",
        },
        // Dark mode
        charcoal: {
          DEFAULT: "#141414",
          100: "#1e1e1e",
          200: "#252525",
          300: "#2e2e2e",
        },
        "warm-cream": "#e8e0d4",
        "muted-amber": "#b8963e",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        handwriting: ["var(--font-caveat)", "cursive"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 8vw, 7rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.2" }],
        "body-lg": ["1.25rem", { lineHeight: "1.7" }],
        "body-md": ["1.125rem", { lineHeight: "1.7" }],
        "body-sm": ["1rem", { lineHeight: "1.6" }],
        "caption": ["0.875rem", { lineHeight: "1.5" }],
        "annotation": ["0.8125rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "section": "8rem",
        "section-sm": "5rem",
        "chapter": "12rem",
      },
      maxWidth: {
        "content": "1280px",
        "prose": "72ch",
        "narrow": "52ch",
      },
      backgroundImage: {
        "paper-grain": "url('/images/textures/noise.png')",
      },
      animation: {
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "ink-write": "ink-write 1s ease-in-out forwards",
      },
      keyframes: {
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "ink-write": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
      },
      boxShadow: {
        "polaroid": "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        "card": "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        "card-hover": "0 8px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        "ink": "inset 0 -2px 0 rgba(139, 105, 20, 0.3)",
      },
      borderRadius: {
        "journal": "2px",
      },
    },
  },
  plugins: [],
};

export default config;

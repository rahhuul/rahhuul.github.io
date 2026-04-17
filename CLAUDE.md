# CLAUDE.md  Rahul's Storytelling Portfolio

## Project Overview

Build a scroll-driven storytelling portfolio for Rahul Patel (rahhuul.github.io) that replaces the current generic template with an immersive "Developer's Journal" experience. The portfolio tells Rahul's 12+ year career story through scroll-triggered chapters  each section is a "journal entry" that unfolds as the visitor scrolls, using GSAP ScrollTrigger, Lenis smooth scroll, and cinematic text reveals.

**This is NOT a template portfolio. This is a narrative experience.**

The current site (https://rahhuul.github.io) follows a standard Hero → About → Skills → Projects → Experience → Contact flow. The new site transforms that into a story arc where the scroll itself represents the passage of time, and each section is a chapter in Rahul's journey.

---

## Design Concept: "The Developer's Journal"

### Core Aesthetic
- **Paper/ink/journal feel**  warm cream backgrounds, ink-dark text, subtle paper textures via CSS noise grain
- **Handwriting meets code**  editorial serif/handwritten font for narrative, monospace for code/tech elements
- **Torn edges, marginalia, sketches**  decorative SVG clip-paths for section transitions, side annotations
- **Polaroid-style project cards**  slightly rotated, white border, subtle shadow, tape/pin details
- **Ink animations**  text that writes itself via SVG stroke-dasharray reveals
- **Color palette**: Cream/off-white (#FAF8F5) background, ink black (#1a1a1a), accent warm brown (#8B6914), code green (#2d5016), red annotation (#c23616), faded blue ink (#2c3e6b)
- **Dark mode**: Deep charcoal (#141414) background, warm cream text (#e8e0d4), muted amber accent (#b8963e)

### Typography
- **Narrative/headings**: "Playfair Display" (Google Fonts)  editorial, journal-like
- **Handwriting accents**: "Caveat" (Google Fonts)  for dates, annotations, margin notes
- **Code/tech**: "JetBrains Mono" (Google Fonts)  monospace for technical elements
- **Body text**: "Source Serif 4" or "Lora"  readable serif for long-form
- **UI/nav elements**: "Inter" or system sans-serif  clean, doesn't compete

### Key Visual Elements
1. **Paper grain overlay**: CSS `background-image` with subtle noise, `mix-blend-mode: multiply`, very low opacity (0.03-0.05)
2. **Torn paper edges**: SVG paths as section dividers  organic, hand-torn look
3. **Ink splatter accents**: Small decorative SVG elements near headings/dates
4. **Tape/pin graphics**: CSS-only tape strips on polaroid cards (rotated rectangles with opacity)
5. **Margin annotations**: Absolutely positioned "handwritten" notes in Caveat font, slightly rotated, in annotation red or blue
6. **Chapter markers**: Left-margin dots/circles that fill as you scroll past each chapter
7. **Coffee stain ring**: One subtle decorative CSS element on the about section (radial gradient, very low opacity)

---

## Tech Stack

```
Framework:      Next.js 15 (App Router, Static Export for GitHub Pages)
Language:       TypeScript (strict)
Styling:        Tailwind CSS v4
Animation:      GSAP 3 + ScrollTrigger + SplitText (or Splitting.js as free alternative)
Smooth Scroll:  Lenis
Page Transitions: Framer Motion (AnimatePresence for route transitions)
Fonts:          Google Fonts (Playfair Display, Caveat, JetBrains Mono, Source Serif 4)
Icons:          Lucide React (minimal use)
Deployment:     GitHub Pages (static export)
Package Manager: npm
```

### Critical Dependencies
```json
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "gsap": "^3.12",
    "@studio-freight/lenis": "latest",
    "framer-motion": "^11",
    "lucide-react": "^0.383",
    "splitting": "^1.0.6"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "latest",
    "eslint": "^9",
    "prettier": "^3"
  }
}
```

### GSAP Note
GSAP is free for portfolios/personal sites. ScrollTrigger is included in the core package. SplitText is a premium plugin  use Splitting.js (free, MIT) as the alternative for character/word splitting. If using SplitText, register it: `gsap.registerPlugin(ScrollTrigger, SplitText)`.

---

## Project Structure

```
portfolio/
├── CLAUDE.md                          # This file
├── next.config.ts                     # Static export config for GitHub Pages
├── tailwind.config.ts                 # Custom theme: colors, fonts, spacing
├── tsconfig.json
├── package.json
├── public/
│   ├── images/
│   │   ├── profile.jpg                # Rahul's photo (reuse from current site)
│   │   ├── projects/                  # Project screenshots
│   │   │   ├── apilens.webp
│   │   │   ├── cms-mcp-hub.webp
│   │   │   ├── textdrip.webp
│   │   │   └── codepulse.webp
│   │   └── textures/
│   │       └── noise.png              # Paper grain texture (tiny, tileable)
│   ├── resume.pdf
│   └── fonts/                         # Self-host if needed for performance
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout: fonts, Lenis provider, metadata
│   │   ├── page.tsx                   # Main page: all chapters composed
│   │   ├── globals.css                # Tailwind imports, CSS variables, grain overlay
│   │   └── case-study/
│   │       └── [slug]/
│   │           └── page.tsx           # Individual case study pages
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx         # Floating nav  chapter indicators, minimal
│   │   │   ├── ChapterProgress.tsx    # Left-side dot/line progress indicator
│   │   │   ├── ScrollProgress.tsx     # Top thin progress bar
│   │   │   └── Footer.tsx
│   │   ├── chapters/
│   │   │   ├── Chapter01Hook.tsx      # "The Hook"  cinematic intro
│   │   │   ├── Chapter02Origin.tsx    # "Origin Story"  where it started
│   │   │   ├── Chapter03Craft.tsx     # "The Craft"  skills/expertise
│   │   │   ├── Chapter04Work.tsx      # "The Work"  projects as case studies
│   │   │   ├── Chapter05Proof.tsx     # "The Proof"  metrics, testimonials, bento
│   │   │   └── Chapter06Invitation.tsx # "The Invitation"  contact
│   │   ├── ui/
│   │   │   ├── PolaroidCard.tsx       # Rotated project card with tape effect
│   │   │   ├── JournalEntry.tsx       # Date + content wrapper with margin notes
│   │   │   ├── AnimatedCounter.tsx    # Number that counts up on scroll
│   │   │   ├── InkReveal.tsx          # SVG stroke-dasharray text reveal
│   │   │   ├── CodeMorph.tsx          # Code block that transitions between languages
│   │   │   ├── InteractiveTerminal.tsx # Fake terminal with typed commands
│   │   │   ├── TornEdge.tsx           # SVG torn paper divider
│   │   │   ├── MarginNote.tsx         # Handwritten annotation in margin
│   │   │   ├── BentoGrid.tsx          # Asymmetric stats grid
│   │   │   └── MagneticButton.tsx     # Button that attracts toward cursor
│   │   └── effects/
│   │       ├── TextReveal.tsx         # GSAP + Splitting.js character reveal
│   │       ├── ParallaxLayer.tsx      # Scroll-speed multiplier wrapper
│   │       ├── FadeInOnScroll.tsx     # Reusable scroll-triggered fade
│   │       └── StickyReveal.tsx       # Pinned visual + scrolling text (scrollytelling)
│   ├── hooks/
│   │   ├── useGsap.ts                # GSAP context + cleanup hook
│   │   ├── useLenis.ts               # Lenis instance hook
│   │   ├── useScrollProgress.ts      # Current scroll % hook
│   │   └── useInView.ts              # Intersection Observer hook
│   ├── lib/
│   │   ├── gsap-config.ts            # GSAP plugin registration, defaults
│   │   ├── lenis-config.ts           # Lenis initialization
│   │   ├── animations.ts             # Reusable GSAP timeline factories
│   │   └── constants.ts              # Colors, breakpoints, chapter data
│   ├── data/
│   │   ├── chapters.ts               # Chapter metadata (titles, dates, copy)
│   │   ├── projects.ts               # Project data (used by Chapter04)
│   │   ├── experience.ts             # Career timeline data
│   │   └── skills.ts                 # Skills/tools data
│   └── types/
│       └── index.ts                  # Shared TypeScript types
```

---

## Chapter-by-Chapter Specification

### Chapter 1: "The Hook" (Hero)
**Purpose**: Stop the scroll. One powerful moment that makes the visitor curious.

**Layout**:
- Full viewport height (100vh)
- Dark background  deep ink/charcoal
- Center-aligned single line of text that reveals character by character
- No navigation visible yet  it fades in after scroll begins
- Subtle paper grain overlay

**Content**:
```
[Character-by-character reveal, typed effect]

"I've been writing code since smartphones
were still just phones."

[Pause 1.5s]

[Fade in below:]
Rahul Patel
Tech Lead · Full-Stack Developer · 12+ Years

[Small arrow or "scroll to explore" indicator at bottom, gently bouncing]
```

**Animations**:
1. Page loads → 0.8s pause → text begins character reveal (GSAP stagger, 0.03s per char)
2. After text completes → 1s pause → name/title fades up (y: 20 → 0, opacity: 0 → 1)
3. Scroll indicator pulses with CSS keyframe (translateY bounce)
4. On scroll down: entire section parallax-fades (opacity reduces, slight y shift up)
5. Navigation bar fades in from top after 100px of scroll

**Technical Notes**:
- Use Splitting.js to wrap each character in a `<span>` with `--char-index` CSS variable
- GSAP timeline: `gsap.from('.char', { opacity: 0, y: 10, stagger: 0.03, ease: 'power2.out' })`
- Background: solid dark color, NOT an image (performance)
- `will-change: transform, opacity` on animated elements
- Wrap in `@media (prefers-reduced-motion: no-preference)`  fall back to simple fade

---

### Chapter 2: "The Origin" (Journey Timeline)
**Purpose**: Show where Rahul started and how he evolved. This is the emotional core.

**Layout**:
- Horizontal scroll section (vertical scroll drives horizontal movement)
- Each "card" is a journal entry with a year, a sketch/icon, and a short paragraph
- Background shifts from sepia/warm (2011) to modern/cool (2026)

**Content** (timeline entries):
```
2011  "First real job. Database admin. I didn't even know what an API was."
2013  "PHP changed everything. Built my first dynamic website. Felt like magic."
2014  "iDevTechnolabs. CodeIgniter, jQuery, and dreams of building something real."
2016  "Senior developer. Laravel. Finally writing code I was proud of."
2017  "Global India Technologies. React entered the picture. Everything got faster."
2018  "Full-stack reality: React + Node + MongoDB. Shipped 7 production apps in 4 years."
2022  "Moved to Pranshtech Solutions. Started leading, not just coding."
2023  "Tech Lead. 10 developers. Architecture decisions. The weight of other people's code."
2024  "Built APILens. My first SaaS. From developer to product builder."
2025  "CMS MCP Hub. Open source. 589 AI tools across 12 platforms."
2026  "Still building. Still learning. The next chapter starts here."
```

**Animations**:
1. Pin the section, scroll drives horizontal movement via GSAP ScrollTrigger
2. Each card fades/slides in as it enters the viewport from the right
3. Year numbers scale up dramatically (large, semi-transparent) as they enter
4. Background color subtly shifts across the horizontal scroll (warm sepia → neutral → cool modern)
5. A thin timeline line draws itself across the bottom as you scroll

**Technical Notes**:
- Container: `width: calc(number_of_cards * card_width)`, pinned parent
- GSAP: `gsap.to(container, { x: -totalWidth, scrollTrigger: { trigger: parent, pin: true, scrub: 1, end: () => '+=' + totalWidth } })`
- Each card is a `<div>` styled as a journal page  cream bg, subtle border, torn edge on one side
- Year numbers: font-size 8rem, opacity 0.08, positioned behind the card text
- **Mobile fallback**: No horizontal scroll on mobile (< 768px). Stack cards vertically with simple fade-in-on-scroll. Horizontal scroll is unreliable on mobile touch devices.

---

### Chapter 3: "The Craft" (Skills & Expertise)
**Purpose**: Show what Rahul can do  not as a boring icon grid, but as living, interactive demonstrations.

**Layout**:
- Scrollytelling pattern: pinned visual on the left, scrolling text on the right
- As each text block scrolls into view, the left visual changes to match
- Sections: Backend, Frontend, DevOps, Blockchain, Leadership

**Content Blocks** (right side, scrolling):
```
Block 1  "Backend is where I live"
Laravel, Node.js, Express, Fastify. REST APIs, GraphQL, WebSockets.
Database design that scales. Queue systems that never drop a message.
→ Left visual: Interactive terminal typing `curl -X POST /api/...` and showing response

Block 2  "Frontend that feels alive"
React, Next.js, TypeScript. Component systems, state management, performance obsession.
Pixel-perfect doesn't mean rigid  it means intentional.
→ Left visual: Code editor showing React component, syntax highlighting animates in

Block 3  "Infrastructure as confidence"
Docker, AWS, GitHub Actions. The code doesn't matter if it can't ship.
CI/CD pipelines, monitoring, zero-downtime deploys.
→ Left visual: Terminal showing `docker compose up` → services starting animation

Block 4  "The whole picture"
12 years taught me that the best code serves the business, not the ego.
Architecture decisions. Team mentorship. Async leadership across timezones.
→ Left visual: Bento grid of stats  12+ years, 50+ projects, 10 team members, 3 time zones
```

**Animations**:
1. Left panel is pinned (position: sticky or GSAP pin)
2. Right text blocks trigger visual transitions via Intersection Observer
3. Terminal text types out character by character (GSAP stagger on spans)
4. Code editor has syntax highlighting that fades in token by token
5. Stats in bento grid count up with AnimatedCounter component

**Technical Notes**:
- Use `position: sticky` over GSAP pin for the left panel (more reliable on mobile)
- Right side text blocks: min-height 60vh each to give scroll room
- Each visual transition: crossfade (opacity) + subtle scale (0.98 → 1.0)
- On mobile (< 1024px): stack vertically, each block gets its visual above the text
- Terminal component: monospace font, dark bg, green/white text, blinking cursor

---

### Chapter 4: "The Work" (Projects)
**Purpose**: Showcase projects as stories, not cards. Each project is a mini case study.

**Layout**:
- Stacked full-width sections, each project gets generous vertical space
- Alternating layout: image left / text right, then text left / image right
- Project images are "polaroid" style  white border, slightly rotated, tape detail
- A margin note (Caveat font) adds a personal comment on each project

**Projects to Feature** (in order):
```
1. APILens (apilens.rest)
   - "My first real product. Built because I was tired of debugging APIs blind."
   - npm package → SaaS dashboard → real users
   - Stats: Zero dependencies, real-time monitoring, free tier
   - Margin note: "This one taught me that building the product is 20%. Marketing is 80%."

2. CMS MCP Hub
   - "589 AI tools across 12 CMS platforms. Open source. One monorepo."
   - WordPress, Shopify, Strapi, Ghost, Webflow...
   - Stats: 12 platforms, 589 tools, Turborepo monorepo
   - Margin note: "The WordPress blog post about this is still pending review."

3. TextDrip (textdrip.com)
   - "Sole backend engineer. Thousands of businesses. Millions of messages."
   - SMS marketing SaaS  drip campaigns, automation, queues
   - Stats: High message throughput, Redis queues, multi-tenant
   - Margin note: "The queue system was the hardest thing I've ever built."

4. CodePulse AI
   - "Paste a GitHub URL. Get a security audit. Powered by Claude."
   - AI-powered code analysis  vulnerabilities, dead code, performance issues
   - Stats: Claude API integration, GitHub URL parsing
   - Margin note: "Still in progress. But the prototype already caught real bugs."
```

**Animations**:
1. Each project section: polaroid card slides in from the side (alternating left/right)
2. Margin notes appear with a slight rotation animation + handwriting fade
3. Stats count up on scroll into view
4. Subtle parallax on project images (slower scroll speed than text)
5. "View Project" / "Case Study" buttons have magnetic cursor effect

**Technical Notes**:
- PolaroidCard component: `transform: rotate(-2deg)` to `rotate(1deg)` randomly
- Tape effect: CSS pseudo-element  semi-transparent rectangle, rotated 45deg, positioned at top
- Margin notes: absolute positioned, Caveat font, 14px, rotated -3deg to -1deg, in red/blue ink color
- Image aspect ratio: 16:9 or 4:3, object-fit: cover, border-radius on image only (not the white frame)
- Mobile: polaroids straighten (rotation: 0), full width, margin notes below the card instead of beside

---

### Chapter 5: "The Proof" (Stats, Metrics, Social Proof)
**Purpose**: Build credibility with concrete numbers and evidence.

**Layout**:
- Bento grid  asymmetric cards of varying sizes
- Mix of: large stat cards, small detail cards, a GitHub contribution-style visualization, tech stack cloud
- One featured testimonial card (if available) or a "what colleagues say" placeholder

**Content**:
```
Large cards:
- "12+ Years" / "Writing production code since 2011"
- "50+ Projects" / "SaaS, marketplaces, e-commerce, healthcare, education"

Medium cards:
- "Tech Lead" / "Leading 7-10 developers"
- "3 Products" / "APILens, CMS MCP Hub, CodePulse AI"
- "Remote-Ready" / "US Eastern hours, async-first"

Small cards:
- "Node.js · React · Laravel · AWS" (stack summary)
- "Open Source Contributor" / GitHub link
- HackerRank certifications badge

Interactive:
- GitHub-style contribution grid (simplified, shows activity)
- "Years of code" bar chart  PHP → Laravel → Node → React (animated fill)
```

**Animations**:
1. Cards stagger in from bottom (GSAP stagger, 0.1s apart)
2. Numbers count up in large stat cards
3. Contribution grid cells fill in with a wave animation (left to right)
4. "Years of code" bars animate width from 0 to target

**Technical Notes**:
- Bento grid: CSS Grid with `grid-template-columns: repeat(4, 1fr)` and varied `grid-column: span 2` / `span 1`
- Mobile: 2 columns, simplified layout
- Cards: cream bg, subtle border, border-radius-lg, slight hover lift (translateY -2px)
- No real GitHub API calls  use static/representative data for the contribution grid

---

### Chapter 6: "The Invitation" (Contact)
**Purpose**: End the story with a personal invitation. Not a generic contact form.

**Layout**:
- Full viewport, darker background (journal cover closing)
- Large handwritten-style text: "The next chapter starts with a conversation."
- Simple contact details  email, phone, links
- A final journal "entry" style: date is today, content is the CTA

**Content**:
```
[Large, Caveat font, handwritten feel]
"The next chapter starts with a conversation."

[Below, clean sans-serif]
Senior engineering roles, architecture consulting,
or a product you need shipped  I'll reply within a day.

[Contact cards]
📧 rahul.patel786@gmail.com
📱 +91 903-304-3379

[Social links  GitHub, LinkedIn, Twitter]

[Status badge]
🟢 Open for work  Full-time · Contract · Freelance

[Final line, very small, Caveat font]
"Thanks for reading.  Rahul, April 2026"
```

**Animations**:
1. Headline reveals word by word (Splitting.js + GSAP stagger)
2. Contact cards fade up sequentially
3. Status badge pulses gently (CSS animation on the green dot)
4. Signature line fades in last, 0.5s after everything else

---

## Navigation & Progress System

### Floating Navigation
- Fixed top bar, transparent initially, gains background on scroll
- Left: "RP" monogram or "rahul · patel" (links to top)
- Right: "Resume" button + hamburger (mobile) or chapter links (desktop)
- Chapter links show as small text: "hook · origin · craft · work · proof · contact"
- Active chapter is highlighted (underline or bold)
- Navigation fades in after first 100px of scroll (not visible on the hook chapter)

### Chapter Progress Indicator
- Left side of viewport, fixed position
- 6 dots (one per chapter), connected by a thin line
- Current chapter's dot is filled/larger
- Dots are clickable  smooth scroll to that chapter via Lenis
- Labels appear on hover: "The Hook", "Origin", etc.
- Hidden on mobile (screen too narrow)

### Scroll Progress Bar
- Thin (2px) horizontal bar at very top of page
- Fills left to right as you scroll
- Color matches the accent (warm brown)
- Always visible, all screen sizes

---

## Animation Rules & Performance

### GSAP Best Practices
1. **Always register plugins at app level**: `gsap.registerPlugin(ScrollTrigger)` in `gsap-config.ts`
2. **Use `useGsap` hook** for React cleanup  kill ScrollTriggers on unmount
3. **Scrub over toggle**: Use `scrub: 1` (1s smoothing) for scroll-tied animations, `toggleActions` for enter/leave
4. **Avoid `pin: true` on mobile**: Use CSS `position: sticky` instead, or disable pinning below 768px
5. **Batch similar animations**: Use `gsap.utils.toArray('.fade-in').forEach(...)` not individual timelines
6. **Stagger pattern**: `stagger: { amount: 0.6, from: 'start' }` for group reveals

### Performance Rules
1. **Only animate `transform` and `opacity`**  never animate width, height, top, left, margin, padding
2. **`will-change: transform, opacity`** on elements that will animate (add via CSS class, remove after animation)
3. **`@media (prefers-reduced-motion: reduce)`**  disable all scroll-driven animations, show all content immediately
4. **Lazy load images** below the fold: `loading="lazy"` + `decoding="async"` on all `<img>`
5. **Font loading**: `font-display: swap` on all @font-face. Preload critical fonts (Playfair Display, Source Serif 4)
6. **No layout thrashing**: Don't read DOM measurements inside animation callbacks
7. **ScrollTrigger.refresh()**: Call after dynamic content loads or window resize
8. **Kill animations on unmount**: Every `useEffect` that creates GSAP animations must return a cleanup function
9. **Image formats**: WebP with JPEG fallback. Max width 1200px. Compress to < 100KB per image
10. **Target Lighthouse score**: 90+ on all metrics (Performance, Accessibility, Best Practices, SEO)

### Reduced Motion Strategy
```tsx
// In every animation component:
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Show all content immediately, no animations
  gsap.set(elements, { opacity: 1, y: 0, x: 0 });
  return;
}
// ... normal animation code
```

---

## Responsive Breakpoints

```
Mobile:    < 640px    Single column, no horizontal scroll, simplified animations
Tablet:    640-1023px  Two columns where appropriate, reduced parallax
Desktop:   1024-1439px  Full layout, all animations active
Wide:      1440px+    Max content width 1280px, centered, generous margins
```

### Mobile-Specific Rules
1. **No horizontal scroll sections**  stack vertically with fade-in
2. **No pinned/sticky reveals**  content flows naturally
3. **Polaroid cards**  no rotation, full width
4. **Chapter progress dots**  hidden (use scroll progress bar only)
5. **Navigation**  hamburger menu with chapter list
6. **Font sizes**: Scale down headings (Display: 36px → 28px)
7. **Reduce animation complexity**  simple fades/slides only, no character-level reveals
8. **Touch-friendly**  all interactive elements min 44x44px tap target

---

## GitHub Pages Deployment

### next.config.ts
```typescript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js image optimization
  },
  basePath: '', // Set to '/repo-name' if not using custom domain
  assetPrefix: '', // Same as basePath
};
```

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
- Trigger: push to main
- Steps: checkout → setup Node 20 → npm ci → npm run build → deploy `out/` to gh-pages branch
- Use `actions/deploy-pages@v4` or `peaceiris/actions-gh-pages@v3`

---

## Content Data (src/data/)

### Rahul's Real Data (use this, don't invent)

**Name**: Rahul Patel
**Title**: Tech Lead & Full-Stack Developer
**Location**: Ahmedabad, India
**Remote**: Yes  US Eastern aligned hours (4 PM – 1:30 AM IST)
**Experience**: 12+ years (since 2011)
**Handle**: @rahhuul (GitHub, LinkedIn, npm, WordPress.org)

**Email**: rahul.patel786@gmail.com
**Phone**: +91 903-304-3379
**GitHub**: https://github.com/rahhuul
**LinkedIn**: https://www.linkedin.com/in/rahhuul
**Twitter**: https://x.com/rahhuul310

**Career Timeline**:
| Year | Role | Company |
|------|------|---------|
| 2011-2013 | Database Admin | Rural Shores Technologies |
| 2013-2016 | PHP Developer | Global India Technologies |
| 2016-2017 | Sr. PHP Developer | Siddhi Infosoft |
| 2017-2023 | Project Manager / Sr. Full-Stack Dev | Global India Technologies |
| 2023-Present | Tech Lead | Pranshtech Solutions |

**Core Stack**:
Node.js, TypeScript, React, Next.js, PHP, Laravel, WordPress/WooCommerce, Solidity/Web3, AWS, Docker, MongoDB, PostgreSQL, MySQL, Redis, GraphQL, REST APIs

**Products**:
1. APILens (apilens.rest)  API observability SaaS + auto-api-observe npm package
2. CMS MCP Hub  589 MCP tools across 12 CMS platforms (open source)
3. CodePulse AI  AI-powered code security scanner (in progress)

**Key Stats**:
- 12+ years experience
- 50+ projects delivered
- 30+ clients served
- 7-10 developers led as Tech Lead
- 3 own products built

**Resume PDF**: /resume.pdf (link to download)

---

## Build Order (for Claude Code)

Execute in this exact order. Each step should be a working, viewable state.

### Phase 1: Foundation (do this first, completely)
1. Initialize Next.js 15 project with TypeScript + Tailwind v4
2. Configure `next.config.ts` for static export
3. Set up fonts (Google Fonts via next/font/google)
4. Create `globals.css` with CSS variables, paper grain overlay, base styles
5. Create Tailwind config with custom colors, fonts, spacing
6. Create `src/lib/constants.ts` with all colors, chapter data
7. Create `src/data/` files with all real content
8. Build basic page layout  verify it renders and exports

### Phase 2: Animation Infrastructure
1. Create `src/lib/gsap-config.ts`  register plugins
2. Create `src/hooks/useGsap.ts`  GSAP context + cleanup
3. Create `src/hooks/useLenis.ts`  smooth scroll provider
4. Create `src/hooks/useInView.ts`  Intersection Observer
5. Set up Lenis in root layout
6. Create `src/components/effects/TextReveal.tsx`  reusable text animation
7. Create `src/components/effects/FadeInOnScroll.tsx`  reusable fade
8. Test: scroll the page and verify Lenis smooth scroll works

### Phase 3: Navigation & Progress
1. Build `Navigation.tsx`  floating nav with chapter links
2. Build `ChapterProgress.tsx`  left-side dot indicator
3. Build `ScrollProgress.tsx`  top bar
4. Wire up: nav appears after scroll, dots update, progress fills

### Phase 4: Chapters (build one at a time, top to bottom)
1. `Chapter01Hook.tsx`  hero with character reveal
2. `Chapter02Origin.tsx`  horizontal scroll timeline
3. `Chapter03Craft.tsx`  scrollytelling skills section
4. `Chapter04Work.tsx`  polaroid project cards
5. `Chapter05Proof.tsx`  bento grid stats
6. `Chapter06Invitation.tsx`  contact section

### Phase 5: Polish & Responsive
1. Mobile responsive pass on ALL chapters
2. Reduced motion support
3. Accessibility audit (semantic HTML, aria labels, keyboard nav, color contrast)
4. Performance optimization (lazy loading, font preload, image compression)
5. SEO: meta tags, Open Graph, structured data
6. GitHub Actions deployment workflow

---

## Quality Checklist (verify before shipping)

- [ ] All text content matches Rahul's real data (no placeholder Lorem ipsum)
- [ ] Smooth scroll works on Chrome, Firefox, Safari
- [ ] Mobile layout works on 375px width (iPhone SE)
- [ ] `prefers-reduced-motion` disables all scroll animations gracefully
- [ ] No horizontal overflow on any screen size
- [ ] All links work (GitHub, LinkedIn, email, phone, resume)
- [ ] Navigation chapter indicators update correctly on scroll
- [ ] Lighthouse: 90+ Performance, 90+ Accessibility, 90+ Best Practices, 90+ SEO
- [ ] Static export (`npm run build`) produces working `out/` directory
- [ ] No console errors in dev or production
- [ ] Fonts load without visible FOUT (use font-display: swap + preload)
- [ ] Dark mode works and respects system preference
- [ ] Images are WebP, compressed, lazy-loaded below fold
- [ ] Page load: hero content visible within 1.5s on 3G

---

## Style Guide Reference

### DO
- Use warm, paper-like backgrounds (#FAF8F5 light, #141414 dark)
- Mix serif (Playfair Display) for headlines with monospace (JetBrains Mono) for code
- Add handwritten annotations (Caveat) sparingly  max 1 per section
- Use subtle paper grain texture overlay (opacity 0.03-0.05)
- Make scroll animations purposeful  each one should reveal content, not just move it
- Keep animations under 1.5s duration (feel snappy, not sluggish)
- Use `ease: 'power2.out'` as default easing (smooth deceleration)

### DON'T
- Don't use more than 3 font families in one viewport
- Don't animate layout properties (width, height, margin, padding)
- Don't use `pin: true` on mobile devices
- Don't make the user wait more than 2s to see content
- Don't use heavy 3D/WebGL  this is a journal, not a game
- Don't auto-play videos or audio
- Don't add more than 1 parallax layer per section
- Don't use backdrop-filter: blur() (performance killer on mobile)
- Don't add animations that don't serve the narrative
- Don't use icon grids for skills  show them in context
- Don't copy Kishan's site layout/structure  this should look NOTHING like it

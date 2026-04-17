export type BlogPillar = "building" | "technical" | "career" | "tutorial" | "opinion";

export interface BlogPost {
  slug: string;
  title: string;
  description: string; // meta description, 155 chars max
  date: string;        // ISO date
  readTime: string;
  tags: string[];
  pillar: BlogPillar;
  featured: boolean;
  externalUrl?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-i-built-zero-dependency-npm-package",
    title: "How I Built a Zero-Dependency npm Package from Scratch",
    description:
      "The story behind auto-api-observe  a zero-dependency Express/Fastify observability middleware. Architecture decisions, AsyncLocalStorage, and why I said no to every dependency.",
    date: "2026-03-15",
    readTime: "8 min read",
    tags: ["Node.js", "npm", "Open Source", "APILens"],
    pillar: "building",
    featured: true,
  },
  {
    slug: "asynclocalstorage-nodejs-complete-guide",
    title: "AsyncLocalStorage in Node.js: The Complete Guide with Real Examples",
    description:
      "Everything you need to know about AsyncLocalStorage  from basic context tracking to building a full request-scoped logging system without passing req objects everywhere.",
    date: "2026-03-01",
    readTime: "12 min read",
    tags: ["Node.js", "TypeScript", "Backend", "Tutorial"],
    pillar: "technical",
    featured: true,
  },
  {
    slug: "building-mcp-server-wordpress",
    title: "How to Build an MCP Server for WordPress from Scratch",
    description:
      "A step-by-step guide to building a Model Context Protocol server that lets Claude manage WordPress content. Zod schemas, tool definitions, and REST API integration.",
    date: "2026-02-20",
    readTime: "15 min read",
    tags: ["MCP", "WordPress", "AI", "TypeScript", "CMS MCP Hub"],
    pillar: "technical",
    featured: true,
  },
  {
    slug: "from-database-admin-to-tech-lead",
    title: "From Database Admin to Tech Lead: A 12-Year Roadmap",
    description:
      "My journey from writing SQL queries in 2011 to leading 10 developers in 2026. The skills that mattered, the ones that didn't, and what I wish I'd learned sooner.",
    date: "2026-02-10",
    readTime: "10 min read",
    tags: ["Career", "Leadership", "Growth"],
    pillar: "career",
    featured: false,
  },
  {
    slug: "nextjs-static-export-github-pages-guide",
    title: "Next.js 15 Static Export to GitHub Pages  The Complete Guide",
    description:
      "Deploy Next.js 15 App Router to GitHub Pages with static export. Covers next.config, GitHub Actions, fonts, images, trailing slashes, and common pitfalls.",
    date: "2026-01-25",
    readTime: "7 min read",
    tags: ["Next.js", "GitHub Pages", "Deployment", "Tutorial"],
    pillar: "tutorial",
    featured: false,
  },
  {
    slug: "589-mcp-tools-one-monorepo",
    title: "589 MCP Tools in One Monorepo: How I Built CMS MCP Hub",
    description:
      "Architecture decisions behind CMS MCP Hub  a Turborepo monorepo of MCP servers for 12 CMS platforms. Zod validation, universal REST gateway, and tsup builds.",
    date: "2026-01-15",
    readTime: "11 min read",
    tags: ["MCP", "Open Source", "Turborepo", "TypeScript"],
    pillar: "building",
    featured: false,
  },
  {
    slug: "code-review-culture-reduced-bugs-40-percent",
    title: "Code Review Culture: How I Reduced Production Bugs by 40%",
    description:
      "The code review process I built at Pranshtech Solutions  PR templates, review checklists, mentoring patterns, and how it measurably reduced production bugs.",
    date: "2026-01-05",
    readTime: "9 min read",
    tags: ["Leadership", "Code Review", "Best Practices", "Team"],
    pillar: "career",
    featured: false,
  },
  {
    slug: "gsap-scrolltrigger-lenis-nextjs-scroll-animations",
    title: "GSAP ScrollTrigger + Lenis: Building Scroll-Driven Animations in Next.js",
    description:
      "How to build smooth scroll-driven animations in Next.js using GSAP ScrollTrigger and Lenis. Character reveals, parallax, horizontal scroll, and mobile fallbacks.",
    date: "2025-12-20",
    readTime: "13 min read",
    tags: ["GSAP", "Lenis", "Next.js", "Animation", "Tutorial"],
    pillar: "tutorial",
    featured: false,
  },
  {
    slug: "you-dont-need-50-dependencies",
    title: "You Don't Need 50 Dependencies  Build Your Own Framework",
    description:
      "Why I'm building a Node.js framework with zero external dependencies. The real cost of npm install, and what happens when you say no to everything.",
    date: "2025-12-10",
    readTime: "6 min read",
    tags: ["Node.js", "Opinion", "Architecture", "Zero Dependencies"],
    pillar: "opinion",
    featured: false,
  },
  {
    slug: "leading-developers-remotely-from-india",
    title: "Leading 10 Developers Remotely from India  What Actually Works",
    description:
      "Practical lessons from leading a distributed team across timezones. Async standups, Jira workflows, 1:1 patterns, and why overcommunication beats undercommunication.",
    date: "2025-11-28",
    readTime: "8 min read",
    tags: ["Remote Work", "Leadership", "Async", "Career"],
    pillar: "career",
    featured: false,
  },
];

export function getFeaturedPosts(): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.featured);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const byTag = BLOG_POSTS.filter(
    (p) =>
      p.slug !== post.slug &&
      p.tags.some((t) => post.tags.includes(t))
  );
  // Fallback: most recent posts when no tag overlap
  if (byTag.length === 0) {
    return BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, limit);
  }
  return byTag.slice(0, limit);
}

// Human-readable pillar labels
export const PILLAR_LABELS: Record<BlogPillar, string> = {
  building: "Building",
  technical: "Technical",
  career: "Career",
  tutorial: "Tutorial",
  opinion: "Opinion",
};

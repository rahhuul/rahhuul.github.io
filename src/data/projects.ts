// Project data  real products Rahul has built

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  story: string; // First-person narrative
  marginNote: string; // Handwritten annotation in Caveat font
  url?: string;
  github?: string;
  npmPackage?: string;
  image: string; // Path in /public/images/projects/
  stats: ProjectStat[];
  tech: string[];
  type: "saas" | "open-source" | "client" | "in-progress";
  year: number;
  featured: boolean;
}

export interface ProjectStat {
  label: string;
  value: string;
}

export const PROJECTS: Project[] = [
  {
    id: "apilens",
    name: "APILens",
    tagline: "API observability you can actually use",
    description:
      "Real-time API monitoring and observability SaaS. Started as an npm package, evolved into a full dashboard. Built because I was tired of debugging APIs blind.",
    story:
      "My first real product. I built this because every time I was debugging a production issue, I was flying blind  no visibility into what APIs were actually doing. Zero dependencies in the npm package. Real-time monitoring in the dashboard. Real users.",
    marginNote:
      "This one taught me that building the product is 20%. Marketing is 80%.",
    url: "https://apilens.rest",
    npmPackage: "auto-api-observe",
    image: "/images/projects/apilens.webp",
    stats: [
      { label: "Dependencies", value: "Zero" },
      { label: "Monitoring", value: "Real-time" },
      { label: "Package", value: "npm" },
    ],
    tech: ["Node.js", "TypeScript", "React", "Next.js", "PostgreSQL", "Redis"],
    type: "saas",
    year: 2026,
    featured: true,
  },
  {
    id: "cms-mcp-hub",
    name: "CMS MCP Hub",
    tagline: "589 AI tools. 12 platforms. One monorepo.",
    description:
      "Open-source collection of Model Context Protocol tools for every major CMS platform. WordPress, Shopify, Strapi, Ghost, Webflow, and more.",
    story:
      "589 AI tools across 12 CMS platforms. Open source. One Turborepo monorepo. Built because the AI tooling ecosystem for CMS platforms was fragmented and incomplete.",
    marginNote: "The WordPress blog post about this is still pending review.",
    github: "https://github.com/rahhuul",
    image: "/images/projects/cms-mcp-hub.webp",
    stats: [
      { label: "Platforms", value: "12" },
      { label: "Tools", value: "589" },
      { label: "Architecture", value: "Monorepo" },
    ],
    tech: [
      "TypeScript",
      "Turborepo",
      "Node.js",
      "WordPress REST API",
      "Shopify API",
      "Strapi",
    ],
    type: "open-source",
    year: 2025,
    featured: true,
  },
  {
    id: "textdrip",
    name: "TextDrip",
    tagline: "SMS drip campaigns that actually deliver",
    description:
      "Backend engineering for a high-throughput SMS marketing SaaS. Drip campaigns, automation sequences, Redis-powered queues, multi-tenant architecture.",
    story:
      "Sole backend engineer. Thousands of businesses. Millions of messages. The queue system was the hardest thing I've ever built  getting it to be reliable at scale without dropping a single message.",
    marginNote: "The queue system was the hardest thing I've ever built.",
    url: "https://textdrip.com",
    image: "/images/projects/textdrip.webp",
    stats: [
      { label: "Throughput", value: "High" },
      { label: "Queue", value: "Redis" },
      { label: "Architecture", value: "Multi-tenant" },
    ],
    tech: ["Node.js", "Redis", "PostgreSQL", "AWS SQS", "Twilio", "Express"],
    type: "client",
    year: 2022,
    featured: true,
  },
  {
    id: "codepulse",
    name: "CodePulse AI",
    tagline: "Paste a GitHub URL. Get a security audit.",
    description:
      "AI-powered code analysis tool. Paste any GitHub repository URL and get a comprehensive security audit  vulnerabilities, dead code, performance issues, architectural concerns.",
    story:
      "Still in progress. Powered by Claude. The prototype already caught real bugs in real codebases. Paste a GitHub URL, get back a structured security audit in seconds.",
    marginNote: "Still in progress. But the prototype already caught real bugs.",
    url: "https://rahhuul.github.io/codepulse-ai",
    image: "/images/projects/codepulse.webp",
    stats: [
      { label: "AI", value: "Claude API" },
      { label: "Input", value: "GitHub URL" },
      { label: "Status", value: "In progress" },
    ],
    tech: ["TypeScript", "Next.js", "Claude API", "GitHub API", "Node.js"],
    type: "in-progress",
    year: 2026,
    featured: true,
  },
];

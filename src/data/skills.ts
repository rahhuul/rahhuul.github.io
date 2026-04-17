// Skills data  organized by domain for Chapter 3 (The Craft)

export interface SkillDomain {
  id: string;
  title: string;
  subtitle: string;
  narrative: string; // First-person paragraph
  skills: string[];
  visual: "terminal" | "code-editor" | "docker" | "bento";
  terminalCommands?: string[]; // For terminal visual
  codeSnippet?: string; // For code editor visual
}

export const SKILL_DOMAINS: SkillDomain[] = [
  {
    id: "backend",
    title: "Backend is where I live",
    subtitle: "12 years of server-side thinking",
    narrative:
      "Laravel, Node.js, Express, Fastify. REST APIs, GraphQL, WebSockets. Database design that scales. Queue systems that never drop a message.",
    skills: [
      "Node.js",
      "TypeScript",
      "PHP",
      "Laravel",
      "Express",
      "Fastify",
      "GraphQL",
      "REST APIs",
      "WebSockets",
      "Redis",
      "PostgreSQL",
      "MySQL",
      "MongoDB",
    ],
    visual: "terminal",
    terminalCommands: [
      "curl -X POST /api/monitor \\",
      "  -H 'Content-Type: application/json' \\",
      "  -d '{\"endpoint\": \"/api/users\", \"interval\": 60}'",
      "",
      '{ "id": "mon_01J...", "status": "active", "latency_p99": "42ms" }',
    ],
  },
  {
    id: "frontend",
    title: "Frontend that feels alive",
    subtitle: "Components with intention",
    narrative:
      "React, Next.js, TypeScript. Component systems, state management, performance obsession. Pixel-perfect doesn't mean rigid it means intentional.",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "GSAP",
      "Framer Motion",
      "Redux",
      "Zustand",
      "React Query",
    ],
    visual: "code-editor",
    codeSnippet: `function APIMonitor({ endpoint }: Props) {
  const { data, latency } = useRealtime(endpoint)

  return (
    <Card className="monitor">
      <Status active={data.isUp} />
      <Latency value={latency.p99} />
      <Timeline events={data.recent} />
    </Card>
  )
}`,
  },
  {
    id: "devops",
    title: "Infrastructure as confidence",
    subtitle: "The code doesn't matter if it can't ship",
    narrative:
      "Docker, AWS, GitHub Actions. CI/CD pipelines, monitoring, zero-downtime deploys. The code doesn't matter if it can't ship.",
    skills: [
      "Docker",
      "AWS",
      "GitHub Actions",
      "CI/CD",
      "Nginx",
      "Linux",
      "Vercel",
      "Railway",
      "Monitoring",
    ],
    visual: "docker",
    terminalCommands: [
      "docker compose up --build",
      "",
      "✔ api        Started   0.0.0.0:3000->3000/tcp",
      "✔ worker     Started   (background)",
      "✔ postgres   Started   0.0.0.0:5432->5432/tcp",
      "✔ redis      Started   0.0.0.0:6379->6379/tcp",
      "",
      "🚀 All services healthy",
    ],
  },
  {
    id: "leadership",
    title: "The whole picture",
    subtitle: "Code serves the business, not the ego",
    narrative:
      "12 years taught me that the best code serves the business, not the ego. Architecture decisions. Team mentorship. Async leadership across time zones.",
    skills: [
      "Tech Leadership",
      "Architecture",
      "Code Review",
      "Mentorship",
      "Async Communication",
      "Sprint Planning",
      "System Design",
    ],
    visual: "bento",
  },
];

// Tech stack for Chapter 5 (The Proof)  condensed display
export const TECH_STACK_SUMMARY = [
  "Node.js",
  "React",
  "Next.js",
  "TypeScript",
  "Laravel",
  "PHP",
  "AWS",
  "Docker",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "GraphQL",
];

// Years of experience per technology (for animated bars)
export interface TechYears {
  tech: string;
  years: number;
  maxYears: number;
}

export const TECH_YEARS: TechYears[] = [
  { tech: "PHP / Laravel", years: 10, maxYears: 14 },
  { tech: "JavaScript / Node.js", years: 9, maxYears: 14 },
  { tech: "React / Next.js", years: 8, maxYears: 14 },
  { tech: "TypeScript", years: 5, maxYears: 14 },
  { tech: "Databases (SQL/NoSQL)", years: 13, maxYears: 14 },
  { tech: "AWS / Cloud", years: 7, maxYears: 14 },
  { tech: "Docker / DevOps", years: 6, maxYears: 14 },
];

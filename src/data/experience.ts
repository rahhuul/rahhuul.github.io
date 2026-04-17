// Career timeline  real data from Rahul's history

export interface TimelineEntry {
  year: string;
  yearStart: number;
  yearEnd: number | null; // null = present
  role: string;
  company: string;
  narrative: string; // Journal-voice description
  tech: string[];
}

export const TIMELINE: TimelineEntry[] = [
  {
    year: "2011",
    yearStart: 2011,
    yearEnd: 2013,
    role: "Database Administrator",
    company: "Rural Shores Technologies",
    narrative:
      "First real job. Database admin. I didn't even know what an API was.",
    tech: ["MySQL", "SQL Server", "Excel VBA"],
  },
  {
    year: "2013",
    yearStart: 2013,
    yearEnd: 2016,
    role: "PHP Developer",
    company: "Global India Technologies",
    narrative:
      "PHP changed everything. Built my first dynamic website. Felt like magic.",
    tech: ["PHP", "CodeIgniter", "jQuery", "MySQL"],
  },
  {
    year: "2016",
    yearStart: 2016,
    yearEnd: 2017,
    role: "Senior PHP Developer",
    company: "Siddhi Infosoft",
    narrative: "Senior developer. Laravel. Finally writing code I was proud of.",
    tech: ["PHP", "Laravel", "Vue.js", "REST APIs"],
  },
  {
    year: "2017",
    yearStart: 2017,
    yearEnd: 2023,
    role: "Project Manager / Senior Full-Stack Developer",
    company: "Global India Technologies",
    narrative:
      "React entered the picture. Everything got faster. Full-stack reality: React + Node + MongoDB. Shipped 7 production apps in 4 years.",
    tech: ["React", "Node.js", "Laravel", "MongoDB", "AWS", "Docker"],
  },
  {
    year: "2023",
    yearStart: 2023,
    yearEnd: null,
    role: "Tech Lead",
    company: "Pranshtech Solutions",
    narrative:
      "Tech Lead. 10 developers. Architecture decisions. The weight of other people's code.",
    tech: [
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "AWS",
      "PostgreSQL",
      "Redis",
    ],
  },
];

// Narrative journal entries (Chapter 2 horizontal scroll)
export interface JournalEntry {
  year: string;
  entry: string;
}

export const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    year: "2011",
    entry:
      "First real job. Database admin. I didn't even know what an API was.",
  },
  {
    year: "2013",
    entry:
      "PHP changed everything. Built my first dynamic website. Felt like magic.",
  },
  {
    year: "2014",
    entry:
      "iDevTechnolabs. CodeIgniter, jQuery, and dreams of building something real.",
  },
  {
    year: "2016",
    entry:
      "Senior developer. Laravel. Finally writing code I was proud of.",
  },
  {
    year: "2017",
    entry:
      "Global India Technologies. React entered the picture. Everything got faster.",
  },
  {
    year: "2018",
    entry:
      "Full-stack reality: React + Node + MongoDB. Shipped 7 production apps in 4 years.",
  },
  {
    year: "2022",
    entry:
      "Moved to Pranshtech Solutions. Started leading, not just coding.",
  },
  {
    year: "2023",
    entry:
      "Tech Lead. 10 developers. Architecture decisions. The weight of other people's code.",
  },
  {
    year: "2025",
    entry: "CMS MCP Hub. Open source. 589 AI tools across 12 CMS platforms. One Turborepo monorepo.",
  },
  {
    year: "2026",
    entry:
      "Built APILens. My first SaaS. From developer to product builder. Still building. The next chapter starts here.",
  },
];

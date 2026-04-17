import type { ContentBlock } from "./blog-content-types";

export const POST_CONTENT_C: Record<string, ContentBlock[]> = {
  "you-dont-need-50-dependencies": [
    {
      type: "p",
      text: "Run `npm install` on a freshly scaffolded Express app. Then run `npm ls --all 2>/dev/null | wc -l`. Go ahead, I'll wait.",
    },
    {
      type: "p",
      text: "On a recent project I inherited, that number was 847. Eight hundred and forty-seven lines of dependency tree. The app itself was a REST API with six endpoints. It stored data in Postgres and sent emails. That's it.",
    },
    {
      type: "p",
      text: "Somewhere in the last decade, installing 200 transitive dependencies for a TODO app became the default. I want to talk about why that's a problem, and what I've been doing about it.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Real Costs  Not the Ones You Think",
    },
    {
      type: "p",
      text: "Bundle size is the obvious one, and the one nobody actually fixes. But the costs I care about are more insidious.",
    },
    {
      type: "h3",
      text: "Security vulnerabilities you didn't write",
    },
    {
      type: "p",
      text: "A while back I ran `npm audit` on a production Node.js API at a client's request. The report came back with 47 high-severity vulnerabilities. I spent about 20 minutes going through each one. Not a single vulnerability was in code I had written. Every single one was buried in transitive dependencies  packages that packages that packages that I actually needed had pulled in.",
    },
    {
      type: "p",
      text: "Try explaining that to a client. \"Yes, there are 47 high-severity vulnerabilities. No, I didn't write any of the vulnerable code. Yes, it's still my problem.\"",
    },
    {
      type: "callout",
      variant: "warning",
      text: "Every dependency you add is a dependency you implicitly vouch for. You're trusting not just the package, but every package that package trusts, and every package *those* packages trust. You have no idea who most of those people are.",
    },
    {
      type: "h3",
      text: "The left-pad, colors.js, node-ipc problem",
    },
    {
      type: "p",
      text: "You've heard about left-pad. A developer unpublished a tiny string-padding utility and broke half the internet's CI pipelines overnight. That was 2016. We didn't learn.",
    },
    {
      type: "p",
      text: "In 2022, the maintainer of `colors.js` and `faker.js` deliberately corrupted his own packages to protest unpaid open source labor. Thousands of projects pulled in infinite loops and broken output because they trusted a string that `npm install` printed.",
    },
    {
      type: "p",
      text: "Also in 2022, `node-ipc`  a package with 1 million weekly downloads  had malicious code added that would delete files if it detected you were in Russia or Belarus. It was in a *minor* version bump.",
    },
    {
      type: "p",
      text: "These aren't edge cases. They're the supply chain when you've decided that \"batteries included\" means pulling in 200 packages to avoid writing 50 lines of code.",
    },
    {
      type: "h3",
      text: "Cognitive overhead",
    },
    {
      type: "p",
      text: "This is the one that actually slows down development the most, and nobody talks about it. Every dependency is a surface area your team has to understand. When something breaks, you have to know whether the bug is in your code, in a library, or in the interaction between two libraries that don't quite agree on how to handle an edge case.",
    },
    {
      type: "p",
      text: "I've watched junior developers spend three hours debugging something because they didn't understand how `passport.js` serializes sessions  because they don't need to understand it, it \"just works.\" Until it doesn't.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "\"Zero Dependencies\" Is a Spectrum",
    },
    {
      type: "p",
      text: "When I say zero dependencies, I don't mean \"never use npm.\" That's not pragmatism, that's theater. I mean: **every dependency you add should be a deliberate decision you can justify**, not a default.",
    },
    {
      type: "ul",
      items: [
        "**Zero deps**  nothing in `dependencies`. Runtime needs only Node.js built-ins. Best for libraries and middleware.",
        "**Minimal deps**  a handful of well-chosen packages. Zod for validation, date-fns for dates, a real test runner. Every one is justified.",
        "**Framework-level**  you're building on a framework (Next.js, NestJS). You're accepting a large dependency graph in exchange for a solved infrastructure problem.",
      ],
    },
    {
      type: "p",
      text: "The framework case is legitimate. But a lot of apps that import a framework also import 40 more packages on top of it, each solving a problem that the framework already solves, or that the developer didn't need to solve at all.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "Building Your Own HTTP Router Is Not That Hard",
    },
    {
      type: "p",
      text: "Here's what a usable HTTP router looks like in pure Node.js. Not \"production-ready\" in the sense of handling every edge case, but production-ready in the sense of shipping real apps:",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "router.ts",
      code: `import { IncomingMessage, ServerResponse } from "http";

type Handler = (req: IncomingMessage, res: ServerResponse, params: Record<string, string>) => void | Promise<void>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  private register(method: string, path: string, handler: Handler) {
    const paramNames: string[] = [];
    const pattern = new RegExp(
      "^" + path.replace(/:([a-zA-Z]+)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      }) + "(?:/)?$"
    );
    this.routes.push({ method: method.toUpperCase(), pattern, paramNames, handler });
  }

  get(path: string, handler: Handler)    { this.register("GET", path, handler); }
  post(path: string, handler: Handler)   { this.register("POST", path, handler); }
  put(path: string, handler: Handler)    { this.register("PUT", path, handler); }
  delete(path: string, handler: Handler) { this.register("DELETE", path, handler); }

  async handle(req: IncomingMessage, res: ServerResponse) {
    const url = req.url?.split("?")[0] ?? "/";
    const method = req.method?.toUpperCase() ?? "GET";

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = url.match(route.pattern);
      if (!match) continue;

      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => { params[name] = match[i + 1]; });

      await route.handler(req, res, params);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
}`,
    },
    {
      type: "p",
      text: "That's 40 lines. It handles `GET /users/:id`, `POST /api/orders`, nested paths, async handlers, and 404s. No `express`, no `fastify`, no `koa`. You own every line of it.",
    },
    {
      type: "callout",
      variant: "tip",
      text: "You'll need to add body parsing, query string parsing, and middleware support before this is truly production-ready. Each of those is another 20-40 lines  and you'll understand exactly what's happening at every step.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "Building Your Own Validation Is Not That Hard Either",
    },
    {
      type: "p",
      text: "I'm not saying don't use Zod. Zod is excellent and I use it. But if you can't use it (CLI tool, library with zero-dep requirement, size-constrained environment), here's a type-safe validator that covers 80% of what most apps actually need:",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "validate.ts",
      code: `type Schema = {
  [key: string]: {
    type: "string" | "number" | "boolean" | "array";
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
};

type InferType<S extends Schema> = {
  [K in keyof S]: S[K]["type"] extends "string"
    ? string
    : S[K]["type"] extends "number"
    ? number
    : S[K]["type"] extends "boolean"
    ? boolean
    : unknown[];
};

export function validate<S extends Schema>(
  data: unknown,
  schema: S
): { ok: true; data: InferType<S> } | { ok: false; errors: string[] } {
  if (typeof data !== "object" || data === null) {
    return { ok: false, errors: ["Input must be an object"] };
  }

  const errors: string[] = [];
  const input = data as Record<string, unknown>;

  for (const [key, rule] of Object.entries(schema)) {
    const value = input[key];

    if (rule.required && (value === undefined || value === null)) {
      errors.push(\`\${key}: required\`);
      continue;
    }

    if (value === undefined || value === null) continue;

    if (typeof value !== rule.type && !(rule.type === "array" && Array.isArray(value))) {
      errors.push(\`\${key}: expected \${rule.type}, got \${typeof value}\`);
      continue;
    }

    if (rule.type === "string" && typeof value === "string") {
      if (rule.min !== undefined && value.length < rule.min)
        errors.push(\`\${key}: min length \${rule.min}\`);
      if (rule.max !== undefined && value.length > rule.max)
        errors.push(\`\${key}: max length \${rule.max}\`);
      if (rule.pattern && !rule.pattern.test(value))
        errors.push(\`\${key}: invalid format\`);
    }

    if (rule.type === "number" && typeof value === "number") {
      if (rule.min !== undefined && value < rule.min)
        errors.push(\`\${key}: min value \${rule.min}\`);
      if (rule.max !== undefined && value > rule.max)
        errors.push(\`\${key}: max value \${rule.max}\`);
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: input as InferType<S> };
}`,
    },
    {
      type: "p",
      text: "Usage looks like this, with full TypeScript inference:",
    },
    {
      type: "code",
      lang: "typescript",
      code: `const result = validate(body, {
  email:    { type: "string", required: true, pattern: /^[^@]+@[^@]+\\.[^@]+$/ },
  name:     { type: "string", required: true, min: 2, max: 100 },
  age:      { type: "number", required: false, min: 0, max: 150 },
});

if (!result.ok) {
  // result.errors is string[]
  return res.writeHead(400).end(JSON.stringify({ errors: result.errors }));
}

// result.data is fully typed
console.log(result.data.email); // string`,
    },
    { type: "divider" },
    {
      type: "h2",
      text: "What You Should Still Use Dependencies For",
    },
    {
      type: "p",
      text: "I want to be clear: this isn't a manifesto against packages. Some things you should always reach for a library for:",
    },
    {
      type: "ul",
      items: [
        "**Cryptography**  `node:crypto` is there, but bcrypt, argon2, and jose exist because cryptographic implementations need eyes on them that most developers don't have. Don't roll your own password hashing.",
        "**Date parsing**  `date-fns` or `Temporal` (native, arriving soon). Timezone edge cases will ruin your weekend if you try to handle them yourself.",
        "**Schema validation at scale**  Zod for anything user-facing. The DX is worth the dependency.",
        "**Test runners**  Vitest or Node's built-in test runner. Both are fine. Testing infrastructure isn't worth building yourself.",
        "**ORM/Query builders**  Drizzle ORM if you want type safety without magic. Writing raw SQL with a `pg` pool is also fine and underrated.",
      ],
    },
    {
      type: "p",
      text: "The pattern: reach for a dependency when the problem domain is genuinely hard and the package is well-maintained by people who specialize in that domain. Don't reach for a dependency to avoid writing 30 lines of code.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "What Building auto-api-observe Taught Me",
    },
    {
      type: "p",
      text: "When I built `auto-api-observe`  the npm package that powers APILens  I made a hard rule: zero runtime dependencies. The package uses Express/Fastify middleware to capture request/response data and stream it to the APILens dashboard.",
    },
    {
      type: "p",
      text: "The reason wasn't ideology. It was practical: **I was building a monitoring tool**. If my monitoring middleware itself had a vulnerability or pulled in a broken transitive dep, I'd be creating the exact problem I was trying to solve. A zero-dependency middleware is auditable in 10 minutes.",
    },
    {
      type: "p",
      text: "What I didn't expect was what the constraint taught me. I had to actually understand `AsyncLocalStorage` to track request context across async operations. I had to understand how Node.js HTTP response streams work to capture response bodies without buffering them. I had to understand how Express middleware chains execute.",
    },
    {
      type: "p",
      text: "None of that knowledge came for free when I was importing `morgan` and `winston` and letting them handle it. The constraint forced the understanding.",
    },
    {
      type: "quote",
      text: "Every abstraction you depend on is knowledge you're outsourcing. Sometimes that's the right call. But if you've never looked at what's underneath, you don't actually know what you're building on.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Framework I'm Building",
    },
    {
      type: "p",
      text: "I'm building a Node.js HTTP framework from scratch. Not because Express is bad  Express is fine. Because I want to understand what a modern Node.js framework looks like when you design it from the ground up with TypeScript, async/await, and Node.js 22+ in mind. No legacy baggage.",
    },
    {
      type: "p",
      text: "Decisions I've made so far:",
    },
    {
      type: "ul",
      items: [
        "**Zero runtime dependencies** in the core. Everything in `node:http`, `node:crypto`, `node:stream`, `node:url`.",
        "**TypeScript-first**  not \"supports TypeScript.\" The router types infer path parameters from string literals. `route('/users/:id')` gives you `params.id` as `string` with full IDE autocomplete.",
        "**Middleware is just async functions**  `(req, res, next) => Promise<void>`. No magic objects, no monkey-patching.",
        "**Context objects over globals**  request-scoped context via `AsyncLocalStorage`, not `req.user = ...` mutation.",
        "**No decorators**  I've used NestJS extensively. The decorator pattern is clever until you're debugging why your `@Injectable()` isn't injecting. I want plain functions.",
      ],
    },
    {
      type: "p",
      text: "Is this going to replace Fastify? No. Fastify is battle-tested and faster than anything I'll write. But it's teaching me things I couldn't learn any other way.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Nuance: Be Intentional, Not Dogmatic",
    },
    {
      type: "p",
      text: "The point is not \"never use npm.\" The point is: **treat every `npm install` as a decision, not a reflex.**",
    },
    {
      type: "p",
      text: "Before adding a package, ask:",
    },
    {
      type: "ol",
      items: [
        "What does this package actually do? Could I implement the part I need in under 100 lines?",
        "How many transitive dependencies does it add? (`npm install --dry-run`)",
        "When was it last updated? How responsive is the maintainer?",
        "What happens to my app if this package gets abandoned, corrupted, or goes malicious?",
        "Is this in my `dependencies` or `devDependencies`? Many things that end up in `dependencies` should be in `devDependencies`.",
      ],
    },
    {
      type: "p",
      text: "If you can answer those questions and still want the package, install it. If you can't answer them, you've already found out more about your own dependency hygiene than `npm audit` ever will.",
    },
    {
      type: "callout",
      variant: "note",
      text: "The best codebase I've ever worked in had 12 direct dependencies and 43 total transitive ones. Everything worked, everything was understandable, and `npm audit` came back clean every time. It was a deliberate, years-long effort by one architect who cared about this. It's achievable.",
    },
  ],

  "leading-developers-remotely-from-india": [
    {
      type: "p",
      text: "I'm writing this at 11:30 PM IST. That's 1:00 PM Eastern Time. My team's active hours started about three hours ago from their side, and I've got about two hours left before I sign off. This is the rhythm I've been working in for the past few years.",
    },
    {
      type: "p",
      text: "I'm a Tech Lead at Pranshtech Solutions. I lead 10 developers  some in Ahmedabad with me, some in other cities across India, and the product stakeholders largely in the US. IST is 10.5 hours ahead of Eastern Time. That's not a small gap. Every system I've built for this team has been designed around that gap, not in spite of it.",
    },
    {
      type: "p",
      text: "Here's what actually works.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Async-First Mandate",
    },
    {
      type: "p",
      text: "Early on, I made a rule: **if completing your work requires someone else to be online at the same time, that's a design problem, not a timezone problem.**",
    },
    {
      type: "p",
      text: "This sounds obvious until you see how many \"design problems\" are actually just coordination habits that got normalized. A developer who can't merge their PR without a synchronous review hasn't hit a timezone wall  they've hit a process wall. A developer who can't start a feature because the ticket description is missing acceptance criteria hasn't been blocked by timezones  they've been blocked by incomplete requirements.",
    },
    {
      type: "p",
      text: "Async-first means investing more time upfront  writing better tickets, making PRs self-explanatory, documenting decisions  so that the work itself doesn't require synchronous coordination. It's more work at the beginning, less friction across the entire delivery cycle.",
    },
    {
      type: "callout",
      variant: "note",
      text: "\"Async-first\" does not mean \"async-only.\" Some conversations genuinely need to be synchronous. The discipline is distinguishing between \"I prefer to talk about this live\" (personal preference, often fine to convert to async) and \"this decision has enough ambiguity that async will take three days of back-and-forth when a 20-minute call resolves it\" (sync is correct).",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Daily Async Standup",
    },
    {
      type: "p",
      text: "We don't do a daily standup meeting. We do a daily standup _message_.",
    },
    {
      type: "p",
      text: "Every developer posts to a dedicated Slack channel before they start their first task. The format is fixed:",
    },
    {
      type: "code",
      lang: "text",
      filename: "standup-format.txt",
      code: `Yesterday: [what you completed]
Today: [what you're working on]
Blockers: [anything stopping you  or "none"]`,
    },
    {
      type: "p",
      text: "That's it. Takes 3 minutes to write. Takes 1 minute to read. I read all 10 of them at the start of my overlap window and I know exactly where every thread of the project is without scheduling a meeting.",
    },
    {
      type: "p",
      text: "The blocker field is the most important one. When I see a blocker, I triage it immediately  either I unblock it myself within the hour, or I find who can unblock it and make that happen. The developer should never be blocked for more than a few hours without me knowing about it.",
    },
    {
      type: "callout",
      variant: "tip",
      text: "Make it a Slack channel, not a thread. Channels are searchable, archivable, and you can scroll back weeks to see patterns. If someone's been blocked on the same kind of issue three times, that's a signal  either the system needs fixing or they need a different kind of support.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Weekly Sync",
    },
    {
      type: "p",
      text: "We have one recurring meeting per week. Monday, one hour, every week without exception.",
    },
    {
      type: "p",
      text: "The agenda goes out **24 hours before**, not 5 minutes before. If I don't have an agenda ready 24 hours out, the meeting gets cancelled or I send a draft agenda with a note that it's incomplete. People should be able to prepare, not show up and figure out what we're discussing in real time.",
    },
    {
      type: "p",
      text: "The Monday sync covers:",
    },
    {
      type: "ul",
      items: [
        "**Sprint review**  what shipped last week, what didn't, why",
        "**Sprint planning**  what's being picked up this week, who owns what",
        "**Cross-team dependencies**  anything where two developers are blocked on each other",
        "**Process issues**  things that slowed us down that we can fix",
        "**Open floor**  10 minutes at the end, team can raise anything",
      ],
    },
    {
      type: "p",
      text: "Everything is recorded. The recording link goes into the standup channel. People who can't attend for legitimate reasons catch up from the recording  not from asking a colleague to summarize it for them, which costs two people time instead of one.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "1:1 Patterns",
    },
    {
      type: "p",
      text: "Every two weeks, 30 minutes, every developer on the team. Not monthly  that's too infrequent to catch things early. Not weekly  that's too frequent to have meaningful change to discuss.",
    },
    {
      type: "p",
      text: "The key shift: **the agenda is theirs, not mine.** I send a note before each 1:1: \"The floor is yours  what do you want to talk about?\" I come with notes on anything I've observed that I want to address, but I don't lead with it. If they don't raise it, I do  but I let them go first.",
    },
    {
      type: "p",
      text: "Three questions I ask in every 1:1, in some form:",
    },
    {
      type: "ol",
      items: [
        "**What's one thing that's slowing you down that I could fix?**  Not \"are you blocked?\" That gets a yes/no. This gets specifics.",
        "**What's something you'd like to be working on that you're not?**  People have aspirations. If I don't ask, I don't know. If I know, I can route interesting work toward them.",
        "**How are you feeling about the team's direction right now?**  Vague, intentionally. The answer to this question tells me more about morale and trust than any status update does.",
      ],
    },
    {
      type: "p",
      text: "I keep private notes after every 1:1. Not a corporate record  personal notes. Themes, things I noticed, commitments I made. I review them before the next 1:1. If I said I'd do something, I've done it or I explain why not.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Jira Workflow That Actually Works",
    },
    {
      type: "p",
      text: "Most Jira boards I've inherited have 7-9 statuses. `Todo`, `In Analysis`, `In Progress`, `In Review`, `In QA`, `Ready for Deploy`, `Blocked`, `Done`, `Duplicate`. By the time a ticket moves through all of them, the work is ancient history.",
    },
    {
      type: "p",
      text: "We use three statuses: **`To Do`**, **`In Progress`**, **`Done`**. That's it.",
    },
    {
      type: "p",
      text: "The discipline isn't in the statuses  it's in what a ticket must contain before anyone is allowed to pick it up. Our rule: **no ticket gets picked up without acceptance criteria written in the description.** Not a vague \"implement the login page.\" Specific: what the user can do, what happens on error, what the success state looks like, any edge cases we've thought of.",
    },
    {
      type: "code",
      lang: "text",
      filename: "ticket-template.txt",
      code: `## What
[One sentence description of the feature/fix]

## Why
[Why are we doing this? What user problem does it solve?]

## Acceptance Criteria
- [ ] User can do X
- [ ] When Y happens, Z is shown
- [ ] Error state: [description]
- [ ] Mobile: [any mobile-specific requirement]

## Out of Scope
[Explicit list of what we're NOT doing in this ticket]

## Notes / Context
[Any links, designs, related tickets, technical constraints]`,
    },
    {
      type: "p",
      text: "If a ticket arrives without acceptance criteria, it doesn't get picked up. It goes back to the person who created it with a comment: \"Can you add acceptance criteria? Using the template in the description.\" This feels bureaucratic the first two weeks. After that it becomes muscle memory, and we stop having endless PR comments about \"this doesn't do what I expected.\"",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "Timezone Management: The Practical Reality",
    },
    {
      type: "p",
      text: "My core overlap window with US Eastern is roughly **7:30 PM – 11:30 PM IST** (9:00 AM – 1:00 PM ET). Four hours of real-time overlap. That's enough for one weekly sync plus occasional async reviews and urgent unblocking.",
    },
    {
      type: "p",
      text: "The rest of my day  the 12+ hours before overlap  is deep work time. Feature planning, architecture, code review on Indian-timezone PRs, writing. The overlap window is reserved for anything requiring a US stakeholder in the loop.",
    },
    {
      type: "p",
      text: "The rule I protect hard: **no shallow work in deep work time.** No Slack-first mornings. No checking email as the first thing I do. I start with whatever the hardest/most important thing is, and I work on it until I've made real progress. The overlap window will deal with everything that came in overnight.",
    },
    {
      type: "h3",
      text: "Async by default, sync by exception",
    },
    {
      type: "p",
      text: "When someone on the US side says \"can we jump on a call?\" my first response is always: \"What do you want to cover? Let me see if I can address it async first.\" About 70% of the time, a well-written Loom video or a detailed Notion doc resolves what they thought needed a call.",
    },
    {
      type: "p",
      text: "The 30% that genuinely need a call, we schedule. I'm not precious about it. Some conversations are just faster live. The goal isn't zero calls  it's intentional calls.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "Code Review Across Timezones",
    },
    {
      type: "p",
      text: "The rule is simple: **PRs opened by EOD should have a review within 24 hours.** Not instant, not \"when I get to it.\" Within 24 hours.",
    },
    {
      type: "p",
      text: "To make this work, PRs have to be self-explanatory. Our PR template requires:",
    },
    {
      type: "ul",
      items: [
        "**What changed**  not just what files, but what the intent was",
        "**How to test it**  exact steps, not \"run the app and check\"",
        "**Screenshots or recordings**  for anything UI-related",
        "**The Jira ticket**  linked, so the reviewer can check acceptance criteria",
      ],
    },
    {
      type: "p",
      text: "The unblocking rule: if a PR has been reviewed and has changes requested, the author has 24 hours to respond. If they don't respond within 24 hours, they post in the standup channel why  usually because they hit a question or disagreement they need to discuss. The review doesn't just sit.",
    },
    {
      type: "p",
      text: "For large PRs (more than 400 lines of meaningful change), I ask the author to record a short Loom walkthrough  5-10 minutes, explain the approach, walk through the key files. Reviewers watch it before reviewing. This has cut review time significantly because reviewers understand the intent before they look at the diff.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "What Doesn't Work",
    },
    {
      type: "p",
      text: "I'll be direct about the things that failed before I stopped doing them.",
    },
    {
      type: "ul",
      items: [
        "**Daily video standups**  10 people on a 15-minute call wastes 150 minutes of developer time for information that a 3-minute written message delivers more clearly. The only people who benefit are managers who feel better seeing faces.",
        "**Expecting instant replies**  Slack's green dot is not a contract. If your workflow requires someone to respond in 5 minutes, your workflow is fragile. Design for 4-hour response times as the default.",
        "**Micro-managing ticket states**  I used to check Jira status daily and ping people when tickets hadn't moved. This creates a low-trust environment and trains people to update Jira instead of shipping work. The standup message tells me everything Jira doesn't.",
        "**Skipping documentation because 'everyone knows'**  everyone who's currently at the company knows. New hires don't. Future-you in 6 months doesn't. Write it down.",
      ],
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Skill Nobody Talks About: Writing",
    },
    {
      type: "p",
      text: "You cannot lead a distributed team if you can't write clearly. This is not a soft skill. It's the core infrastructure of async work.",
    },
    {
      type: "p",
      text: "Writing clearly means: the person reading your message should not need to send a follow-up question to understand what you mean. Not because you wrote 500 words when 100 would do  because you chose the right 100 words and structured them so the key information is immediately findable.",
    },
    {
      type: "p",
      text: "Things I've learned to write better:",
    },
    {
      type: "ul",
      items: [
        "**Lead with the conclusion**  don't make the reader get to the end to understand what you're asking for. State it first, then explain.",
        "**One ask per message**  if you have three things to discuss, send three structured messages or a document with three clearly separated sections. One wall of text with three asks gets you one (wrong) response.",
        "**Make the action item explicit**  \"I think we should...\" is a thought. \"Can you review this by Thursday EOD?\" is an action item. Every message that requires someone to do something should say exactly what, and by when.",
        "**Separate questions from context**  context is the background someone needs to understand a question. Put the question first, context second. Most people never get to the context anyway.",
      ],
    },
    {
      type: "quote",
      text: "The quality of your writing is the quality of your team's thinking when you're not in the room. If your written communication is vague, your team will fill in the gaps with assumptions  and assumptions in distributed teams always diverge.",
      attribution: "Something I tell every new lead I work with",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "After 3 Years: Distributed Teams Can Ship Faster",
    },
    {
      type: "p",
      text: "The common assumption is that distributed teams are a compromise  you accept slower delivery and more miscommunication in exchange for access to talent that wouldn't relocate. I don't think that's true anymore, and I'm not just saying it.",
    },
    {
      type: "p",
      text: "The distributed team I've built ships faster than most co-located teams I've seen, for a specific reason: we've been _forced_ to make our process explicit. Co-located teams can rely on hallway conversations, ambient context, shoulder-tap decisions. Those things feel efficient but they don't scale, they don't document, and they exclude anyone who wasn't in the room.",
    },
    {
      type: "p",
      text: "When you can't rely on being in the same room, you build systems. When you build systems, the systems work even when people are sick, or on vacation, or onboarding, or scattered across three cities and two time zones.",
    },
    {
      type: "p",
      text: "The timezone gap I work across every day  10.5 hours  looked like a problem when I started this role. Now I think of it as a feature of how I work: it forced me to become a better leader, a better writer, and a better engineer than I was when I could tap someone on the shoulder.",
    },
    {
      type: "callout",
      variant: "tip",
      text: "If you're building a remote team and it feels chaotic: the chaos isn't because of remote work. It's because you haven't yet built the async infrastructure that remote work demands. Every co-located team that goes remote discovers this. Build the systems first, then the team can be anywhere.",
    },
  ],
};

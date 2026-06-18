import type { ContentBlock } from "./blog-content-types";

export const POST_CONTENT_D: Record<string, ContentBlock[]> = {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST: Building SMS Drip Campaigns with Redis Queues and Node.js
  // ─────────────────────────────────────────────────────────────────────────────
  "sms-drip-campaigns-redis-queues-nodejs": [
    {
      type: "p",
      text: "At TextDrip I was the sole backend engineer responsible for a system that sent millions of SMS messages a month for thousands of businesses. Drip campaigns  sequences like \"welcome message now, follow-up in 2 days, offer in 5 days\"  sound simple until you actually have to build them reliably at scale, across multiple tenants, with carrier rate limits, retry logic, and zero message loss.",
    },
    {
      type: "p",
      text: "This is the architecture that actually worked. Not the first version, and not the \"clean\" version I'd design on a whiteboard. The one that survived production.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "Why Not Just Use Cron Jobs",
    },
    {
      type: "p",
      text: "The naive approach is a cron job that runs every minute, queries the database for messages due to be sent, and fires them. I see this in codebases all the time. Here's why it breaks:",
    },
    {
      type: "ul",
      items: [
        "**Race conditions**: if your cron runs on two servers simultaneously, both pick up the same pending messages and you send duplicates",
        "**No retry logic**: if the SMS carrier API returns a 429, the message is just lost unless you build retry state into your DB schema",
        "**Blocking**: a slow carrier API call blocks the next batch from starting on time",
        "**No observability**: you can't see the queue depth, failure rates, or processing speed without custom instrumentation",
        "**Server-bound**: if your server restarts mid-batch, messages in progress have no state to recover from",
      ],
    },
    {
      type: "p",
      text: "A message queue solves all of these. I chose Redis with **BullMQ** because the team was already running Redis for session storage, BullMQ has excellent TypeScript types, and its delayed job support is exactly what drip campaigns need.",
    },
    {
      type: "h2",
      text: "The Data Model",
    },
    {
      type: "p",
      text: "Before the queue, the database. A drip campaign has a sequence of steps. Each step has a delay relative to when the contact enrolled. When a contact enrolls in a campaign, we create a `campaign_enrollment` record and immediately enqueue all messages with their calculated send times.",
    },
    {
      type: "code",
      lang: "sql",
      filename: "schema.sql",
      code: `-- A campaign belongs to a tenant (business)
CREATE TABLE campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft', -- draft | active | paused
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each step in the drip sequence
CREATE TABLE campaign_steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  delay_hours INT  NOT NULL,   -- hours after enrollment
  message     TEXT NOT NULL,
  step_order  INT  NOT NULL
);

-- When a contact enrolls
CREATE TABLE campaign_enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  contact_id  UUID NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT NOT NULL DEFAULT 'active'
);

-- Individual message sends (one per step per enrollment)
CREATE TABLE campaign_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES campaign_enrollments(id),
  step_id       UUID NOT NULL REFERENCES campaign_steps(id),
  tenant_id     UUID NOT NULL,
  phone         TEXT NOT NULL,
  body          TEXT NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  sent_at       TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'queued', -- queued | sent | failed | skipped
  attempts      INT  NOT NULL DEFAULT 0,
  bull_job_id   TEXT  -- BullMQ job ID for deduplication
);`,
    },
    {
      type: "h2",
      text: "Queue Setup with BullMQ",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/queues/sms.queue.ts",
      code: `import { Queue, Worker, QueueEvents } from "bullmq";
import { redis } from "../lib/redis";

export interface SmsJobData {
  messageId: string;
  tenantId: string;
  phone: string;
  body: string;
  attempt: number;
}

// One queue per logical domain. Don't share queues across unrelated jobs.
export const smsQueue = new Queue<SmsJobData>("sms", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 60_000, // first retry after 1 min, then 2 min, then 4 min
    },
    removeOnComplete: { count: 1000 }, // keep last 1000 completed jobs for auditing
    removeOnFail: { count: 5000 },     // keep failed jobs longer for debugging
  },
});`,
    },
    {
      type: "h2",
      text: "Enrolling a Contact: Scheduling All Messages Upfront",
    },
    {
      type: "p",
      text: "When a contact enrolls, we calculate every future send time immediately and add all jobs to the queue with `delay` set in milliseconds. BullMQ handles the timing  it won't process the job until the delay has elapsed.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/services/enrollment.service.ts",
      code: `import { smsQueue } from "../queues/sms.queue";
import { db } from "../lib/db";

export async function enrollContact(
  campaignId: string,
  contactId: string,
  tenantId: string,
  phone: string
): Promise<void> {
  // Create the enrollment record
  const [enrollment] = await db
    .insertInto("campaign_enrollments")
    .values({ campaign_id: campaignId, contact_id: contactId, status: "active" })
    .returning(["id"])
    .execute();

  // Load all steps for this campaign
  const steps = await db
    .selectFrom("campaign_steps")
    .where("campaign_id", "=", campaignId)
    .orderBy("step_order", "asc")
    .selectAll()
    .execute();

  const now = Date.now();

  for (const step of steps) {
    const scheduledAt = new Date(now + step.delay_hours * 60 * 60 * 1000);
    const delayMs = scheduledAt.getTime() - now;

    // Create the DB record first so we have an ID
    const [msg] = await db
      .insertInto("campaign_messages")
      .values({
        enrollment_id: enrollment.id,
        step_id: step.id,
        tenant_id: tenantId,
        phone,
        body: step.message,
        scheduled_at: scheduledAt,
        status: "queued",
      })
      .returning(["id"])
      .execute();

    // Enqueue with the BullMQ job ID = our DB message ID for deduplication
    const job = await smsQueue.add(
      "send-sms",
      {
        messageId: msg.id,
        tenantId,
        phone,
        body: step.message,
        attempt: 1,
      },
      {
        delay: delayMs,
        jobId: msg.id, // idempotency key — BullMQ won't add a second job with same ID
      }
    );

    // Record the Bull job ID for tracking
    await db
      .updateTable("campaign_messages")
      .set({ bull_job_id: job.id })
      .where("id", "=", msg.id)
      .execute();
  }
}`,
    },
    {
      type: "callout",
      variant: "tip",
      text: "Using `jobId: msg.id` is the most important line in this function. If your server crashes mid-enrollment and you replay the operation, BullMQ will silently skip duplicate job IDs. No double-sends.",
    },
    {
      type: "h2",
      text: "The Worker: Processing Messages",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/workers/sms.worker.ts",
      code: `import { Worker } from "bullmq";
import { redis } from "../lib/redis";
import { db } from "../lib/db";
import { sendViaTwilio } from "../lib/twilio";
import type { SmsJobData } from "../queues/sms.queue";

export const smsWorker = new Worker<SmsJobData>(
  "sms",
  async (job) => {
    const { messageId, tenantId, phone, body } = job.data;

    // Check if this message was cancelled (contact unsubscribed, campaign paused)
    const msg = await db
      .selectFrom("campaign_messages")
      .where("id", "=", messageId)
      .select(["status"])
      .executeTakeFirst();

    if (!msg || msg.status === "skipped") {
      return; // Silently skip — don't throw, that would count as a failure
    }

    // Increment attempt count
    await db
      .updateTable("campaign_messages")
      .set({ attempts: db.raw("attempts + 1") })
      .where("id", "=", messageId)
      .execute();

    // Send via carrier
    await sendViaTwilio({ to: phone, body, tenantId });

    // Mark as sent
    await db
      .updateTable("campaign_messages")
      .set({ status: "sent", sent_at: new Date() })
      .where("id", "=", messageId)
      .execute();
  },
  {
    connection: redis,
    concurrency: 10, // process 10 jobs simultaneously per worker process
    limiter: {
      max: 100,      // max 100 jobs per...
      duration: 1000 // ...per second (Twilio free tier rate limit)
    },
  }
);

smsWorker.on("failed", async (job, err) => {
  if (!job) return;
  const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 3);
  if (isLastAttempt) {
    await db
      .updateTable("campaign_messages")
      .set({ status: "failed" })
      .where("id", "=", job.data.messageId)
      .execute();
  }
});`,
    },
    {
      type: "h2",
      text: "Handling Unsubscribes and Campaign Pauses",
    },
    {
      type: "p",
      text: "This is the tricky part. When a contact unsubscribes or you pause a campaign, you have future jobs already sitting in the Redis queue. You have two options: remove them from the queue, or let the worker skip them.",
    },
    {
      type: "p",
      text: "I use the skip pattern: mark affected `campaign_messages` rows as `skipped` in the database, and let the worker bail out early when it sees that status. Removing jobs from BullMQ requires iterating the delayed queue, which is O(n) and slow. A DB status check is a single indexed lookup.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/services/unsubscribe.service.ts",
      code: `export async function unsubscribeContact(contactId: string, tenantId: string) {
  // Mark all future queued messages as skipped — worker will bail when it sees this
  await db
    .updateTable("campaign_messages as cm")
    .set({ status: "skipped" })
    .where("cm.tenant_id", "=", tenantId)
    .where("cm.status", "=", "queued")
    .where((eb) =>
      eb(
        "cm.enrollment_id",
        "in",
        eb
          .selectFrom("campaign_enrollments")
          .where("contact_id", "=", contactId)
          .select("id")
      )
    )
    .execute();
}`,
    },
    {
      type: "h2",
      text: "What I Learned the Hard Way",
    },
    {
      type: "ol",
      items: [
        "**Don't share a Redis instance between BullMQ and your app cache.** BullMQ uses blocking Redis commands (`BRPOPLPUSH`) that can starve your cache reads under load. Use a separate Redis connection or a second Redis instance.",
        "**Rate limit per tenant, not globally.** Some carriers throttle at the sender level. If tenant A sends a burst, they should eat the 429s, not tenant B. BullMQ's `limiter` option is global per queue; implement per-tenant rate limiting in the worker itself using a sliding window counter in Redis.",
        "**Log the carrier's message SID, not just your internal ID.** When Twilio reports a delivery failure, you need to correlate it back to your `campaign_messages` row. Store their SID.",
        "**Test with `runInBackground: false` in BullMQ dev mode.** In local dev, it's painful to wait 2 hours to see if your 2-hour-delay job fires. Set `BULL_DEV_MODE=true` and reduce all delays to seconds for testing.",
      ],
    },
    {
      type: "quote",
      text: "The queue system was the hardest thing I've ever built. Not because the code was complex — but because the failure modes were. Messages you never sent. Messages you sent twice. Messages delivered to someone who unsubscribed. Each one was a real business consequence.",
      attribution: "Margin note from my TextDrip postmortem doc",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST: Laravel to Node.js: What 6 Years of PHP Taught Me About Switching
  // ─────────────────────────────────────────────────────────────────────────────
  "laravel-to-nodejs-php-developer-migration": [
    {
      type: "p",
      text: "I wrote PHP professionally from 2013 to 2017. Laravel specifically from 2016. I loved it. Eloquent ORM was elegant, artisan commands were ergonomic, and `php artisan tinker` saved me hours every week. When I moved to Node.js full-time in 2017, I spent the next year being quietly furious about everything the ecosystem didn't have.",
    },
    {
      type: "p",
      text: "Now, seven years later, I still write some Laravel when a project calls for it. And I can give you an honest comparison  not a framework war, just what it actually feels like to switch from one to the other when you know both well.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "Why I Switched",
    },
    {
      type: "p",
      text: "For me it came down to three things. First: I was building APIs that handled a lot of concurrent long-polling connections, and PHP's synchronous request model meant every held connection occupied a PHP-FPM worker. Node.js handles ten thousand concurrent connections on a single thread. That's not hype  it's a fundamental architectural difference that matters for certain workloads.",
    },
    {
      type: "p",
      text: "Second: the project I was joining in 2017 was already a React frontend. Having the same language  TypeScript  on both sides meant I could write shared types, move between repositories without context-switching, and eventually do full-stack features alone without a handoff.",
    },
    {
      type: "p",
      text: "Third: npm had `socket.io`, `bull`, `ioredis`, and a dozen other packages that had no mature equivalent in the PHP world at the time. The Node.js ecosystem was where real-time and async-heavy tooling lived.",
    },
    {
      type: "h2",
      text: "What Laravel Gets Right (and Node.js Still Doesn't)",
    },
    {
      type: "h3",
      text: "Eloquent vs every Node.js ORM",
    },
    {
      type: "p",
      text: "I'm just going to say it: Eloquent is the best ORM I've used. The relationship definition is clean, lazy loading (when used carefully) is convenient, and `with()` eager loading makes N+1 queries hard to stumble into. I've used TypeORM, Sequelize, Prisma, Drizzle, and Kysely in Node.js. All of them have rough edges that Eloquent doesn't.",
    },
    {
      type: "p",
      text: "Prisma is the closest thing to a pleasant experience in the Node.js world, and it's still not Eloquent. The generated client is great. The migration story is less elegant than `php artisan migrate`. And Prisma still doesn't have a native `withCount()` equivalent that doesn't require a raw query.",
    },
    {
      type: "callout",
      variant: "note",
      text: "If you're migrating from Laravel to Node.js, reach for **Prisma** first for new projects, or **Kysely** if you want SQL-first type safety and don't mind more boilerplate. Avoid Sequelize for new projects — its TypeScript support has always felt bolted on.",
    },
    {
      type: "h3",
      text: "Built-in queues (Horizon) vs DIY",
    },
    {
      type: "p",
      text: "Laravel Horizon is the gold standard for queue dashboards. Out of the box, without writing a line of code, you get real-time queue metrics, failed job management, job tags, and throughput graphs. In Node.js land, you assemble this yourself: BullMQ for the queue, Bull Board or Arena for the UI, your own metrics for alerts.",
    },
    {
      type: "p",
      text: "It works fine. But Horizon is genuinely better as a product than anything in the Node.js ecosystem right now. I've made peace with assembling my own stack, but I don't pretend Horizon isn't nicer.",
    },
    {
      type: "h3",
      text: "Artisan commands",
    },
    {
      type: "p",
      text: "`php artisan make:controller`, `make:model`, `make:migration`  these aren't life-changing, but they enforce conventions and eliminate the boilerplate of copying files. In Node.js I use scaffolding scripts or Plop.js, but neither has the first-class feeling of artisan. This is a small thing that I notice every single day.",
    },
    {
      type: "h2",
      text: "What Node.js Does Better",
    },
    {
      type: "h3",
      text: "TypeScript end-to-end",
    },
    {
      type: "p",
      text: "Shared types between your API and frontend are not a small thing. In a Laravel + React stack, you define a response shape in PHP and then recreate it in TypeScript by hand, and they drift. In a Node.js + React stack with a monorepo, a single `types/api.ts` file is imported by both the server route and the React query hook. The type is the contract.",
    },
    {
      type: "h3",
      text: "Async performance",
    },
    {
      type: "p",
      text: "This is the original reason I switched and it still holds. For I/O-bound workloads  which most API servers are  Node.js's event loop handles concurrency with a fraction of the memory that PHP-FPM uses. PHP-FPM needs one worker process per concurrent request. Node.js handles thousands of concurrent requests in one process.",
    },
    {
      type: "h3",
      text: "npm ecosystem breadth",
    },
    {
      type: "p",
      text: "The Node.js package ecosystem is larger and  for certain categories  more mature. Real-time (Socket.io, ws), ML inference (ONNX Runtime), AI SDKs (Anthropic, OpenAI), PDF processing, image manipulation  all have excellent Node.js packages that have no equivalent in PHP Composer.",
    },
    {
      type: "h2",
      text: "The Migration Checklist Nobody Writes",
    },
    {
      type: "p",
      text: "If you're actually migrating a production Laravel API to Node.js, here's the order I'd do it in:",
    },
    {
      type: "ol",
      items: [
        "**Map your routes first.** Export `php artisan route:list --json` and use it as the spec. Every route is a migration task.",
        "**Port your validation layer first, not your business logic.** Validation rules in Laravel map almost directly to Zod schemas. `required|string|max:255` becomes `z.string().max(255)`. Do this mechanically.",
        "**Use a strangler fig pattern.** Run both apps behind nginx. Route path-by-path from Laravel to Node as each endpoint is ported and tested. Never try to do it all at once.",
        "**Port your queued jobs last.** They depend on the most business logic. Get everything else working first.",
        "**Don't port your Blade views at all.** If you have a server-rendered frontend, this migration is a different conversation  port the API separately.",
      ],
    },
    {
      type: "h2",
      text: "What I Actually Miss",
    },
    {
      type: "p",
      text: "Seven years in, the only things I genuinely miss are: `tinker` (an app-context REPL is invaluable for debugging), Eloquent's relationship syntax, and Laravel's first-party packages  Cashier for Stripe billing is particularly good. Everything else I've found equal or better equivalents for in the Node.js ecosystem.",
    },
    {
      type: "quote",
      text: "Switching frameworks isn't a technical decision. It's an ecosystem decision. You're not just choosing syntax — you're choosing a community, a package ecosystem, and a set of conventions you'll live with for years.",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST: Integrating Claude API into a Real Product: Lessons from CodePulse AI
  // ─────────────────────────────────────────────────────────────────────────────
  "integrating-claude-api-codepulse-ai": [
    {
      type: "p",
      text: "CodePulse AI started as a side project itch I had to scratch: paste a GitHub repository URL, get back a structured security audit. No setup, no CLI, no local tooling. Just a URL and a report. I built it using the Claude API as the analysis engine, and it taught me more about working with LLMs in production than any tutorial I've read.",
    },
    {
      type: "p",
      text: "This post covers the technical decisions behind integrating Claude into a real product  not the Hello World examples, but the parts that only surface when actual code is running in production.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Pipeline",
    },
    {
      type: "p",
      text: "The flow has three stages: fetch code from GitHub, chunk and prepare it for Claude's context window, then stream the analysis back to the client. Each stage has its own failure modes.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/pipeline/analyze.ts",
      code: `// High-level flow
export async function analyzeRepository(repoUrl: string): Promise<AnalysisStream> {
  const { owner, repo, ref } = parseGitHubUrl(repoUrl);
  const files = await fetchRepoFiles(owner, repo, ref);
  const chunks = prepareChunks(files);
  return streamAnalysis(chunks);
}`,
    },
    {
      type: "h2",
      text: "Stage 1: Fetching Code from GitHub",
    },
    {
      type: "p",
      text: "GitHub's REST API lets you fetch a repo's file tree and then the contents of individual files. For analysis purposes, I only fetch files that are likely to contain security-relevant code: TypeScript, JavaScript, Python, PHP, SQL, and config files (`.env.example`, `docker-compose.yml`, etc.). Binary files, images, lock files, and `node_modules` are excluded.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/github/fetch.ts",
      code: `const INCLUDE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".py", ".php", ".rb", ".go", ".rs",
  ".sql", ".graphql",
  ".env.example", ".yml", ".yaml", ".json", ".toml",
  ".sh", ".Dockerfile",
]);

const EXCLUDE_PATHS = [
  "node_modules/", "vendor/", ".git/", "dist/", "build/",
  "*.min.js", "*.lock", "package-lock.json", "yarn.lock",
];

export async function fetchRepoFiles(
  owner: string,
  repo: string,
  ref = "HEAD"
): Promise<{ path: string; content: string }[]> {
  // Get file tree recursively via GitHub Trees API
  const tree = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: ref,
    recursive: "1",
  });

  const relevantFiles = tree.data.tree.filter((item) => {
    if (item.type !== "blob") return false;
    const ext = path.extname(item.path ?? "");
    if (!INCLUDE_EXTENSIONS.has(ext)) return false;
    return !EXCLUDE_PATHS.some((p) => item.path?.includes(p));
  });

  // Fetch content in parallel (respect GitHub's 5000 req/hr limit)
  const contents = await pMap(
    relevantFiles,
    async (file) => {
      const { data } = await octokit.git.getBlob({ owner, repo, file_sha: file.sha! });
      return {
        path: file.path!,
        content: Buffer.from(data.content, "base64").toString("utf-8"),
      };
    },
    { concurrency: 10 }
  );

  return contents;
}`,
    },
    {
      type: "callout",
      variant: "warning",
      text: "Always check `data.encoding` before decoding. GitHub returns `base64` for text files but `none` if the blob exceeds 100MB (it won't send the content at all). Handle this case or your pipeline silently drops large files.",
    },
    {
      type: "h2",
      text: "Stage 2: Chunking for the Context Window",
    },
    {
      type: "p",
      text: "A typical repository has far more code than fits in Claude's context window in one shot. My approach: analyze in logical chunks, then synthesize. Security issues are usually local to a file or a small set of related files, so per-file analysis works well. For very large files (> 500 lines), I split at function/class boundaries rather than arbitrary line counts.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/pipeline/chunks.ts",
      code: `const MAX_TOKENS_PER_CHUNK = 30_000; // ~120KB of code, conservative

export function prepareChunks(
  files: { path: string; content: string }[]
): AnalysisChunk[] {
  const chunks: AnalysisChunk[] = [];
  let current: typeof files = [];
  let currentTokens = 0;

  for (const file of files) {
    // Rough token estimate: 1 token ≈ 4 chars for code
    const fileTokens = Math.ceil(file.content.length / 4);

    if (currentTokens + fileTokens > MAX_TOKENS_PER_CHUNK && current.length > 0) {
      chunks.push({ files: current });
      current = [];
      currentTokens = 0;
    }

    current.push(file);
    currentTokens += fileTokens;
  }

  if (current.length > 0) chunks.push({ files: current });
  return chunks;
}`,
    },
    {
      type: "h2",
      text: "Stage 3: The System Prompt and Structured Output",
    },
    {
      type: "p",
      text: "Getting Claude to return structured, machine-parseable output was the most important prompt engineering challenge. I ask for JSON with a specific schema and provide a concrete example in the prompt. Claude honors this reliably  but you must validate the response before trusting it.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/claude/prompt.ts",
      code: `export const SYSTEM_PROMPT = \`You are a senior security engineer reviewing code for a penetration testing firm.
Analyze the provided code files and return a JSON object matching this exact schema:

{
  "summary": "one paragraph overview",
  "severity": "critical" | "high" | "medium" | "low" | "info",
  "findings": [
    {
      "id": "unique string",
      "title": "short title",
      "severity": "critical" | "high" | "medium" | "low",
      "file": "path/to/file.ts",
      "line": number | null,
      "description": "detailed explanation",
      "recommendation": "how to fix",
      "cwe": "CWE-XXX" | null
    }
  ],
  "positives": ["what the code does well"],
  "score": number between 0-100
}

Focus on: SQL injection, XSS, authentication bypass, insecure deserialization, hardcoded secrets, SSRF, path traversal, IDOR, and broken access control.
Return ONLY valid JSON. No markdown, no explanation outside the JSON object.\`;`,
    },
    {
      type: "h2",
      text: "Streaming the Response",
    },
    {
      type: "p",
      text: "Security analysis takes 10-30 seconds per chunk. Streaming is not optional  it's the difference between a product that feels responsive and one that looks broken while the spinner turns.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/claude/stream.ts",
      code: `import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function* streamAnalysis(chunk: AnalysisChunk): AsyncGenerator<string> {
  const fileContents = chunk.files
    .map((f) => \`\\\`\\\`\\\`// \${f.path}\\n\${f.content}\\\`\\\`\\\`\`)
    .join("\\n\\n");

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: \`Analyze these files:\\n\\n\${fileContents}\`,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}`,
    },
    {
      type: "h2",
      text: "Parsing Structured Output Defensively",
    },
    {
      type: "p",
      text: "Claude almost always returns valid JSON when you ask for it clearly. But \"almost always\" is not \"always\". I wrap the output in a Zod schema and handle parse failures gracefully rather than crashing.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/claude/parse.ts",
      code: `import { z } from "zod";

const FindingSchema = z.object({
  id: z.string(),
  title: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  file: z.string(),
  line: z.number().nullable(),
  description: z.string(),
  recommendation: z.string(),
  cwe: z.string().nullable(),
});

const AnalysisSchema = z.object({
  summary: z.string(),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  findings: z.array(FindingSchema),
  positives: z.array(z.string()),
  score: z.number().min(0).max(100),
});

export function parseAnalysis(raw: string): z.infer<typeof AnalysisSchema> | null {
  try {
    // Claude sometimes wraps JSON in backtick code fences despite instructions
    const cleaned = raw.replace(/^\`\`\`json\\n?/, "").replace(/\\n?\`\`\`$/, "").trim();
    return AnalysisSchema.parse(JSON.parse(cleaned));
  } catch {
    return null; // Caller handles null gracefully
  }
}`,
    },
    {
      type: "h2",
      text: "Cost Management",
    },
    {
      type: "p",
      text: "This is the part nobody covers in tutorials but everyone discovers in production. LLM costs scale with usage. For CodePulse AI I implemented three guards:",
    },
    {
      type: "ol",
      items: [
        "**Token estimation before sending**: count approximate tokens in the request. If it exceeds a threshold, warn the user and let them confirm before running the analysis.",
        "**Repository size cap**: refuse repos over 50MB or 500 files. This is as much a quality gate as a cost gate  huge repos produce noisy analysis.",
        "**Result caching by commit SHA**: if the same repo at the same commit SHA was analyzed in the last 24 hours, return the cached result. Most re-analysis requests happen within minutes of a first run.",
      ],
    },
    {
      type: "quote",
      text: "The prototype already caught real bugs on the first repo I tested it on — a hardcoded AWS key in a config file that had been sitting in a public repo for 14 months. That was the moment I knew the product was worth building.",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST: Docker Compose for Production-Like Local Dev: My Exact Setup
  // ─────────────────────────────────────────────────────────────────────────────
  "docker-compose-local-dev-setup": [
    {
      type: "p",
      text: "The gap between local development and production is where bugs live. \"It works on my machine\" is a meme because it describes a real and persistent failure mode. Docker Compose doesn't eliminate that gap completely, but it shrinks it dramatically  and it does so without requiring you to run Kubernetes locally.",
    },
    {
      type: "p",
      text: "This is the exact Docker Compose setup I use on new projects. Not a tutorial with toy examples  the actual files, with the decisions explained.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Goal: Dev/Prod Parity",
    },
    {
      type: "p",
      text: "Dev/prod parity means: the same services run in both environments, the same versions, the same configuration shape. You shouldn't use SQLite locally when production runs PostgreSQL. You shouldn't mock Redis locally when production uses Redis. The only thing that should differ is credentials and URLs.",
    },
    {
      type: "h2",
      text: "The Compose File",
    },
    {
      type: "code",
      lang: "yaml",
      filename: "docker-compose.yml",
      code: `version: "3.9"

services:
  # ─── Application ───────────────────────────────────────────────
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app                    # bind mount: edits on host = live reload
      - /app/node_modules         # don't override node_modules with host's
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/appdb
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.local                # secrets (API keys etc) not in compose file
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run dev

  # ─── PostgreSQL ─────────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"              # expose so you can connect from host with psql/DBeaver
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data   # named volume: data survives compose down
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql  # run once on first start
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  # ─── Redis ──────────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --save 60 1 --loglevel warning
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # ─── Background worker (same image as app, different command) ────
  worker:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/appdb
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.local
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run worker:dev

volumes:
  postgres_data:
  redis_data:`,
    },
    {
      type: "callout",
      variant: "tip",
      text: "The `condition: service_healthy` in `depends_on` is the most important line in the file. Without health checks, Docker starts services in order but doesn't wait for them to be *ready*. Your app starts, tries to connect to Postgres before it finishes initializing, and crashes. Health checks fix this.",
    },
    {
      type: "h2",
      text: "The Dev Dockerfile",
    },
    {
      type: "p",
      text: "The dev Dockerfile is different from the production one. It installs all dependencies (including `devDependencies`), doesn't do a multi-stage build, and expects volume mounts for live code.",
    },
    {
      type: "code",
      lang: "dockerfile",
      filename: "Dockerfile.dev",
      code: `FROM node:22-alpine

WORKDIR /app

# Copy package files first — Docker caches this layer if unchanged
COPY package*.json ./

# Install ALL deps including devDependencies
RUN npm ci

# Don't COPY . . here — the volume mount handles that at runtime
# The node_modules installed above will be preserved by the volume exclusion

EXPOSE 3000

# Command is overridden by compose file
CMD ["npm", "run", "dev"]`,
    },
    {
      type: "h2",
      text: "Environment File Strategy",
    },
    {
      type: "p",
      text: "I use two environment files with a strict separation of concerns:",
    },
    {
      type: "ul",
      items: [
        "**`.env.example`** — committed to git. Contains all variable names with placeholder values. Documents what config the app needs.",
        "**`.env.local`** — gitignored. Contains real secrets (API keys, OAuth tokens). Mounted into the container via `env_file`.",
        "Non-secret local-dev values (database URL, Redis URL, ports) go directly in the `environment` block of the compose file — they're not secrets, and keeping them in compose makes the setup self-documenting.",
      ],
    },
    {
      type: "h2",
      text: "Useful Commands",
    },
    {
      type: "code",
      lang: "bash",
      filename: "Makefile",
      code: `# Start all services in the background
up:
	docker compose up -d

# Start with logs streaming
up-logs:
	docker compose up

# Rebuild the app image (after changing package.json or Dockerfile)
rebuild:
	docker compose up -d --build app worker

# Run database migrations inside the app container
migrate:
	docker compose exec app npm run db:migrate

# Open a psql shell
psql:
	docker compose exec postgres psql -U postgres -d appdb

# Open a Redis shell
redis-cli:
	docker compose exec redis redis-cli

# Wipe all data volumes and start fresh (destructive!)
reset:
	docker compose down -v && docker compose up -d

# View logs for a specific service
logs:
	docker compose logs -f $(service)`,
    },
    {
      type: "h2",
      text: "The Named Volume Trick for node_modules",
    },
    {
      type: "p",
      text: "The `- /app/node_modules` line in the app service's volumes section is subtle but critical. It tells Docker: mount the host directory at `/app`, but **don't** overlay the `node_modules` inside the container with anything from the host. Instead, use the `node_modules` installed when the image was built.",
    },
    {
      type: "p",
      text: "Without this, the host's `node_modules` (built for your local OS) would overwrite the container's `node_modules` (built for Linux). Native modules like `bcrypt` will crash because the host binary isn't compatible with the Linux container.",
    },
    {
      type: "h2",
      text: "docker compose watch (New in Compose 2.22)",
    },
    {
      type: "p",
      text: "`docker compose watch` is a newer alternative to volume mounts for hot reload. Instead of bind-mounting the entire directory, it watches for file changes and syncs or rebuilds selectively. It's faster for large projects and avoids the node_modules problem entirely.",
    },
    {
      type: "code",
      lang: "yaml",
      filename: "docker-compose.yml (watch extension)",
      code: `services:
  app:
    develop:
      watch:
        - action: sync           # fast: copy changed file into container
          path: ./src
          target: /app/src
        - action: rebuild        # slow: full image rebuild (rare)
          path: package.json`,
    },
    {
      type: "p",
      text: "Run it with `docker compose watch` instead of `docker compose up`. I'm migrating all new projects to this pattern.",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST: Solidity for Web2 Developers: My First Year Writing Smart Contracts
  // ─────────────────────────────────────────────────────────────────────────────
  "solidity-for-web2-developers": [
    {
      type: "p",
      text: "In 2021 I took on a project that required writing Solidity smart contracts. I had zero blockchain experience. My mental model was: \"It's just code that runs on a distributed database.\" That mental model is wrong in ways that took me months to unlearn.",
    },
    {
      type: "p",
      text: "This is the guide I wish I had  for developers who know JavaScript or TypeScript, understand databases and APIs, and are about to write their first production smart contract.",
    },
    { type: "divider" },
    {
      type: "h2",
      text: "The Fundamental Mental Shift",
    },
    {
      type: "p",
      text: "In web development, mistakes are cheap. You deploy a broken API, you fix it, you deploy again. The broken version might have caused a few errors in your logs. In smart contract development, mistakes are permanent and potentially expensive. Once a contract is deployed to mainnet, that code runs forever exactly as written. If you have a bug, you deploy a *new* contract and migrate to it  which costs gas and requires users to update any references they hold.",
    },
    {
      type: "callout",
      variant: "warning",
      text: "The DAO hack in 2016 drained $60 million in ETH from a reentrancy bug. The Poly Network hack in 2021 stole $611 million from a single function visibility mistake. These are not theoretical risks. Write every contract assuming an adversary will probe every code path.",
    },
    {
      type: "p",
      text: "The other shift is economic. Every operation in a smart contract costs **gas**  a fee paid by the caller in ETH. Reading from storage is cheaper than writing. Writing a new storage slot costs 20,000 gas. Simple arithmetic is 3 gas. This means you care about computational complexity in a way you never did in traditional backend development.",
    },
    {
      type: "h2",
      text: "Solidity for TypeScript Developers",
    },
    {
      type: "p",
      text: "The surface syntax will feel familiar. The semantics are completely different.",
    },
    {
      type: "code",
      lang: "solidity",
      filename: "contracts/SimpleToken.sol",
      code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleToken {
    // State variables live on the blockchain (expensive to write, cheap to read)
    string public name;
    uint256 public totalSupply;

    // mapping is like a hash map, but every key already "exists" with default value 0
    mapping(address => uint256) public balances;

    // Events are the blockchain equivalent of console.log — they're queryable
    event Transfer(address indexed from, address indexed to, uint256 amount);

    // Constructor runs once at deploy time — like a class constructor
    constructor(string memory _name, uint256 _initialSupply) {
        name = _name;
        totalSupply = _initialSupply;
        balances[msg.sender] = _initialSupply; // msg.sender is the deployer
    }

    // external: can only be called from outside the contract
    // public: can be called externally and internally
    function transfer(address to, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(to != address(0), "Cannot transfer to zero address");

        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
    }
}`,
    },
    {
      type: "h2",
      text: "Key Differences from TypeScript",
    },
    {
      type: "ul",
      items: [
        "**No floats.** Solidity has no floating-point numbers. Use integers scaled by a factor (e.g. represent $1.50 as `150` with 2 decimal places, or use `1.5 * 10^18` for 18-decimal token math).",
        "**Integer overflow protection is built in since 0.8.0.** Before 0.8, `uint8(255) + 1` would silently wrap to 0. Now it reverts. This eliminated an entire class of bugs.",
        "**`msg.sender` is the address that called this function.** Not necessarily the contract owner. This is the foundation of access control.",
        "**`require(condition, message)` is your validation.** If condition is false, the entire transaction reverts and gas used so far is lost (but the state change doesn't persist).",
        "**There is no `null`.** Unset mappings return 0. Unset addresses return `address(0)`. Unset booleans return `false`. Always check for zero-address explicitly.",
        "**Arrays have no built-in `indexOf`.** If you need to check membership, use a mapping as a lookup set alongside the array.",
      ],
    },
    {
      type: "h2",
      text: "Your Local Dev Setup: Hardhat",
    },
    {
      type: "p",
      text: "Hardhat is to Solidity what Jest + nodemon is to Node.js. It compiles contracts, runs a local Ethereum node for testing, and provides a testing framework.",
    },
    {
      type: "code",
      lang: "bash",
      code: `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init    # choose TypeScript project`,
    },
    {
      type: "code",
      lang: "typescript",
      filename: "test/SimpleToken.test.ts",
      code: `import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleToken } from "../typechain-types";

describe("SimpleToken", () => {
  let token: SimpleToken;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;

  beforeEach(async () => {
    [owner, alice] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("SimpleToken");
    token = await factory.deploy("TestToken", 1_000_000n * 10n ** 18n);
  });

  it("gives total supply to deployer", async () => {
    const balance = await token.balances(owner.address);
    expect(balance).to.equal(1_000_000n * 10n ** 18n);
  });

  it("transfers correctly", async () => {
    const amount = 100n * 10n ** 18n;
    await token.transfer(alice.address, amount);
    expect(await token.balances(alice.address)).to.equal(amount);
  });

  it("reverts on insufficient balance", async () => {
    await expect(
      token.connect(alice).transfer(owner.address, 1n)
    ).to.be.revertedWith("Insufficient balance");
  });
});`,
    },
    {
      type: "callout",
      variant: "tip",
      text: "Hardhat generates TypeScript types for your contracts automatically (`typechain-types/`). Use them. Type-safe contract interaction is the difference between catching mistakes at compile time versus finding them by losing ETH.",
    },
    {
      type: "h2",
      text: "The Reentrancy Vulnerability",
    },
    {
      type: "p",
      text: "The most important security concept to understand before you write a single line of production Solidity. A reentrancy attack happens when your contract sends ETH to an external address, and that address's fallback function calls back into your contract before the first call finishes executing.",
    },
    {
      type: "code",
      lang: "solidity",
      filename: "contracts/VulnerableVault.sol",
      code: `// ❌ VULNERABLE: reentrancy attack possible
contract VulnerableVault {
    mapping(address => uint256) public balances;

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        (bool success, ) = msg.sender.call{value: amount}("");  // <-- attacker's fallback runs here
        require(success, "Transfer failed");
        balances[msg.sender] = 0;  // <-- this line runs AFTER the attacker has already re-entered
    }
}

// ✅ SAFE: Checks-Effects-Interactions pattern
contract SafeVault {
    mapping(address => uint256) public balances;

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        balances[msg.sender] = 0;                                // Effect FIRST
        (bool success, ) = msg.sender.call{value: amount}("");   // Interaction LAST
        require(success, "Transfer failed");
    }
}`,
    },
    {
      type: "p",
      text: "The rule is **Checks-Effects-Interactions**: validate inputs, then update state, then interact with external contracts or addresses. In that order. Always.",
    },
    {
      type: "h2",
      text: "Gas Optimization: The Things That Actually Matter",
    },
    {
      type: "ul",
      items: [
        "**Use `calldata` instead of `memory` for read-only function parameters.** `calldata` avoids copying; `memory` copies. For string/array params, this can save thousands of gas.",
        "**Pack storage variables.** Ethereum uses 32-byte storage slots. A `uint128` + `uint128` fits in one slot and costs one write. Two separate `uint256` variables cost two writes. Order your struct fields from smallest to largest type.",
        "**Use events instead of storage for history.** If you just need a record that something happened (an audit trail), emit an event instead of writing to storage. Events cost ~375 gas; storage writes cost 20,000+.",
        "**Use `unchecked {}` for known-safe math.** In tight loops where you've already validated bounds, `unchecked { i++; }` skips overflow checking and saves ~40 gas per iteration.",
        "**Cache storage reads in memory variables.** Every `SLOAD` (storage read) costs 100 gas. If you read the same storage variable twice, cache it: `uint256 bal = balances[msg.sender];` then use `bal`.",
      ],
    },
    {
      type: "h2",
      text: "What Surprised Me Most",
    },
    {
      type: "p",
      text: "After a year with Solidity, the thing that surprised me most wasn't the syntax or the tooling. It was how much the permanent, adversarial nature of the environment changes how you think about code. In web development I optimize for iteration speed. In smart contract development I optimize for correctness on the first try.",
    },
    {
      type: "quote",
      text: "Solidity made me a better web developer by forcing me to think rigorously about state transitions, access control, and failure modes. Those skills transfer directly back to designing APIs and database schemas.",
    },
    {
      type: "callout",
      variant: "note",
      text: "Before deploying to mainnet: get an audit from a firm like Trail of Bits, OpenZeppelin, or Code4rena. Not optional for anything holding real value. Your test suite is not an audit.",
    },
  ],
};

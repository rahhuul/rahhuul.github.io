export interface CsStat {
  value: number;
  suffix: string;
  label: string;
}

export interface CsArchSection {
  title: string;
  body: string;
  code?: string;
}

export interface CsTechBadge {
  name: string;
  icon?: string;
  color: string;
}

export interface CsPlatform {
  name: string;
  count: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  titleAccent: string;
  eyebrow: string;
  lede: string;
  stats: CsStat[];
  meta: { label: string; value: string }[];
  links: { label: string; href: string; primary: boolean }[];
  marginNote: string;
  problem: { heading: string; paragraphs: string[] };
  solution: {
    heading: string;
    paragraphs: string[];
    codeBlock?: { filename: string; code: string };
    platforms?: CsPlatform[];
  };
  architecture: { heading: string; sections: CsArchSection[] };
  stack: CsTechBadge[];
  outcome: { heading: string; items: string[] };
  nextCaseStudy: { slug: string; title: string; teaser: string };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'apilens',
    title: 'APILens  zero-config API observability.',
    titleAccent: 'zero-config',
    eyebrow: 'Case Study · Open Source',
    lede: 'An open-source NPM package that adds production-grade observability to any Express or Fastify app in a single line. Auto-instruments 8 databases, generates distributed trace IDs, and streams structured logs to a free cloud dashboard at apilens.rest.',
    stats: [
      { value: 600, suffix: 'K+', label: 'Requests / minute supported' },
      { value: 8, suffix: '', label: 'Databases auto-instrumented' },
      { value: 1, suffix: '', label: 'Line of code to integrate' },
      { value: 0, suffix: '', label: 'External dependencies' },
    ],
    meta: [
      { label: 'Year', value: '2026' },
      { label: 'Role', value: 'Creator & Maintainer' },
      { label: 'Type', value: 'Open-Source NPM Package' },
      { label: 'Status', value: 'Live in Beta' },
    ],
    links: [
      { label: 'View on GitHub', href: 'https://github.com/rahhuul/auto-api-observe', primary: true },
      { label: 'Live Dashboard', href: 'https://apilens.rest', primary: false },
    ],
    marginNote: 'This one taught me that building the product is 20%. Marketing is 80%.',
    problem: {
      heading: 'Production APIs lose hours to invisible bottlenecks.',
      paragraphs: [
        'Every production Node.js application eventually hits the same wall: something is slow, something is failing intermittently, and you have no idea where to look. I rebuilt our entire observability stack from scratch at Pranshtech  custom request logging middleware, manual database query timing, ad-hoc trace IDs scattered across microservices. It worked, but it cost two full days every time we brought up a new service.',
        'Commercial APMs like Datadog and New Relic solve the problem, but at $25–$50 per host per month they price out the indie developer and early-stage startup entirely. There was nothing in between: either you pay the enterprise tax or you instrument everything by hand. APILens was built to close that gap.',
      ],
    },
    solution: {
      heading: 'One line of code. Zero dependencies.',
      paragraphs: [
        'The package monkey-patches the Node.js HTTP layer and each supported database client at require-time, so every inbound request, outbound query, and downstream HTTP call is captured automatically. A distributed trace ID is generated on the first incoming request and threaded through the entire call chain using Node\'s AsyncLocalStorage  no manual propagation, no context passing.',
        'Structured JSON logs are buffered in memory and flushed to the apilens.rest cloud dashboard over a persistent WebSocket connection. The dashboard aggregates p50/p95/p99 latency, error rates, and slow query analysis in real time. The entire package ships as a single compiled file with zero production dependencies.',
      ],
      codeBlock: {
        filename: 'server.js',
        code: `const express = require('express');
const observe = require('auto-api-observe');

const app = express();
app.use(observe()); // that's it.`,
      },
    },
    architecture: {
      heading: 'The interesting engineering.',
      sections: [
        {
          title: 'AsyncLocalStorage for zero-overhead trace propagation',
          body: 'Node.js `AsyncLocalStorage` (stable since v16) lets you attach arbitrary data to an async execution context  every `setTimeout`, Promise chain, and I/O callback that descends from the original request inherits the same store. APILens creates a new store on each inbound request, writes the trace ID and request metadata once, and reads it back anywhere in the call tree without touching function signatures or passing context objects.',
        },
        {
          title: 'Monkey-patching without breaking the world',
          body: 'Patching `pg`, `mysql2`, `mongoose`, `redis`, `ioredis`, `@prisma/client`, `axios`, and `node-fetch` at the module level is straightforward but fragile: the patch must run before any application code imports those modules, must not break existing error handling, and must restore the original function on teardown. APILens wraps each client method in a try/finally block so an error in the instrumentation layer never propagates to application code. The original function is always called.',
        },
        {
          title: 'Buffered async logger with backpressure',
          body: 'Synchronous logging kills throughput. APILens accumulates log entries in an in-process ring buffer (configurable size, default 1 000 entries) and flushes to the cloud on a 250 ms interval or when the buffer reaches 80% capacity  whichever comes first. If the WebSocket connection drops, entries are held in the buffer and replayed on reconnect. If the buffer overflows, the oldest entries are dropped silently so application performance is never impacted.',
        },
        {
          title: 'Zero runtime dependencies  intentionally',
          body: 'Every npm package you add to `dependencies` is a liability: version conflicts, supply-chain risk, bundle size. APILens patches native Node.js APIs and uses only built-ins (`http`, `https`, `async_hooks`, `crypto`, `zlib`). The compiled output is a single 18 KB file. This was the hardest constraint to maintain  the WebSocket client, the ring buffer, the JSON serialiser, and the HTTP interceptor are all written from scratch.',
        },
      ],
    },
    stack: [
      { name: 'Node.js', icon: 'nodedotjs', color: '339933' },
      { name: 'TypeScript', icon: 'typescript', color: '3178C6' },
      { name: 'Express', icon: 'express', color: '888888' },
      { name: 'Fastify', icon: 'fastify', color: '888888' },
      { name: 'PostgreSQL', icon: 'postgresql', color: '4169E1' },
      { name: 'MongoDB', icon: 'mongodb', color: '47A248' },
      { name: 'Redis', icon: 'redis', color: 'DC382D' },
      { name: 'Prisma', color: '6b6b6b' },
    ],
    outcome: {
      heading: 'What shipped.',
      items: [
        'Published to npm as `auto-api-observe`  installable in 30 seconds, zero configuration required for default use.',
        'Auto-instruments 8 database clients: PostgreSQL (`pg`), MySQL (`mysql2`), MongoDB (`mongoose`), Redis (`redis`, `ioredis`), Prisma, and outbound HTTP via `axios` and `node-fetch`.',
        'Cloud dashboard at apilens.rest provides real-time request timelines, slow query highlighting, error rate tracking, and p50/p95/p99 latency breakdowns  free tier, no credit card.',
        'Handles 600 000+ requests per minute in load tests without measurable throughput degradation (< 0.3 ms overhead per request on M2 hardware).',
        'Zero external runtime dependencies  the entire instrumentation layer is built on Node.js built-ins, keeping supply-chain risk and bundle size to a minimum.',
      ],
    },
    nextCaseStudy: {
      slug: 'cms-mcp-hub',
      title: 'CMS MCP Hub',
      teaser: '589 AI tools. 12 platforms. One monorepo. The open-source MCP server collection that lets AI assistants manage content across every major CMS.',
    },
  },
  {
    slug: 'cms-mcp-hub',
    title: 'CMS MCP Hub  giving AI 589 ways to run your content.',
    titleAccent: '589 ways',
    eyebrow: 'Case Study · Open Source · AI Tooling',
    lede: 'A monorepo of Model Context Protocol servers that lets Claude, Cursor, and any MCP-compatible AI client create posts, manage products, upload images, and handle SEO across 12 major CMS platforms. One unified interface for a fragmented ecosystem.',
    stats: [
      { value: 589, suffix: '', label: 'MCP tools exposed' },
      { value: 12, suffix: '', label: 'CMS platforms supported' },
      { value: 1, suffix: '', label: 'Universal REST gateway' },
      { value: 100, suffix: '%', label: 'TypeScript strict mode' },
    ],
    meta: [
      { label: 'Year', value: '2026' },
      { label: 'Role', value: 'Creator & Maintainer' },
      { label: 'Type', value: 'MCP Monorepo' },
      { label: 'Status', value: 'Active Development' },
    ],
    links: [
      { label: 'View on GitHub', href: 'https://github.com/rahhuul/cms-mcp-hub', primary: true },
    ],
    marginNote: 'The WordPress Developer Blog post about this is still pending review.',
    problem: {
      heading: "AI agents can't manage content across the CMS ecosystem.",
      paragraphs: [
        'The CMS market is deeply fragmented. WordPress powers 43% of the web, but Shopify owns e-commerce, Ghost owns indie publishing, Webflow owns design-led marketing sites, and Sanity/Contentful own enterprise structured content. Each platform has its own REST or GraphQL API, its own auth model, its own concept of what a "post" or "product" even is. Connecting an AI agent to all of them means writing a custom integration for each one  and keeping it up to date as APIs change.',
        'The Model Context Protocol is the right primitive for this problem. MCP defines a standard way for AI clients to discover and call tools, with structured input schemas and typed responses. Build one MCP server per CMS, expose the right tools, and any MCP-compatible AI client  Claude Desktop, Cursor, Windsurf, your own agent  can manage content anywhere without any bespoke integration code.',
      ],
    },
    solution: {
      heading: 'One monorepo. 589 tools. Every major CMS.',
      paragraphs: [
        'CMS MCP Hub is a Turborepo monorepo of independently publishable npm packages  one per CMS platform. Each package is a self-contained MCP server that exposes a complete set of typed tools for that platform: create post, update product, upload media, manage SEO metadata, handle taxonomies, configure redirects. The tools are designed to be composable  an AI agent can chain them to complete multi-step workflows like "draft a blog post, add the featured image, set the SEO title, and publish it" in a single conversation turn.',
      ],
      platforms: [
        { name: 'WordPress', count: '169 tools' },
        { name: 'Shopify', count: '147 tools' },
        { name: 'WooCommerce', count: '95 tools' },
        { name: 'Ghost', count: '24 tools' },
        { name: 'Webflow', count: '21 tools' },
        { name: 'Payload CMS', count: '21 tools' },
        { name: 'Wix', count: '21 tools' },
        { name: 'Framer', count: '20 tools' },
        { name: 'Contentful', count: '20 tools' },
        { name: 'Yoast SEO', count: '18 tools' },
        { name: 'Strapi', count: '17 tools' },
        { name: 'Sanity', count: '16 tools' },
      ],
    },
    architecture: {
      heading: 'How the monorepo is wired.',
      sections: [
        {
          title: 'Turborepo with per-platform packages',
          body: 'Each CMS lives in `packages/mcp-[platform]`  a standalone npm package with its own `package.json`, build config, and test suite. Turborepo handles the build graph: changed packages are rebuilt in parallel, unchanged packages are restored from cache. A shared `packages/core` package provides the MCP server scaffolding, Zod schema utilities, and HTTP client abstractions that every platform package imports.',
        },
        {
          title: 'Zod-validated tool contracts',
          body: 'Every tool input is defined as a Zod schema. This serves double duty: the MCP SDK uses the schema to generate the JSON Schema that AI clients see when they discover available tools, and the runtime uses it to validate and parse incoming arguments before they reach any API call. Invalid inputs are rejected with structured error messages that the AI client can act on  "field `postId` must be a positive integer"  rather than opaque HTTP 400s from the upstream CMS API.',
        },
        {
          title: 'Universal REST gateway',
          body: 'Rather than using each CMS\'s official SDK (where one even exists), all platform packages share a thin REST gateway that handles auth token injection, retry-with-backoff, rate limit detection, and response normalisation. This keeps the dependency tree shallow and makes it straightforward to support new authentication flows  OAuth, API key, JWT  without touching tool logic. The gateway is the only place that makes HTTP calls; tool handlers are pure functions of validated input → normalised output.',
        },
        {
          title: 'tsup + Vitest for every package',
          body: 'Each package is compiled with `tsup`  zero-config TypeScript bundler that produces both ESM and CJS outputs, handles declaration file generation, and runs in under a second for incremental builds. Tests are written with Vitest: fast, ESM-native, with a Jest-compatible API. The Turborepo pipeline runs `test` before `build`, so a failing test in any package blocks the build of everything that depends on it.',
        },
      ],
    },
    stack: [
      { name: 'TypeScript', icon: 'typescript', color: '3178C6' },
      { name: 'Node.js', icon: 'nodedotjs', color: '339933' },
      { name: 'Turborepo', color: 'b8963e' },
      { name: 'Zod', color: '3068b7' },
      { name: 'Vitest', icon: 'vitest', color: '6E9F18' },
      { name: 'tsup', color: '888888' },
      { name: 'MCP SDK', color: '8B6914' },
      { name: 'OpenAPI', color: '6BA539' },
    ],
    outcome: {
      heading: 'What shipped.',
      items: [
        '589 MCP tools across 12 platforms  the largest open-source MCP tool collection for CMS management at time of writing.',
        'WordPress package alone exposes 169 tools covering posts, pages, media, users, plugins, themes, WooCommerce products, orders, taxonomies, and Yoast SEO  essentially the full WordPress REST API surface.',
        'Every tool is fully typed end-to-end: Zod input schema → TypeScript handler → typed response. AI clients get accurate tool descriptions and can rely on structured, predictable outputs.',
        'Turborepo build cache means CI runs for changed packages only  a single-package change builds and tests in under 30 seconds on GitHub Actions.',
        'Published to npm under the `@cms-mcp` scope  each platform package is independently installable so teams can adopt only the platforms they use.',
      ],
    },
    nextCaseStudy: {
      slug: 'apilens',
      title: 'APILens',
      teaser: 'Zero-dependency API observability middleware for Express and Fastify. 8 databases auto-instrumented, 600k+ req/min, one line integration.',
    },
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}

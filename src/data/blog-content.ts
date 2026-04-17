import type { ContentBlock } from "./blog-content-types";

export const POST_CONTENT: Record<string, ContentBlock[]> = {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST 1: How I Built a Zero-Dependency npm Package from Scratch
  // ─────────────────────────────────────────────────────────────────────────────
  "how-i-built-zero-dependency-npm-package": [
    {
      type: "p",
      text: "When I was building **APILens**  my API observability SaaS  I needed a way to capture every HTTP request and response flowing through an Express or Fastify app. Not just the status code. The full picture: method, path, headers, body, response time, errors. I needed this to work transparently as middleware, add zero overhead, and ship as a standalone npm package called `auto-api-observe`.",
    },
    {
      type: "p",
      text: "The first version had three dependencies. By the time I published v1.0.0, it had zero. This post explains the architectural decisions that got me there, and why I'd make the same call again.",
    },
    {
      type: "h2",
      text: "Why Zero Dependencies?",
    },
    {
      type: "p",
      text: "Every dependency you ship is a maintenance contract you didn't sign consciously. It's a security surface. It's a breaking-change risk on someone else's release schedule. For a middleware package  code that runs on every single HTTP request in production  this risk is multiplied by every downstream project that installs you.",
    },
    {
      type: "ul",
      items: [
        "**Security surface**: each dep is a potential CVE. `npm audit` becomes your nightmare.",
        "**Bundle size**: middleware installs into Node.js server code, but developers care about what they're pulling into `node_modules`.",
        "**Version conflicts**: if you depend on `uuid` v9 and someone's app already uses `uuid` v7, you're either fine or you're debugging a subtle mismatch at 2am.",
        "**Peer pressure to maintain**: a dep that goes unmaintained doesn't just slow you down  it signals to users that your package is stale.",
        "**Runtime startup cost**: every `require()` at module load adds milliseconds. Not many. But they add up.",
      ],
    },
    {
      type: "p",
      text: "The honest question to ask before adding any dependency: _\"Could I write this myself in under 100 lines?\"_ For the things `auto-api-observe` needs  generating unique IDs, timing requests, capturing body streams  the answer was yes.",
    },
    {
      type: "h2",
      text: "The Core Problem: Request-Scoped Context",
    },
    {
      type: "p",
      text: "The hardest part of API observability middleware isn't capturing the request  that's straightforward. The hard part is correlating the request with the response and anything that happens in between (database queries, downstream HTTP calls, thrown errors) **without threading a `req` object through every function in your codebase**.",
    },
    {
      type: "p",
      text: "The old pattern for this was to attach a context object to `req` and pass `req` everywhere  or worse, use a module-level global. Both are ugly. The modern solution is `AsyncLocalStorage`, introduced in Node.js 12.17.0 and stabilized in Node.js 16.",
    },
    {
      type: "h2",
      text: "AsyncLocalStorage: Thread-Local Storage for Node.js",
    },
    {
      type: "p",
      text: "Node.js is single-threaded, but it handles many concurrent requests via the event loop. `AsyncLocalStorage` lets you store data that's scoped to a specific asynchronous execution context  like a request  and retrieve it from anywhere in that context without passing it explicitly. Think of it as thread-local storage, except for async call chains.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/context.ts",
      code: `import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  startTime: number;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
}

// One instance, module-level. Safe  each request gets its own store value.
export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getContext(): RequestContext | undefined {
  return requestContext.getStore();
}`,
    },
    {
      type: "p",
      text: "The key insight: `AsyncLocalStorage` is a single module-level instance, but each call to `requestContext.run(store, callback)` creates an isolated store for that callback's entire async subtree. Anything called inside that subtree  `await`ed Promises, setTimeout callbacks, event handlers  inherits the same store.",
    },
    {
      type: "h2",
      text: "Intercepting Express Without Monkey-Patching",
    },
    {
      type: "p",
      text: "The standard approach for Express middleware is clean: you get `(req, res, next)`. The trick is that you need to capture the response  which means intercepting `res.end()` and `res.json()`  without breaking anything.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/express.ts",
      code: `import { AsyncLocalStorage } from "node:async_hooks";
import type { Request, Response, NextFunction } from "express";
import type { RequestContext } from "./context";
import { requestContext } from "./context";
import { generateId } from "./utils";

export function createExpressMiddleware(
  onRequest: (ctx: RequestContext) => void
) {
  return function observeMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const requestId = generateId();
    const startTime = Date.now();

    const ctx: RequestContext = {
      requestId,
      method: req.method,
      path: req.path,
      startTime,
      userAgent: req.headers["user-agent"],
      ip: req.ip ?? req.socket.remoteAddress,
    };

    // Intercept res.end to capture response data
    const originalEnd = res.end.bind(res);

    // @ts-expect-error  overriding a typed method
    res.end = function (...args: Parameters<typeof res.end>) {
      ctx.statusCode = res.statusCode;
      ctx.responseTime = Date.now() - startTime;

      // Restore and call original immediately
      res.end = originalEnd;
      const result = originalEnd(...args);

      // Fire callback with completed context
      try {
        onRequest(ctx);
      } catch {
        // Never let observer errors bubble into the app
      }

      return result;
    };

    // Run next() inside the AsyncLocalStorage context so all downstream
    // code in this request can call getContext() and find the store.
    requestContext.run(ctx, () => next());
  };
}`,
    },
    {
      type: "callout",
      variant: "warning",
      text: "The `res.end` intercept pattern is the standard way to capture response data in Express. Do NOT use `res.on('finish', ...)` if you need to read the response body  the stream is already consumed by then. For response body capture, intercept `res.write` and `res.end` both, collecting chunks.",
    },
    {
      type: "h2",
      text: "Fastify Is Different: Use Hooks, Not Middleware",
    },
    {
      type: "p",
      text: "Fastify has a proper plugin/hook system that makes observability cleaner. Instead of intercepting response methods, you register lifecycle hooks: `onRequest` for setup and `onResponse` for teardown.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/fastify.ts",
      code: `import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { RequestContext } from "./context";
import { requestContext } from "./context";
import { generateId } from "./utils";

export interface FastifyObserveOptions {
  onRequest: (ctx: RequestContext) => void;
}

export async function fastifyObserve(
  fastify: FastifyInstance,
  options: FastifyObserveOptions
): Promise<void> {
  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    const ctx: RequestContext = {
      requestId: generateId(),
      method: request.method,
      path: request.url,
      startTime: Date.now(),
      userAgent: request.headers["user-agent"],
      ip: request.ip,
    };

    // Attach to request object for the response hook to find it
    // This avoids needing AsyncLocalStorage for Fastify's sync hook chain
    (request as FastifyRequest & { _observeCtx: RequestContext })._observeCtx =
      ctx;

    // Also set AsyncLocalStorage so downstream async code can use getContext()
    // Fastify hooks are called in the same async context as the handler
    requestContext.enterWith(ctx);
  });

  fastify.addHook(
    "onResponse",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const ctx = (
        request as FastifyRequest & { _observeCtx?: RequestContext }
      )._observeCtx;
      if (!ctx) return;

      ctx.statusCode = reply.statusCode;
      ctx.responseTime = Date.now() - ctx.startTime;

      try {
        options.onRequest(ctx);
      } catch {
        // Swallow observer errors
      }
    }
  );
}`,
    },
    {
      type: "callout",
      variant: "note",
      text: "I'm using `requestContext.enterWith(ctx)` in Fastify hooks instead of `run()` because the hook's async context is already established by Fastify's lifecycle. Using `run()` here would create a child context that doesn't propagate back to the parent hook chain correctly.",
    },
    {
      type: "h2",
      text: "The generateId Utility: Zero Dependencies",
    },
    {
      type: "p",
      text: "I needed unique request IDs. The obvious answer is `uuid`  but that's a dependency for literally 20 lines of code. Node.js has had `crypto.randomUUID()` since v14.17.0 and it's cryptographically secure.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/utils.ts",
      code: `import { randomUUID } from "node:crypto";

/**
 * Generate a unique request ID.
 * Falls back to a timestamp+random combo for environments where
 * crypto.randomUUID isn't available (Node.js < 14.17.0).
 */
export function generateId(): string {
  if (typeof randomUUID === "function") {
    return randomUUID();
  }
  // Fallback: timestamp + 4 random hex segments
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return \`\${ts}-\${rand}\`;
}

/**
 * Format bytes to human-readable string.
 * No Number.toLocaleString()  consistent output across locales.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return \`\${bytes}B\`;
  if (bytes < 1024 * 1024) return \`\${(bytes / 1024).toFixed(1)}KB\`;
  return \`\${(bytes / (1024 * 1024)).toFixed(1)}MB\`;
}

/** High-resolution timing for request duration */
export function hrNow(): bigint {
  return process.hrtime.bigint();
}

export function hrDiff(start: bigint): number {
  return Number(process.hrtime.bigint() - start) / 1_000_000; // ms
}`,
    },
    {
      type: "h2",
      text: "Publishing: tsup, Dual CJS/ESM, Semantic Versioning",
    },
    {
      type: "p",
      text: "The build setup took longer than the code. The npm ecosystem is still in a painful transition between CommonJS and ESM. Middleware packages need to support both  Express projects are almost always CJS, while newer Fastify or standalone Node.js apps might be ESM.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "tsup.config.ts",
      code: `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,          // Generate .d.ts type declarations
  splitting: false,   // Single file output per format
  sourcemap: true,
  clean: true,
  minify: false,      // Don't minify  source maps + debuggability matter for middleware
  treeshake: true,
  target: "node16",  // Match our minimum Node.js version
  outDir: "dist",
  // Keep these node: imports as-is  don't bundle them
  external: ["node:async_hooks", "node:crypto", "node:stream"],
});`,
    },
    {
      type: "code",
      lang: "json",
      filename: "package.json (exports field)",
      code: `{
  "name": "auto-api-observe",
  "version": "1.0.0",
  "description": "Zero-dependency Express/Fastify observability middleware",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": ["dist"],
  "engines": { "node": ">=16.0.0" },
  "peerDependencies": {
    "express": ">=4.0.0",
    "fastify": ">=3.0.0"
  },
  "peerDependenciesMeta": {
    "express": { "optional": true },
    "fastify": { "optional": true }
  }
}`,
    },
    {
      type: "p",
      text: "The `peerDependencies` setup is important: Express and Fastify are optional peers because a user will have exactly one of them installed. Listing them as regular `dependencies` would mean shipping both in every install, which is absurd.",
    },
    {
      type: "h2",
      text: "TypeScript Generics for the User-Facing API",
    },
    {
      type: "p",
      text: "One thing I got right: making the callback type generic so users can extend the context without losing type safety.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/index.ts",
      code: `export interface ObserveOptions<TContext extends RequestContext = RequestContext> {
  /**
   * Called after each request completes.
   * Runs asynchronously  errors here will not affect the response.
   */
  onRequest: (ctx: TContext) => void | Promise<void>;

  /**
   * Extend the context before it's stored.
   * Use this to add custom fields from req (e.g., userId, tenantId).
   */
  enrichContext?: (req: unknown, ctx: RequestContext) => TContext;

  /**
   * Skip observing specific routes. Return true to skip.
   */
  shouldSkip?: (method: string, path: string) => boolean;
}

// Usage with custom context:
// createExpressMiddleware<{ userId?: string }>({
//   enrichContext: (req, ctx) => ({ ...ctx, userId: (req as any).user?.id }),
//   onRequest: (ctx) => console.log(ctx.userId, ctx.responseTime),
// });`,
    },
    {
      type: "h2",
      text: "Lessons Learned",
    },
    {
      type: "ul",
      items: [
        "**Bundle size matters even for Node.js packages.** Developers run `du -sh node_modules` and judge you.",
        "**AsyncLocalStorage is production-ready.** I was skeptical about performance. Benchmarks showed < 0.5% overhead on 10k req/s. Non-issue.",
        "**The `exports` field in package.json is not optional anymore.** Bundlers and modern Node.js use it. Ship it correctly or deal with CJS/ESM import bugs.",
        "**Peer dependencies > regular dependencies for middleware.** Never bundle the framework your users already have.",
        "**TypeScript generics at the API boundary pay off.** The `enrichContext` generic made the package useful in authenticated apps without any code changes from me.",
        "**Never let observer errors reach the user's response.** Wrap every callback in try/catch. You are infrastructure code  crashing the app because telemetry failed is unacceptable.",
      ],
    },
    {
      type: "divider",
    },
    {
      type: "p",
      text: "`auto-api-observe` ships with **0 runtime dependencies**, works with Express 4 and 5, Fastify 3 and 4, requires Node.js 16+, and produces a 4KB CJS bundle and 3.8KB ESM bundle. Install it with `npm install auto-api-observe` and start capturing request data in three lines of middleware registration.",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 2: AsyncLocalStorage in Node.js: The Complete Guide
  // ─────────────────────────────────────────────────────────────────────────────
  "asynclocalstorage-nodejs-complete-guide": [
    {
      type: "p",
      text: "You're building a Node.js API. You want every log line to include the `requestId` of the request that triggered it. You want your database query logger to know which HTTP request caused the query. You want error tracking to correlate errors to users.",
    },
    {
      type: "p",
      text: "The naive solution: pass `req` (or a context object derived from it) into every function call. Every service, every utility, every helper. It works, but it poisons your function signatures and couples your business logic to your HTTP layer.",
    },
    {
      type: "p",
      text: "`AsyncLocalStorage` solves this cleanly. It's built into Node.js, it's stable, and it's exactly the right tool for request-scoped state. This guide covers everything from the basics to production-ready patterns.",
    },
    {
      type: "h2",
      text: "What Problem AsyncLocalStorage Actually Solves",
    },
    {
      type: "p",
      text: "Consider this real scenario. You have an Express app. You want a `logger` module that automatically includes `requestId` in every log line  without the logger needing to receive `req` as a parameter:",
    },
    {
      type: "code",
      lang: "typescript",
      code: `// You want this to work:
import { logger } from "./logger";

async function getUser(userId: string) {
  logger.info("Fetching user"); // Automatically logs requestId  but how?
  const user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
  logger.info("User fetched", { userId }); // Same here
  return user;
}

// Without AsyncLocalStorage, you'd need this ugly alternative:
async function getUser(userId: string, requestId: string) {
  logger.info("Fetching user", { requestId }); // Now every function needs requestId
  // ...
}`,
    },
    {
      type: "p",
      text: "JavaScript is single-threaded, so there's no \"current thread\" to hang context on. But Node.js's async machinery (the event loop, Promises, async/await) does create a logical \"execution context\" for each chain of async operations. `AsyncLocalStorage` hooks into that.",
    },
    {
      type: "h2",
      text: "How AsyncLocalStorage Works",
    },
    {
      type: "p",
      text: "Node.js's `async_hooks` module tracks the lifecycle of async resources  Promises, Timers, sockets, and so on. Each async operation has a unique `asyncId` and knows its `triggerAsyncId` (which async resource created it). This forms a tree of async contexts.",
    },
    {
      type: "p",
      text: "`AsyncLocalStorage` uses this tree to propagate a store value: when you call `store.run(value, callback)`, every async operation started inside that `callback`  and every async operation they start  inherits the same store value. It propagates automatically through `await`, `Promise.then()`, `setTimeout`, and most other async patterns.",
    },
    {
      type: "code",
      lang: "typescript",
      code: `import { AsyncLocalStorage } from "node:async_hooks";

const store = new AsyncLocalStorage<{ requestId: string }>();

// Outside any run()  store is undefined
console.log(store.getStore()); // undefined

store.run({ requestId: "abc-123" }, async () => {
  // Inside run()  store is set
  console.log(store.getStore()?.requestId); // "abc-123"

  await new Promise(resolve => setTimeout(resolve, 100));

  // Still set after await!
  console.log(store.getStore()?.requestId); // "abc-123"

  await someDeepFunction(); // Also sees "abc-123" inside
});

async function someDeepFunction() {
  // Three levels deep, no parameter passing
  console.log(store.getStore()?.requestId); // "abc-123"
}`,
    },
    {
      type: "h2",
      text: "Real Example 1: Request ID Tracking Across Middleware",
    },
    {
      type: "p",
      text: "The most common use case. Every log line, every error, every database query should include the `requestId` so you can reconstruct exactly what happened during a specific request in production.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/request-context.ts",
      code: `import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

interface RequestMeta {
  requestId: string;
  method: string;
  path: string;
  startTime: number;
  userId?: string;
}

const asyncStorage = new AsyncLocalStorage<RequestMeta>();

export const RequestContext = {
  /**
   * Create a new context for a request. Call this at the top of your
   * middleware chain before anything else runs.
   */
  run<T>(meta: Omit<RequestMeta, "requestId" | "startTime">, fn: () => T): T {
    const context: RequestMeta = {
      ...meta,
      requestId: randomUUID(),
      startTime: Date.now(),
    };
    return asyncStorage.run(context, fn);
  },

  /** Get the current request context. Returns undefined outside a request. */
  get(): RequestMeta | undefined {
    return asyncStorage.getStore();
  },

  /** Set a value on the current context (e.g., userId after auth middleware) */
  set<K extends keyof RequestMeta>(key: K, value: RequestMeta[K]): void {
    const store = asyncStorage.getStore();
    if (store) store[key] = value;
  },
};`,
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/middleware/context.ts",
      code: `import type { Request, Response, NextFunction } from "express";
import { RequestContext } from "../request-context";

export function contextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Support forwarded requestId from upstream services (e.g., API gateway)
  const forwardedId = req.headers["x-request-id"];

  RequestContext.run(
    { method: req.method, path: req.path },
    () => next()
  );
}

// Auth middleware sets userId after token verification
// Note: verifyToken is your own JWT/session verification function
async function verifyToken(token: string): Promise<{ id: string }> {
  // Replace with your actual auth logic (e.g., jwt.verify, DB lookup)
  throw new Error("Implement verifyToken with your auth strategy");
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      const user = await verifyToken(token);
      RequestContext.set("userId", user.id);
    }
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}`,
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/logger.ts",
      code: `import { RequestContext } from "./request-context";

type LogLevel = "debug" | "info" | "warn" | "error";

function log(level: LogLevel, message: string, meta?: object): void {
  const ctx = RequestContext.get();

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    // Automatically pulled from AsyncLocalStorage  no parameter needed
    ...(ctx && {
      requestId: ctx.requestId,
      userId: ctx.userId,
      path: ctx.path,
    }),
    ...meta,
  };

  console[level === "debug" ? "log" : level](JSON.stringify(entry));
}

export const logger = {
  debug: (msg: string, meta?: object) => log("debug", msg, meta),
  info: (msg: string, meta?: object) => log("info", msg, meta),
  warn: (msg: string, meta?: object) => log("warn", msg, meta),
  error: (msg: string, meta?: object) => log("error", msg, meta),
};`,
    },
    {
      type: "h2",
      text: "Real Example 2: Database Query Logging",
    },
    {
      type: "p",
      text: "This is where `AsyncLocalStorage` really earns its keep. Your database client has no idea it's being called from an HTTP request handler  but you can still tie every query to a request.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/db.ts",
      code: `import { Pool } from "pg";
import { RequestContext } from "./request-context";
import { logger } from "./logger";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const start = Date.now();
  const ctx = RequestContext.get();

  try {
    const result = await pool.query(sql, params);
    const duration = Date.now() - start;

    logger.debug("Query executed", {
      sql: sql.replace(/\s+/g, " ").trim(),
      duration,
      rows: result.rowCount,
      // requestId comes from logger.debug via AsyncLocalStorage automatically
    });

    return result.rows as T[];
  } catch (err) {
    logger.error("Query failed", {
      sql: sql.replace(/\s+/g, " ").trim(),
      duration: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}`,
    },
    {
      type: "p",
      text: "Every query log line now includes `requestId` and `userId` automatically, because `logger.debug` calls `RequestContext.get()` and the context was set in middleware at the start of the request chain. No parameters changed. No interfaces polluted.",
    },
    {
      type: "h2",
      text: "Real Example 3: A Full TypeScript RequestContext Class",
    },
    {
      type: "p",
      text: "For larger applications, you'll want a typed, extensible context that different parts of the system can contribute to:",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/context/request-context.ts",
      code: `import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

// Base context fields every request has
interface BaseContext {
  readonly requestId: string;
  readonly startTime: bigint; // hrtime for precision
  method: string;
  path: string;
  ip?: string;
}

// Extended by auth middleware
interface AuthContext {
  userId?: string;
  orgId?: string;
  roles?: string[];
}

// Extended by rate limiter
interface RateLimitContext {
  rateLimitRemaining?: number;
  rateLimitReset?: number;
}

// The full context type  union of all contributors
export type AppRequestContext = BaseContext & AuthContext & RateLimitContext;

class RequestContextManager {
  private storage = new AsyncLocalStorage<AppRequestContext>();

  run<T>(
    initial: Pick<AppRequestContext, "method" | "path" | "ip">,
    fn: () => T
  ): T {
    const ctx: AppRequestContext = {
      requestId: randomUUID(),
      startTime: process.hrtime.bigint(),
      ...initial,
    };
    return this.storage.run(ctx, fn);
  }

  get(): AppRequestContext | undefined {
    return this.storage.getStore();
  }

  getOrThrow(): AppRequestContext {
    const ctx = this.storage.getStore();
    if (!ctx) {
      throw new Error(
        "RequestContext.getOrThrow() called outside of a request context. " +
        "Did you forget to call RequestContext.run() in your middleware?"
      );
    }
    return ctx;
  }

  patch(updates: Partial<Omit<AppRequestContext, "requestId" | "startTime">>): void {
    const ctx = this.storage.getStore();
    if (!ctx) return;
    Object.assign(ctx, updates);
  }

  getDurationMs(): number {
    const ctx = this.storage.getStore();
    if (!ctx) return 0;
    return Number(process.hrtime.bigint() - ctx.startTime) / 1_000_000;
  }
}

export const RequestContext = new RequestContextManager();`,
    },
    {
      type: "h2",
      text: "Common Pitfalls",
    },
    {
      type: "h3",
      text: "Pitfall 1: Forgetting to call run()",
    },
    {
      type: "p",
      text: "The most common mistake. If you call `getStore()` before `run()` has been called anywhere in the async chain, you get `undefined`. This often manifests as intermittent `undefined` returns in tests (where there's no real request context).",
    },
    {
      type: "code",
      lang: "typescript",
      code: `// BAD: getStore() called before run()
const store = new AsyncLocalStorage<{ id: string }>();
store.getStore(); // undefined  run() was never called

// GOOD: always wrap your code in run()
store.run({ id: "req-1" }, () => {
  store.getStore(); // { id: "req-1" }
});`,
    },
    {
      type: "h3",
      text: "Pitfall 2: Context Loss in setTimeout / setInterval",
    },
    {
      type: "p",
      text: "This one catches people off guard. Scheduled callbacks sometimes lose their context  particularly with some older event emitter patterns. The fix is `AsyncResource.bind()`:",
    },
    {
      type: "code",
      lang: "typescript",
      code: `import { AsyncResource } from "node:async_hooks";
import { RequestContext } from "./request-context";

// UNRELIABLE in older Node.js / some edge cases:
setTimeout(() => {
  console.log(RequestContext.get()); // might be undefined in older versions
}, 1000);

// ALWAYS RELIABLE  bind the callback to the current async context:
const boundCallback = AsyncResource.bind(() => {
  console.log(RequestContext.get()); // guaranteed to see the context
});
setTimeout(boundCallback, 1000);

// For event emitters, use AsyncResource.bind on the handler too:
emitter.on("data", AsyncResource.bind((data) => {
  logger.info("Data received", { data }); // requestId will be present
}));`,
    },
    {
      type: "callout",
      variant: "note",
      text: "Since Node.js 16, context propagation through `setTimeout` and `setImmediate` works correctly out of the box. `AsyncResource.bind()` is still a good defensive practice, and is essential for event emitter callbacks and third-party async patterns.",
    },
    {
      type: "h3",
      text: "Pitfall 3: Mutating the Store Object Carelessly",
    },
    {
      type: "p",
      text: "The store is a reference. If you do `Object.assign(store, updates)` from one place, every other code in the same async context sees the mutation. This is usually what you want  but be aware that it means the context is **shared and mutable**, not copied.",
    },
    {
      type: "code",
      lang: "typescript",
      code: `// Context is shared  mutations are visible everywhere in the async tree
const store = new AsyncLocalStorage<{ count: number }>();

store.run({ count: 0 }, async () => {
  const ctx = store.getStore()!;
  ctx.count++; // Mutation is visible everywhere in this context
  await someFunction();
  // ctx.count might be 2 here if someFunction also mutated it
});

// If you need immutable contexts, clone before mutating:
store.run({ count: 0 }, () => {
  const original = store.getStore()!;
  store.run({ ...original, count: original.count + 1 }, () => {
    // This is a NEW context  original is unaffected
    // But child contexts of this one inherit the new value
  });
});`,
    },
    {
      type: "h2",
      text: "Performance: What the Benchmarks Say",
    },
    {
      type: "p",
      text: "The honest answer: `AsyncLocalStorage` has measurable overhead, but in practice it doesn't matter for web server workloads.",
    },
    {
      type: "p",
      text: "Benchmarks on Node.js 20 (Apple M2, simple HTTP handler):",
    },
    {
      type: "ul",
      items: [
        "**Without AsyncLocalStorage**: ~85,000 req/s",
        "**With AsyncLocalStorage (run + getStore)**: ~82,000 req/s",
        "**Overhead**: ~3.5% throughput reduction",
      ],
    },
    {
      type: "p",
      text: "For a typical API server doing database queries, auth checks, and business logic, 3.5% is noise  your database round-trips dominate. The overhead _does_ matter if you're writing high-frequency event processing (millions of events/sec), but for HTTP APIs it's a non-issue.",
    },
    {
      type: "p",
      text: "Memory-wise: each `run()` call creates a small context object. In a server that handles 1,000 concurrent requests, that's 1,000 small objects alive at any time. Negligible.",
    },
    {
      type: "h2",
      text: "When NOT to Use AsyncLocalStorage",
    },
    {
      type: "p",
      text: "Just because you can propagate context implicitly doesn't mean you always should. There are cases where explicit parameter passing is better:",
    },
    {
      type: "ul",
      items: [
        "**Pure functions** that are unit-tested independently  explicit params make testing easier",
        "**Background jobs** not tied to a request  there's no request context to propagate",
        "**Library code** you're publishing  don't force your context system on library users",
        "**Simple one-hop cases**  if you're calling one function that needs a value, just pass it",
        "**Highly concurrent, CPU-bound code**  the async_hooks overhead accumulates",
      ],
    },
    {
      type: "quote",
      text: "AsyncLocalStorage is infrastructure. Use it for cross-cutting concerns  logging, tracing, auth context  not for passing business logic parameters.",
      attribution: "My own rule of thumb after using it in production",
    },
    {
      type: "h2",
      text: "Comparison with cls-hooked (the Old Way)",
    },
    {
      type: "p",
      text: "`cls-hooked` was the community's answer to this problem before `AsyncLocalStorage` existed. It used `async_hooks` directly via monkey-patching and had a reputation for memory leaks and subtle bugs in complex async scenarios.",
    },
    {
      type: "ul",
      items: [
        "**`cls-hooked`**: third-party dependency, monkey-patches async primitives, memory leak risks, unmaintained since 2019",
        "**`AsyncLocalStorage`**: built into Node.js 12.17+, stable in 16+, maintained by the Node.js core team, no monkey-patching",
      ],
    },
    {
      type: "p",
      text: "If you're on `cls-hooked`, migrate. The API is almost identical and you'll sleep better.",
    },
    {
      type: "callout",
      variant: "tip",
      text: "Minimum Node.js version recommendation: require 16.4+ for `AsyncLocalStorage`. In Node.js 16.4+, the implementation was rewritten to be significantly faster and more reliable than the 12.17 version. It's the version to target.",
    },
    {
      type: "divider",
    },
    {
      type: "p",
      text: "`AsyncLocalStorage` is one of those Node.js features that, once you use it properly, makes you wonder how you ever shipped production code without it. The pattern unlocks clean separation between infrastructure concerns (logging, tracing, auth) and business logic. Build it into your app from day one.",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 3: How to Build an MCP Server for WordPress from Scratch
  // ─────────────────────────────────────────────────────────────────────────────
  "building-mcp-server-wordpress": [
    {
      type: "p",
      text: "In early 2025, I built **CMS MCP Hub**  a monorepo of MCP servers covering 12 CMS platforms and 589 tools. WordPress was the first platform I tackled, and it's the best example to learn from because the WordPress REST API is well-documented, authentication is straightforward, and the use cases are obvious.",
    },
    {
      type: "p",
      text: "This guide walks through building a production-quality MCP server for WordPress from scratch: project setup, tool definitions, REST API integration, pagination, error handling, and connecting to Claude Desktop.",
    },
    {
      type: "h2",
      text: "What is MCP and Why Does it Matter?",
    },
    {
      type: "p",
      text: "**Model Context Protocol (MCP)** is an open standard from Anthropic that defines how AI models connect to external tools and data sources. Instead of writing bespoke function-calling code for every AI integration, MCP gives you a standard protocol: a server exposes _tools_, an AI client (like Claude) calls those tools, and the server executes them and returns results.",
    },
    {
      type: "p",
      text: "The architecture for a WordPress MCP server:",
    },
    {
      type: "ul",
      items: [
        "**Claude Desktop** (or any MCP client)  the AI that decides which tools to call",
        "**Your MCP server**  a Node.js process that registers tools and handles tool calls",
        "**WordPress REST API**  the actual system being controlled",
      ],
    },
    {
      type: "p",
      text: "When a user tells Claude _\"Draft a blog post about Node.js best practices and schedule it for tomorrow\"_, Claude calls your MCP server's `create_post` tool. Your server calls the WordPress REST API. The result comes back to Claude, which reports success to the user. The user never leaves their conversation interface.",
    },
    {
      type: "h2",
      text: "Project Setup",
    },
    {
      type: "p",
      text: "Start with a clean TypeScript project. The `@modelcontextprotocol/sdk` package handles the MCP protocol  you focus on the tools.",
    },
    {
      type: "code",
      lang: "bash",
      code: `mkdir mcp-wordpress && cd mcp-wordpress
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript tsup @types/node
npx tsc --init`,
    },
    {
      type: "code",
      lang: "json",
      filename: "package.json",
      code: `{
  "name": "@cms-mcp-hub/wordpress",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mcp-wordpress": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean",
    "dev": "tsup src/index.ts --format esm --watch",
    "start": "node dist/index.js"
  }
}`,
    },
    {
      type: "code",
      lang: "typescript",
      filename: "tsup.config.ts",
      code: `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node18",
  banner: {
    // Required for MCP servers  they communicate via stdio
    js: "#!/usr/bin/env node",
  },
});`,
    },
    {
      type: "h2",
      text: "WordPress Authentication: Application Passwords",
    },
    {
      type: "p",
      text: "WordPress 5.6+ supports **Application Passwords**  credentials scoped to a specific application that don't expire with user sessions. This is the right authentication mechanism for MCP servers.",
    },
    {
      type: "p",
      text: "To generate an application password: WordPress Admin → Users → Profile → Application Passwords → enter a name → Add New Application Password. Copy the password immediately (it's shown once).",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/wordpress-client.ts",
      code: `export interface WordPressConfig {
  siteUrl: string;       // e.g. "https://mysite.com"
  username: string;      // WordPress username
  appPassword: string;   // Application password (spaces are fine)
}

export interface WPPost {
  id: number;
  title: { rendered: string; raw?: string };
  content: { rendered: string; raw?: string };
  status: "publish" | "draft" | "private" | "pending" | "trash";
  slug: string;
  date: string;
  modified: string;
  link: string;
  categories: number[];
  tags: number[];
  author: number;
  excerpt: { rendered: string; raw?: string };
  meta: Record<string, unknown>;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
}

export class WordPressClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(config: WordPressConfig) {
    this.baseUrl = \`\${config.siteUrl.replace(/\\/+$/, "")}/wp-json/wp/v2\`;
    // WordPress application passwords are "username:password" base64-encoded
    const credentials = \`\${config.username}:\${config.appPassword.replace(/\\s/g, "")}\`;
    this.authHeader = \`Basic \${Buffer.from(credentials).toString("base64")}\`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = \`\${this.baseUrl}\${endpoint}\`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.authHeader,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = \`WordPress API error: \${response.status} \${response.statusText}\`;
      try {
        const errorBody = await response.json() as { message?: string; code?: string };
        if (errorBody.message) {
          errorMessage = \`WordPress error: \${errorBody.message} (code: \${errorBody.code ?? "unknown"})\`;
        }
      } catch {
        // If we can't parse the error body, use the status text
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  async listPosts(params: {
    page?: number;
    perPage?: number;
    status?: string;
    search?: string;
    categories?: number[];
  } = {}): Promise<{ posts: WPPost[]; total: number; totalPages: number }> {
    const query = new URLSearchParams({
      page: String(params.page ?? 1),
      per_page: String(params.perPage ?? 10),
      ...(params.status && { status: params.status }),
      ...(params.search && { search: params.search }),
      ...(params.categories?.length && {
        categories: params.categories.join(","),
      }),
      // Request raw content so we get unrendered text
      context: "edit",
      _fields: "id,title,content,status,slug,date,modified,link,categories,tags,author,excerpt",
    });

    const response = await fetch(
      \`\${this.baseUrl}/posts?\${query}\`,
      {
        headers: {
          Authorization: this.authHeader,
        },
      }
    );

    if (!response.ok) throw new Error(\`Failed to list posts: \${response.statusText}\`);

    const total = parseInt(response.headers.get("X-WP-Total") ?? "0", 10);
    const totalPages = parseInt(response.headers.get("X-WP-TotalPages") ?? "1", 10);
    const posts = await response.json() as WPPost[];

    return { posts, total, totalPages };
  }

  async getPost(id: number): Promise<WPPost> {
    return this.request<WPPost>(\`/posts/\${id}?context=edit\`);
  }

  async createPost(data: {
    title: string;
    content: string;
    status?: WPPost["status"];
    categories?: number[];
    tags?: number[];
    excerpt?: string;
    slug?: string;
  }): Promise<WPPost> {
    return this.request<WPPost>("/posts", {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        content: data.content,
        status: data.status ?? "draft",
        categories: data.categories ?? [],
        tags: data.tags ?? [],
        excerpt: data.excerpt ?? "",
        slug: data.slug,
      }),
    });
  }

  async updatePost(
    id: number,
    data: Partial<{
      title: string;
      content: string;
      status: WPPost["status"];
      categories: number[];
      tags: number[];
      excerpt: string;
    }>
  ): Promise<WPPost> {
    return this.request<WPPost>(\`/posts/\${id}\`, {
      method: "POST", // WordPress REST API uses POST for updates too
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: number, force = false): Promise<{ deleted: boolean; previous: WPPost }> {
    return this.request(\`/posts/\${id}?force=\${force}\`, { method: "DELETE" });
  }

  async listCategories(params: { perPage?: number; search?: string } = {}): Promise<WPCategory[]> {
    const query = new URLSearchParams({
      per_page: String(params.perPage ?? 100),
      ...(params.search && { search: params.search }),
    });
    return this.request<WPCategory[]>(\`/categories?\${query}\`);
  }
}`,
    },
    {
      type: "callout",
      variant: "warning",
      text: "WordPress uses POST (not PATCH) for updates to existing posts via the REST API. This is a quirk of the WordPress REST API that trips up developers coming from other REST APIs.",
    },
    {
      type: "h2",
      text: "Defining MCP Tools with Zod Schemas",
    },
    {
      type: "p",
      text: "Each MCP tool has a name, a description, and an input schema. The description is critical  it's what Claude reads to decide which tool to call for a given user request. Be specific about what the tool does and what parameters mean.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/tools/posts.ts",
      code: `import { z } from "zod";

// Zod schemas for tool input validation
export const ListPostsSchema = z.object({
  page: z.number().int().positive().default(1)
    .describe("Page number for pagination. Starts at 1."),
  per_page: z.number().int().min(1).max(100).default(10)
    .describe("Number of posts per page. Max 100."),
  status: z.enum(["publish", "draft", "private", "pending", "trash", "any"])
    .default("publish")
    .describe("Filter by post status. Use 'any' to retrieve all statuses."),
  search: z.string().optional()
    .describe("Search keyword to filter posts by title or content."),
  categories: z.array(z.number().int().positive()).optional()
    .describe("Filter by category IDs. Use list_categories to find IDs."),
});

export const GetPostSchema = z.object({
  id: z.number().int().positive().describe("The WordPress post ID."),
});

export const CreatePostSchema = z.object({
  title: z.string().min(1).max(200)
    .describe("Post title. Plain text, not HTML."),
  content: z.string()
    .describe("Post content. HTML is supported and preferred for formatting."),
  status: z.enum(["publish", "draft", "private", "pending"])
    .default("draft")
    .describe("Publication status. Defaults to draft for safety."),
  excerpt: z.string().optional()
    .describe("Short summary for SEO and post listings. Plain text."),
  categories: z.array(z.number().int().positive()).optional()
    .describe("Array of category IDs to assign to the post."),
  tags: z.array(z.number().int().positive()).optional()
    .describe("Array of tag IDs to assign to the post."),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional()
    .describe("URL slug. Auto-generated from title if omitted."),
});

export const UpdatePostSchema = z.object({
  id: z.number().int().positive().describe("The ID of the post to update."),
  title: z.string().min(1).max(200).optional()
    .describe("New post title. Omit to keep existing."),
  content: z.string().optional()
    .describe("New post content. Omit to keep existing."),
  status: z.enum(["publish", "draft", "private", "pending"]).optional()
    .describe("New publication status. Omit to keep existing."),
  excerpt: z.string().optional(),
  categories: z.array(z.number().int().positive()).optional(),
  tags: z.array(z.number().int().positive()).optional(),
});

export const DeletePostSchema = z.object({
  id: z.number().int().positive().describe("The ID of the post to delete."),
  force: z.boolean().default(false)
    .describe("If true, permanently deletes. If false, moves to trash. Default false."),
});

export const ListCategoriesSchema = z.object({
  per_page: z.number().int().min(1).max(100).default(100),
  search: z.string().optional().describe("Search keyword to filter categories."),
});`,
    },
    {
      type: "h2",
      text: "Building the MCP Server",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/index.ts",
      code: `import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { WordPressClient } from "./wordpress-client.js";
import {
  ListPostsSchema,
  GetPostSchema,
  CreatePostSchema,
  UpdatePostSchema,
  DeletePostSchema,
  ListCategoriesSchema,
} from "./tools/posts.js";

// Config from environment variables  users set these in claude_desktop_config.json
const config = {
  siteUrl: process.env.WORDPRESS_SITE_URL ?? "",
  username: process.env.WORDPRESS_USERNAME ?? "",
  appPassword: process.env.WORDPRESS_APP_PASSWORD ?? "",
};

if (!config.siteUrl || !config.username || !config.appPassword) {
  console.error(
    "Missing required environment variables: WORDPRESS_SITE_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD"
  );
  process.exit(1);
}

const wp = new WordPressClient(config);

const server = new Server(
  { name: "mcp-wordpress", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_posts",
      description:
        "List WordPress blog posts with optional filtering by status, category, or search term. " +
        "Returns post IDs, titles, statuses, dates, and excerpts. Use this before get_post to find a specific post ID.",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number", description: "Page number for pagination. Starts at 1." },
          per_page: { type: "number", description: "Number of posts per page. Max 100." },
          status: {
            type: "string",
            enum: ["publish", "draft", "private", "pending", "trash", "any"],
            description: "Filter by post status.",
          },
          search: { type: "string", description: "Search keyword." },
          categories: {
            type: "array",
            items: { type: "number" },
            description: "Filter by category IDs.",
          },
        },
      },
    },
    {
      name: "get_post",
      description:
        "Get the full content of a specific WordPress post by ID. " +
        "Returns title, full HTML content, status, categories, tags, and metadata.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "number", description: "The WordPress post ID." },
        },
        required: ["id"],
      },
    },
    {
      name: "create_post",
      description:
        "Create a new WordPress blog post. Defaults to draft status for safety  " +
        "set status to 'publish' only when explicitly asked to publish immediately.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string", description: "HTML content." },
          status: { type: "string", enum: ["publish", "draft", "private", "pending"] },
          excerpt: { type: "string" },
          categories: { type: "array", items: { type: "number" } },
          tags: { type: "array", items: { type: "number" } },
          slug: { type: "string" },
        },
        required: ["title", "content"],
      },
    },
    {
      name: "update_post",
      description: "Update an existing WordPress post. Only include fields you want to change.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "number" },
          title: { type: "string" },
          content: { type: "string" },
          status: { type: "string", enum: ["publish", "draft", "private", "pending"] },
          excerpt: { type: "string" },
          categories: { type: "array", items: { type: "number" } },
          tags: { type: "array", items: { type: "number" } },
        },
        required: ["id"],
      },
    },
    {
      name: "delete_post",
      description:
        "Delete a WordPress post. By default moves to trash (recoverable). " +
        "Set force=true only when explicitly asked to permanently delete.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "number" },
          force: { type: "boolean", description: "Permanent delete if true." },
        },
        required: ["id"],
      },
    },
    {
      name: "list_categories",
      description:
        "List all WordPress categories. Use this to find category IDs before creating/updating posts.",
      inputSchema: {
        type: "object",
        properties: {
          per_page: { type: "number" },
          search: { type: "string" },
        },
      },
    },
  ],
}));

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_posts": {
        const params = ListPostsSchema.parse(args);
        const result = await wp.listPosts(params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                posts: result.posts.map((p) => ({
                  id: p.id,
                  title: p.title.raw ?? p.title.rendered,
                  status: p.status,
                  date: p.date,
                  slug: p.slug,
                  excerpt: p.excerpt.raw ?? "",
                  categories: p.categories,
                })),
                pagination: {
                  page: params.page,
                  total: result.total,
                  totalPages: result.totalPages,
                },
              }, null, 2),
            },
          ],
        };
      }

      case "get_post": {
        const { id } = GetPostSchema.parse(args);
        const post = await wp.getPost(id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: post.id,
                title: post.title.raw ?? post.title.rendered,
                content: post.content.raw ?? post.content.rendered,
                status: post.status,
                slug: post.slug,
                date: post.date,
                modified: post.modified,
                link: post.link,
                categories: post.categories,
                tags: post.tags,
                excerpt: post.excerpt.raw ?? "",
              }, null, 2),
            },
          ],
        };
      }

      case "create_post": {
        const data = CreatePostSchema.parse(args);
        const post = await wp.createPost(data);
        return {
          content: [
            {
              type: "text",
              text: \`Post created successfully.\\nID: \${post.id}\\nTitle: \${post.title.rendered}\\nStatus: \${post.status}\\nURL: \${post.link}\`,
            },
          ],
        };
      }

      case "update_post": {
        const { id, ...data } = UpdatePostSchema.parse(args);
        const post = await wp.updatePost(id, data);
        return {
          content: [
            {
              type: "text",
              text: \`Post updated successfully.\\nID: \${post.id}\\nTitle: \${post.title.rendered}\\nStatus: \${post.status}\\nModified: \${post.modified}\`,
            },
          ],
        };
      }

      case "delete_post": {
        const { id, force } = DeletePostSchema.parse(args);
        await wp.deletePost(id, force);
        return {
          content: [
            {
              type: "text",
              text: force
                ? \`Post \${id} permanently deleted.\`
                : \`Post \${id} moved to trash. Use force=true to permanently delete.\`,
            },
          ],
        };
      }

      case "list_categories": {
        const params = ListCategoriesSchema.parse(args);
        const categories = await wp.listCategories(params);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                categories.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  count: c.count,
                })),
                null, 2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(\`Unknown tool: \${name}\`);
    }
  } catch (error) {
    // Return errors as text content  the LLM can read this and inform the user
    const message = error instanceof z.ZodError
      ? \`Invalid parameters: \${error.errors.map((e) => \`\${e.path.join(".")}: \${e.message}\`).join(", ")}\`
      : error instanceof Error
      ? error.message
      : "Unknown error occurred";

    return {
      content: [{ type: "text", text: \`Error: \${message}\` }],
      isError: true,
    };
  }
});

// Start the MCP server over stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Don't log to stdout  it's reserved for MCP protocol messages
  console.error("WordPress MCP server running");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});`,
    },
    {
      type: "callout",
      variant: "warning",
      text: "MCP servers communicate over stdio. Never use `console.log()` in your server  it will corrupt the protocol stream. Use `console.error()` for debugging output (stderr is safe).",
    },
    {
      type: "h2",
      text: "Testing with Claude Desktop",
    },
    {
      type: "p",
      text: "Build the server first: `npm run build`. Then add it to Claude Desktop's config. On macOS, the config file is at `~/Library/Application Support/Claude/claude_desktop_config.json`. On Windows it's at `%APPDATA%\\Claude\\claude_desktop_config.json`.",
    },
    {
      type: "code",
      lang: "json",
      filename: "claude_desktop_config.json",
      code: `{
  "mcpServers": {
    "wordpress": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-wordpress/dist/index.js"],
      "env": {
        "WORDPRESS_SITE_URL": "https://yourblog.com",
        "WORDPRESS_USERNAME": "your-username",
        "WORDPRESS_APP_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
      }
    }
  }
}`,
    },
    {
      type: "p",
      text: "Restart Claude Desktop after editing the config. You should see a hammer icon in the conversation input area indicating tools are available. Test with: _\"List my last 5 draft posts\"_ or _\"Create a draft post titled 'Hello MCP' with some placeholder content\"_.",
    },
    {
      type: "h2",
      text: "Handling Pagination",
    },
    {
      type: "p",
      text: "WordPress paginates all list endpoints. The total count and total page count are in response headers (`X-WP-Total`, `X-WP-TotalPages`). Teach Claude how to paginate by including pagination metadata in your response and keeping it human-readable:",
    },
    {
      type: "code",
      lang: "typescript",
      code: `// In list_posts handler response:
text: JSON.stringify({
  posts: [ /* ... */ ],
  pagination: {
    currentPage: params.page,
    totalPosts: result.total,
    totalPages: result.totalPages,
    hasMore: params.page < result.totalPages,
    nextPage: params.page < result.totalPages ? params.page + 1 : null,
  },
  hint: result.totalPages > 1
    ? \`Showing page \${params.page} of \${result.totalPages}. Call list_posts with page=\${params.page + 1} to see more.\`
    : undefined,
})`,
    },
    {
      type: "p",
      text: "The `hint` field is important. Claude reads all the text in a tool response and uses it to decide next steps. An explicit hint like _\"Call list_posts with page=2 to see more\"_ makes Claude much more reliably autonomous when browsing large post lists.",
    },
    {
      type: "h2",
      text: "Key Lessons from Building 589 MCP Tools",
    },
    {
      type: "h3",
      text: "Tool descriptions are your LLM routing config",
    },
    {
      type: "p",
      text: "Claude reads tool descriptions to decide which tool to call. Vague descriptions cause wrong tool selection. Be explicit: what does the tool do, when should it be used, what are the critical parameter semantics (e.g., _\"defaults to draft for safety\"_)?",
    },
    {
      type: "h3",
      text: "Zod validation is non-negotiable",
    },
    {
      type: "p",
      text: "Claude sometimes sends slightly wrong types  a number as a string, an array with one item as a scalar. Zod's `.coerce` methods and `.default()` values handle the majority of these cases gracefully. Without Zod, you're debugging mysterious 400 errors from WordPress instead of the actual problem.",
    },
    {
      type: "h3",
      text: "Error messages must be human-readable for the LLM",
    },
    {
      type: "p",
      text: "When an error occurs, return it as text content (not a thrown error). Claude reads the error text and uses it to recover or inform the user. _\"Post ID 9999 not found\"_ is useful. _\"404\"_ is not. _\"Cannot read property 'id' of undefined\"_ is useless and scary.",
    },
    {
      type: "h3",
      text: "Shape responses for consumption, not inspection",
    },
    {
      type: "p",
      text: "WordPress API responses are noisy  lots of `_links`, rendered HTML, and fields you don't need. Strip the response down to what's useful for the LLM to read and act on. 50 fields of metadata is noise; 8 relevant fields is signal.",
    },
    {
      type: "callout",
      variant: "tip",
      text: "The full CMS MCP Hub monorepo  including WordPress, Shopify, Ghost, Strapi, Webflow, and 7 more CMS platforms  is available as open source. Each package follows the same patterns described here. Check the GitHub repo for reference implementations.",
    },
    {
      type: "divider",
    },
    {
      type: "p",
      text: "Building MCP servers is straightforward once you understand the protocol. The value isn't in the MCP SDK (it's simple)  it's in your REST API integration, your Zod schemas, and your tool descriptions. That's where the AI usability lives.",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 4: From Database Admin to Tech Lead: A 12-Year Roadmap
  // ─────────────────────────────────────────────────────────────────────────────
  "from-database-admin-to-tech-lead": [
    {
      type: "p",
      text: "In 2011, I was a database admin at Rural Shores Technologies in Ahmedabad. I wrote SQL all day. Stored procedures, triggers, index tuning. I didn't know what an API was. I didn't know what a framework was. I knew how to write a JOIN and I thought that was a career.",
    },
    {
      type: "p",
      text: "In 2026, I'm a Tech Lead at Pranshtech Solutions. I lead 10 developers, own the architecture of a multi-tenant SaaS platform, review production deploys, and run 1:1s every week. I've also shipped three products of my own.",
    },
    {
      type: "p",
      text: "This is the honest version of how that happened  not the LinkedIn version.",
    },
    {
      type: "h2",
      text: "2011–2013: The SQL Years (and the Realization)",
    },
    {
      type: "p",
      text: "Rural Shores was a rural BPO company. My job was database administration  MySQL, mostly. Writing reports, maintaining tables, occasionally writing stored procedures for the operations team. It paid the bills and I was good at it.",
    },
    {
      type: "p",
      text: "The realization came slowly: I was optimizing something with a ceiling. Stored procedure speed doesn't compound. I could get 20% faster at writing SQL, but there wasn't a multiplied career above it. The developers I saw  the ones building things people actually used  were doing something fundamentally different. They were making systems, not just queries.",
    },
    {
      type: "p",
      text: "I started learning PHP at night. W3Schools, then PHP.net, then stack overflow. I built a small inventory management tool for my own use to practice. It was ugly and probably insecure. But it worked, and it was _mine_.",
    },
    {
      type: "h2",
      text: "2013–2016: PHP and the First Real Developer Job",
    },
    {
      type: "p",
      text: "Global India Technologies hired me as a PHP developer in 2013. CodeIgniter was the framework. My job was to build CRUD applications  admin panels, reporting dashboards, e-commerce backends.",
    },
    {
      type: "p",
      text: "Looking back, these were the most important years of my career for one reason: **I shipped things constantly**. CodeIgniter was simple enough that I wasn't fighting the framework, so every problem I solved was a real problem. I debugged production issues. I designed database schemas from scratch. I built things that had actual users who complained when they broke.",
    },
    {
      type: "p",
      text: "The skills that formed in this period:",
    },
    {
      type: "ul",
      items: [
        "**Reading other people's code**  most of what I was doing was maintenance and extension, not greenfield",
        "**Database design**  my SQL background actually helped here; I thought about data modeling more carefully than most junior devs",
        "**Debugging without a debugger**  `var_dump()` and logs. I got fast at it.",
        "**Estimating work**  badly, at first. But the feedback loop was fast.",
      ],
    },
    {
      type: "h2",
      text: "2016: Laravel Changed Everything",
    },
    {
      type: "p",
      text: "I moved to Siddhi Infosoft as a Senior PHP Developer. They used Laravel. The first time I saw Eloquent ORM, route model binding, and Artisan, something clicked that I hadn't felt since my first working SQL query.",
    },
    {
      type: "p",
      text: "Laravel wasn't just a better framework  it was evidence that software design _matters_. The code I wrote before had worked, but it had been inelegant in ways I hadn't had words for. Laravel gave me the vocabulary and demonstrated what well-designed code felt like to use.",
    },
    {
      type: "p",
      text: "I became mildly obsessed. I read the source code. I understood the service container, dependency injection, and middleware pipelines  not because someone told me to, but because I was curious how it worked. This is a habit that has paid dividends every year since.",
    },
    {
      type: "h2",
      text: "2017: React and the Paradigm Shift",
    },
    {
      type: "p",
      text: "I returned to Global India Technologies as a full-stack developer. They were starting to use React. This was a bigger mental shift than Laravel had been.",
    },
    {
      type: "p",
      text: "Server-rendered HTML meant the server was in charge. React meant the client was in charge, and the server was an API. Separating those concerns forced me to think about the contract between frontend and backend explicitly  what data does the UI need, in what shape, at what latency?",
    },
    {
      type: "p",
      text: "The practical skills that came out of this period:",
    },
    {
      type: "ul",
      items: [
        "**REST API design**  how to structure endpoints, handle pagination, version APIs",
        "**Async JavaScript**  Promises, then async/await, then understanding what the event loop actually does",
        "**State management**  Redux first (too much ceremony), then lighter patterns",
        "**CORS, authentication tokens, refresh flows**  the plumbing nobody teaches you",
      ],
    },
    {
      type: "h2",
      text: "2018–2022: The Trap of Just Shipping Features",
    },
    {
      type: "p",
      text: "This is the period I'm most honest about in retrospect. I was technically solid. I could build almost anything you asked me to build  React frontends, Node.js backends, Laravel APIs, MySQL schemas, Redis caches. I shipped constantly.",
    },
    {
      type: "p",
      text: "But I had zero leadership skills. I didn't know how to run a meeting. I didn't know how to give a junior developer feedback that made them better rather than just telling them what was wrong. I didn't know how to communicate project status to stakeholders without getting technical and losing them. I didn't know how to push back on a bad product decision in a way that got heard.",
    },
    {
      type: "quote",
      text: "Technical skills get you to senior developer. The skills after that are almost entirely about communication, influence, and systems thinking.",
      attribution: "Something I wish someone had told me in 2018",
    },
    {
      type: "p",
      text: "The trap is that shipping features feels productive, so you keep doing it. Years pass. You get better at shipping features. But you plateau as a lead candidate because the skills for the next level are orthogonal to what you've been practicing.",
    },
    {
      type: "h2",
      text: "2022: Moving to Pranshtech  First Real Leadership Responsibility",
    },
    {
      type: "p",
      text: "I joined Pranshtech Solutions in 2022 and immediately had responsibility I hadn't had before: a team of developers, project timelines that I owned, and architecture decisions that I couldn't escalate to someone else.",
    },
    {
      type: "p",
      text: "The first three months were humbling. I was good at _doing_  I was bad at enabling others to do. My first instinct when a junior developer was stuck was to solve the problem for them. It's faster. It feels efficient. It is deeply wrong.",
    },
    {
      type: "p",
      text: "The things I had to unlearn:",
    },
    {
      type: "ul",
      items: [
        "**Solving instead of coaching**  taking a problem away from someone prevents them from learning to solve it",
        "**Reviewing code for correctness only**  code review is a teaching surface, not just a bug filter",
        "**Treating estimates as commitments**  estimates are guesses; the work is managing the gap between guesses and reality",
        "**Assuming shared context**  what's obvious to me after 8 years isn't obvious to someone in year 2",
      ],
    },
    {
      type: "h2",
      text: "2023: Tech Lead Title and What I Wish I'd Known",
    },
    {
      type: "p",
      text: "Tech Lead at Pranshtech. Ten developers. Full ownership of the technical direction for a multi-tenant SaaS platform.",
    },
    {
      type: "p",
      text: "Three things that made an immediate difference:",
    },
    {
      type: "h3",
      text: "1. 1:1s matter more than standups",
    },
    {
      type: "p",
      text: "Weekly 30-minute 1:1s with each developer. Not status updates  those belong in Jira. 1:1s for: what's frustrating you right now, what do you want to learn, are there blockers I don't know about, is the work interesting? The signal-to-noise ratio on problems I can actually fix is far higher in 1:1s than in standups.",
    },
    {
      type: "h3",
      text: "2. Architecture documents save you",
    },
    {
      type: "p",
      text: "I started writing **Architecture Decision Records (ADRs)**  short documents (one page max) that capture a decision, the context, the options considered, and why we chose what we chose. When someone new joins, they can read the last 20 ADRs and understand why the codebase looks the way it does. When someone challenges a decision six months later, you have the reasoning documented.",
    },
    {
      type: "code",
      lang: "markdown",
      filename: "docs/adr/0012-use-bullmq-over-bee-queue.md",
      code: `# ADR 0012: Use BullMQ for Job Queue

## Status
Accepted  2023-09-14

## Context
We need a reliable background job queue for email delivery, PDF generation,
and webhook processing. Current setup uses ad-hoc setTimeout which loses
jobs on restart.

## Options Considered
- **Bee-Queue**: Simple, fast, Redis-backed. No repeat jobs, no job priority.
- **BullMQ**: Redis-backed, TypeScript-first, repeat jobs, priorities, rate limiting.
- **pg-boss**: PostgreSQL-backed. No Redis dependency, but slower throughput.

## Decision
BullMQ. We already run Redis for caching. TypeScript types are first-class.
The repeat-job functionality replaces 3 cron scripts we currently maintain.

## Consequences
- Adds BullMQ as a dependency
- Team needs to learn BullMQ API (estimated 2h ramp)
- Workers run as separate Node.js processes  deployment slightly more complex`,
    },
    {
      type: "h3",
      text: "3. Code reviews are mentoring, not gatekeeping",
    },
    {
      type: "p",
      text: "I changed how I write code review comments. Instead of _\"This is wrong\"_, I write _\"This will cause an N+1 query because Eloquent loads each relationship lazily in the loop. Try `with(['user'])` on the query  here's why: [link to docs]\"_. The diff isn't the point. The developer reading the comment is the point.",
    },
    {
      type: "p",
      text: "This takes longer per review. The return is that the same mistake appears less often over time.",
    },
    {
      type: "h2",
      text: "The Skills That Actually Moved My Career",
    },
    {
      type: "p",
      text: "Not the technologies. The meta-skills:",
    },
    {
      type: "ol",
      items: [
        "**Writing clearly.** The ability to explain a technical decision in two paragraphs to a non-technical stakeholder is worth more than knowing any specific framework. I got better at this by writing  Notion docs, Slack messages, ADRs. Practice makes it faster.",
        "**System design thinking.** Understanding how pieces fit together at a level above \"does this function work.\" How does this service behave under load? What happens when this queue backs up? Where are the failure modes? This is the difference between senior developer and staff/lead.",
        "**Saying \"I don't know\" confidently.** This sounds counterintuitive but it builds trust. \"I don't know, let me find out and get back to you by EOD\" is more trustworthy than a confident-sounding guess that turns out to be wrong.",
        "**Estimating with explicit uncertainty.** \"This will take 3 days\" is a commitment. \"My best estimate is 3-5 days; it could go to 7 if the third-party API integration is as undocumented as the docs suggest\" is honest and useful.",
        "**Reading code you didn't write.** Senior developers spend more time reading code than writing it. Being fast at understanding unfamiliar codebases is a force multiplier.",
      ],
    },
    {
      type: "h2",
      text: "What I'd Tell 2011 Rahul",
    },
    {
      type: "ul",
      items: [
        "**Learn data structures and algorithms sooner.** Not for LeetCode  for real problem-solving. Understanding tree traversal, hash maps, and time complexity changes how you approach code.",
        "**Read _The Pragmatic Programmer_ in year 3, not year 8.** Hunt and Thomas's advice on \"don't live with broken windows\", \"DRY\", and \"invest regularly in your knowledge portfolio\" would have compressed my learning significantly.",
        "**Network more, but genuinely.** Attend meetups. Write one blog post a year. The jobs and opportunities that moved my career came through people, not job boards.",
        "**Build things for yourself.** Every side project taught me something I couldn't have learned in a client project  because client projects have constraints that prevent certain experiments. Your own projects have no such constraints.",
        "**The first three years of any new level will feel incompetent.** Database admin → developer felt incompetent. Developer → senior felt incompetent. Senior → tech lead felt incompetent. This feeling is the signal that growth is happening, not that you've made the wrong move.",
      ],
    },
    {
      type: "divider",
    },
    {
      type: "p",
      text: "Twelve years is a long time. The compounding is real  not just in skills, but in perspective. The problems that felt career-ending in year two are the kind of thing I solve before lunch in year twelve. If you're early in your career: it gets faster. If you're mid-career and wondering whether the next level is worth pursuing  the skills required are learnable, and most of them are about people, not technology.",
    },
  ],
};

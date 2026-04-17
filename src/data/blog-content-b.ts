import type { ContentBlock } from "./blog-content-types";

export const POST_CONTENT_B: Record<string, ContentBlock[]> = {
  // ─────────────────────────────────────────────────────────────────────────────
  // POST 5  Next.js 15 Static Export to GitHub Pages
  // ─────────────────────────────────────────────────────────────────────────────
  "nextjs-static-export-github-pages-guide": [
    {
      type: "p",
      text: "I host this portfolio on GitHub Pages. Zero cost, global CDN, no server to babysit at 2 AM. If your Next.js project doesn't need server-side rendering at runtime  and most portfolios, marketing sites, and docs sites don't  static export is the right call.",
    },
    {
      type: "p",
      text: "This guide covers everything I figured out setting up Next.js 15 App Router for static export and GitHub Pages deployment. I'll skip the theory and show you the exact config, workflow file, and the gotchas that will waste your afternoon if you don't know about them.",
    },
    {
      type: "h2",
      text: "Why Static Export Over Vercel or a VPS",
    },
    {
      type: "ul",
      items: [
        "**Free forever**  GitHub Pages has no bandwidth caps for public repos",
        "**CDN included**  GitHub's CDN serves your assets from edge nodes globally",
        "**No cold starts**  static files serve instantly, no Lambda spin-up",
        "**Zero maintenance**  no Node.js process to keep alive, no memory leaks, no uptime monitoring",
        "**Git-native deploys**  push to main, site updates. That's the whole workflow.",
      ],
    },
    {
      type: "callout",
      variant: "note",
      text: "Static export means no `getServerSideProps`, no Route Handlers that run at request time, no ISR (Incremental Static Regeneration), and no Next.js Image Optimization API. Everything must be deterministic at build time. For a portfolio or blog, that's a non-issue.",
    },
    {
      type: "h2",
      text: "The next.config.ts You Actually Need",
    },
    {
      type: "p",
      text: "Start here. This is the minimal config for a static export deployed at the root of a custom domain (or `yourusername.github.io`). I'll cover the `basePath` variant for project repos below.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "next.config.ts",
      code: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",         // emit static files to /out instead of running a server
  trailingSlash: true,      // /about -> /about/index.html  required for GH Pages routing
  images: {
    unoptimized: true,      // next/image optimization requires a server; disable it
  },
  // If deploying to https://yourusername.github.io/repo-name/ (not a custom domain):
  // basePath: "/repo-name",
  // assetPrefix: "/repo-name",
};

export default nextConfig;`,
    },
    {
      type: "p",
      text: "The three options that matter most:",
    },
    {
      type: "ul",
      items: [
        '**`output: "export"`**  tells Next.js to write static files to `out/` instead of starting a server. Without this, `npm run build` produces a Node.js app, not static HTML.',
        "**`trailingSlash: true`**  GitHub Pages serves `/about/` by loading `/about/index.html`. Without trailing slashes, navigating directly to a route returns a 404.",
        "**`images: { unoptimized: true }`**  `next/image` normally uses a server-side optimization endpoint (`/_next/image`). That endpoint doesn't exist in a static export. This disables it so your images still render, just without on-the-fly resizing.",
      ],
    },
    {
      type: "h3",
      text: "Deploying to a Project Repo (Not a Custom Domain)",
    },
    {
      type: "p",
      text: "If your site lives at `https://rahhuul.github.io/my-project/` instead of `https://rahhuul.github.io/`, you need `basePath` and `assetPrefix` set to `/my-project`. Without them, your JS bundles and images will 404 because they'll be requested from `/` instead of `/my-project/`.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "next.config.ts",
      code: `const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isProd ? "/my-project" : "",
  assetPrefix: isProd ? "/my-project" : "",
};`,
    },
    {
      type: "callout",
      variant: "tip",
      text: "Using a custom domain (like `rahhuul.com`)? Keep `basePath` empty. The custom domain maps directly to your repo root, so no path prefix is needed.",
    },
    {
      type: "h2",
      text: "GitHub Actions Deployment Workflow",
    },
    {
      type: "p",
      text: "Create this file at `.github/workflows/deploy.yml`. It triggers on every push to `main`, builds the site, and deploys the `out/` directory to the `gh-pages` branch.",
    },
    {
      type: "code",
      lang: "yaml",
      filename: ".github/workflows/deploy.yml",
      code: `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch: # allow manual trigger from the GitHub UI

permissions:
  contents: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SITE_URL: https://rahhuul.github.io

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
          cname: rahhuul.com  # remove this line if you're not using a custom domain`,
    },
    {
      type: "p",
      text: "After the first successful run, go to your repo's Settings → Pages → Source and set it to the `gh-pages` branch, `/ (root)`. GitHub will show you the live URL.",
    },
    {
      type: "h2",
      text: "The .nojekyll File",
    },
    {
      type: "p",
      text: "GitHub Pages runs Jekyll by default on any branch it serves. Jekyll ignores directories and files that start with an underscore  like `_next/`, which is where all your JavaScript bundles live. Your site will be blank.",
    },
    {
      type: "p",
      text: "Fix: add an empty `.nojekyll` file to `public/`. Next.js copies everything in `public/` to `out/` during build. The `peaceiris/actions-gh-pages` action also adds this automatically, but putting it in `public/` ensures it's there even if you swap deployment tools.",
    },
    {
      type: "code",
      lang: "bash",
      code: `touch public/.nojekyll`,
    },
    {
      type: "h2",
      text: "Custom Domain Setup",
    },
    {
      type: "p",
      text: "Two things needed for a custom domain to work:",
    },
    {
      type: "ol",
      items: [
        "Add a `CNAME` file to `public/` containing your domain name (no `https://`, no trailing slash)",
        "Update your DNS: point an `A` record to GitHub's IP addresses, or a `CNAME` record to `yourusername.github.io`",
      ],
    },
    {
      type: "code",
      lang: "text",
      filename: "public/CNAME",
      code: `rahhuul.com`,
    },
    {
      type: "p",
      text: "GitHub's current IP addresses for `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Add all four. DNS propagation takes up to 48 hours but is usually minutes.",
    },
    {
      type: "h2",
      text: "Common Pitfalls",
    },
    {
      type: "h3",
      text: "1. Dynamic Routes Require generateStaticParams",
    },
    {
      type: "p",
      text: "Any `[slug]` or `[id]` route must export `generateStaticParams` that returns the list of all possible values. Without it, Next.js doesn't know what pages to render, and the build either skips them or throws.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/app/blog/[slug]/page.tsx",
      code: `import { BLOG_POSTS } from "@/data/blog-posts";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  // params.slug is guaranteed to be one of the values from generateStaticParams
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return null;
  return <article>...</article>;
}`,
    },
    {
      type: "h3",
      text: "2. ISR / On-Demand Revalidation Silently Fails",
    },
    {
      type: "p",
      text: "If you have `revalidate = 60` on a page or use `revalidatePath()` in a Server Action, the build will succeed but the revalidation never runs  there's no server. All content is frozen at build time. Remove `revalidate` exports from static export pages or accept that you need a new deploy to update content.",
    },
    {
      type: "h3",
      text: "3. Font Loading  Google Fonts vs Self-Hosted",
    },
    {
      type: "p",
      text: "Next.js `next/font/google` downloads fonts at build time and self-hosts them  this works perfectly with static export. The font files end up in `out/_next/static/media/`. No runtime Google Fonts request, no privacy issues, no FOUT.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/app/layout.tsx",
      code: `import { Playfair_Display, Caveat, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={\`\${playfair.variable} \${caveat.variable} \${jetbrainsMono.variable}\`}>
      <body>{children}</body>
    </html>
  );
}`,
    },
    {
      type: "h3",
      text: "4. Environment Variables Are Baked at Build Time",
    },
    {
      type: "p",
      text: "There's no server to read `process.env` at runtime. Only `NEXT_PUBLIC_` variables are inlined into the JavaScript bundle at build time. Pass them to the GitHub Actions `env:` block:",
    },
    {
      type: "code",
      lang: "yaml",
      code: `- name: Build
  run: npm run build
  env:
    NEXT_PUBLIC_SITE_URL: https://rahhuul.com
    NEXT_PUBLIC_GA_ID: G-XXXXXXXXXX`,
    },
    {
      type: "callout",
      variant: "warning",
      text: "Never put secrets (API keys, tokens) in `NEXT_PUBLIC_` variables. They are literally embedded in your JavaScript bundle and visible to anyone who views source. Secrets only make sense in server-only contexts  which static export doesn't have.",
    },
    {
      type: "h2",
      text: "Testing the Static Output Locally",
    },
    {
      type: "p",
      text: "Before pushing, verify the `out/` directory actually works. Don't open `out/index.html` directly in a browser  file:// protocol breaks relative paths. Serve it over HTTP:",
    },
    {
      type: "code",
      lang: "bash",
      code: `npm run build
npx serve out

# or with a specific port:
npx serve out -l 3001`,
    },
    {
      type: "p",
      text: "Navigate through the site, check that dynamic routes work, confirm images load, verify that hard-refreshing a page like `/blog/my-post/` doesn't 404. If it 404s locally, it'll 404 on GitHub Pages too.",
    },
    {
      type: "h2",
      text: "The Complete Setup Checklist",
    },
    {
      type: "ol",
      items: [
        "Add `output: 'export'`, `trailingSlash: true`, `images: { unoptimized: true }` to `next.config.ts`",
        "Add `public/.nojekyll` (empty file)",
        "Add `public/CNAME` with your domain (if using custom domain)",
        "Add `generateStaticParams` to all dynamic routes",
        "Replace any `revalidate` exports with static data",
        "Use `next/font/google` for fonts (self-hosted at build time)",
        "Set `NEXT_PUBLIC_` env vars in GitHub Actions workflow",
        "Create `.github/workflows/deploy.yml` with `peaceiris/actions-gh-pages`",
        "Enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch",
        "Test locally with `npx serve out` before pushing",
      ],
    },
    {
      type: "quote",
      text: "Static sites are the right default. Add a server only when you have a problem that requires one.",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 6  589 MCP Tools in One Monorepo
  // ─────────────────────────────────────────────────────────────────────────────
  "589-mcp-tools-one-monorepo": [
    {
      type: "p",
      text: "When I started building MCP servers for CMS platforms, I built the WordPress one first. It took about three weeks: REST API integration, Zod schemas for every tool input, TypeScript types, a build pipeline, a README. Then I started the Shopify one and realized I was going to repeat everything.",
    },
    {
      type: "p",
      text: "Twelve CMS platforms. If I did them independently, I'd have twelve separate repos, twelve separate CI pipelines, twelve separate versioning strategies, and twelve places where a bug in the shared authentication logic would need to be fixed. CMS MCP Hub was the answer: one monorepo, one pipeline, shared core, 589 tools.",
    },
    {
      type: "p",
      text: "Here's how it's built.",
    },
    {
      type: "h2",
      text: "The Problem: Every CMS Needs Its Own MCP Server",
    },
    {
      type: "p",
      text: "Model Context Protocol lets you expose tools that an LLM (Claude, GPT-4, etc.) can call. An MCP server for WordPress might expose `create_post`, `update_page`, `list_plugins`. An MCP server for Shopify exposes `create_product`, `update_inventory`, `list_orders`. The concepts differ but the plumbing is identical:",
    },
    {
      type: "ul",
      items: [
        "Parse tool call input with Zod",
        "Authenticate against the CMS API",
        "Make HTTP requests to the right endpoint",
        "Transform the response into something the LLM can read",
        "Handle errors without crashing the MCP session",
      ],
    },
    {
      type: "p",
      text: "The platforms in scope: WordPress, Shopify, Ghost, Strapi, Webflow, Contentful, Prismic, Sanity, Directus, Payload CMS, Hygraph (GraphQL CMS), and KeystoneJS. Each has a completely different API  REST, GraphQL, custom SDKs. But all share the same MCP server structure.",
    },
    {
      type: "h2",
      text: "Monorepo Setup with Turborepo",
    },
    {
      type: "p",
      text: "Turborepo handles the build orchestration. The workspace structure:",
    },
    {
      type: "code",
      lang: "text",
      code: `cms-mcp-hub/
├── packages/
│   ├── core/                    # @cms-mcp-hub/core  shared utilities
│   ├── wordpress/               # @cms-mcp-hub/wordpress  89 tools
│   ├── shopify/                 # @cms-mcp-hub/shopify  67 tools
│   ├── ghost/                   # @cms-mcp-hub/ghost  45 tools
│   ├── strapi/                  # @cms-mcp-hub/strapi  52 tools
│   ├── webflow/                 # @cms-mcp-hub/webflow  48 tools
│   ├── contentful/              # @cms-mcp-hub/contentful  51 tools
│   ├── prismic/                 # @cms-mcp-hub/prismic  41 tools
│   ├── sanity/                  # @cms-mcp-hub/sanity  43 tools
│   ├── directus/                # @cms-mcp-hub/directus  55 tools
│   ├── payload/                 # @cms-mcp-hub/payload  44 tools
│   ├── hygraph/                 # @cms-mcp-hub/hygraph  38 tools
│   └── keystonejs/              # @cms-mcp-hub/keystonejs  36 tools
├── turbo.json
├── package.json                 # workspace root
└── tsconfig.base.json`,
    },
    {
      type: "code",
      lang: "json",
      filename: "package.json (root)",
      code: `{
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "tsup": "^8.0.0"
  }
}`,
    },
    {
      type: "code",
      lang: "json",
      filename: "turbo.json",
      code: `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // build dependencies first (core before everything else)
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}`,
    },
    {
      type: "p",
      text: "The `^build` dependency declaration is the key insight. It tells Turborepo that before building `wordpress`, it must build `core` first. Turbo figures out the DAG automatically from workspace dependencies.",
    },
    {
      type: "h2",
      text: "The Core Package: Shared Foundation",
    },
    {
      type: "p",
      text: "`@cms-mcp-hub/core` exports the utilities every CMS package imports:",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "packages/core/src/index.ts",
      code: `// Universal REST gateway  authenticate once, route anywhere
export { createCmsGateway } from "./gateway";
// Base error types
export { CmsAuthError, CmsApiError, CmsValidationError } from "./errors";
// Shared Zod utilities
export { paginationSchema, dateRangeSchema, slugSchema } from "./schemas";
// MCP server factory
export { createMcpServer } from "./server";
// Logger
export { createLogger } from "./logger";
// Type utilities
export type { CmsConfig, ToolResult, PaginatedResult } from "./types";`,
    },
    {
      type: "h3",
      text: "The Universal REST Gateway",
    },
    {
      type: "p",
      text: "Every CMS package instantiates a gateway with its credentials. The gateway handles authentication, rate limiting, retry logic, and response normalization  once, in core, for everyone.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "packages/core/src/gateway.ts",
      code: `import { z } from "zod";

export interface GatewayConfig {
  baseUrl: string;
  auth:
    | { type: "bearer"; token: string }
    | { type: "basic"; username: string; password: string }
    | { type: "api-key"; header: string; key: string };
  timeout?: number;
  retries?: number;
}

export function createCmsGateway(config: GatewayConfig) {
  const headers = buildAuthHeaders(config.auth);

  async function request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = \`\${config.baseUrl}\${path}\`;
    const maxRetries = config.retries ?? 3;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json", ...headers },
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(config.timeout ?? 10_000),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new CmsApiError(res.status, text);
        }

        return (await res.json()) as T;
      } catch (err) {
        lastError = err as Error;
        if (err instanceof CmsApiError && err.status < 500) throw err; // don't retry 4xx
        if (attempt < maxRetries - 1) await sleep(Math.pow(2, attempt) * 100);
      }
    }
    throw lastError;
  }

  return { get: <T>(p: string) => request<T>("GET", p),
           post: <T>(p: string, b: unknown) => request<T>("POST", p, b),
           put: <T>(p: string, b: unknown) => request<T>("PUT", p, b),
           patch: <T>(p: string, b: unknown) => request<T>("PATCH", p, b),
           delete: <T>(p: string) => request<T>("DELETE", p) };
}

function buildAuthHeaders(auth: GatewayConfig["auth"]): Record<string, string> {
  switch (auth.type) {
    case "bearer":
      return { Authorization: \`Bearer \${auth.token}\` };
    case "basic":
      return { Authorization: \`Basic \${btoa(\`\${auth.username}:\${auth.password}\`)}\` };
    case "api-key":
      return { [auth.header]: auth.key };
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));`,
    },
    {
      type: "h2",
      text: "Zod Schemas: The Key to LLM-Friendly Tools",
    },
    {
      type: "p",
      text: "Every tool input is validated with Zod before touching the API. But there's a subtlety: Zod's `.describe()` method on fields is how the LLM knows what to pass. The MCP protocol serializes your Zod schema into JSON Schema, and Claude reads those descriptions to figure out what each argument means.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "packages/wordpress/src/tools/posts.ts",
      code: `import { z } from "zod";
import { createCmsGateway } from "@cms-mcp-hub/core";

// The .describe() calls are what Claude actually reads
export const createPostSchema = z.object({
  title: z.string()
    .min(1)
    .max(200)
    .describe("The post title. Displayed as the H1 and used in the URL slug."),

  content: z.string()
    .describe("Post body in HTML or Gutenberg block JSON. Plain text is also accepted."),

  status: z.enum(["draft", "publish", "private", "pending"])
    .default("draft")
    .describe("Publication status. Use 'draft' unless the user explicitly asks to publish."),

  categories: z.array(z.number().int())
    .optional()
    .describe("Array of category IDs. Use the list_categories tool first to get valid IDs."),

  tags: z.array(z.number().int())
    .optional()
    .describe("Array of tag IDs. Use list_tags tool to get valid IDs."),

  featured_media: z.number().int().optional()
    .describe("Media attachment ID for the featured image. Use upload_media first."),

  meta: z.record(z.unknown()).optional()
    .describe("Custom field key-value pairs for plugins like ACF or Yoast SEO."),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export async function createPost(
  gateway: ReturnType<typeof createCmsGateway>,
  input: CreatePostInput
) {
  // Zod already validated  trust the types
  const post = await gateway.post<{ id: number; link: string }>("/wp/v2/posts", input);
  return {
    success: true,
    postId: post.id,
    url: post.link,
    message: \`Post created with ID \${post.id}\`,
  };
}`,
    },
    {
      type: "callout",
      variant: "tip",
      text: "The `.describe()` pattern is critical. Without descriptions, Claude has to guess what `featured_media` means. With descriptions, it knows to call `upload_media` first and use the returned ID. Good Zod descriptions are what separate a usable MCP tool from a frustrating one.",
    },
    {
      type: "h2",
      text: "The MCP Server Factory",
    },
    {
      type: "p",
      text: "Each package calls `createMcpServer` from core with its tool list. The factory handles the MCP protocol boilerplate  tool listing, tool execution, error serialization  so each CMS package just exports an array of tool definitions.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "packages/wordpress/src/index.ts",
      code: `import { createMcpServer, createCmsGateway } from "@cms-mcp-hub/core";
import { createPostSchema, createPost } from "./tools/posts";
import { updatePostSchema, updatePost } from "./tools/posts";
import { listPostsSchema, listPosts } from "./tools/posts";
// ... import all 89 tools

const gateway = createCmsGateway({
  baseUrl: process.env.WP_BASE_URL!,
  auth: {
    type: "basic",
    username: process.env.WP_USERNAME!,
    password: process.env.WP_APP_PASSWORD!,
  },
});

createMcpServer({
  name: "cms-mcp-hub-wordpress",
  version: "1.0.0",
  tools: [
    {
      name: "create_post",
      description: "Create a new WordPress post or custom post type",
      inputSchema: createPostSchema,
      handler: (input) => createPost(gateway, input),
    },
    {
      name: "update_post",
      description: "Update an existing post by ID",
      inputSchema: updatePostSchema,
      handler: (input) => updatePost(gateway, input),
    },
    {
      name: "list_posts",
      description: "List posts with filtering, pagination, and search",
      inputSchema: listPostsSchema,
      handler: (input) => listPosts(gateway, input),
    },
    // ... 86 more
  ],
}).start();`,
    },
    {
      type: "h2",
      text: "tsup for Builds: Dual CJS/ESM Output",
    },
    {
      type: "p",
      text: "Each package uses tsup to produce both CommonJS and ESM builds with declaration files. This matters because different MCP clients have different module expectations.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "packages/wordpress/tsup.config.ts",
      code: `import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,                  // generate .d.ts declaration files
  splitting: false,            // single output file per format
  sourcemap: true,
  clean: true,
  external: [                  // don't bundle the SDK  let the consumer provide it
    "@modelcontextprotocol/sdk",
    "zod",
  ],
  esbuildOptions(options) {
    options.platform = "node";
  },
});`,
    },
    {
      type: "h2",
      text: "How 12 Platforms × ~49 Tools = 589",
    },
    {
      type: "p",
      text: "Each CMS package has a consistent tool surface organized into resource types. WordPress has the most because it's the most extensible; simpler platforms like KeystoneJS have fewer:",
    },
    {
      type: "ul",
      items: [
        "**WordPress**  89 tools (posts, pages, media, taxonomies, users, comments, plugins, themes, options, custom post types, WooCommerce)",
        "**Shopify**  67 tools (products, variants, inventory, orders, customers, collections, metafields, webhooks)",
        "**Strapi**  52 tools (content types, entries, media, components, roles, users)",
        "**Directus**  55 tools (items, collections, files, flows, permissions, users, relations)",
        "**Contentful**  51 tools (entries, assets, content types, locales, webhooks, tags)",
        "**Ghost**  45 tools (posts, pages, tags, members, newsletters, offers, tiers)",
        "**Webflow**  48 tools (collections, items, pages, assets, forms, sites, webhooks)",
        "**Sanity**  43 tools (documents, assets, datasets, projects, users, webhooks)",
        "**Payload**  44 tools (collections, globals, media, users, preferences, versions)",
        "**Prismic**  41 tools (documents, custom types, releases, assets, environments)",
        "**Hygraph**  38 tools (content entries, models, enumerations, stages, locales)",
        "**KeystoneJS**  36 tools (lists, items, files, users, sessions, schema introspection)",
      ],
    },
    {
      type: "h2",
      text: "Turborepo Caching Saved Hours",
    },
    {
      type: "p",
      text: "Turbo caches build outputs by content hash. If I change only the WordPress package, a `turbo run build` will rebuild WordPress but use cached output for the other 11 packages. On a full build from scratch, all 12 packages take about 4 minutes. With the cache, touching one package takes 15 seconds.",
    },
    {
      type: "code",
      lang: "bash",
      code: `# First build: all 12 packages compile fresh
turbo run build
# Tasks: 13 total, 0 cached, 13 completed (4m 12s)

# After editing only the wordpress package:
turbo run build
# Tasks: 13 total, 12 cached, 1 completed (14s)
# FULL TURBO (for the 12 unchanged packages)`,
    },
    {
      type: "h2",
      text: "Open Source Strategy",
    },
    {
      type: "p",
      text: "MIT license. The rationale: MCP servers are infrastructure. Infrastructure that's locked behind a commercial license gets ignored. The goal is adoption  developers adding these to their Claude Desktop configs, not paying for a SaaS.",
    },
    {
      type: "p",
      text: "What actually drives contributions: a clear README with copy-paste config examples, an `examples/` directory showing real Claude prompts and what tools they invoke, and a CONTRIBUTING guide that explains the architecture so adding a new tool takes 30 minutes, not 3 hours.",
    },
    {
      type: "callout",
      variant: "note",
      text: "The biggest lesson from open source: people don't read long READMEs. The first 10 lines need to answer 'what does this do' and 'how do I install it'. Everything else is reference documentation.",
    },
    {
      type: "h2",
      text: "What I'd Do Differently",
    },
    {
      type: "ul",
      items: [
        "**Start with the schema layer**  I built 3 packages before establishing the Zod schema conventions. Retrofitting consistent `.describe()` patterns across 150 tools was painful.",
        "**Integration tests from day one**  each tool should have a test against a real CMS instance (or a mock that matches the API contract). I added tests late and caught schema mismatches I'd shipped.",
        "**Versioning strategy**  deciding whether to version packages independently or lock-step is harder than it sounds. I use lock-step (all packages share the same version) because independent versioning of 12 packages is overhead I don't want.",
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 7  Code Review Culture
  // ─────────────────────────────────────────────────────────────────────────────
  "code-review-culture-reduced-bugs-40-percent": [
    {
      type: "p",
      text: "When I took over as Tech Lead at Pranshtech Solutions, code review was theater. PRs went up, a teammate would click through the diff, comment 'LGTM', and merge. We were shipping 30–40 PRs a week. We were also debugging production incidents every few days.",
    },
    {
      type: "p",
      text: "Three months after I rebuilt the review process, production incidents dropped by roughly 40%. Not because the developers got better  they were already good. Because the process gave them the right information at the right moment, and made the friction go in the right direction.",
    },
    {
      type: "h2",
      text: "The Before State",
    },
    {
      type: "p",
      text: "Diagnosing the problem first. The PRs we had looked like this:",
    },
    {
      type: "ul",
      items: [
        "Average diff size: **520 lines** changed per PR",
        "Average review time: **4 minutes** (I checked the GitHub timestamps)",
        "Review comments per PR: **0.8**  most PRs had zero comments",
        "Common review comment: `'LGTM'` or `'Looks good, merge'`",
        "Merge-to-incident correlation: **impossible to trace** because no one linked commits to incidents",
      ],
    },
    {
      type: "p",
      text: "The underlying issue wasn't laziness. Large diffs are genuinely impossible to review properly. You can't hold 500 lines of context in your head and spot the off-by-one in the pagination logic and the missing null check in the auth middleware at the same time. People defaulted to LGTM because there was no other rational option.",
    },
    {
      type: "h2",
      text: "Step 1: The PR Template",
    },
    {
      type: "p",
      text: "I added `.github/pull_request_template.md`. Every new PR now auto-populates with this structure:",
    },
    {
      type: "code",
      lang: "markdown",
      filename: ".github/pull_request_template.md",
      code: `## What changed
<!-- One paragraph. What does this PR do? Not HOW, but WHAT. -->

## Why
<!-- What problem does this solve? Link the Jira ticket or issue. -->
Closes #

## How to test
<!-- Step-by-step. Don't assume the reviewer knows the feature. -->
1.
2.
3.

## Screenshots (for UI changes)
<!-- Before and after. Drag images here. -->

## Checklist
- [ ] No \`console.log\` left in
- [ ] Error cases handled (what happens if the API is down? if input is invalid?)
- [ ] Tests added or updated
- [ ] No new dependencies without discussion
- [ ] Database migrations are reversible`,
    },
    {
      type: "p",
      text: "The template does two things. It forces the author to think through the change before requesting review. And it gives the reviewer a map  they know what they're supposed to be verifying before they read a single line of code.",
    },
    {
      type: "callout",
      variant: "tip",
      text: "The 'How to test' section alone cut our review time significantly  reviewers stopped asking clarifying questions in Slack and started just running the code. The template moved that context from chat history into the PR itself.",
    },
    {
      type: "h2",
      text: "Step 2: The Review Checklist",
    },
    {
      type: "p",
      text: "I wrote a review checklist and shared it in our engineering Notion. Not mandatory for every review, but a reference to check against when something feels off:",
    },
    {
      type: "ul",
      items: [
        "**Security**: Is user input sanitized before going into a query? Are API endpoints authenticated? Are secrets in env vars, not in code?",
        "**Edge cases**: What happens with empty arrays, null values, network timeouts, concurrent requests?",
        "**Performance**: Any N+1 queries? Any operations in a loop that should be batched? Any missing database indexes?",
        "**Error handling**: Are errors caught and logged? Does the user get a meaningful message or a raw stack trace?",
        "**Readability**: Would a developer unfamiliar with this code understand it in 5 minutes? Are variable names descriptive?",
        "**Tests**: Do the tests actually test the behavior, or just the happy path?",
      ],
    },
    {
      type: "p",
      text: "I didn't ask reviewers to explicitly check every box on every PR. The list exists to jog memory and to create a shared vocabulary. When I leave a comment about an N+1 query, everyone on the team knows what that means and why it matters.",
    },
    {
      type: "h2",
      text: "Step 3: The Size Limit",
    },
    {
      type: "p",
      text: "This was the most controversial change: no PR over 200 lines of changed code without a written justification in the PR description.",
    },
    {
      type: "p",
      text: "The resistance was immediate. 'Migrations are 600 lines, I can't split that.' 'This refactor touches 40 files, there's no way to split it.' Fair  so the rule isn't a hard block, it's a conversation trigger. A PR over 200 lines needs a comment explaining why it can't be smaller. That comment forces the author to think about whether they've actually tried to split it.",
    },
    {
      type: "p",
      text: "In practice, about 70% of large PRs could be split. The other 30% were legitimately large (schema migrations, dependency upgrades) and got labeled `large-pr`  which meant they needed two reviewers instead of one, and got blocked for a dedicated review session rather than the async queue.",
    },
    {
      type: "code",
      lang: "yaml",
      filename: ".github/workflows/pr-size-check.yml",
      code: `name: PR Size Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - name: Check PR size
        uses: actions/github-script@v7
        with:
          script: |
            const { data: pr } = await github.rest.pulls.get({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
            });

            const additions = pr.additions;
            const deletions = pr.deletions;
            const total = additions + deletions;

            if (total > 200) {
              // Add a label  doesn't block, just flags
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                labels: ["large-pr"],
              });

              core.warning(\`This PR changes \${total} lines. Consider splitting into smaller PRs. If this size is necessary, add a justification to the PR description.\`);
            }`,
    },
    {
      type: "h2",
      text: "Step 4: Reviews as Mentoring",
    },
    {
      type: "p",
      text: "This is the change that had the biggest long-term effect, and it's the hardest to automate. I changed how I wrote review comments.",
    },
    {
      type: "p",
      text: "Before: `'Change this to use Promise.allSettled instead.'`",
    },
    {
      type: "p",
      text: "After: `'This uses Promise.all, which will reject the entire batch if any single request fails. In a user-facing API, that means one bad user ID causes everyone else's data to disappear. Promise.allSettled processes all items and lets you handle successes and failures individually  see MDN for examples. Worth switching here.'`",
    },
    {
      type: "p",
      text: "The longer comment takes 2 more minutes to write. But the developer now understands _why_  and they won't reach for Promise.all in this situation again. Over 6 months, each developer on the team absorbs dozens of these explanations. That compounds.",
    },
    {
      type: "callout",
      variant: "note",
      text: "Distinguish blocking from non-blocking comments. I prefix non-blocking suggestions with `nit:` or `optional:`. This lets the author merge without addressing minor style preferences, while still seeing the feedback. Conflating 'must fix' and 'would be nice' is how review threads become adversarial.",
    },
    {
      type: "h2",
      text: "Step 5: Measuring It",
    },
    {
      type: "p",
      text: "The 40% reduction is a real number, but measuring it required agreeing on a definition first.",
    },
    {
      type: "p",
      text: "A 'production bug' in our tracking: any issue that required a hotfix deploy, caused user-visible errors (captured in Sentry), or triggered a customer support ticket referencing broken behavior. We excluded performance degradation, missing features, and UX improvements  those aren't bugs in the relevant sense.",
    },
    {
      type: "ul",
      items: [
        "**Month before process change**: 23 production bugs across 8 deployments",
        "**Month 1 after**: 19 bugs  smaller drop, team was still learning the new process",
        "**Month 2 after**: 16 bugs  trend confirmed",
        "**Month 3 after**: 14 bugs  roughly 39% reduction vs baseline",
      ],
    },
    {
      type: "p",
      text: "Causation is hard to prove. We also onboarded a new monitoring tool around the same time, and caught some latent bugs that way. But the timing correlation is strong, and qualitatively the team started catching the same categories of issues (missing null checks, unhandled promise rejections, N+1 queries) in review rather than in production.",
    },
    {
      type: "h2",
      text: "Handling the Resistance",
    },
    {
      type: "p",
      text: "The argument you'll hear: 'Code review slows us down.' The correct response is data, not philosophy.",
    },
    {
      type: "p",
      text: "A production incident at Pranshtech typically costs 2–4 hours: the alert, the diagnosis, the hotfix, the deploy, the post-mortem. A thorough code review takes 30–45 minutes. One prevented incident pays for 4–8 review sessions. The math isn't close.",
    },
    {
      type: "p",
      text: "The real slowdown isn't reviews  it's large PRs and unclear PR descriptions, which make reviews take longer and require async Q&A. Both of those are fixed by the process changes above, not by doing fewer reviews.",
    },
    {
      type: "h2",
      text: "What NOT To Do",
    },
    {
      type: "ul",
      items: [
        "**Don't fight style wars in reviews**  that's what ESLint and Prettier are for. Configure them once, enforce them in CI, never comment on indentation or quote style again.",
        "**Don't block on non-blocking issues**  if a comment is optional, say so explicitly. Using `nit:` or `optional:` syntax reduces friction significantly.",
        "**Don't review code you don't understand**  if a PR is in a domain you're unfamiliar with, ask the author for a 10-minute walkthrough before reviewing async. A confused LGTM is worse than no review.",
        "**Don't use reviews to score points**  the goal is to ship good software, not to demonstrate your knowledge. A comment that says 'change X to Y' with no explanation serves your ego, not the team.",
        "**Don't make reviews feel adversarial**  start comments with 'I think' or 'one option might be' for suggestions. Reserve direct imperatives for actual bugs or security issues.",
      ],
    },
    {
      type: "quote",
      text: "The best code review comment is one that the author reads, thinks 'oh, I didn't consider that,' and then never needs to see again because it became part of how they think about code.",
      attribution: "Something I tell my team",
    },
  ],

  // ─────────────────────────────────────────────────────────────────────────────
  // POST 8  GSAP ScrollTrigger + Lenis in Next.js
  // ─────────────────────────────────────────────────────────────────────────────
  "gsap-scrolltrigger-lenis-nextjs-scroll-animations": [
    {
      type: "p",
      text: "Scroll animations done badly are a performance nightmare and an accessibility problem. Done well, they feel inevitable  like the page is telling a story at exactly the pace you're reading it. This is the implementation I use for this portfolio: Lenis for smooth scroll, GSAP ScrollTrigger for all the animation logic.",
    },
    {
      type: "p",
      text: "I'll walk through the setup, four real animation patterns, and the mobile/performance rules that keep it from breaking on slower devices. All code is Next.js App Router with TypeScript.",
    },
    {
      type: "h2",
      text: "Why Lenis + GSAP ScrollTrigger",
    },
    {
      type: "p",
      text: "The native browser scroll event is inconsistent across devices and browsers. On desktop Chrome it fires smoothly; on iOS Safari it fires in bursts; on trackpads it behaves differently depending on the OS. Lenis normalizes this: it intercepts the scroll, applies a lerp (linear interpolation) easing, and emits a single consistent scroll event that GSAP can reliably listen to.",
    },
    {
      type: "p",
      text: "GSAP ScrollTrigger is the industry standard for scroll-driven animations. It handles pinning, scrubbing (tying animation progress to scroll position), enter/leave callbacks, and complex timeline orchestration. It's the right tool for this problem  nothing else comes close for the kind of precision you need for a storytelling layout.",
    },
    {
      type: "callout",
      variant: "note",
      text: "GSAP is free for portfolios, personal sites, and open source projects. ScrollTrigger is included in the core `gsap` package as of GSAP 3. You don't need a club membership for either. Only SplitText (premium) needs a license  this guide uses Splitting.js (MIT) instead.",
    },
    {
      type: "h2",
      text: "Package Setup",
    },
    {
      type: "code",
      lang: "bash",
      code: `npm install gsap lenis splitting
npm install --save-dev @types/splitting`,
    },
    {
      type: "h2",
      text: "Step 1: Register GSAP Plugins  Once, at the App Level",
    },
    {
      type: "p",
      text: "Never register plugins inside components. If a component mounts more than once, you get duplicate registrations and mysterious animation bugs. Register everything in a single config file:",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/lib/gsap-config.ts",
      code: `import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once  this is safe to call multiple times (GSAP deduplicates)
gsap.registerPlugin(ScrollTrigger);

// Global defaults  overridable per animation
gsap.defaults({
  ease: "power2.out",
  duration: 0.8,
});

// ScrollTrigger global defaults
ScrollTrigger.defaults({
  markers: process.env.NODE_ENV === "development", // show debug markers in dev only
});

export { gsap, ScrollTrigger };`,
    },
    {
      type: "p",
      text: "Import from `@/lib/gsap-config` everywhere, not directly from `gsap`. This ensures plugins are always registered.",
    },
    {
      type: "h2",
      text: "Step 2: The Lenis Provider",
    },
    {
      type: "p",
      text: "Lenis needs to run in a React context that persists across the app. The right place is the root layout. We also need to connect Lenis to GSAP's ticker so ScrollTrigger reads the Lenis scroll position, not the native one.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/components/LenisProvider.tsx",
      code: `"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "@/lib/gsap-config";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,         // lerp duration in seconds
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // exponential ease-out
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Connect Lenis to ScrollTrigger  critical step
    // Without this, ScrollTrigger reads native scroll position, not Lenis's smoothed one
    lenis.on("scroll", ScrollTrigger.update);

    // Run Lenis inside GSAP's ticker for frame-perfect sync
    const tickerCallback = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0); // disable GSAP's lag smoothing  Lenis handles this

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerCallback);
    };
  }, []);

  return <>{children}</>;
}`,
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/app/layout.tsx",
      code: `import { LenisProvider } from "@/components/LenisProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}`,
    },
    {
      type: "h2",
      text: "Step 3: The useGsap Hook  React Cleanup",
    },
    {
      type: "p",
      text: "GSAP animations created in React components must be cleaned up on unmount. If you don't kill ScrollTriggers, they pile up as components remount (especially in Strict Mode's double-invoke), causing animation glitches and memory leaks.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/hooks/useGsap.ts",
      code: `import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";

type GsapContextCallback = (context: gsap.Context) => void;

export function useGsap(
  callback: GsapContextCallback,
  deps: React.DependencyList = []
) {
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // gsap.context() scopes all animations created inside the callback
    // context.revert() undoes all of them on cleanup
    contextRef.current = gsap.context(() => {
      callback(contextRef.current!);
    });

    return () => {
      contextRef.current?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}`,
    },
    {
      type: "h2",
      text: "Animation 1: Character-by-Character Text Reveal",
    },
    {
      type: "p",
      text: "Splitting.js wraps each character in a `<span>` and sets a `--char-index` CSS custom property. GSAP then staggers the reveal by character index.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/components/effects/TextReveal.tsx",
      code: `"use client";

import { useRef, useEffect } from "react";
import Splitting from "splitting";
import { gsap } from "@/lib/gsap-config";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface TextRevealProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  delay?: number;
  stagger?: number;
  triggerOnScroll?: boolean;
}

export function TextReveal({
  children,
  as: Tag = "p",
  className,
  delay = 0,
  stagger = 0.03,
  triggerOnScroll = true,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1 });
      return;
    }

    // Split text into character spans
    const results = Splitting({ target: el, by: "chars" });
    const chars = results[0]?.chars ?? [];

    // Start invisible
    gsap.set(chars, { opacity: 0, y: 12 });

    const animationProps = {
      opacity: 1,
      y: 0,
      stagger,
      delay,
      ease: "power2.out",
      duration: 0.5,
    };

    let trigger: ScrollTrigger | undefined;

    if (triggerOnScroll) {
      gsap.to(chars, {
        ...animationProps,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    } else {
      gsap.to(chars, animationProps);
    }

    return () => {
      trigger?.kill();
      // Restore original HTML (Splitting adds spans  clean up on unmount)
      if (el) el.innerHTML = children;
    };
  }, [children, delay, stagger, triggerOnScroll]);

  return (
    // @ts-expect-error  dynamic tag
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  );
}`,
    },
    {
      type: "callout",
      variant: "tip",
      text: "The `--char-index` CSS variable Splitting.js sets on each span lets you do pure-CSS staggered animations too: `animation-delay: calc(var(--char-index) * 30ms)`. Useful when you want the effect without GSAP loaded.",
    },
    {
      type: "h2",
      text: "Animation 2: Reusable Fade-In on Scroll",
    },
    {
      type: "p",
      text: "The most common animation in any scroll-driven layout. Wrap any element in this component and it fades in when it enters the viewport.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/components/effects/FadeInOnScroll.tsx",
      code: `"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap-config";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface FadeInOnScrollProps {
  children: React.ReactNode;
  className?: string;
  y?: number;         // initial y offset in pixels (default: 24)
  duration?: number;  // seconds
  delay?: number;     // seconds
  once?: boolean;     // if true, don't re-animate on scroll up/down
}

export function FadeInOnScroll({
  children,
  className,
  y = 24,
  duration = 0.7,
  delay = 0,
  once = true,
}: FadeInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    gsap.set(el, { opacity: 0, y });

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      onEnter: () => {
        gsap.to(el, { opacity: 1, y: 0, duration, delay, ease: "power2.out" });
      },
      onLeaveBack: () => {
        if (!once) gsap.set(el, { opacity: 0, y });
      },
    });

    return () => {
      st.kill();
      gsap.set(el, { clearProps: "all" });
    };
  }, [y, duration, delay, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}`,
    },
    {
      type: "h2",
      text: "Animation 3: Horizontal Scroll Section",
    },
    {
      type: "p",
      text: "Pin the container, then use scrub to tie the horizontal translation to the user's scroll position. The key is calculating the total scroll distance correctly  it's `container.scrollWidth - viewport.width`.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/components/HorizontalScrollSection.tsx",
      code: `"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap-config";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HorizontalScrollSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScrollSection({
  children,
  className,
}: HorizontalScrollSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container) return;

    // Disable horizontal scroll on mobile  unreliable on touch
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // Calculate how far to scroll horizontally
    const getScrollAmount = () => -(container.scrollWidth - window.innerWidth);

    const st = gsap.to(container, {
      x: getScrollAmount,    // function-based value  recalculated on resize
      ease: "none",          // linear  scrub handles the easing
      scrollTrigger: {
        trigger: wrapper,
        start: "top top",
        end: () => \`+=\${container.scrollWidth - window.innerWidth}\`,
        pin: true,           // pin the wrapper while scrolling horizontally
        scrub: 1,            // 1 second smoothing between scroll position and animation
        anticipatePin: 1,    // reduces pin jump on fast scroll
        invalidateOnRefresh: true, // recalculate on window resize
      },
    });

    return () => {
      st.scrollTrigger?.kill();
      gsap.set(container, { clearProps: "x" });
    };
  }, []);

  return (
    // wrapper is the pinned element  it takes up scroll space
    <div ref={wrapperRef} className="overflow-hidden">
      {/* container is what actually moves */}
      <div
        ref={containerRef}
        className={\`flex will-change-transform \${className ?? ""}\`}
        style={{ width: "max-content" }}
      >
        {children}
      </div>
    </div>
  );
}`,
    },
    {
      type: "callout",
      variant: "warning",
      text: "Never use `pin: true` on mobile. Pinning requires knowing the container height at the time of pin  on mobile with dynamic viewport heights (iOS URL bar), this breaks. Use a vertical fallback layout below 768px and call `ScrollTrigger.refresh()` after any dynamic content loads.",
    },
    {
      type: "h2",
      text: "Animation 4: Parallax Layers",
    },
    {
      type: "p",
      text: "Parallax creates depth by moving elements at different speeds relative to scroll. The safest implementation uses `yPercent`  it avoids layout thrashing and only animates `transform`, which the browser can handle on the compositor thread.",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/components/effects/ParallaxLayer.tsx",
      code: `"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap-config";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;    // 0 = no parallax, 1 = full scroll speed, -1 = opposite direction
  className?: string;
}

export function ParallaxLayer({
  children,
  speed = 0.3,
  className,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    // Reduce parallax on smaller screens  less visual impact, better performance
    const isMobile = window.innerWidth < 768;
    const effectiveSpeed = isMobile ? speed * 0.3 : speed;

    const st = gsap.to(el, {
      yPercent: -(effectiveSpeed * 100),  // negative = moves up as you scroll down
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,  // boolean scrub = 0 smoothing (perfectly in sync)
      },
    });

    return () => {
      st.scrollTrigger?.kill();
      gsap.set(el, { clearProps: "transform" });
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={\`will-change-transform \${className ?? ""}\`}
    >
      {children}
    </div>
  );
}`,
    },
    {
      type: "h2",
      text: "Staggered Group Reveals",
    },
    {
      type: "p",
      text: "For grids of cards, stats, or any group of elements that should animate together with stagger:",
    },
    {
      type: "code",
      lang: "typescript",
      filename: "src/components/effects/StaggerReveal.tsx",
      code: `"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap-config";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;   // seconds between each child's animation start
  childSelector?: string; // default: direct children
}

export function StaggerReveal({
  children,
  className,
  stagger = 0.1,
  childSelector = ":scope > *",
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const items = gsap.utils.toArray<Element>(el.querySelectorAll(childSelector));
    gsap.set(items, { opacity: 0, y: 20 });

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      onEnter: () => {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: {
            amount: stagger * items.length,
            from: "start",
          },
          ease: "power2.out",
        });
      },
    });

    return () => {
      st.kill();
      gsap.set(items, { clearProps: "all" });
    };
  }, [stagger, childSelector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}`,
    },
    {
      type: "h2",
      text: "ScrollTrigger.refresh()  When to Call It",
    },
    {
      type: "p",
      text: "ScrollTrigger calculates positions at registration time. If content shifts after that (lazy-loaded images, fonts finishing load, dynamic data), the trigger positions are wrong. Call `ScrollTrigger.refresh()` after any of these:",
    },
    {
      type: "code",
      lang: "typescript",
      code: `import { ScrollTrigger } from "gsap/ScrollTrigger";

// After images load
window.addEventListener("load", () => ScrollTrigger.refresh());

// After fonts load
document.fonts.ready.then(() => ScrollTrigger.refresh());

// After a route change in Next.js
// (ScrollTrigger.refresh() in a useEffect with [] dependencies
//  on each page component handles this)
useEffect(() => {
  ScrollTrigger.refresh();
}, []);`,
    },
    {
      type: "h2",
      text: "Performance Rules  The Non-Negotiables",
    },
    {
      type: "ul",
      items: [
        "**Only animate `transform` and `opacity`**  these run on the compositor thread. Animating `top`, `left`, `width`, `height`, `margin`, or `padding` triggers layout recalculation every frame and will drop to sub-30fps on mid-range phones.",
        "**`will-change: transform, opacity`** on elements that animate  tells the browser to promote them to their own layer. Add via CSS class, remove after animation with `gsap.set(el, { clearProps: 'will-change' })`.",
        "**Kill all ScrollTriggers on unmount**  `ScrollTrigger.getAll().forEach(st => st.kill())` at component cleanup, or use `gsap.context()` which does this for you.",
        "**Never read DOM measurements inside GSAP callbacks**  `getBoundingClientRect()` in a ScrollTrigger `onUpdate` handler runs every frame and causes continuous layout thrashing. Calculate once in `useEffect`, store in a ref.",
        "**`scrub: true` vs `scrub: 1`**  `true` (or `0`) means perfectly in sync with scroll; `scrub: 1` means 1 second lag for smoothing. Use `true` for parallax (should feel responsive), `1` for storytelling sequences (needs smoothing).",
        "**Batch similar elements**  `gsap.utils.toArray('.fade-item').forEach(...)` in one `useEffect`, not individual `useEffect` per element. Reduces ScrollTrigger instance count.",
      ],
    },
    {
      type: "h2",
      text: "prefers-reduced-motion  Required, Not Optional",
    },
    {
      type: "p",
      text: "Vestibular disorders affect around 35% of adults over 40. Scroll-driven motion can cause nausea and dizziness. Always implement a reduced-motion fallback.",
    },
    {
      type: "code",
      lang: "typescript",
      code: `// In any animation hook or component:
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  // Make everything visible immediately  skip all animations
  gsap.set(elements, { opacity: 1, y: 0, x: 0, clearProps: "will-change" });
  return; // bail out before setting up ScrollTriggers
}`,
    },
    {
      type: "p",
      text: "You can also handle this globally in CSS and let GSAP respect it:",
    },
    {
      type: "code",
      lang: "css",
      code: `@media (prefers-reduced-motion: reduce) {
  /* Override any inline styles GSAP might have set */
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`,
    },
    {
      type: "h2",
      text: "The Complete Setup in Order",
    },
    {
      type: "ol",
      items: [
        "Install `gsap`, `lenis`, `splitting`",
        "Create `src/lib/gsap-config.ts`  register ScrollTrigger, set defaults",
        "Create `src/components/LenisProvider.tsx`  init Lenis, connect to GSAP ticker",
        "Wrap root layout with `<LenisProvider>`",
        "Create `src/hooks/useGsap.ts`  GSAP context + cleanup",
        "Build animation components (`TextReveal`, `FadeInOnScroll`, `ParallaxLayer`, `StaggerReveal`)",
        "Add `ScrollTrigger.refresh()` calls after dynamic content loads",
        "Test with Chrome DevTools → Rendering → Emulate CSS media feature → `prefers-reduced-motion: reduce`",
        "Test horizontal scroll section on mobile  verify it falls back to vertical stack",
        "Run Lighthouse  Performance score should stay above 90 with animations active",
      ],
    },
    {
      type: "callout",
      variant: "tip",
      text: "Enable GSAP's development markers during setup: `ScrollTrigger.defaults({ markers: process.env.NODE_ENV === 'development' })`. The red/green markers show exactly where your triggers start and end, and save hours of debugging invisible trigger positions.",
    },
  ],
};

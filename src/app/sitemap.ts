import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/data/blog-posts";

export const dynamic = "force-static";

const siteUrl = "https://rahhuul.github.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = BLOG_POSTS.filter((p) => !p.externalUrl).map((p) => ({
    url: `${siteUrl}/blog/${p.slug}/`,
    lastModified: p.date,
    changeFrequency: "monthly" as const,
    priority: p.featured ? 0.85 : 0.75,
  }));

  return [
    {
      url: `${siteUrl}/`,
      lastModified: "2026-04-17",
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/blog/`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...blogPosts,
    {
      url: `${siteUrl}/case-study/apilens/`,
      lastModified: "2026-04-17",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/case-study/cms-mcp-hub/`,
      lastModified: "2026-04-17",
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

import { BLOG_POSTS } from "@/data/blog-posts";

export function BlogSchema() {
  const siteUrl = "https://rahhuul.github.io";

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${siteUrl}/blog/#blog`,
    name: "The Notebook - Rahul Patel",
    description:
      "Technical deep dives, building in public, and lessons from 12 years of shipping code.",
    url: `${siteUrl}/blog/`,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Rahul Patel",
      url: siteUrl,
    },
    isPartOf: { "@id": `${siteUrl}/#website` },
    blogPost: BLOG_POSTS.filter((p) => !p.externalUrl).map((p) => ({
      "@type": "BlogPosting",
      "@id": `${siteUrl}/blog/${p.slug}/#blogposting`,
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      dateModified: p.date,
      url: `${siteUrl}/blog/${p.slug}/`,
      author: { "@id": `${siteUrl}/#person` },
      keywords: p.tags.join(", "),
      image: `${siteUrl}/images/og-image.png`,
      inLanguage: "en-US",
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "The Notebook", item: `${siteUrl}/blog/` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

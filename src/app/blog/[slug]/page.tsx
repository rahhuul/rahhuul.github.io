import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import {
  BLOG_POSTS,
  getPostBySlug,
  getRelatedPosts,
  PILLAR_LABELS,
  type BlogPillar,
} from "@/data/blog-posts";
import { getPostContent, type ContentBlock } from "@/data/blog-content-index";

// ── Static params ──────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

// ── Dynamic metadata ───────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };

  const siteUrl = "https://rahhuul.github.io";
  const url = `${siteUrl}/blog/${post.slug}/`;
  const content = getPostContent(slug);
  const isStub = !content && !post.externalUrl;

  return {
    title: `${post.title} | Rahul Patel`,
    description: post.description,
    robots: isStub ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      authors: ["Rahul Patel"],
      tags: post.tags,
      section: PILLAR_LABELS[post.pillar],
      images: [{ url: `${siteUrl}/images/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: "@rahhuul310",
      images: [`${siteUrl}/images/og-image.png`],
    },
    alternates: { canonical: url },
  };
}

// ── Pillar accent colors ───────────────────────────────────────────────────────
const PILLAR_COLORS: Record<BlogPillar, string> = {
  building: "#8B6914",
  technical: "#2c3e6b",
  career: "#2d5016",
  tutorial: "#c23616",
  opinion: "#6b4c8a",
};

const CALLOUT_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  note:    { bg: "rgba(44,62,107,0.08)",  border: "#2c3e6b", label: "Note" },
  tip:     { bg: "rgba(45,80,22,0.08)",   border: "#2d5016", label: "Tip" },
  warning: { bg: "rgba(194,54,22,0.08)",  border: "#c23616", label: "Warning" },
};

// ── Format date ────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── Inline markdown renderer ───────────────────────────────────────────────────
// Parses **bold**, `code`, _italic_ into React nodes
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Combined regex: captures **bold**, `code`, _italic_
  const re = /(\*\*(.+?)\*\*|`([^`]+)`|_(.+?)_)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    if (match[2] !== undefined) {
      // **bold**
      parts.push(<strong key={match.index} style={{ fontWeight: 700, color: "var(--color-fg)" }}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      // `code`
      parts.push(
        <code key={match.index} style={{
          fontFamily: "var(--font-jetbrains)",
          fontSize: "0.88em",
          background: "var(--color-bg-alt)",
          border: "1px solid var(--color-border)",
          borderRadius: "3px",
          padding: "1px 5px",
          color: "var(--color-fg)",
        }}>{match[3]}</code>
      );
    } else if (match[4] !== undefined) {
      // _italic_
      parts.push(<em key={match.index}>{match[4]}</em>);
    }

    last = re.lastIndex;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ── Block renderer ─────────────────────────────────────────────────────────────
function RenderBlock({ block, i }: { block: ContentBlock; i: number }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} style={{
          fontFamily: "var(--font-playfair)",
          fontSize: "clamp(1.4rem,2.2vw,1.75rem)",
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          color: "var(--color-fg)",
          margin: "2.5rem 0 0.75rem",
        }}>
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3 key={i} style={{
          fontFamily: "var(--font-playfair)",
          fontSize: "clamp(1.1rem,1.6vw,1.3rem)",
          fontWeight: 700,
          lineHeight: 1.25,
          color: "var(--color-fg)",
          margin: "2rem 0 0.5rem",
        }}>
          {block.text}
        </h3>
      );

    case "p":
      return (
        <p key={i} style={{
          fontFamily: "var(--font-source-serif)",
          fontSize: "clamp(0.95rem,1.2vw,1.05rem)",
          lineHeight: 1.85,
          color: "var(--color-fg-muted)",
          margin: "0 0 1.25rem",
        }}>
          {parseInline(block.text)}
        </p>
      );

    case "code":
      return (
        <div key={i} style={{
          margin: "1.5rem 0",
          borderRadius: "6px",
          overflow: "hidden",
          border: "1px solid var(--color-border-strong)",
        }}>
          {/* toolbar */}
          <div style={{
            background: "var(--color-bg-alt)",
            borderBottom: "1px solid var(--color-border)",
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f", display: "inline-block" }} />
            {block.filename && (
              <span style={{
                marginLeft: "8px",
                fontFamily: "var(--font-jetbrains)",
                fontSize: "0.72rem",
                color: "var(--color-fg-subtle)",
                letterSpacing: "0.02em",
              }}>
                {block.filename}
              </span>
            )}
            {!block.filename && block.lang && (
              <span style={{
                marginLeft: "8px",
                fontFamily: "var(--font-jetbrains)",
                fontSize: "0.72rem",
                color: "var(--color-fg-subtle)",
                letterSpacing: "0.02em",
              }}>
                {block.lang}
              </span>
            )}
          </div>
          <pre style={{
            margin: 0,
            padding: "1.25rem 1.5rem",
            background: "#1a1a2e",
            overflowX: "auto",
          }}>
            <code style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "0.82rem",
              lineHeight: 1.7,
              color: "#e2e8f0",
              display: "block",
              whiteSpace: "pre",
            }}>
              {block.code}
            </code>
          </pre>
        </div>
      );

    case "ul":
      return (
        <ul key={i} style={{
          margin: "0 0 1.25rem",
          paddingLeft: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          listStyle: "none",
        }}>
          {block.items.map((item, j) => (
            <li key={j} style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "clamp(0.95rem,1.2vw,1.05rem)",
              lineHeight: 1.75,
              color: "var(--color-fg-muted)",
              paddingLeft: "1.25rem",
              position: "relative",
            }}>
              <span style={{
                position: "absolute",
                left: 0,
                top: "0.6em",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "var(--color-accent)",
                flexShrink: 0,
              }} />
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol key={i} style={{
          margin: "0 0 1.25rem",
          paddingLeft: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          counterReset: "ol-counter",
          listStyle: "none",
        }}>
          {block.items.map((item, j) => (
            <li key={j} style={{
              fontFamily: "var(--font-source-serif)",
              fontSize: "clamp(0.95rem,1.2vw,1.05rem)",
              lineHeight: 1.75,
              color: "var(--color-fg-muted)",
              paddingLeft: "1.5rem",
              position: "relative",
            }}>
              <span style={{
                position: "absolute",
                left: 0,
                fontFamily: "var(--font-jetbrains)",
                fontSize: "0.75rem",
                color: "var(--color-accent)",
                top: "0.2em",
                fontWeight: 700,
              }}>
                {j + 1}.
              </span>
              {parseInline(item)}
            </li>
          ))}
        </ol>
      );

    case "callout": {
      const variant = block.variant ?? "note";
      const colors = CALLOUT_COLORS[variant] ?? CALLOUT_COLORS.note;
      return (
        <div key={i} style={{
          margin: "1.5rem 0",
          padding: "1rem 1.25rem",
          background: colors.bg,
          borderLeft: `3px solid ${colors.border}`,
          borderRadius: "0 4px 4px 0",
        }}>
          <span style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: colors.border,
            display: "block",
            marginBottom: "0.4rem",
          }}>
            {colors.label}
          </span>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "0.95rem",
            lineHeight: 1.75,
            color: "var(--color-fg-muted)",
            margin: 0,
          }}>
            {parseInline(block.text)}
          </p>
        </div>
      );
    }

    case "quote":
      return (
        <blockquote key={i} style={{
          margin: "2rem 0",
          padding: "1.25rem 1.5rem",
          borderLeft: "3px solid var(--color-accent)",
          background: "var(--color-bg-alt)",
          borderRadius: "0 4px 4px 0",
        }}>
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "clamp(1rem,1.4vw,1.1rem)",
            lineHeight: 1.75,
            color: "var(--color-fg)",
            fontStyle: "italic",
            margin: 0,
          }}>
            &ldquo;{block.text}&rdquo;
          </p>
          {block.attribution && (
            <cite style={{
              display: "block",
              marginTop: "0.6rem",
              fontFamily: "var(--font-caveat)",
              fontSize: "0.9rem",
              color: "var(--color-fg-subtle)",
              fontStyle: "normal",
            }}>
               {block.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "divider":
      return (
        <div key={i} style={{
          margin: "2.5rem 0",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
          <span style={{
            fontFamily: "var(--font-caveat)",
            fontSize: "1rem",
            color: "var(--color-fg-subtle)",
            opacity: 0.5,
          }}>
            ✦
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
        </div>
      );

    default:
      return null;
  }
}

// ── JSON-LD ────────────────────────────────────────────────────────────────────
function BlogPostSchema({ post }: { post: ReturnType<typeof getPostBySlug> }) {
  if (!post) return null;
  const siteUrl = "https://rahhuul.github.io";
  const postUrl = `${siteUrl}/blog/${post.slug}/`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#blogposting`,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: postUrl,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Rahul Patel",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Rahul Patel",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/profile.jpg`,
        width: 400,
        height: 400,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    isPartOf: { "@id": `${siteUrl}/blog/#blog` },
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/images/og-image.png`,
      width: 1200,
      height: 630,
    },
    keywords: post.tags.join(", "),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "The Notebook", item: `${siteUrl}/blog/` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3);
  const accentColor = PILLAR_COLORS[post.pillar];
  const content = getPostContent(slug);

  return (
    <>
      <BlogPostSchema post={post} />

      {/* ── Sticky top nav ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          padding: "0 clamp(1.5rem,5vw,4rem)",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/blog"
          className="blog-back-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-caveat)",
            fontSize: "1rem",
            color: "var(--color-annotation-red)",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          The Notebook
        </Link>
        <span style={{ fontFamily: "var(--font-caveat)", fontSize: "0.85rem", color: "var(--color-fg-subtle)" }}>
          {post.readTime}
        </span>
      </nav>

      <main style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

        {/* ── Hero ── */}
        <header
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "clamp(4rem,8vh,6rem) clamp(1.5rem,5vw,3rem) clamp(2rem,4vh,3rem)",
          }}
        >
          {/* Pillar badge */}
          <div style={{ marginBottom: "1.5rem" }}>
            <span style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: accentColor,
              padding: "3px 10px",
              border: `1px solid ${accentColor}`,
              borderRadius: "3px",
            }}>
              {PILLAR_LABELS[post.pillar]}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(2rem,4.5vw,3.2rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--color-fg)",
            margin: "0 0 1.5rem 0",
          }}>
            {post.title}
          </h1>

          {/* Meta row */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "1.25rem",
            marginBottom: "1.5rem",
          }}>
            <span style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "1rem",
              color: "var(--color-fg-subtle)",
            }}>
              {formatDate(post.date)}
            </span>
            <span style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "0.72rem",
              color: "var(--color-fg-subtle)",
              letterSpacing: "0.04em",
            }}>
              {post.readTime}
            </span>
            <span style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.72rem",
              color: "var(--color-fg-subtle)",
            }}>
              by Rahul Patel
            </span>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: "var(--font-source-serif)",
            fontSize: "clamp(1rem,1.4vw,1.15rem)",
            color: "var(--color-fg-muted)",
            lineHeight: 1.8,
            fontStyle: "italic",
            margin: "0 0 1.5rem 0",
            borderLeft: `3px solid ${accentColor}`,
            paddingLeft: "1.25rem",
          }}>
            {post.description}
          </p>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "0.68rem",
                  padding: "3px 10px",
                  borderRadius: "3px",
                  background: "var(--color-bg-alt)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-fg-subtle)",
                  letterSpacing: "0.02em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Social share */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--color-border)",
          }}>
            <span style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "0.9rem",
              color: "var(--color-fg-subtle)",
            }}>
              Share:
            </span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://rahhuul.github.io/blog/${post.slug}`)}&via=rahhuul310`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-link"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.75rem",
                color: "var(--color-fg-muted)",
                textDecoration: "none",
                padding: "4px 12px",
                border: "1px solid var(--color-border-strong)",
                borderRadius: "3px",
              }}
            >
              Twitter / X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://rahhuul.github.io/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-link"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.75rem",
                color: "var(--color-fg-muted)",
                textDecoration: "none",
                padding: "4px 12px",
                border: "1px solid var(--color-border-strong)",
                borderRadius: "3px",
              }}
            >
              LinkedIn
            </a>
          </div>
        </header>

        {/* ── Article body ── */}
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "0 clamp(1.5rem,5vw,3rem) clamp(5rem,10vh,7rem)",
          }}
        >
          {content ? (
            /* ── Full content ── */
            <article style={{ borderTop: "1px solid var(--color-border)", paddingTop: "2.5rem" }}>
              {content.map((block, i) => (
                <RenderBlock key={i} block={block} i={i} />
              ))}
            </article>
          ) : (
            /* ── Coming soon fallback ── */
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                paddingTop: "3rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke={accentColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ opacity: 0.6, marginBottom: "0.5rem" }}
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <p style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "clamp(1.5rem,3vw,2rem)",
                color: accentColor,
                transform: "rotate(-1deg)",
                margin: 0,
              }}>
                 still writing this one
              </p>
              <p style={{
                fontFamily: "var(--font-source-serif)",
                fontSize: "1rem",
                color: "var(--color-fg-muted)",
                lineHeight: 1.75,
                maxWidth: "480px",
                margin: 0,
              }}>
                This post is being drafted. The full article will be published soon.
              </p>
              <Link
                href="/blog"
                style={{
                  marginTop: "0.5rem",
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.82rem",
                  letterSpacing: "0.04em",
                  color: "var(--color-fg-muted)",
                  textDecoration: "none",
                  padding: "8px 20px",
                  border: "1.5px solid var(--color-border-strong)",
                  borderRadius: "4px",
                  display: "inline-block",
                }}
              >
                ← Browse all posts
              </Link>
            </div>
          )}

          {/* ── Related posts ── */}
          {related.length > 0 && (
            <div style={{ marginTop: "5rem" }}>
              <p style={{
                fontFamily: "var(--font-caveat)",
                fontSize: "0.9rem",
                color: "var(--color-annotation-blue)",
                transform: "rotate(-0.5deg)",
                display: "inline-block",
                marginBottom: "1rem",
              }}>
                 more from the notebook
              </p>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {related.map((rel) => {
                  const relAccent = PILLAR_COLORS[rel.pillar];
                  return (
                    <Link
                      key={rel.slug}
                      href={rel.externalUrl ?? `/blog/${rel.slug}`}
                      target={rel.externalUrl ? "_blank" : undefined}
                      rel={rel.externalUrl ? "noopener noreferrer" : undefined}
                      style={{ textDecoration: "none" }}
                    >
                      <article
                        className="related-post-card"
                        style={{
                          borderTop: "1px solid var(--color-border)",
                          padding: "1.5rem 0",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                          <span style={{
                            fontFamily: "var(--font-caveat)",
                            fontSize: "0.82rem",
                            color: "var(--color-fg-subtle)",
                          }}>
                            {formatDate(rel.date)}
                          </span>
                          <span style={{
                            fontFamily: "var(--font-inter)",
                            fontSize: "0.62rem",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: relAccent,
                            padding: "1px 6px",
                            border: `1px solid ${relAccent}`,
                            borderRadius: "3px",
                            opacity: 0.85,
                          }}>
                            {PILLAR_LABELS[rel.pillar]}
                          </span>
                        </div>
                        <h3
                          className="related-post-title"
                          style={{
                            fontFamily: "var(--font-playfair)",
                            fontSize: "clamp(1rem,1.6vw,1.2rem)",
                            fontWeight: 700,
                            lineHeight: 1.3,
                            color: "var(--color-fg)",
                            margin: "0 0 0.3rem 0",
                          }}
                        >
                          {rel.title}
                          {rel.externalUrl && (
                            <span style={{ fontSize: "0.75em", marginLeft: "6px", opacity: 0.5 }}>↗</span>
                          )}
                        </h3>
                        <p style={{
                          fontFamily: "var(--font-source-serif)",
                          fontSize: "0.88rem",
                          color: "var(--color-fg-muted)",
                          lineHeight: 1.6,
                          margin: 0,
                        }}>
                          {rel.description.length > 120 ? rel.description.slice(0, 120) + "…" : rel.description}
                        </p>
                      </article>
                    </Link>
                  );
                })}
                <div style={{ borderTop: "1px solid var(--color-border)" }} />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        .blog-back-link:hover { opacity: 0.7; }
        .share-link:hover { color: var(--color-fg) !important; border-color: var(--color-fg) !important; }
        .related-post-title { transition: color 0.2s; }
        a:hover .related-post-title { color: var(--color-accent) !important; }
      `}</style>
    </>
  );
}

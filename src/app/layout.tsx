import type { Metadata, Viewport } from "next";
import {
  Playfair_Display,
  Caveat,
  JetBrains_Mono,
  Source_Serif_4,
  Inter,
} from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { Providers } from "@/components/layout/Providers";

// ─────────────────────────────────────────────
// Google Fonts - self-hosted via next/font
// ─────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  preload: true,
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  weight: ["400"],
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400"],
  preload: false,
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "600"],
  style: ["normal", "italic"],
  preload: true,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500"],
  preload: false,
});

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    template: `%s - ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  keywords: [
    "Tech Lead",
    "Full-Stack Developer",
    "Node.js",
    "React",
    "Laravel",
    "Next.js",
    "Ahmedabad",
    "Remote Developer",
    "Rahul Patel",
  ],
  authors: [{ name: "Rahul Patel", url: SITE.url }],
  alternates: {
    canonical: SITE.url,
  },
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en_US",
    type: "profile",
    images: [
      {
        url: `${SITE.url}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Rahul Patel - Tech Lead & Full-Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    creator: SITE.twitterHandle,
    images: [`${SITE.url}/images/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

// ─────────────────────────────────────────────
// Root Layout
// ─────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[
        playfair.variable,
        caveat.variable,
        jetbrainsMono.variable,
        sourceSerif.variable,
        inter.variable,
      ].join(" ")}
      suppressHydrationWarning
    >
      <head>
        {/* Anti-flash: runs before React hydrates - must be in <head> in React 19 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": "https://rahhuul.github.io/#person",
                  name: "Rahul Patel",
                  givenName: "Rahul",
                  familyName: "Patel",
                  description:
                    "Tech Lead and Full-Stack Developer with 12+ years building scalable web applications. Creator of APILens and CMS MCP Hub. Available for remote senior engineering roles.",
                  jobTitle: "Tech Lead & Full-Stack Developer",
                  url: "https://rahhuul.github.io",
                  image: {
                    "@type": "ImageObject",
                    url: "https://rahhuul.github.io/images/profile.jpg",
                    width: 400,
                    height: 400,
                  },
                  email: "rahul.patel786@gmail.com",
                  telephone: "+91-903-304-3379",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Ahmedabad",
                    addressRegion: "Gujarat",
                    addressCountry: "IN",
                  },
                  worksFor: {
                    "@type": "Organization",
                    name: "Pranshtech Solutions",
                  },
                  subjectOf: { "@id": "https://rahhuul.github.io/blog/#blog" },
                  sameAs: [
                    "https://github.com/rahhuul",
                    "https://www.linkedin.com/in/rahhuul",
                    "https://x.com/rahhuul310",
                    "https://www.npmjs.com/~rahhuul",
                  ],
                  knowsAbout: [
                    "Node.js", "TypeScript", "React", "Next.js",
                    "Laravel", "PHP", "AWS", "Docker",
                    "PostgreSQL", "MongoDB", "Redis", "GraphQL", "Solidity",
                    "Model Context Protocol", "AI Agent Development",
                  ],
                  hasOccupation: [
                    { "@type": "Occupation", name: "Tech Lead" },
                    { "@type": "Occupation", name: "Senior Full-Stack Developer" },
                    { "@type": "Occupation", name: "Project Manager" },
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://rahhuul.github.io/#website",
                  name: "Rahul Patel - Tech Lead & Full-Stack Developer",
                  url: "https://rahhuul.github.io",
                  description:
                    "Personal portfolio of Rahul Patel. 12+ years of full-stack engineering, products, and leadership.",
                  author: { "@id": "https://rahhuul.github.io/#person" },
                  inLanguage: "en-US",
                },
                {
                  "@type": "ProfilePage",
                  "@id": "https://rahhuul.github.io/#profilepage",
                  url: "https://rahhuul.github.io",
                  name: "Rahul Patel - Portfolio",
                  isPartOf: { "@id": "https://rahhuul.github.io/#website" },
                  about: { "@id": "https://rahhuul.github.io/#person" },
                  inLanguage: "en-US",
                  dateModified: "2026-04-17",
                },
                {
                  "@type": "Blog",
                  "@id": "https://rahhuul.github.io/blog/#blog",
                  name: "The Notebook - Rahul Patel",
                  description: "Technical deep dives, building in public, and lessons from 12 years of shipping code.",
                  url: "https://rahhuul.github.io/blog/",
                  inLanguage: "en-US",
                  author: { "@id": "https://rahhuul.github.io/#person" },
                  isPartOf: { "@id": "https://rahhuul.github.io/#website" },
                },
                {
                  "@type": "ItemList",
                  "@id": "https://rahhuul.github.io/#projects",
                  name: "Projects by Rahul Patel",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      item: {
                        "@type": "SoftwareApplication",
                        name: "APILens",
                        url: "https://apilens.rest",
                        description:
                          "Real-time API monitoring and observability SaaS. Zero-dependency npm package with a full dashboard.",
                        applicationCategory: "DeveloperApplication",
                        operatingSystem: "Web",
                        author: { "@id": "https://rahhuul.github.io/#person" },
                      },
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      item: {
                        "@type": "SoftwareSourceCode",
                        name: "CMS MCP Hub",
                        codeRepository: "https://github.com/rahhuul",
                        description:
                          "589 Model Context Protocol tools across 12 CMS platforms. Open-source Turborepo monorepo.",
                        programmingLanguage: "TypeScript",
                        runtimePlatform: "Node.js",
                        author: { "@id": "https://rahhuul.github.io/#person" },
                      },
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      item: {
                        "@type": "SoftwareApplication",
                        name: "TextDrip",
                        url: "https://textdrip.com",
                        description:
                          "High-throughput SMS marketing SaaS with drip campaign automation and Redis-powered queues.",
                        applicationCategory: "BusinessApplication",
                        operatingSystem: "Web",
                        author: { "@id": "https://rahhuul.github.io/#person" },
                      },
                    },
                    {
                      "@type": "ListItem",
                      position: 4,
                      item: {
                        "@type": "SoftwareApplication",
                        name: "CodePulse AI",
                        description:
                          "AI-powered code security scanner. Paste a GitHub URL and get a structured audit for vulnerabilities and performance issues.",
                        applicationCategory: "DeveloperApplication",
                        operatingSystem: "Web",
                        author: { "@id": "https://rahhuul.github.io/#person" },
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="page-wrapper">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

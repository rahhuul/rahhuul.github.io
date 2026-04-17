import type { Metadata } from "next";
import { BlogSchema } from "./BlogSchema";

export const metadata: Metadata = {
  title: "The Notebook",
  description:
    "Technical deep dives, building in public, and lessons from 12 years of shipping code.",
  alternates: { canonical: "https://rahhuul.github.io/blog/" },
  openGraph: {
    title: "The Notebook  Rahul Patel",
    description:
      "Technical deep dives, building in public, and lessons from 12 years of shipping code.",
    url: "https://rahhuul.github.io/blog/",
    type: "website",
    images: [
      {
        url: "https://rahhuul.github.io/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Notebook  Rahul Patel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Notebook  Rahul Patel",
    description:
      "Technical deep dives, building in public, and lessons from 12 years of shipping code.",
    creator: "@rahhuul310",
    images: ["https://rahhuul.github.io/images/og-image.png"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BlogSchema />
      {children}
    </>
  );
}

import type { ContentBlock } from "./blog-content-types";
import { POST_CONTENT } from "./blog-content";
import { POST_CONTENT_B } from "./blog-content-b";
import { POST_CONTENT_C } from "./blog-content-c";
import { POST_CONTENT_D } from "./blog-content-d";

export type { ContentBlock };

export const ALL_POST_CONTENT: Record<string, ContentBlock[]> = {
  ...POST_CONTENT,
  ...POST_CONTENT_B,
  ...POST_CONTENT_C,
  ...POST_CONTENT_D,
};

export function getPostContent(slug: string): ContentBlock[] | null {
  return ALL_POST_CONTENT[slug] ?? null;
}

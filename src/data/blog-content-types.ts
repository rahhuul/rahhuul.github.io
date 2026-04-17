// Content block types for blog post rich content

export type ContentBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string } // supports **bold**, `inline code`, and _italic_ markdown
  | { type: "code"; lang: string; filename?: string; code: string }
  | { type: "ul"; items: string[] } // items support **bold** and `code`
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string; variant?: "note" | "tip" | "warning" }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "divider" };

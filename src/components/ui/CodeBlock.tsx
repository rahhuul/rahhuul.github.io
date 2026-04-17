"use client";

import { useState, useEffect } from "react";

interface CodeBlockProps {
  code: string;
  filename?: string;
}

function highlightCode(code: string): string {
  // Escape HTML first
  let result = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments (// ...)  must run before other patterns to avoid double-processing
  result = result.replace(
    /(\/\/[^\n]*)/g,
    '<span style="color:#546e7a;font-style:italic">$1</span>'
  );

  // Strings ("..." '...' `...`)  avoid matching inside already-replaced spans
  result = result.replace(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
    (match) => {
      // Don't re-highlight if already inside a span
      if (match.includes("<span")) return match;
      return `<span style="color:#c3e88d">${match}</span>`;
    }
  );

  // Keywords
  result = result.replace(
    /\b(const|require|let|var|function|return|import|from|export|default)\b/g,
    (match, keyword, offset, str) => {
      // Skip if inside an existing span (basic check: preceded by a color style)
      const before = str.slice(Math.max(0, offset - 20), offset);
      if (before.includes("color:")) return match;
      return `<span style="color:#c792ea">${keyword}</span>`;
    }
  );

  // Function calls (word followed by `(`)
  result = result.replace(
    /([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\()/g,
    (match, fn, offset, str) => {
      const before = str.slice(Math.max(0, offset - 20), offset);
      if (before.includes("color:")) return match;
      return `<span style="color:#82aaff">${fn}</span>`;
    }
  );

  // Numbers
  result = result.replace(
    /\b(\d+)\b/g,
    (match, num, offset, str) => {
      const before = str.slice(Math.max(0, offset - 20), offset);
      if (before.includes("color:")) return match;
      return `<span style="color:#f78c6c">${num}</span>`;
    }
  );

  return result;
}

export function CodeBlock({ code, filename }: CodeBlockProps) {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    setHighlighted(highlightCode(code));
  }, [code]);

  const lines = code.split("\n");

  return (
    <div
      style={{
        background: "#0d1117",
        borderRadius: "10px",
        overflow: "hidden",
        fontFamily: "var(--font-jetbrains)",
        fontSize: "0.8rem",
        lineHeight: 1.7,
        margin: "1.5rem 0",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "#1c2128",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Traffic lights */}
        <span
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#ff5f57",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#febc2e",
            display: "inline-block",
          }}
        />
        <span
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#28c840",
            display: "inline-block",
          }}
        />
        {filename && (
          <span
            style={{
              marginLeft: "8px",
              color: "#8b949e",
              fontSize: "0.75rem",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            {filename}
          </span>
        )}
      </div>

      {/* Code area */}
      <div style={{ padding: "1.25rem 0", overflowX: "auto" }}>
        {highlighted
          ? // Client: render highlighted HTML line by line
            highlighted.split("\n").map((lineHtml, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "flex-start" }}
              >
                <span
                  style={{
                    width: "2.8rem",
                    minWidth: "2.8rem",
                    textAlign: "right",
                    paddingRight: "1rem",
                    color: "#3d4451",
                    userSelect: "none",
                    fontSize: "0.75rem",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{ color: "#e8e0d4", flex: 1, paddingRight: "1.25rem" }}
                  dangerouslySetInnerHTML={{ __html: lineHtml || "&nbsp;" }}
                />
              </div>
            ))
          : // Server / before hydration: plain text
            lines.map((line, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "flex-start" }}
              >
                <span
                  style={{
                    width: "2.8rem",
                    minWidth: "2.8rem",
                    textAlign: "right",
                    paddingRight: "1rem",
                    color: "#3d4451",
                    userSelect: "none",
                    fontSize: "0.75rem",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{ color: "#e8e0d4", flex: 1, paddingRight: "1.25rem" }}
                >
                  {line || "\u00A0"}
                </span>
              </div>
            ))}
      </div>
    </div>
  );
}

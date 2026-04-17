"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap-config";

interface InteractiveTerminalProps {
  lines: string[];
  /** Delay (seconds) before typing starts  lets the parent fade-in complete first */
  startDelay?: number;
  style?: React.CSSProperties;
}

export function InteractiveTerminal({
  lines,
  startDelay = 0.35,
  style,
}: InteractiveTerminalProps) {
  const linesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!linesRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const el = linesRef.current;
    el.innerHTML = "";

    // totalDelay starts after startDelay so typing begins once the
    // parent AnimatePresence fade-in has finished.
    let totalDelay = startDelay;

    lines.forEach((line) => {
      const lineEl = document.createElement("div");
      lineEl.style.cssText =
        "min-height: 1.5em; display: flex; flex-wrap: wrap; align-items: flex-start;";

      if (line === "") {
        lineEl.innerHTML = "&nbsp;";
        gsap.set(lineEl, { opacity: 0 });
        gsap.to(lineEl, { opacity: 1, duration: 0.01, delay: totalDelay });
        totalDelay += 0.1;
        el.appendChild(lineEl);
        return;
      }

      const isCommand =
        line.startsWith("$") ||
        line.startsWith("curl") ||
        line.startsWith("docker");
      const isSuccess = line.startsWith("✔") || line.startsWith("🚀");
      const isJson = line.startsWith("{") || line.startsWith("}");
      const isContinuation =
        line.startsWith(" ") ||
        line.startsWith("-") ||
        line.startsWith("'");

      if (isCommand) {
        const prompt = document.createElement("span");
        prompt.textContent = "$ ";
        prompt.style.cssText =
          "color: rgba(74,222,128,0.5); margin-right: 2px; flex-shrink: 0;";
        gsap.set(prompt, { opacity: 0 });
        gsap.to(prompt, { opacity: 1, duration: 0.01, delay: totalDelay });
        lineEl.appendChild(prompt);
        totalDelay += 0.05;
      }

      const displayLine = isCommand ? line.replace(/^\$ ?/, "") : line;
      const charDelay = isCommand ? 0.032 : isSuccess || isJson ? 0 : 0.018;

      [...displayLine].forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char;

        if (isSuccess) span.style.color = "#4ade80";
        else if (isJson) span.style.color = "rgba(232,224,212,0.7)";
        else if (isContinuation) span.style.color = "rgba(232,224,212,0.5)";
        else span.style.color = "rgba(232,224,212,0.9)";

        if (char === " ") span.style.whiteSpace = "pre";

        gsap.set(span, { opacity: 0 });
        gsap.to(span, { opacity: 1, duration: 0.01, delay: totalDelay });

        if (!isSuccess && !isJson) totalDelay += charDelay;
        lineEl.appendChild(span);
      });

      if (isSuccess || isJson) totalDelay += 0.3;
      else totalDelay += 0.2;

      el.appendChild(lineEl);
    });

    // Blinking cursor
    const cursor = document.createElement("span");
    cursor.textContent = "█";
    cursor.style.cssText =
      "color: #4ade80; animation: terminal-blink 1.1s step-end infinite; margin-left: 2px;";
    gsap.set(cursor, { opacity: 0 });
    gsap.to(cursor, { opacity: 1, delay: totalDelay, duration: 0.01 });

    const lastLine = el.lastElementChild;
    if (lastLine) lastLine.appendChild(cursor);
    else el.appendChild(cursor);

    // Cleanup: kill all GSAP tweens targeting children of this element
    return () => {
      gsap.killTweensOf(el.querySelectorAll("*"));
    };
  }, [lines, startDelay]);

  return (
    <div
      role="presentation"
      aria-hidden="true"
      style={{
        background: "#0d1117",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
        fontFamily: "var(--font-jetbrains)",
        fontSize: "clamp(0.72rem, 1.1vw, 0.82rem)",
        lineHeight: 1.6,
        ...style,
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          background: "#1c2128",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57", flexShrink: 0 }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e", flexShrink: 0 }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840", flexShrink: 0 }} />
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-jetbrains)",
            fontSize: "0.65rem",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.04em",
          }}
        >
          bash
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "1.25rem 1.5rem", minHeight: "180px" }}>
        <div ref={linesRef}>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{ minHeight: "1.5em", color: "rgba(232,224,212,0.8)" }}
            >
              {line || "\u00a0"}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes terminal-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

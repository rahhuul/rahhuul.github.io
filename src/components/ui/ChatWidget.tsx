"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Local dev: uses /api/chat (Next.js route). Production: set NEXT_PUBLIC_CHAT_URL to your Cloudflare Worker URL.
const WORKER_URL = process.env.NEXT_PUBLIC_CHAT_URL ?? "/api/chat";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTED = [
  "What's your tech stack?",
  "Are you available for hire?",
  "Tell me about APILens",
  "How many years of experience?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = {
        id: `${Date.now()}`,
        role: "user",
        text: text.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = [...messages, userMsg].map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        }));

        const res = await fetch(WORKER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();

        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply && data.error?.code === 429) {
          reply = "I'm getting a lot of questions right now — please try again in a moment! Or reach Rahul directly at rahul.patel786@gmail.com 📬";
        } else if (!reply) {
          reply = "Sorry, I couldn't respond. Please try again.";
        }

        setMessages((prev) => [
          ...prev,
          { id: `${Date.now() + 1}`, role: "assistant", text: reply as string },
        ]);

        if (!open) setUnread(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now() + 1}`,
            role: "assistant",
            text: "Something went wrong. You can reach Rahul directly at rahul.patel786@gmail.com",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, open]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              bottom: "92px",
              right: "24px",
              width: "clamp(320px, 90vw, 388px)",
              height: "clamp(420px, 70vh, 560px)",
              background: "#18161400",
              borderRadius: "22px",
              overflow: "hidden",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(184,150,62,0.18)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Glassmorphism bg layer */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(160deg, rgba(30,26,20,0.97) 0%, rgba(20,18,14,0.98) 100%)",
                zIndex: -1,
              }}
            />

            {/* ── Header ── */}
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                background:
                  "linear-gradient(to bottom, rgba(184,150,62,0.06), transparent)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "11px" }}
              >
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #c4973e 0%, #7a580f 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-playfair)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#fff",
                      boxShadow: "0 0 0 2px rgba(184,150,62,0.25)",
                    }}
                  >
                    RP
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      bottom: "1px",
                      right: "1px",
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: "#4ade80",
                      border: "2px solid #18161a",
                      boxShadow: "0 0 6px rgba(74,222,128,0.6)",
                    }}
                  />
                </div>

                <div>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-playfair)",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      color: "#e8e0d4",
                      lineHeight: 1.2,
                    }}
                  >
                    Rahul&apos;s AI
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-caveat)",
                      fontSize: "0.82rem",
                      color: "rgba(184,150,62,0.7)",
                      lineHeight: 1.2,
                    }}
                  >
                    Ask me anything about Rahul
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "9px",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(232,224,212,0.5)",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#e8e0d4";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(232,224,212,0.5)";
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ── Messages area ── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                scrollbarWidth: "none",
              }}
            >
              {/* Empty state */}
              {messages.length === 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    paddingTop: "4px",
                  }}
                >
                  {/* Greeting bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{
                      background: "rgba(184,150,62,0.09)",
                      border: "1px solid rgba(184,150,62,0.18)",
                      borderRadius: "16px 16px 16px 4px",
                      padding: "13px 15px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-source-serif)",
                        fontSize: "0.875rem",
                        color: "rgba(232,224,212,0.88)",
                        lineHeight: 1.65,
                      }}
                    >
                      Hi! I&apos;m Rahul&apos;s AI. Ask me about his experience,
                      tech stack, projects, or if he&apos;s available to hire. 👋
                    </p>
                  </motion.div>

                  {/* Suggested prompts */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-caveat)",
                        fontSize: "0.78rem",
                        color: "rgba(232,224,212,0.28)",
                        marginBottom: "7px",
                        paddingLeft: "2px",
                      }}
                    >
                      try asking:
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      {SUGGESTED.map((prompt, i) => (
                        <motion.button
                          key={prompt}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.07 }}
                          onClick={() => sendMessage(prompt)}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "10px",
                            padding: "9px 13px",
                            textAlign: "left",
                            cursor: "pointer",
                            color: "rgba(232,224,212,0.6)",
                            fontFamily: "var(--font-source-serif)",
                            fontSize: "0.82rem",
                            lineHeight: 1.45,
                            transition: "all 0.18s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(184,150,62,0.1)";
                            e.currentTarget.style.borderColor =
                              "rgba(184,150,62,0.28)";
                            e.currentTarget.style.color = "#e8e0d4";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.04)";
                            e.currentTarget.style.borderColor =
                              "rgba(255,255,255,0.08)";
                            e.currentTarget.style.color =
                              "rgba(232,224,212,0.6)";
                          }}
                        >
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Message bubbles */}
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: i === messages.length - 1 ? 0 : 0 }}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "84%",
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, #c4973e 0%, #8b6914 100%)"
                          : "rgba(255,255,255,0.07)",
                      border:
                        msg.role === "user"
                          ? "none"
                          : "1px solid rgba(255,255,255,0.08)",
                      borderRadius:
                        msg.role === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      padding: "10px 14px",
                      boxShadow:
                        msg.role === "user"
                          ? "0 4px 16px rgba(184,150,62,0.25)"
                          : "none",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-source-serif)",
                        fontSize: "0.855rem",
                        color:
                          msg.role === "user"
                            ? "#fff"
                            : "rgba(232,224,212,0.88)",
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", justifyContent: "flex-start" }}
                >
                  <div
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "16px 16px 16px 4px",
                      padding: "12px 16px",
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "rgba(184,150,62,0.8)",
                          animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                          display: "block",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ── */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: "10px 12px 14px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                flexShrink: 0,
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                disabled={loading}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  color: "#e8e0d4",
                  fontFamily: "var(--font-source-serif)",
                  fontSize: "0.855rem",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  minWidth: 0,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(184,150,62,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(184,150,62,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background:
                    input.trim() && !loading
                      ? "linear-gradient(135deg, #c4973e, #8b6914)"
                      : "rgba(255,255,255,0.06)",
                  border: "none",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  flexShrink: 0,
                  boxShadow:
                    input.trim() && !loading
                      ? "0 4px 14px rgba(184,150,62,0.3)"
                      : "none",
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={
                    input.trim() && !loading
                      ? "#fff"
                      : "rgba(232,224,212,0.25)"
                  }
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>

            {/* Powered by label */}
            <div
              style={{
                textAlign: "center",
                padding: "5px 0 8px",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-caveat)",
                  fontSize: "0.7rem",
                  color: "rgba(232,224,212,0.18)",
                  letterSpacing: "0.03em",
                }}
              >
                powered by Gemini AI
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating button ── */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          background: open
            ? "rgba(26,22,16,0.95)"
            : "linear-gradient(135deg, #c4973e 0%, #7a580f 100%)",
          border: open
            ? "1px solid rgba(184,150,62,0.35)"
            : "1px solid rgba(196,151,62,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          boxShadow: open
            ? "0 4px 24px rgba(0,0,0,0.4)"
            : "0 8px 32px rgba(184,150,62,0.4), 0 2px 8px rgba(0,0,0,0.35)",
        }}
      >
        {/* Pulse ring — only when closed */}
        {!open && (
          <>
            <span
              style={{
                position: "absolute",
                inset: "-5px",
                borderRadius: "50%",
                border: "1.5px solid rgba(184,150,62,0.35)",
                animation: "chat-pulse 2.8s ease-out infinite",
                pointerEvents: "none",
              }}
            />
            <span
              style={{
                position: "absolute",
                inset: "-5px",
                borderRadius: "50%",
                border: "1.5px solid rgba(184,150,62,0.2)",
                animation: "chat-pulse 2.8s ease-out 0.7s infinite",
                pointerEvents: "none",
              }}
            />
          </>
        )}

        {/* Unread dot */}
        {unread && !open && (
          <span
            style={{
              position: "absolute",
              top: "3px",
              right: "3px",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#4ade80",
              border: "2px solid #141414",
              boxShadow: "0 0 8px rgba(74,222,128,0.7)",
            }}
          />
        )}

        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(232,224,212,0.8)"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.18 }}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      <style>{`
        @keyframes chat-pulse {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.65); opacity: 0; }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.35; }
          30%           { transform: translateY(-4px); opacity: 1;    }
        }
      `}</style>
    </>
  );
}

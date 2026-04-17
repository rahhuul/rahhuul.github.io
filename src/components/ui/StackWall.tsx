"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { TechBadge } from "./TechBadge";

interface Tech {
  name: string;
  icon?: string;
  color: string;
}

interface StackGroup {
  label: string;
  items: Tech[];
}

const STACK_GROUPS: StackGroup[] = [
  {
    label: "Frontend",
    items: [
      { name: "React",        icon: "react",        color: "61DAFB" },
      { name: "Next.js",      icon: "nextdotjs",    color: "888888" },
      { name: "Angular",      icon: "angular",      color: "DD0031" },
      { name: "TypeScript",   icon: "typescript",   color: "3178C6" },
      { name: "JavaScript",   icon: "javascript",   color: "c8a800" },
      { name: "HTML5",        icon: "html5",        color: "E34F26" },
      { name: "CSS3",         icon: "css3",         color: "1572B6" },
      { name: "Tailwind CSS", icon: "tailwindcss",  color: "06B6D4" },
      { name: "jQuery",       icon: "jquery",       color: "0769AD" },
      { name: "Bootstrap",    icon: "bootstrap",    color: "7952B3" },
    ],
  },
  {
    label: "Backend",
    items: [
      { name: "Node.js",    icon: "nodedotjs",  color: "339933" },
      { name: "Express",    icon: "express",    color: "888888" },
      { name: "Fastify",    icon: "fastify",    color: "888888" },
      { name: "Laravel",    icon: "laravel",    color: "FF2D20" },
      { name: "PHP",        icon: "php",        color: "777BB4" },
      { name: "Python",     icon: "python",     color: "3776AB" },
      { name: "GraphQL",    icon: "graphql",    color: "E10098" },
      { name: "REST APIs",                      color: "6b6b6b" },
      { name: "gRPC",                           color: "244C5A" },
      { name: "RPC",                            color: "6b6b6b" },
      { name: "WebRTC",                         color: "333333" },
    ],
  },
  {
    label: "Database",
    items: [
      { name: "PostgreSQL", icon: "postgresql",      color: "4169E1" },
      { name: "MySQL",      icon: "mysql",           color: "4479A1" },
      { name: "MongoDB",    icon: "mongodb",         color: "47A248" },
      { name: "Redis",      icon: "redis",           color: "DC382D" },
      { name: "Cassandra",  icon: "apachecassandra", color: "1287B1" },
      { name: "ClickHouse",                          color: "c8a800" },
    ],
  },
  {
    label: "DevOps & Cloud",
    items: [
      { name: "Docker",          icon: "docker",        color: "2496ED" },
      { name: "AWS",             icon: "amazonaws",     color: "FF9900" },
      { name: "Vercel",          icon: "vercel",        color: "888888" },
      { name: "Nginx",           icon: "nginx",         color: "009639" },
      { name: "Linux",           icon: "linux",         color: "c8a800" },
      { name: "GitHub Actions",  icon: "githubactions", color: "2088FF" },
    ],
  },
  {
    label: "Mobile",
    items: [
      { name: "React Native", icon: "react",        color: "61DAFB" },
      { name: "Expo",         icon: "expo",         color: "888888" },
    ],
  },
  {
    label: "CMS",
    items: [
      { name: "WordPress",   icon: "wordpress",   color: "21759B" },
      { name: "WooCommerce", icon: "woocommerce", color: "96588A" },
      { name: "Joomla",      icon: "joomla",      color: "F44321" },
    ],
  },
  {
    label: "Blockchain",
    items: [
      { name: "Solidity", icon: "solidity", color: "5C5C5C" },
      { name: "Web3.js",                    color: "F16822" },
      { name: "ethers.js",                  color: "2535A0" },
    ],
  },
  {
    label: "AI & MCP",
    items: [
      { name: "Claude API", color: "b8963e" },
      { name: "MCP",        color: "b8963e" },
    ],
  },
  {
    label: "Tooling",
    items: [
      { name: "Git",       icon: "git",         color: "F05032" },
      { name: "Jira",      icon: "jira",        color: "0052CC" },
      { name: "Figma",     icon: "figma",       color: "F24E1E" },
      { name: "RabbitMQ",  icon: "rabbitmq",    color: "FF6600" },
      { name: "Kafka",     icon: "apachekafka", color: "888888" },
      { name: "Stripe",    icon: "stripe",      color: "635BFF" },
      { name: "Selenium",  icon: "selenium",    color: "43B02A" },
    ],
  },
];

export function StackWall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);
  let globalIndex = 0;

  // ── GSAP stagger in from center ─────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const badges = badgeRefs.current.filter(Boolean) as HTMLElement[];
    if (!badges.length) return;

    gsap.fromTo(
      badges,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
        stagger: { amount: 0.8, from: "center" },
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.vars.trigger === container)
        .forEach((st) => st.kill());
    };
  }, []);

  // ── Cursor magnetic effect (desktop only) ───────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const cursorX = e.clientX - containerRect.left;
    const cursorY = e.clientY - containerRect.top;

    badgeRefs.current.forEach((badge) => {
      if (!badge) return;
      const rect = badge.getBoundingClientRect();
      const cx = rect.left - containerRect.left + rect.width / 2;
      const cy = rect.top - containerRect.top + rect.height / 2;
      const dx = cursorX - cx;
      const dy = cursorY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150 && dist > 0) {
        const strength = (1 - dist / 150) * 5;
        badge.style.transform = `translate(${(dx / dist) * strength}px, ${(dy / dist) * strength}px)`;
      } else {
        badge.style.transform = "translate(0,0)";
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    badgeRefs.current.forEach((badge) => {
      if (badge) badge.style.transform = "translate(0,0)";
    });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      {STACK_GROUPS.map((group) => (
        <div key={group.label} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          {/* Category label */}
          <span
            style={{
              fontFamily: "var(--font-caveat)",
              fontSize: "0.8rem",
              color: "var(--color-muted)",
              whiteSpace: "nowrap",
              paddingTop: "5px",
              minWidth: "90px",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {group.label}
          </span>

          {/* Divider */}
          <span
            style={{
              width: "1px",
              alignSelf: "stretch",
              background: "var(--color-border)",
              flexShrink: 0,
              marginTop: "2px",
              marginBottom: "2px",
            }}
          />

          {/* Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {group.items.map((tech) => {
              const idx = globalIndex++;
              return (
                <div
                  key={tech.name}
                  ref={(el) => { badgeRefs.current[idx] = el; }}
                  style={{ transition: "transform 0.18s ease" }}
                >
                  <TechBadge name={tech.name} icon={tech.icon} color={tech.color} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

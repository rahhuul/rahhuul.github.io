"use client";

import { useRef } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  maxDisplace?: number; // max px shift, default 8
  style?: React.CSSProperties;
  className?: string;
}

export function MagneticButton({
  children,
  maxDisplace = 8,
  style,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    el.style.transform = `translate(${dx * maxDisplace}px, ${dy * maxDisplace}px)`;
    el.style.transition = "transform 0.15s ease";
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
    el.style.transition = "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: "inline-block", ...style }}
    >
      {children}
    </div>
  );
}

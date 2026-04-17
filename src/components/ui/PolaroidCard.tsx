"use client";

import Image from "next/image";

interface PolaroidCardProps {
  image: string;
  alt: string;
  rotation?: number; // degrees, e.g. -2
  /** Fallback bg color when image doesn't exist */
  placeholderColor?: string;
  placeholderLabel?: string;
  style?: React.CSSProperties;
}

export function PolaroidCard({
  image,
  alt,
  rotation = 0,
  placeholderColor = "#e8e0d4",
  placeholderLabel,
  style,
}: PolaroidCardProps) {
  return (
    <div
      className="polaroid-card"
      style={{
        background: "#FEFCF9",
        padding: "12px 12px 44px",
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)",
        borderRadius: "2px",
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        position: "relative",
        cursor: "default",
        ...style,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = `rotate(${rotation * 0.3}deg) scale(1.02)`;
        el.style.boxShadow =
          "0 12px 40px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = `rotate(${rotation}deg) scale(1)`;
        el.style.boxShadow =
          "0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.06)";
      }}
    >
      {/* Tape strip at top */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10px",
          left: "50%",
          transform: "translateX(-50%) rotate(-1deg)",
          width: "56px",
          height: "22px",
          background: "rgba(210,195,165,0.55)",
          borderRadius: "2px",
          zIndex: 2,
          backdropFilter: "blur(1px)",
        }}
      />

      {/* Image area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          overflow: "hidden",
          borderRadius: "1px",
          background: placeholderColor,
        }}
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          style={{ objectFit: "cover" }}
          loading="lazy"
          onError={(e) => {
            // Hide broken image, show placeholder behind it
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* CSS placeholder visible when image fails / not provided */}
        {placeholderLabel && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(1rem,2vw,1.4rem)",
              fontStyle: "italic",
              color: "rgba(26,26,26,0.35)",
              letterSpacing: "-0.01em",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            {placeholderLabel}
          </div>
        )}
      </div>
    </div>
  );
}

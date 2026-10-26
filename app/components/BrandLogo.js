"use client";

import React from "react";

export default function BrandLogo({ size = 36, showText = false, textClassName = "", iconOnly = false }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius: `${Math.round(size * 0.3)}px`,
          background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #0284c7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glass reflection highlight */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "45%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
            borderTopLeftRadius: `${Math.round(size * 0.3)}px`,
            borderTopRightRadius: `${Math.round(size * 0.3)}px`,
          }}
        />
        {/* Modern WhatsApp pulse SVG */}
        <svg
          width={Math.round(size * 0.58)}
          height={Math.round(size * 0.58)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))", zIndex: 1 }}
        >
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" fill="rgba(255,255,255,0.15)" />
          <path d="M8 12h.01" />
          <path d="M12 12h.01" />
          <path d="M16 12h.01" />
        </svg>
      </div>

      {showText && !iconOnly && (
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Whats<span style={{ color: "#10b981" }}>Pulse</span>
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "2px 5px",
                borderRadius: "4px",
                background: "rgba(16, 185, 129, 0.12)",
                color: "#059669",
              }}
            >
              PRO
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500", marginTop: "2px" }}>
            Enterprise Cloud API
          </span>
        </div>
      )}
    </div>
  );
}

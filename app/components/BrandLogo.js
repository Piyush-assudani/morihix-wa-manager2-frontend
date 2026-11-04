"use client";

import React from "react";

export default function BrandLogo({ size = 36, showText = false, textClassName = "", iconOnly = false }) {
  const radius = Math.round(size * 0.24);

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius: `${radius}px`,
          boxShadow: "0 4px 12px rgba(10, 28, 68, 0.25)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#06122c",
          flexShrink: 0,
        }}
      >
        <img
          src="/icon.png"
          alt="Morihix WA Manager Logo"
          width={size}
          height={size}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {showText && !iconOnly && (
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "16px", fontWeight: "800", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Morihix <span style={{ color: "#d97706" }}>WA Manager</span>
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "2px 5px",
                borderRadius: "4px",
                background: "rgba(217, 119, 6, 0.12)",
                color: "#d97706",
                border: "1px solid rgba(217, 119, 6, 0.2)",
              }}
            >
              PRO
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500", marginTop: "2px" }}>
            WhatsApp Automation & CRM
          </span>
        </div>
      )}
    </div>
  );
}

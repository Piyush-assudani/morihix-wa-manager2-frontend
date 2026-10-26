"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  MessageCircle,
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.push("/chat");
    }
    const savedUser = typeof window !== "undefined" ? localStorage.getItem("saved_username") : null;
    if (savedUser) {
      setUsername(savedUser);
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double-submit / spam clicks

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://wpautomation.moxrathore.com";

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        if (rememberMe) {
          localStorage.setItem("saved_username", cleanUsername);
        } else {
          localStorage.removeItem("saved_username");
        }
        router.push("/chat");
      } else {
        setError(data.error || "Invalid username or password. Please verify credentials.");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Unable to connect to server. Please check your internet or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fbfbfc",
        color: "#0f172a",
        fontFamily: "var(--font-sans)",
        overflowY: "auto",
      }}
    >
      {/* Subtle, soft ambient background gradient */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(at 20% 15%, rgba(16, 185, 129, 0.05) 0%, transparent 60%), radial-gradient(at 85% 80%, rgba(14, 165, 233, 0.04) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top Navbar */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 48px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <BrandLogo size={38} showText />

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              borderRadius: "999px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              fontWeight: "500",
              color: "#475569",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#10b981",
                boxShadow: "0 0 6px rgba(16, 185, 129, 0.6)",
              }}
            />
            Official Meta Cloud API
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        style={{
          position: "relative",
          zIndex: 5,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 48px",
          maxWidth: "1320px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: "64px",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Left Column: Decent & Minimalist Product Showcase */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#059669",
                  marginBottom: "12px",
                }}
              >
                Enterprise Communication Suite
              </div>

              <h1
                style={{
                  fontSize: "36px",
                  fontWeight: "700",
                  lineHeight: "1.22",
                  letterSpacing: "-0.025em",
                  color: "#0f172a",
                  margin: "0 0 14px 0",
                }}
              >
                The Intelligent Messaging Engine <br />
                <span style={{ color: "#059669" }}>For Modern Enterprises</span>
              </h1>

              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#64748b",
                  margin: 0,
                  maxWidth: "520px",
                }}
              >
                High-throughput WhatsApp broadcasts, live 2-way customer conversations, and automated workflows on official Meta infrastructure.
              </p>
            </div>

            {/* Generated Minimalist Studio Render */}
            <div
              style={{
                position: "relative",
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                boxShadow:
                  "0 20px 35px -10px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)",
                backgroundColor: "#ffffff",
              }}
            >
              <Image
                src="/login_hero.jpg"
                alt="WhatsPulse Enterprise Platform Preview"
                width={700}
                height={525}
                priority
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "360px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {/* Minimalist Feature Pillars */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                paddingTop: "6px",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={16} color="#059669" />
                <span>Zero Throttling Delivery</span>
              </div>
              <span style={{ color: "#cbd5e1" }}>&bull;</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageCircle size={16} color="#059669" />
                <span>Real-Time 2-Way Chat</span>
              </div>
              <span style={{ color: "#cbd5e1" }}>&bull;</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield size={16} color="#059669" />
                <span>Meta Tier-1 Cloud API</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean, Minimalist Login Card */}
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <div
              style={{
                width: "100%",
                maxWidth: "420px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "20px",
                padding: "40px 36px",
                boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.06), 0 0 1px rgba(0, 0, 0, 0.04)",
                boxSizing: "border-box",
              }}
            >
              {/* Card Header */}
              <div style={{ marginBottom: "28px" }}>
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                    margin: "0 0 6px 0",
                  }}
                >
                  Welcome back
                </h2>
                <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
                  Enter your credentials to access your console
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fee2e2",
                    color: "#dc2626",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    marginBottom: "20px",
                  }}
                >
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin}>
                {/* Username */}
                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "7px",
                    }}
                  >
                    Username or ID
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <User size={17} />
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      required
                      autoComplete="username"
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 42px",
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        color: "#0f172a",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#059669";
                        e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.12)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#cbd5e1";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: "7px",
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <Lock size={17} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                      style={{
                        width: "100%",
                        padding: "12px 42px 12px 42px",
                        borderRadius: "10px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        color: "#0f172a",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#059669";
                        e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.12)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#cbd5e1";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember Session & Support */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "22px",
                    fontSize: "13px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      color: "#64748b",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        accentColor: "#059669",
                        width: "15px",
                        height: "15px",
                        cursor: "pointer",
                      }}
                    />
                    Remember me
                  </label>

                  <a
                    href="mailto:support@morihix.com"
                    style={{
                      color: "#059669",
                      textDecoration: "none",
                      fontWeight: "500",
                    }}
                  >
                    Need help?
                  </a>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    backgroundColor: "#059669",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "background-color 0.15s ease, transform 0.1s ease",
                    opacity: loading ? 0.8 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = "#047857";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = "#059669";
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#ffffff",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Security info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginTop: "24px",
                  paddingTop: "18px",
                  borderTop: "1px solid #f1f5f9",
                  fontSize: "12px",
                  color: "#94a3b8",
                }}
              >
                <Shield size={14} color="#059669" />
                <span>End-to-end encrypted session</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 48px",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          backgroundColor: "#ffffff",
          fontSize: "12px",
          color: "#64748b",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span>&copy; 2026 MAA AAINATH GOU SEVA SAMITI BALOTRA. All rights reserved.</span>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href="https://morihix.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#059669", textDecoration: "none", fontWeight: "600" }}
          >
            Powered by Morihix Private Limited
          </a>
          <span>&bull;</span>
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#64748b", textDecoration: "none" }}
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
}

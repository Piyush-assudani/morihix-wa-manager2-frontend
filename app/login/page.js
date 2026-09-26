"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Eye, EyeOff } from "lucide-react"; 

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const apiUrl = "https://wpautomation.moxrathore.com";

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        router.push("/chat");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", backgroundColor: "var(--bg-primary)" }}>
      {/* Left Pane - Image and Branding */}
      <div style={{ 
        flex: 1, 
        position: "relative", 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px",
        backgroundImage: "url('/gaushala_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white"
      }}>
        {/* Overlay for better text readability */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.85)", zIndex: 1 }}></div>

        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/logo.png" alt="Logo" style={{ width: "48px", height: "48px", borderRadius: "50%" }} />
            <div style={{ color: "#8B4513", fontWeight: "bold", fontSize: "14px", lineHeight: "1.2" }}>
              MAA AAINATH<br/>GOU SEVA SAMITI<br/>BALOTRA
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", color: "#8B4513", fontSize: "14px" }}>
            <span>Seva</span> | <span>Samarpan</span> | <span>Sanskar</span> | <span>Samaj</span>
          </div>
        </div>

        {/* Main Text */}
        <div style={{ zIndex: 2, maxWidth: "500px", marginTop: "40px" }}>
          <h1 style={{ color: "#d97706", fontSize: "48px", fontWeight: "bold", lineHeight: "1.2", marginBottom: "16px" }}>
            <span style={{ color: "#d2b48c", fontSize: "64px", verticalAlign: "middle", marginRight: "8px" }}>“</span>
            गौ सेवा<br/>केवल सेवा नहीं,<br/>संस्कार है
            <span style={{ color: "#d2b48c", fontSize: "64px", verticalAlign: "middle", marginLeft: "8px" }}>”</span>
          </h1>
          <p style={{ color: "#5c4033", fontSize: "18px", lineHeight: "1.5" }}>
            गौ माता की सेवा, समाज की सेवा,<br/>हम सबका कर्तव्य है।
          </p>
        </div>

        {/* Bottom Cards */}
        <div style={{ zIndex: 2, display: "flex", gap: "16px" }}>
          {[
            { title: "Gau Seva", sub: "सेवा हमारा धर्म", icon: "❤️" },
            { title: "Samaj Kalyan", sub: "समाज का उत्थान", icon: "👥" },
            { title: "Sanskriti Sanrakshan", sub: "परंपरा की रक्षा", icon: "🌱" }
          ].map((card, idx) => (
            <div key={idx} style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.9)", 
              padding: "16px", 
              borderRadius: "12px", 
              flex: 1, 
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)"
            }}>
              <div style={{ color: "#d97706", fontSize: "24px", marginBottom: "8px" }}>{card.icon}</div>
              <h3 style={{ color: "#5c4033", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>{card.title}</h3>
              <p style={{ color: "#8B4513", fontSize: "12px" }}>{card.sub}</p>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div style={{ zIndex: 2, display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#8B4513", marginTop: "24px", borderTop: "1px solid rgba(139, 69, 19, 0.2)", paddingTop: "12px" }}>
          <span>© 2026 Maa Aainath Gou Seva Samiti Balotra. All rights reserved.</span>
          <span>Developed by <strong style={{ color: "#d97706" }}>Mox Rathore</strong></span>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff5e6" }}>
        <div style={{
          background: "white",
          padding: "48px 40px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center"
        }}>
          <div style={{ margin: "0 auto 24px" }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "50%", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} 
            />
          </div>
          
          <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#3e3328", marginBottom: "8px" }}>
            MAA AAINATH GOU SEVA<br/>SAMITI BALOTRA
          </h2>
          <p style={{ fontSize: "14px", color: "#70655b", marginBottom: "32px" }}>
            WhatsApp Management Dashboard
          </p>

          {error && (
            <div style={{ padding: "12px", backgroundColor: "#fee2e2", color: "#ef4444", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#3e3328", marginBottom: "8px" }}>Username</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>👤</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", fontSize: "14px" }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#3e3328", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{ width: "100%", padding: "12px 40px", borderRadius: "8px", border: "1px solid #e5e7eb", outline: "none", fontSize: "14px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: "14px", 
                backgroundColor: "#f97316", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                fontSize: "15px", 
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

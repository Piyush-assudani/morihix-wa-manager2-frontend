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

    try {
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://wpautomation.moxrathore.com";
      if (apiUrl.includes("localhost") && typeof window !== "undefined" && window.location.hostname !== "localhost") {
        apiUrl = "https://wpautomation.moxrathore.com";
      }
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
      setError("Network error. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100%",
      backgroundColor: "var(--bg-primary)",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "var(--bg-secondary)",
        padding: "48px 40px",
        borderRadius: "24px",
        boxShadow: "var(--shadow-lg)",
        width: "100%",
        maxWidth: "440px",
        border: "1px solid var(--border-color)",
        textAlign: "center"
      }}>
        <div style={{
          width: "100px",
          height: "100px",
          margin: "0 auto 24px",
        }}>
          <img 
            src="/logo.png" 
            alt="Maa Aainath Logo" 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "contain", 
              borderRadius: "24px", 
              backgroundColor: "white", 
              padding: "4px", 
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)" 
            }} 
          />
        </div>
        
        <h1 style={{
          fontSize: "28px",
          fontWeight: "800",
          color: "var(--text-primary)",
          marginBottom: "8px",
          letterSpacing: "-0.02em"
        }}>
          MAA AAINATH GOU SEVA SAMITI BALOTRA
        </h1>
        <p style={{
          fontSize: "15px",
          color: "var(--text-secondary)",
          marginBottom: "32px"
        }}>
          WhatsApp Management Dashboard
        </p>

        {error && (
          <div style={{
            padding: "12px",
            backgroundColor: "var(--warning-bg)",
            color: "var(--warning-text)",
            borderRadius: "12px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid var(--warning-border)"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: "32px", position: "relative" }}>
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{ paddingRight: "48px" }} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px"
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: "100%", padding: "16px" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "3px" }} />
                Signing In...
              </>
            ) : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

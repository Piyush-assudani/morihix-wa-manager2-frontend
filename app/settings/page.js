"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Eye, EyeOff, RefreshCw, Save, ShieldAlert, UserCog } from "lucide-react";
import api, { getAccountHealth } from "../lib/api";

const getTierDescription = (tier) => {
  const tierDescriptions = {
    TIER_250: "250 business-initiated conversations per rolling 24 hours",
    TIER_1K: "1,000 business-initiated conversations per rolling 24 hours",
    TIER_10K: "10,000 business-initiated conversations per rolling 24 hours",
    TIER_100K: "100,000 business-initiated conversations per rolling 24 hours",
    TIER_UNLIMITED: "Unlimited business-initiated conversations",
  };

  return tierDescriptions[tier?.toUpperCase()] || "Limit supplied by Meta";
};

const getQualityStyle = (quality) => {
  switch (quality?.toUpperCase()) {
    case "GREEN":
      return { color: "#15803d", background: "#dcfce7", Icon: CheckCircle2 };
    case "YELLOW":
      return { color: "#a16207", background: "#fef9c3", Icon: AlertTriangle };
    case "RED":
      return { color: "#b91c1c", background: "#fee2e2", Icon: ShieldAlert };
    default:
      return { color: "var(--text-secondary)", background: "var(--bg-tertiary)", Icon: Activity };
  }
};

export default function SettingsPage() {
  const [metaHealth, setMetaHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    getAccountHealth()
      .then((res) => {
        if (isMounted) setMetaHealth(res.data);
      })
      .catch((err) => {
        if (isMounted) {
          setHealthError(err.response?.data?.error || "Failed to load Meta account health.");
        }
      })
      .finally(() => {
        if (isMounted) setHealthLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshMetaHealth = async () => {
    setHealthLoading(true);
    setHealthError("");
    try {
      const res = await getAccountHealth();
      setMetaHealth(res.data);
    } catch (err) {
      setHealthError(err.response?.data?.error || "Failed to load Meta account health.");
    } finally {
      setHealthLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.put("/api/auth/profile", {
        currentUsername,
        currentPassword,
        newUsername,
        newPassword
      });

      setSuccess("Profile updated successfully! Please use new credentials on your next login.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
      </div>

      <div className="page-content" style={{ maxWidth: "700px" }}>
        <section className="ui-card" style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                <Activity size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)" }}>WhatsApp Account Health</h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Quality rating and messaging limit from Meta.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={refreshMetaHealth}
              disabled={healthLoading}
              className="btn-secondary"
              aria-label="Refresh WhatsApp account health"
              title="Refresh from Meta"
              style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {healthLoading ? (
            <div className="loading-container" style={{ minHeight: "80px" }}>
              <div className="loading-spinner" />
            </div>
          ) : healthError ? (
            <div style={{ padding: "16px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fee2e2", color: "#991b1b", fontSize: "13px" }}>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>Notice</div>
              <div>{healthError}</div>
            </div>
          ) : metaHealth?.configured === false ? (
            <div style={{ padding: "16px 20px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "#334155", fontSize: "14px", marginBottom: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
                Meta API Connection Ready
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                WhatsApp Cloud API credentials (Phone Number ID &amp; Access Token) can be set in your backend environment to automatically sync your live Meta quality rating and 24-hour tier limits here.
              </p>
            </div>
          ) : metaHealth ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div style={{ padding: "16px", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
                  <div className="form-label" style={{ marginBottom: "10px" }}>Quality Rating</div>
                  {(() => {
                    const { color, background, Icon } = getQualityStyle(metaHealth.quality_rating);
                    return (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 12px", borderRadius: "999px", color, background, fontWeight: 600 }}>
                        <Icon size={17} />
                        {metaHealth.quality_rating || "UNKNOWN"}
                      </span>
                    );
                  })()}
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "10px" }}>
                    {metaHealth.quality_rating?.toUpperCase() === "RED"
                      ? "High risk: review messaging practices and recent user feedback."
                      : metaHealth.quality_rating?.toUpperCase() === "YELLOW"
                      ? "Quality is declining. Monitor feedback and message relevance."
                      : metaHealth.quality_rating?.toUpperCase() === "GREEN"
                      ? "Healthy rating. Keep messages relevant and expected."
                      : "Meta has not provided a quality rating."}
                  </p>
                </div>

                <div style={{ padding: "16px", border: "1px solid var(--border-color)", borderRadius: "12px" }}>
                  <div className="form-label" style={{ marginBottom: "10px" }}>Messaging Tier</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {metaHealth.messaging_limit_tier?.replace(/^TIER_/, "") || "UNKNOWN"}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "10px" }}>
                    {getTierDescription(metaHealth.messaging_limit_tier)}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>
                Limits describe business-initiated conversations per rolling 24 hours, as reported by Meta.
                {metaHealth.display_phone_number ? ` Phone: ${metaHealth.display_phone_number}.` : ""}
              </p>
            </>
          ) : (
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Meta did not return account health details.</p>
          )}
        </section>

        <div className="ui-card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
              <UserCog size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)" }}>Update Credentials</h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Change your login ID and password here.</p>
            </div>
          </div>

          {error && (
            <div className="window-warning" style={{ marginBottom: "20px" }}>
              <span className="window-warning-text">{error}</span>
            </div>
          )}

          {success && (
            <div style={{ padding: "12px 16px", backgroundColor: "rgba(76, 175, 80, 0.1)", border: "1px solid var(--status-delivered)", borderRadius: "12px", color: "var(--status-delivered)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "14px", fontWeight: "500" }}>
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border-color)" }}>Current Credentials</h3>
            
            <div className="form-group">
              <label className="form-label">Current ID / Username</label>
              <input
                type="text"
                className="form-input"
                value={currentUsername}
                onChange={(e) => setCurrentUsername(e.target.value)}
                placeholder="Enter current ID"
                required
              />
            </div>
            
            <div className="form-group" style={{ position: "relative" }}>
              <label className="form-label">Current Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", margin: "24px 0 16px", paddingBottom: "8px", borderBottom: "1px solid var(--border-color)" }}>New Credentials</h3>

            <div className="form-group">
              <label className="form-label">New ID / Username</label>
              <input
                type="text"
                className="form-input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new ID"
                required
              />
            </div>

            <div className="form-group" style={{ position: "relative", marginBottom: "32px" }}>
              <label className="form-label">New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  style={{ paddingRight: "48px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "14px", display: "flex", justifyContent: "center", gap: "8px" }} disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "3px" }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

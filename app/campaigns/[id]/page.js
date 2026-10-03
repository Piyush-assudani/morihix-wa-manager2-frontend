"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle2, XCircle, Clock, Filter, Activity, MessageSquare } from "lucide-react";
import api from "../../lib/api";
import { format } from "date-fns";

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, messages, analytics
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campRes, recRes, tmplRes] = await Promise.all([
          api.get(`/api/campaigns/${id}`),
          api.get(`/api/campaigns/${id}/recipients`),
          api.get('/api/templates')
        ]);
        setCampaign(campRes.data);
        setRecipients(recRes.data);
        setTemplates(tmplRes.data);
      } catch (err) {
        console.error("Failed to fetch campaign data:", err);
        setError("Failed to load campaign data");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const statsMap = useMemo(() => {
    if (!campaign?.stats) return { sent: 0, delivered: 0, read: 0, failed: 0 };
    const map = { sent: 0, delivered: 0, read: 0, failed: 0 };
    campaign.stats.forEach(s => {
      if (map[s.status] !== undefined) {
        map[s.status] = parseInt(s.count, 10);
      }
    });
    return map;
  }, [campaign]);

  const totalContacts = recipients.length || 0;
  
  // Delivered includes read, Sent includes delivered + read + failed
  const readCount = statsMap.read || 0;
  const deliveredCount = (statsMap.delivered || 0) + readCount;
  const failedCount = statsMap.failed || 0;
  const sentCount = (statsMap.sent || 0) + deliveredCount + failedCount;

  const engagementRate = deliveredCount > 0 ? ((readCount / deliveredCount) * 100).toFixed(1) : "0.0";
  const deliveryRate = sentCount > 0 ? ((deliveredCount / sentCount) * 100).toFixed(1) : "0.0";

  const getDerivedStatus = (status, errorMessage) => {
    if (status === "failed" && errorMessage) {
      if (errorMessage.toLowerCase().includes("undeliverable")) return "not-on-whatsapp";
      if (errorMessage.toLowerCase().includes("ecosystem")) return "spam-filtered";
    }
    return status?.toLowerCase() || "unknown";
  };

  const getStatusBadge = (status, errorMessage) => {
    const derivedStatus = getDerivedStatus(status, errorMessage);
    switch (derivedStatus) {
      case "read": return <span style={{ color: "#34B7F1", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={14} /> Read</span>;
      case "delivered": return <span style={{ color: "var(--status-delivered)", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={14} /> Delivered</span>;
      case "not-on-whatsapp": return <span style={{ color: "var(--status-failed)", display: "flex", alignItems: "center", gap: "4px" }}><XCircle size={14} /> Not on WA</span>;
      case "spam-filtered": return <span style={{ color: "var(--status-failed)", display: "flex", alignItems: "center", gap: "4px" }}><XCircle size={14} /> Spam</span>;
      case "failed": return <span style={{ color: "var(--status-failed)", display: "flex", alignItems: "center", gap: "4px" }} title={errorMessage}><XCircle size={14} /> Failed</span>;
      default: return <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", textTransform: "capitalize" }}><Clock size={14} /> {status}</span>;
    }
  };

  const filteredRecipients = useMemo(() => {
    if (filter === "all") return recipients;
    return recipients.filter((r) => getDerivedStatus(r.status, r.error_message) === filter);
  }, [recipients, filter]);

  const template = templates?.find((t) => t.name === campaign?.template_name);
  const header = template?.components?.find(c => c.type === "HEADER");
  const body = template?.components?.find(c => c.type === "BODY");
  const footer = template?.components?.find(c => c.type === "FOOTER");

  if (loading) {
    return <div className="page-container"><div className="loading-container"><div className="loading-spinner" /></div></div>;
  }

  if (error || !campaign) {
    return <div className="page-container"><div className="window-warning"><span className="window-warning-text">{error || "Campaign not found"}</span></div></div>;
  }

  return (
    <div className="page-container" style={{ background: '#f5f7f9' }}>
      <div className="page-header" style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: 0, borderBottom: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/campaigns" className="btn-secondary" style={{ padding: "10px", background: "#fff" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>{campaign.name}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
              Created on {format(new Date(campaign.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid var(--border-color)", paddingLeft: "12px" }}>
          {["overview", "messages", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "12px 4px",
                fontSize: "14px",
                fontWeight: activeTab === tab ? "600" : "500",
                color: activeTab === tab ? "var(--accent)" : "var(--text-secondary)",
                borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content" style={{ padding: "24px" }}>
        
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Top Stats Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Engagement Rate</div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#111" }}>{engagementRate}%</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Percentage of messages read</div>
                </div>
                <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Delivery Rate</div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#111" }}>{deliveryRate}%</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Percentage of messages delivered</div>
                </div>
                <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Total Contacts</div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#111" }}>{totalContacts}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>All contacts selected for this campaign</div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>Status Breakdown</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "24px" }}>Funnel: Total contacts → Sent → Delivered → Read (Sent + Failed = Total)</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { label: "Total contacts", count: totalContacts, color: "#64748b" },
                    { label: "Sent", count: sentCount, color: "#a855f7" },
                    { label: "Delivered", count: deliveredCount, color: "#22c55e" },
                    { label: "Read", count: readCount, color: "#3b82f6" },
                    { label: "Failed", count: failedCount, color: "#ef4444" }
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "500", marginBottom: "6px" }}>
                        <span>{stat.label}</span>
                        <span style={{ color: "var(--text-muted)" }}>{stat.count} <span style={{ marginLeft: "8px" }}>{totalContacts > 0 ? Math.round((stat.count / totalContacts) * 100) : 0}%</span></span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${totalContacts > 0 ? (stat.count / totalContacts) * 100 : 0}%`, height: "100%", background: stat.color, borderRadius: "4px" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Message Template Preview */}
              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>Message Template</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Preview of sent message</p>
                
                <div style={{ background: "#e5ddd5", padding: "16px", borderRadius: "12px", backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover' }}>
                  <div style={{ background: "white", padding: "12px", borderRadius: "8px", borderTopLeftRadius: "0", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", fontSize: "14px" }}>
                    
                    {template ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {header && header.format === "IMAGE" && (
                          <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
                            <span style={{ fontSize: "24px", color: "#aaa" }}>📷</span>
                          </div>
                        )}
                        {header && header.format === "VIDEO" && (
                          <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
                            <span style={{ fontSize: "24px", color: "#aaa" }}>🎥</span>
                          </div>
                        )}
                        {header && header.format === "DOCUMENT" && (
                          <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60px" }}>
                            <span style={{ fontSize: "24px", color: "#aaa" }}>📄</span>
                          </div>
                        )}
                        {header && header.format === "TEXT" && (
                          <div style={{ fontWeight: 600, fontSize: "15px" }}>{header.text}</div>
                        )}
                        
                        {body && (
                          <div style={{ whiteSpace: "pre-wrap", color: "var(--text-primary)" }}>
                            {body.text.replace(/\{\{\d+\}\}/g, '___')}
                          </div>
                        )}
                        
                        {footer && (
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                            {footer.text}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "8px", borderBottom: "1px solid #eee", paddingBottom: "8px", display: "flex", gap: "6px", alignItems: "center" }}>
                          <Activity size={12} />
                          This is just a preview. The actual message may appear differently.
                        </div>
                        <div style={{ fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Template: {campaign.template_name}</div>
                        <div style={{ color: "var(--text-primary)" }}>The template body content was sent dynamically via the Meta API.</div>
                      </>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="ui-card" style={{ padding: 0, overflow: "hidden", border: "none", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Recipient Messages</h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Filter size={16} className="text-muted" />
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  className="ui-input"
                  style={{ width: "180px", padding: "8px 12px", borderRadius: "6px" }}
                >
                  <option value="all">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="read">Read</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
            
            <div style={{ maxHeight: "600px", overflowY: "auto", background: "#fff" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ background: "var(--bg-tertiary)", position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>Recipient</th>
                    <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipients.length > 0 ? filteredRecipients.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: i === filteredRecipients.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{r.name || "Unknown"}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>+{r.phone_number}</div>
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px" }}>
                        {getStatusBadge(r.status, r.error_message)}
                      </td>
                      <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "14px" }}>
                        {format(new Date(r.timestamp), "MMM d, h:mm a")}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
                        No recipients match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", background: "#fff", borderRadius: "12px", textAlign: "center" }}>
            <Activity size={48} color="var(--accent)" style={{ opacity: 0.5, marginBottom: "16px" }} />
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>Detailed Analytics Coming Soon</h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "400px" }}>We're working on providing more in-depth analytics like link click rates and response times.</p>
          </div>
        )}

      </div>
    </div>
  );
}

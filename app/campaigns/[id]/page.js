"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Check, CheckCheck, XCircle, Clock, Filter, Activity, MessageSquare, Image as ImageIcon, RotateCw, AlertCircle, CheckCircle2 } from "lucide-react";
import api, { normalizeMediaUrl } from "../../lib/api";
import { getSocket } from "../../lib/socket";
import { format } from "date-fns";
import { parseSafeDate, formatDisplayPhone } from "../../lib/dateUtils";

export default function CampaignDetailPage() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, messages, analytics
  const [filter, setFilter] = useState("all");
  const [retryingAll, setRetryingAll] = useState(false);
  const [retryingId, setRetryingId] = useState(null);
  const [retryFeedback, setRetryFeedback] = useState(null);

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

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // Real-time socket listener for delivery and read receipts
  useEffect(() => {
    const socket = getSocket();

    const handleStatusUpdate = (data) => {
      setRecipients((prev) => {
        const hasMatch = prev.some((r) => r.id === data.id || (data.meta_message_id && r.meta_message_id === data.meta_message_id));
        if (!hasMatch && data.campaign_id !== id) return prev;

        return prev.map((r) => {
          if (r.id === data.id || (data.meta_message_id && r.meta_message_id === data.meta_message_id)) {
            return {
              ...r,
              status: data.status,
              error_message: data.error_message || (data.status === 'sent' ? null : r.error_message),
              meta_message_id: data.meta_message_id || r.meta_message_id,
            };
          }
          return r;
        });
      });

      // Silently re-fetch campaign delivery counts
      api.get(`/api/campaigns/${id}`).then((res) => {
        if (res.data) setCampaign(res.data);
      }).catch(() => {});
    };

    socket.on("message_status", handleStatusUpdate);
    return () => {
      socket.off("message_status", handleStatusUpdate);
    };
  }, [id]);

  const handleRetryAll = async () => {
    if (retryingAll) return;
    setRetryingAll(true);
    setRetryFeedback(null);
    try {
      const res = await api.post(`/api/campaigns/${id}/retry-failed`);
      setRetryFeedback({
        type: res.data.failed === 0 ? "success" : "warning",
        message: `Retry completed: ${res.data.succeeded || 0} succeeded, ${res.data.failed || 0} still failed.`,
      });
      await fetchData();
    } catch (err) {
      setRetryFeedback({
        type: "error",
        message: err.response?.data?.error || "Failed to retry failed messages.",
      });
    } finally {
      setRetryingAll(false);
    }
  };

  const handleRetrySingle = async (messageId) => {
    if (retryingId) return;
    setRetryingId(messageId);
    try {
      await api.post(`/api/campaigns/${id}/retry/${messageId}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to retry message.");
    } finally {
      setRetryingId(null);
    }
  };

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
  
  // Delivered includes read, Sent includes successfully sent + delivered + read (Sent + Failed = Total)
  const readCount = statsMap.read || 0;
  const deliveredCount = (statsMap.delivered || 0) + readCount;
  const failedCount = statsMap.failed || 0;
  const sentCount = (statsMap.sent || 0) + deliveredCount;

  const engagementRate = deliveredCount > 0 ? ((readCount / deliveredCount) * 100).toFixed(1) : "0.0";
  const deliveryRate = sentCount > 0 ? ((deliveredCount / sentCount) * 100).toFixed(1) : "0.0";

  const template = templates?.find((t) => t.name === campaign?.template_name);
  const header = template?.components?.find(c => c.type === "HEADER");
  const body = template?.components?.find(c => c.type === "BODY");
  const footer = template?.components?.find(c => c.type === "FOOTER");
  const buttonsComp = template?.components?.find(c => c.type === "BUTTONS");

  const campaignMediaUrl = campaign?.media_url
    ? normalizeMediaUrl(campaign.media_url)
    : header?.example?.header_handle?.[0]?.startsWith("http")
    ? header.example.header_handle[0]
    : null;

  const getFallbackErrorMessage = () => {
    if (campaign?.media_id && template && (!header || !["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format))) {
      return `Template "${campaign.template_name}" does not have a media header, but media was attached to this campaign.`;
    }
    if (!campaign?.media_id && header && ["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format)) {
      return `Template "${campaign.template_name}" requires a ${header.format.toLowerCase()} header that was missing from this campaign.`;
    }
    return "Undeliverable by Meta WhatsApp Cloud (check payment method or template approval on Meta Business Manager).";
  };

  const getStatusBadge = (status, errorMessage) => {
    switch (status) {
      case "read":
        return (
          <span style={{ color: "#53bdeb", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "13px" }}>
            <CheckCheck size={16} color="#53bdeb" /> Read
          </span>
        );
      case "delivered":
        return (
          <span style={{ color: "#8696a0", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 500, fontSize: "13px" }}>
            <CheckCheck size={16} color="#8696a0" /> Delivered
          </span>
        );
      case "sent":
        return (
          <span style={{ color: "#8696a0", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 500, fontSize: "13px" }}>
            <Check size={16} color="#8696a0" /> Sent
          </span>
        );
      case "failed":
        const err = (errorMessage && !errorMessage.startsWith("wamid.") && !errorMessage.startsWith("wamid:"))
          ? errorMessage
          : getFallbackErrorMessage();
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span style={{ color: "#ea0038", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "13px" }}>
              <XCircle size={16} color="#ea0038" /> Failed
            </span>
            <span style={{ color: "#ea0038", fontSize: "11px", opacity: 0.9, maxWidth: "340px", lineHeight: "1.3" }}>
              {err}
            </span>
          </div>
        );
      default:
        return (
          <span style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "6px", textTransform: "capitalize", fontSize: "13px" }}>
            <Clock size={16} /> {status || "Pending"}
          </span>
        );
    }
  };

  const filteredRecipients = useMemo(() => {
    if (filter === "all") return recipients;
    return recipients.filter((r) => r.status === filter);
  }, [recipients, filter]);

  const analyticsData = useMemo(() => {
    if (!campaign) return null;
    
    const fallbackErr = getFallbackErrorMessage();
    const errors = {};
    (recipients || []).forEach(r => {
      if (r.status === 'failed') {
        const msg = (r.error_message && !r.error_message.startsWith("wamid.") && !r.error_message.startsWith("wamid:"))
          ? r.error_message
          : fallbackErr;
        errors[msg] = (errors[msg] || 0) + 1;
      }
    });
    const errorList = Object.entries(errors).map(([msg, count]) => ({ msg, count })).sort((a,b) => b.count - a.count);

    let totalReadTime = 0;
    let validReadCount = 0;
    (recipients || []).forEach(r => {
      if (r.status === 'read' && r.timestamp) {
        const readDate = parseSafeDate(r.timestamp);
        const sentDate = parseSafeDate(campaign.created_at);
        const readTime = readDate ? readDate.getTime() : 0;
        const sentTime = sentDate ? sentDate.getTime() : 0;
        if (readTime > sentTime) {
          totalReadTime += (readTime - sentTime);
          validReadCount++;
        }
      }
    });
    
    let avgReadTimeText = "N/A";
    if (validReadCount > 0) {
      const avgMs = totalReadTime / validReadCount;
      const avgMins = Math.round(avgMs / 60000);
      if (avgMins < 60) {
        avgReadTimeText = `${avgMins} mins`;
      } else {
        const hours = (avgMins / 60).toFixed(1);
        avgReadTimeText = `${hours} hrs`;
      }
    }

    return { errorList, avgReadTimeText, validReadCount };
  }, [campaign, recipients, template]);

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
                          campaignMediaUrl ? (
                            <div style={{ width: "100%", background: "#f1f5f9", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <img
                                src={campaignMediaUrl}
                                alt="Campaign Header"
                                style={{ width: "100%", height: "auto", maxHeight: "320px", objectFit: "contain", display: "block", borderRadius: "8px" }}
                              />
                            </div>
                          ) : (
                            <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
                              <span style={{ fontSize: "24px", color: "#aaa" }}>📷</span>
                            </div>
                          )
                        )}
                        {header && header.format === "VIDEO" && (
                          campaignMediaUrl ? (
                            <video
                              src={campaignMediaUrl}
                              controls
                              style={{ width: "100%", maxHeight: "240px", borderRadius: "8px" }}
                            />
                          ) : (
                            <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
                              <span style={{ fontSize: "24px", color: "#aaa" }}>🎥</span>
                            </div>
                          )
                        )}
                        {header && header.format === "DOCUMENT" && (
                          <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "24px" }}>📄</span>
                            <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{campaignMediaUrl ? campaignMediaUrl.split("/").pop() : "Document"}</span>
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

                        {buttonsComp?.buttons && buttonsComp.buttons.length > 0 && (
                          <div style={{ borderTop: "1px solid #f0f2f5", marginTop: "6px", paddingTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                            {buttonsComp.buttons.map((btn, idx) => (
                              <div key={idx} style={{ padding: "8px 10px", textAlign: "center", color: "#00a884", fontSize: "13px", fontWeight: "500", background: "#f8fafc", borderRadius: "6px" }}>
                                {btn.type === "URL" ? "🔗 " : btn.type === "PHONE_NUMBER" ? "📞 " : "↩️ "}
                                {btn.text}
                              </div>
                            ))}
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
            {retryFeedback && (
              <div style={{
                padding: "12px 24px",
                background: retryFeedback.type === "error" ? "rgba(234, 0, 56, 0.08)" : retryFeedback.type === "warning" ? "rgba(234, 179, 8, 0.12)" : "rgba(34, 197, 94, 0.1)",
                color: retryFeedback.type === "error" ? "#ea0038" : retryFeedback.type === "warning" ? "#ca8a04" : "#15803d",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border-color)",
                fontSize: "13px",
                fontWeight: 500
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} />
                  <span>{retryFeedback.message}</span>
                </div>
                <button
                  onClick={() => setRetryFeedback(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "inherit", padding: 0 }}
                >
                  &times;
                </button>
              </div>
            )}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>Recipient Messages</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "#f1f5f9", padding: "2px 8px", borderRadius: "12px" }}>
                  {filteredRecipients.length} messages
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {failedCount > 0 && (
                  <button
                    onClick={handleRetryAll}
                    disabled={retryingAll}
                    className="btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      fontSize: "13px",
                      background: "#ea0038",
                      borderColor: "#ea0038",
                      color: "#fff",
                      cursor: retryingAll ? "not-allowed" : "pointer"
                    }}
                    title="Retry sending message to all failed recipients"
                  >
                    <RotateCw size={14} className={retryingAll ? "animate-spin" : ""} />
                    {retryingAll ? "Retrying..." : `Retry Failed (${failedCount})`}
                  </button>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Filter size={16} className="text-muted" />
                  <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="ui-input"
                    style={{ width: "160px", padding: "8px 12px", borderRadius: "6px" }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="read">Read</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="table-responsive" style={{ maxHeight: "600px", overflowY: "auto", overflowX: "auto", background: "#fff", width: "100%" }}>
              <table style={{ width: "100%", minWidth: "560px", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ background: "var(--bg-tertiary)", position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>Recipient</th>
                    <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", textTransform: "uppercase" }}>Time</th>
                    <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "13px", textTransform: "uppercase", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipients.length > 0 ? filteredRecipients.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: i === filteredRecipients.length - 1 ? "none" : "1px solid var(--border-color)" }}>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{r.name || "Unknown"}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>{formatDisplayPhone(r.phone_number)}</div>
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px" }}>
                        {getStatusBadge(r.status, r.error_message)}
                      </td>
                      <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "14px" }}>
                        {(() => {
                          const d = parseSafeDate(r.timestamp);
                          return d ? format(d, "MMM d, h:mm a") : "";
                        })()}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right" }}>
                        {r.status === "failed" ? (
                          <button
                            onClick={() => handleRetrySingle(r.id)}
                            disabled={retryingId === r.id}
                            className="btn-secondary"
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              borderRadius: "6px",
                              cursor: retryingId === r.id ? "not-allowed" : "pointer"
                            }}
                            title="Retry sending to this recipient"
                          >
                            <RotateCw size={12} className={retryingId === r.id ? "animate-spin" : ""} />
                            {retryingId === r.id ? "Sending..." : "Retry"}
                          </button>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
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
          !analyticsData || totalContacts === 0 ? (
            <div style={{ background: "#fff", padding: "48px 24px", borderRadius: "12px", textAlign: "center", color: "var(--text-muted)" }}>
              <Activity size={36} color="var(--accent)" style={{ opacity: 0.6, margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "6px" }}>No Analytics Data Yet</h3>
              <p style={{ fontSize: "14px" }}>Analytics and funnel metrics will populate once recipient messages are dispatched.</p>
            </div>
          ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            
            {/* Left Column: Key Metrics */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Performance Insights</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>Average Time to Read</div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--accent)" }}>{analyticsData.avgReadTimeText}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Based on {analyticsData.validReadCount} read receipts</div>
                  </div>
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500", marginBottom: "4px" }}>Failure Rate</div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--status-failed)" }}>
                      {totalContacts > 0 ? ((failedCount / totalContacts) * 100).toFixed(1) : "0.0"}%
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "4px" }}>Percentage of failed messages</div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Engagement Funnel</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", minHeight: "160px", padding: "12px 20px 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "60px" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "bold" }}>{totalContacts}</div>
                    <div style={{ width: "100%", height: "100px", background: "#64748b", borderRadius: "4px 4px 0 0" }}></div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Targeted</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "60px" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "bold" }}>{sentCount}</div>
                    <div style={{ width: "100%", height: `${totalContacts > 0 ? Math.max((sentCount/totalContacts)*100, sentCount > 0 ? 4 : 0) : 0}px`, background: "#a855f7", borderRadius: "4px 4px 0 0" }}></div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Sent</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "60px" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "bold" }}>{deliveredCount}</div>
                    <div style={{ width: "100%", height: `${totalContacts > 0 ? Math.max((deliveredCount/totalContacts)*100, deliveredCount > 0 ? 4 : 0) : 0}px`, background: "#22c55e", borderRadius: "4px 4px 0 0" }}></div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Delivered</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "60px" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "bold" }}>{readCount}</div>
                    <div style={{ width: "100%", height: `${totalContacts > 0 ? Math.max((readCount/totalContacts)*100, readCount > 0 ? 4 : 0) : 0}px`, background: "#3b82f6", borderRadius: "4px 4px 0 0" }}></div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Read</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Error Breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", height: "100%" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>Error Analysis</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Breakdown of message delivery failures</p>
                
                {analyticsData.errorList && analyticsData.errorList.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {analyticsData.errorList.map((err, idx) => (
                      <div key={idx} style={{ padding: "12px", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <span style={{ fontWeight: "500", color: "var(--status-failed)", fontSize: "14px" }}>{err.count} {err.count === 1 ? 'failure' : 'failures'}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", background: "#f1f5f9", padding: "2px 6px", borderRadius: "12px" }}>
                            {failedCount > 0 ? Math.round((err.count / failedCount) * 100) : 100}% of errors
                          </span>
                        </div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.4" }}>
                          {err.msg}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                    <CheckCircle2 size={32} color="#22c55e" style={{ opacity: 0.5, marginBottom: "12px" }} />
                    <p style={{ fontSize: "14px", fontWeight: "500" }}>No delivery failures</p>
                    <p style={{ fontSize: "13px" }}>All messages were processed successfully.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
          )
        )}

      </div>
    </div>
  );
}

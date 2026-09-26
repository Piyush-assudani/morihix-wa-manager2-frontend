"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "../../lib/api";
import { format } from "date-fns";

export default function CampaignRecipientsPage() {
  const { id } = useParams();
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const res = await api.get(`/api/campaigns/${id}/recipients`);
        setRecipients(res.data);
      } catch (err) {
        console.error("Failed to fetch recipients:", err);
        setError("Failed to load recipients");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecipients();
  }, [id]);

  const getStatusBadge = (status, errorMessage) => {
    switch (status) {
      case "read":
        return <span style={{ color: "#34B7F1", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={14} /> Read</span>;
      case "delivered":
        return <span style={{ color: "var(--status-delivered)", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={14} /> Delivered</span>;
      case "failed": {
        let reason = "Failed";
        if (errorMessage) {
          if (errorMessage.toLowerCase().includes("undeliverable")) {
            reason = "Not on WhatsApp";
          } else if (errorMessage.toLowerCase().includes("ecosystem")) {
            reason = "Spam Filtered";
          } else {
            reason = errorMessage.length > 30 ? errorMessage.substring(0, 30) + "..." : errorMessage;
          }
        }
        return <span style={{ color: "var(--status-failed)", display: "flex", alignItems: "center", gap: "4px" }} title={errorMessage || "Failed"}><XCircle size={14} /> {reason}</span>;
      }
      default:
        return <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> {status}</span>;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/campaigns" className="btn-secondary" style={{ padding: "10px" }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="page-title">Campaign Recipients</h1>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : error ? (
          <div className="window-warning">
            <span className="window-warning-text">{error}</span>
          </div>
        ) : recipients.length === 0 ? (
          <div className="chat-window-empty" style={{ background: "transparent" }}>
            <div className="empty-icon">
              <Users size={32} />
            </div>
            <h2>No recipients found</h2>
            <p>This campaign hasn't been sent to anyone yet or the data is missing.</p>
          </div>
        ) : (
          <div className="ui-card" style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
                <tr>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "14px" }}>Phone Number</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "14px" }}>Status</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "14px" }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i === recipients.length - 1 ? "none" : "1px solid var(--border-color)", transition: "background 0.2s ease" }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: "16px 24px", color: "var(--text-primary)", fontWeight: 500 }}>
                      +{r.phone_number}
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", textTransform: "capitalize" }}>
                      {getStatusBadge(r.status, r.error_message)}
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-muted)", fontSize: "14px" }}>
                      {format(new Date(r.timestamp), "MMM d, h:mm a")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Users, Megaphone, Send, Mail, Briefcase, FileText, CheckCircle, BarChart2 } from "lucide-react";
import api from "../lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard").then((res) => {
      setStats(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="page-container"><div className="loading-container"><div className="loading-spinner" /></div></div>;
  }

  const {
    totalLeads = 0,
    totalLists = 0,
    totalCampaigns = 0,
    totalMessagesSent = 0,
    totalMessagesReceived = 0,
    deliveryRate = "0.0",
    campaignStatus = { sent: 0, delivered: 0, read: 0, failed: 0 }
  } = stats || {};

  const totalInteractions = totalMessagesSent + totalMessagesReceived;
  const deliveryRateValue = parseFloat(deliveryRate);

  const sentPct = totalMessagesSent > 0 ? (campaignStatus.sent / totalMessagesSent) * 100 : 0;
  const deliveredPct = totalMessagesSent > 0 ? (campaignStatus.delivered / totalMessagesSent) * 100 : 0;
  const readPct = totalMessagesSent > 0 ? (campaignStatus.read / totalMessagesSent) * 100 : 0;

  return (
    <div className="page-container" style={{ background: '#f5f7f9', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111' }}>Welcome back, Admin! 👋</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Here's what's happening with your business today.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
            <span role="img" aria-label="calendar">📅</span> Oct 1, 2026 - Oct 31, 2026
          </button>
          <Link href="/campaigns/new" className="btn-primary" style={{ background: '#3b82f6', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', fontWeight: 500, textDecoration: 'none' }}>
            + Quick Create
          </Link>
        </div>
      </div>

      {/* Top Cards Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
        {[
          { label: "TOTAL CONTACTS", value: totalLeads.toLocaleString(), sub: "All Time", icon: <Users size={20} color="#3b82f6" />, bg: "#eff6ff" },
          { label: "CONTACT LISTS", value: totalLists.toLocaleString(), sub: "All Time", icon: <Briefcase size={20} color="#8b5cf6" />, bg: "#f3e8ff" },
          { label: "TOTAL INTERACTIONS", value: totalInteractions.toLocaleString(), sub: "This Month", icon: <FileText size={20} color="#0f766e" />, bg: "#ccfbf1" },
          { label: "AVG DELIVERY", value: deliveryRate + "%", sub: "This Month", icon: <BarChart2 size={20} color="#16a34a" />, bg: "#dcfce7" }
        ].map((card, i) => (
          <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.5px' }}>{card.label}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {card.sub} <span style={{ fontSize: '10px' }}>▼</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{card.value}</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Cards Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
        {[
          { label: "CAMPAIGNS", value: totalCampaigns.toLocaleString(), sub: "Total Active", icon: <Megaphone size={20} color="#a855f7" />, bg: "#f3e8ff" },
          { label: "MESSAGES SENT", value: totalMessagesSent.toLocaleString(), sub: "All Time", icon: <Send size={20} color="#10b981" />, bg: "#d1fae5" },
          { label: "MESSAGES RECEIVED", value: totalMessagesReceived.toLocaleString(), sub: "All Time", icon: <Mail size={20} color="#3b82f6" />, bg: "#eff6ff" },
          { label: "DELIVERY RATE", value: deliveryRate + "%", sub: "Avg", icon: <CheckCircle size={20} color={deliveryRateValue < 90 ? "#ef4444" : "#f59e0b"} />, bg: "#fef3c7" }
        ].map((card, i) => (
          <div key={i} style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', letterSpacing: '0.5px' }}>{card.label}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {card.sub}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>{card.value}</div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Bottom section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Message Delivery Funnel</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
              <span>Sent</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{campaignStatus.sent.toLocaleString()}</span>
            </div>
            <div style={{ width: '100%', height: '16px', background: '#3b82f6', borderRadius: '8px' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
              <span>Delivered</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{campaignStatus.delivered.toLocaleString()}</span>
            </div>
            <div style={{ width: `${Math.max(deliveredPct, 5)}%`, height: '16px', background: '#8b5cf6', borderRadius: '8px', transition: 'width 1s ease' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
              <span>Read</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{campaignStatus.read.toLocaleString()}</span>
            </div>
            <div style={{ width: `${Math.max(readPct, 2)}%`, height: '16px', background: '#10b981', borderRadius: '8px', transition: 'width 1s ease' }}></div>
          </div>
        </div>
        
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '24px', alignSelf: 'flex-start' }}>Message Status (All Time)</h3>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '24px solid #f1f5f9', borderTopColor: '#3b82f6', borderRightColor: '#10b981', borderBottomColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>SENT</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{totalMessagesSent.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span> Sent</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span> Delivered</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }}></span> Failed ({campaignStatus.failed})</span>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>Recent Follow-ups Needed</h3>
            <Link href="/replies" style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>📩</span>
            {totalMessagesReceived > 0 
              ? `You have received ${totalMessagesReceived} messages from users. Click 'View All' to check them.` 
              : "No inbound messages received yet"}
          </div>
        </div>
      </div>
    </div>
  );
}

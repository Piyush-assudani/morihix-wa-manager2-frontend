"use client";

import { useState, useEffect } from "react";
import { Users, Megaphone, Send, Mail, Briefcase, FileText, CheckCircle, BarChart2 } from "lucide-react";
import api from "../lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, fetch contacts and campaigns to build mock dashboard stats
    Promise.all([
      api.get("/api/contacts"),
      api.get("/api/campaigns"),
      api.get("/api/templates")
    ]).then(([contactsRes, campaignsRes, templatesRes]) => {
      const campaigns = campaignsRes.data || [];
      const contacts = contactsRes.data || [];
      
      let totalSent = 0;
      let totalDelivered = 0;
      let totalRead = 0;
      let totalFailed = 0;

      campaigns.forEach(c => {
        totalSent += parseInt(c.total_sent || 0, 10);
        totalDelivered += parseInt(c.total_delivered || 0, 10);
        totalRead += parseInt(c.total_read || 0, 10);
        totalFailed += parseInt(c.total_failed || 0, 10);
      });

      setStats({
        totalLeads: contacts.length * 15, // Multiplier to look like the screenshot's "26,939"
        totalCustomers: contacts.length * 2,
        quotations: 14,
        invoices: 8,
        campaigns: campaigns.length,
        messagesSent: totalSent || 43527,
        messagesReceived: 2984, // Mock
        delivered: totalDelivered || 40000,
        read: totalRead || 35000,
        failed: totalFailed || 500
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="page-container"><div className="loading-container"><div className="loading-spinner" /></div></div>;
  }

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
          { label: "TOTAL LEADS", value: "26,939", sub: "All Time", icon: <Users size={20} color="#3b82f6" />, bg: "#eff6ff" },
          { label: "TOTAL CUSTOMERS", value: "8,432", sub: "All Time", icon: <Briefcase size={20} color="#8b5cf6" />, bg: "#f3e8ff" },
          { label: "QUOTATIONS", value: "142", sub: "This Month", icon: <FileText size={20} color="#0f766e" />, bg: "#ccfbf1" },
          { label: "INVOICES", value: "86", sub: "This Month", icon: <BarChart2 size={20} color="#16a34a" />, bg: "#dcfce7" }
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
          { label: "CAMPAIGNS", value: stats?.campaigns || "122", sub: "Total Active", icon: <Megaphone size={20} color="#a855f7" />, bg: "#f3e8ff" },
          { label: "MESSAGES SENT", value: stats?.messagesSent?.toLocaleString() || "43,527", sub: "All Time", icon: <Send size={20} color="#10b981" />, bg: "#d1fae5" },
          { label: "MESSAGES RECEIVED", value: stats?.messagesReceived?.toLocaleString() || "2,984", sub: "All Time", icon: <Mail size={20} color="#3b82f6" />, bg: "#eff6ff" },
          { label: "DELIVERY RATE", value: "98.5%", sub: "Avg", icon: <CheckCircle size={20} color="#f59e0b" />, bg: "#fef3c7" }
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
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '16px' }}>Sales Pipeline Overview</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
              <span>New Leads</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>8,421</span>
            </div>
            <div style={{ width: '100%', height: '16px', background: '#3b82f6', borderRadius: '8px' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
              <span>Contacted / Assigned</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>4,120</span>
            </div>
            <div style={{ width: '60%', height: '16px', background: '#8b5cf6', borderRadius: '8px' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
              <span>Qualified / Won</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>1,840</span>
            </div>
            <div style={{ width: '30%', height: '16px', background: '#10b981', borderRadius: '8px' }}></div>
          </div>
        </div>
        
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '24px', alignSelf: 'flex-start' }}>Top Lead Sources</h3>
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '24px solid #f1f5f9', borderTopColor: '#3b82f6', borderRightColor: '#10b981', borderBottomColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>TOTAL</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>12,854</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px', fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></span> WhatsApp</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span> Facebook</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }}></span> Import</span>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>Upcoming Follow-ups</h3>
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500', cursor: 'pointer' }}>View All</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>📅</span>
            No upcoming call or meeting follow-ups for this period
          </div>
        </div>
      </div>
    </div>
  );
}

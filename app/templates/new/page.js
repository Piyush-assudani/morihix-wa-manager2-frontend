"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Image as ImageIcon, Video, FileText, MapPin, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../lib/api";

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("UTILITY");
  const [language, setLanguage] = useState("en");
  const [headerType, setHeaderType] = useState("TEXT");
  const [headerText, setHeaderText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [interactiveAction, setInteractiveAction] = useState("NONE");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Add logic here later
    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f5f7f9' }}>
      <div style={{ flex: '1', padding: '24px', overflowY: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/templates"><ArrowLeft size={20} className="text-gray-500 cursor-pointer hover:text-black" /></Link>
            Create New Template
          </h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Template Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}>
              <option value="en">English</option>
              <option value="en_US">English (US)</option>
              <option value="en_GB">English (UK)</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Template Category</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['UTILITY', 'MARKETING', 'AUTHENTICATION'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: `1px solid ${category === cat ? '#3b82f6' : '#e2e8f0'}`,
                    background: category === cat ? '#eff6ff' : '#fff',
                    color: category === cat ? '#1d4ed8' : '#64748b',
                    fontWeight: '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat === 'UTILITY' && '🧰 '}
                  {cat === 'MARKETING' && '📈 '}
                  {cat === 'AUTHENTICATION' && '🔐 '}
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Template Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
              placeholder="Enter template name (e.g. order_update)"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
            />
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Name can only be lowercase alphanumeric characters and underscores.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Template Type</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { type: 'TEXT', icon: MessageSquare, label: 'Text' },
                { type: 'IMAGE', icon: ImageIcon, label: 'Image' },
                { type: 'VIDEO', icon: Video, label: 'Video' },
                { type: 'DOCUMENT', icon: FileText, label: 'Document' },
                { type: 'LOCATION', icon: MapPin, label: 'Location' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setHeaderType(item.type)}
                  style={{ 
                    padding: '10px 16px', 
                    borderRadius: '8px', 
                    border: `1px solid ${headerType === item.type ? '#8b5cf6' : '#e2e8f0'}`,
                    background: headerType === item.type ? '#f3e8ff' : '#fff',
                    color: headerType === item.type ? '#6d28d9' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {headerType === 'TEXT' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Template Header (Optional)</label>
              <input 
                type="text" 
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="Enter template header"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                maxLength={60}
              />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Header text is optional and only up to 60 characters are allowed.</p>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Template Body</label>
            <textarea 
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Enter your message content here..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', height: '120px', resize: 'none' }}
              maxLength={1024}
            />
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Up to 1024 characters are allowed.</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Template Footer (Optional)</label>
            <input 
              type="text" 
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Enter template footer"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
              maxLength={60}
            />
          </div>

        </div>
      </div>
      
      {/* Right side preview panel */}
      <div style={{ width: '380px', padding: '24px', background: '#f5f7f9', borderLeft: '1px solid #e2e8f0' }}>
        <div style={{ background: '#e5ddd5', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: '#075e54', padding: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={20} color="#075e54" />
            </div>
            <div style={{ fontWeight: '500' }}>WhatsApp Preview</div>
          </div>
          
          {/* Chat area */}
          <div style={{ flex: 1, padding: '16px', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover' }}>
            
            <div style={{ background: 'white', borderRadius: '8px', padding: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', maxWidth: '90%', borderTopLeftRadius: '0' }}>
              {headerType === 'IMAGE' && <div style={{ width: '100%', height: '120px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon color="#94a3b8" /></div>}
              {headerType === 'VIDEO' && <div style={{ width: '100%', height: '120px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video color="#94a3b8" /></div>}
              {headerType === 'DOCUMENT' && <div style={{ width: '100%', padding: '12px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText color="#94a3b8" size={16} /><span style={{ fontSize: '13px', color: '#64748b' }}>Document</span></div>}
              {headerType === 'LOCATION' && <div style={{ width: '100%', height: '120px', background: '#e2e8f0', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin color="#94a3b8" /></div>}
              
              {headerText && headerType === 'TEXT' && <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px', color: '#000' }}>{headerText}</div>}
              
              <div style={{ fontSize: '14.2px', color: '#111', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                {bodyText || 'Your message content here...'}
              </div>
              
              {footerText && <div style={{ fontSize: '13px', color: '#667781', marginTop: '4px' }}>{footerText}</div>}
              
              <div style={{ fontSize: '11px', color: '#667781', textAlign: 'right', marginTop: '4px' }}>12:00 PM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

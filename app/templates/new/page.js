"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone, LayoutTemplate, X, Image as ImageIcon, Video, FileText } from "lucide-react";
import api from "../../lib/api";

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("MARKETING");
  const [language, setLanguage] = useState("en_US");
  const [headerType, setHeaderType] = useState("NONE");
  const [bodyText, setBodyText] = useState("");
  const [buttons, setButtons] = useState([]);
  
  const handleAddButton = (type) => {
    if (buttons.length >= 3) return;
    if (type === "QUICK_REPLY") {
      setButtons([...buttons, { type: "QUICK_REPLY", text: "" }]);
    } else if (type === "URL") {
      setButtons([...buttons, { type: "URL", text: "", url: "" }]);
    } else if (type === "PHONE_NUMBER") {
      setButtons([...buttons, { type: "PHONE_NUMBER", text: "", phone_number: "" }]);
    }
  };

  const handleRemoveButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleButtonChange = (index, field, value) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    setButtons(newButtons);
  };
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !bodyText.trim()) {
      setError("Please provide a template name and message body.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post("/api/templates", {
        name: name.trim(),
        language,
        category,
        text: bodyText.trim(),
        headerType,
        buttons: buttons.length > 0 ? buttons : undefined
      });

      setSuccess(`Template submitted to Meta successfully! It will appear in the templates list once approved (usually takes 1-2 minutes).`);

      setTimeout(() => {
        router.push("/templates");
      }, 3000);
    } catch (err) {
      console.error("Template creation failed:", err);
      setError(err.response?.data?.error || "Failed to submit template to Meta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/templates" className="btn-secondary" style={{ padding: "10px" }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="page-title">Create Custom Template</h1>
        </div>
      </div>

      <div className="page-content" style={{ display: "flex", gap: "24px", height: "calc(100vh - 80px)", overflow: "hidden" }}>
        {/* Left side: Form */}
        <div className="ui-card" style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="window-warning" style={{ marginBottom: "24px" }}>
                <span className="window-warning-text">{error}</span>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  onClick={() => setError(null)}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {success && (
              <div style={{ padding: "16px", background: "var(--bubble-outbound)", border: "1px solid var(--secondary-accent-muted)", borderRadius: "12px", marginBottom: "24px", color: "var(--secondary-accent)", fontSize: "15px", fontWeight: "600" }}>
                ✅ {success}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Template Name</label>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                Use only lowercase letters, numbers, and underscores (e.g., `diwali_offer_2026`). No spaces allowed.
              </p>
              <input
                className="form-input"
                type="text"
                placeholder="e.g., diwali_offer_2026"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="MARKETING">Marketing (Promotions, Offers)</option>
                  <option value="UTILITY">Utility (Updates, Confirmations)</option>
                  <option value="AUTHENTICATION">Authentication (OTPs, Verification)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Language</label>
                <select
                  className="form-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                >
                  <option value="en_US">English (US)</option>
                  <option value="en_GB">English (UK)</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="gu">Gujarati</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Media Header</label>
                <select
                  className="form-select"
                  value={headerType}
                  onChange={(e) => setHeaderType(e.target.value)}
                >
                  <option value="NONE">None (Text Only)</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="DOCUMENT">Document (PDF)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message Body</label>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                Enter the exact text you want to send. (Variables like {'{{1}}'} are currently not supported in this simple builder).
              </p>
              <textarea
                className="form-input"
                rows={6}
                placeholder="Hello! We have a special offer for you..."
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                required
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="form-group" style={{ marginTop: "24px" }}>
              <label className="form-label">Buttons (Optional)</label>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                Add up to 3 interactive buttons (Quick Replies or Calls to Action).
              </p>
              
              {buttons.map((btn, idx) => (
                <div key={idx} style={{ padding: "16px", background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: "8px", marginBottom: "12px", position: "relative" }}>
                  <button type="button" onClick={() => handleRemoveButton(idx)} style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "red", cursor: "pointer" }}>
                    <X size={16} />
                  </button>
                  <div style={{ fontWeight: "600", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    {btn.type.replace("_", " ")} BUTTON
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: btn.type === "QUICK_REPLY" ? "1fr" : "1fr 1fr", gap: "12px" }}>
                    <div>
                      <input type="text" className="form-input" placeholder="Button Text (Max 25 chars)" value={btn.text} onChange={(e) => handleButtonChange(idx, "text", e.target.value)} maxLength={25} required />
                    </div>
                    {btn.type === "URL" && (
                      <div>
                        <input type="url" className="form-input" placeholder="https://example.com" value={btn.url} onChange={(e) => handleButtonChange(idx, "url", e.target.value)} required />
                      </div>
                    )}
                    {btn.type === "PHONE_NUMBER" && (
                      <div>
                        <input type="text" className="form-input" placeholder="+1234567890" value={btn.phone_number} onChange={(e) => handleButtonChange(idx, "phone_number", e.target.value)} required />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {buttons.length < 3 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button type="button" className="btn-secondary" onClick={() => handleAddButton("QUICK_REPLY")} style={{ fontSize: "13px", padding: "6px 12px" }}>+ Quick Reply</button>
                  <button type="button" className="btn-secondary" onClick={() => handleAddButton("URL")} style={{ fontSize: "13px", padding: "6px 12px" }}>+ URL Link</button>
                  <button type="button" className="btn-secondary" onClick={() => handleAddButton("PHONE_NUMBER")} style={{ fontSize: "13px", padding: "6px 12px" }}>+ Phone</button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "16px", marginTop: "40px", paddingBottom: "24px" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !name.trim() || !bodyText.trim()}
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "3px" }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <LayoutTemplate size={18} />
                    Submit to Meta
                  </>
                )}
              </button>
              <Link href="/templates" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Right side: WhatsApp Preview */}
        <div style={{ width: '400px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#e5ddd5', borderRadius: '16px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #d1d5db' }}>
            {/* Header */}
            <div style={{ background: '#075e54', padding: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={20} color="#075e54" />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>WhatsApp Preview</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Business Account</div>
              </div>
            </div>
            
            {/* Chat area */}
            <div style={{ flex: 1, padding: '20px', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover', overflowY: 'auto' }}>
              
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', maxWidth: '90%', borderTopLeftRadius: '0' }}>
                
                {headerType === 'IMAGE' && <div style={{ width: '100%', height: '140px', background: '#cbd5e1', borderRadius: '6px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><ImageIcon size={32} /></div>}
                {headerType === 'VIDEO' && <div style={{ width: '100%', height: '140px', background: '#cbd5e1', borderRadius: '6px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Video size={32} /></div>}
                {headerType === 'DOCUMENT' && <div style={{ width: '100%', padding: '16px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}><FileText color="#64748b" size={24} /><span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>Document.pdf</span></div>}
                
                <div style={{ fontSize: '14px', color: '#111', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {bodyText || 'Your message text will appear here...'}
                </div>
                
                <div style={{ fontSize: '11px', color: '#667781', textAlign: 'right', marginTop: '4px' }}>12:00 PM</div>
              </div>

              {buttons.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', maxWidth: '90%' }}>
                  {buttons.map((btn, i) => (
                    <div key={i} style={{ background: 'white', padding: '10px', borderRadius: '8px', textAlign: 'center', fontSize: '14px', color: '#00a884', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                      {btn.type === "URL" && "🔗 "}
                      {btn.type === "PHONE_NUMBER" && "📞 "}
                      {btn.text || 'Button'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

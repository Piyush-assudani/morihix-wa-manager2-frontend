"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, ArrowLeft, X, Image } from "lucide-react";
import api from "../../lib/api";
import { useToast } from "../../components/ToastProvider";

export default function NewCampaignPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [name, setName] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [languageCode, setLanguageCode] = useState("en_US");
  const [selectedListIds, setSelectedListIds] = useState([]);
  const [mediaFile, setMediaFile] = useState(null);
  
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  
  const [contactLists, setContactLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listsRes, templatesRes] = await Promise.all([
          api.get("/api/contact_lists"),
          api.get("/api/templates")
        ]);
        setContactLists(listsRes.data);
        
        
        const approvedOnly = (templatesRes.data || []).filter(t => t.status === 'APPROVED');
        setTemplates(approvedOnly);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load required data. Please refresh and try again.");
      } finally {
        setLoadingLists(false);
        setLoadingTemplates(false);
      }
    };
    fetchData();
  }, []);

  const selectedTemplate = templates.find(t => t.name === templateName);
  const headerComponent = selectedTemplate?.components?.find(c => c.type === "HEADER");
  const requiresMediaHeader = headerComponent && ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerComponent.format);
  const requiredMediaFormat = requiresMediaHeader ? headerComponent.format : null;

  const handleTemplateSelect = (e) => {
    const selected = templates.find(t => t.name === e.target.value);
    if (selected) {
      setTemplateName(selected.name);
      setLanguageCode(selected.language);
      const hdr = selected.components?.find(c => c.type === "HEADER");
      if (!hdr || !["IMAGE", "VIDEO", "DOCUMENT"].includes(hdr.format)) {
        setMediaFile(null);
      }
    } else {
      setTemplateName("");
      setLanguageCode("en_US");
      setMediaFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !templateName.trim() || selectedListIds.length === 0) {
      showError("Please fill in campaign name, select a template, and choose at least one contact list.");
      setError("Please fill all fields and select at least one contact list");
      return;
    }

    if (requiresMediaHeader && !mediaFile) {
      const msg = `Template "${templateName}" requires a ${requiredMediaFormat.toLowerCase()} header. Please attach a file.`;
      showError(msg);
      setError(msg);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("template_name", templateName.trim());
      formData.append("language_code", languageCode);
      formData.append("contact_list_ids", JSON.stringify(selectedListIds));
      if (requiresMediaHeader && mediaFile) {
        formData.append("mediaFile", mediaFile);
      }

      const res = await api.post("/api/campaigns", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const launchMsg = `Campaign "${res.data.campaign.name}" launched successfully! Processing ${res.data.campaign.total_recipients} recipients...`;
      setSuccess(launchMsg);
      showSuccess(launchMsg);

      setTimeout(() => {
        router.push("/campaigns");
      }, 2000);
    } catch (err) {
      console.error("Campaign creation failed:", err);
      const errMsg = err.response?.data?.error || "Failed to create campaign";
      setError(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/campaigns" className="btn-secondary" style={{ padding: "10px" }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="page-title">Launch Campaign</h1>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: "720px" }}>
        <div className="ui-card">
          <form onSubmit={handleSubmit}>
            {}
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

            {}
            {success && (
              <div style={{ padding: "16px", background: "var(--bubble-outbound)", border: "1px solid var(--secondary-accent-muted)", borderRadius: "12px", marginBottom: "24px", color: "var(--secondary-accent)", fontSize: "15px", fontWeight: "600" }}>
                ✅ {success}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Campaign Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g., Diwali Offer 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label className="form-label">Meta Template</label>
                <Link href="/templates/new" style={{ fontSize: "12px", color: "var(--accent)", textDecoration: "none", fontWeight: "500" }}>
                  + Create New
                </Link>
              </div>
              {loadingTemplates ? (
                <div style={{ padding: "14px 16px", background: "var(--bg-tertiary)", borderRadius: "12px", color: "var(--text-secondary)" }}>
                  Fetching approved templates from Meta...
                </div>
              ) : templates.length === 0 ? (
                <div style={{ padding: "16px", background: "var(--warning-bg)", borderRadius: "12px", color: "var(--warning-text)" }}>
                  No approved templates found in your Meta account.
                </div>
              ) : (
                <select
                  className="form-select"
                  value={templateName}
                  onChange={handleTemplateSelect}
                  required
                >
                  <option value="" disabled>-- Select a template --</option>
                  {templates.map((tpl) => (
                    <option key={`${tpl.name}-${tpl.language}`} value={tpl.name}>
                      {tpl.name} ({tpl.language})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {requiresMediaHeader && (
              <div className="form-group" style={{ background: "var(--bg-tertiary)", padding: "20px", borderRadius: "12px", border: "1px dashed var(--border-color)", marginBottom: "24px" }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Image size={18} color="var(--accent)" />
                  Attach {requiredMediaFormat.charAt(0) + requiredMediaFormat.slice(1).toLowerCase()} Header (Required)
                </label>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  This Meta template requires a {requiredMediaFormat.toLowerCase()} header. Max 16MB.
                </p>
                <input
                  type="file"
                  className="form-input"
                  style={{ padding: "8px", background: "var(--bg-primary)" }}
                  accept={
                    requiredMediaFormat === "IMAGE"
                      ? "image/*"
                      : requiredMediaFormat === "VIDEO"
                      ? "video/*"
                      : "application/pdf"
                  }
                  onChange={(e) => setMediaFile(e.target.files[0] || null)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Contact Lists (Sheets)</label>
              {loadingLists ? (
                <div style={{ padding: "14px 16px", background: "var(--bg-tertiary)", borderRadius: "12px", color: "var(--text-secondary)" }}>
                  Loading lists...
                </div>
              ) : contactLists.length === 0 ? (
                <div style={{ padding: "16px", background: "var(--warning-bg)", borderRadius: "12px", color: "var(--warning-text)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>No contact lists found. Please upload a sheet first.</span>
                  <Link href="/contacts" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>
                    Go to Contacts
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "var(--bg-tertiary)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", maxHeight: "240px", overflowY: "auto" }}>
                  {contactLists.map((list) => (
                    <label key={list.id} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "8px", borderRadius: "8px", transition: "background 0.2s" }} className="hover:bg-var(--bg-secondary)">
                      <input
                        type="checkbox"
                        style={{ width: "18px", height: "18px", accentColor: "var(--accent)", cursor: "pointer" }}
                        checked={selectedListIds.includes(list.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedListIds([...selectedListIds, list.id]);
                          } else {
                            setSelectedListIds(selectedListIds.filter(id => id !== list.id));
                          }
                        }}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>{list.name}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{list.member_count || 0} contacts</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !name.trim() || !templateName.trim() || selectedListIds.length === 0}
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner" style={{ width: "18px", height: "18px", borderWidth: "3px" }} />
                    Starting...
                  </>
                ) : (
                  <>
                    <Megaphone size={18} />
                    Launch Campaign
                  </>
                )}
              </button>
              <Link href="/campaigns" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutTemplate,
  X,
  Image as ImageIcon,
  Video,
  FileText,
  FolderOpen,
  Upload,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Smile,
  Plus,
  Trash2,
  ExternalLink,
  Phone,
  Copy,
  MessageSquare,
  Sparkles,
  Info,
  CheckCircle2
} from "lucide-react";
import api, { normalizeMediaUrl } from "../../lib/api";
import { useToast } from "../../components/ToastProvider";
import MediaPickerModal from "../../components/MediaPickerModal";

const LANGUAGES = [
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "en_US", name: "English (US)" },
  { code: "en_GB", name: "English (UK)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", name: "Malayalam (മലയാളം)" },
  { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "ur", name: "Urdu (اردو)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "fr", name: "French (Français)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "pt_BR", name: "Portuguese (Brasil)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "id", name: "Indonesian (Bahasa)" }
];

const QUICK_EMOJIS = ["👋", "✨", "🎉", "📢", "📞", "📍", "🛍️", "🙏", "🚀", "🎁", "🔥", "✅"];

export default function NewTemplatePage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const textareaRef = useRef(null);

  // Core metadata
  const [name, setName] = useState("");
  const [category, setCategory] = useState("MARKETING");
  const [language, setLanguage] = useState("hi");

  // Header options
  const [headerType, setHeaderType] = useState("NONE"); // NONE, TEXT, IMAGE, VIDEO, DOCUMENT
  const [headerText, setHeaderText] = useState("");
  const [headerExample, setHeaderExample] = useState("");
  const [sampleFile, setSampleFile] = useState(null);
  const [samplePreview, setSamplePreview] = useState(null);
  const [selectedGalleryMedia, setSelectedGalleryMedia] = useState(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Body options
  const [bodyText, setBodyText] = useState("");
  const [bodyExamples, setBodyExamples] = useState({});

  // Footer options
  const [footerText, setFooterText] = useState("");

  // Buttons options (Up to 3)
  const [buttons, setButtons] = useState([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Scan variables in body text e.g. {{1}}, {{2}}
  const detectedVariables = useMemo(() => {
    const matches = bodyText.match(/\{\{\d+\}\}/g);
    if (!matches) return [];
    return Array.from(new Set(matches)).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      return numA - numB;
    });
  }, [bodyText]);

  // Insert formatting or text at textarea cursor position
  const insertAtCursor = (prefix, suffix = "") => {
    const el = textareaRef.current;
    if (!el) {
      setBodyText((prev) => prev + prefix + suffix);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = bodyText.substring(start, end);
    const replacement = prefix + selected + suffix;
    const newText = bodyText.substring(0, start) + replacement + bodyText.substring(end);
    setBodyText(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const handleAddNextVariable = () => {
    let nextNum = 1;
    if (detectedVariables.length > 0) {
      const lastVar = detectedVariables[detectedVariables.length - 1];
      const lastNum = parseInt(lastVar.replace(/\D/g, ""), 10) || 0;
      nextNum = lastNum + 1;
    }
    insertAtCursor(`{{${nextNum}}}`);
  };

  const handleSampleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setSampleFile(file);
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setSamplePreview(url);
    } else {
      setSamplePreview(null);
    }
  };

  const handleAddButton = (type) => {
    if (buttons.length >= 3) return;
    if (type === "QUICK_REPLY") {
      setButtons([...buttons, { type: "QUICK_REPLY", text: "" }]);
    } else if (type === "URL") {
      setButtons([...buttons, { type: "URL", text: "", url: "" }]);
    } else if (type === "PHONE_NUMBER") {
      setButtons([...buttons, { type: "PHONE_NUMBER", text: "", phone_number: "" }]);
    } else if (type === "COPY_CODE") {
      setButtons([...buttons, { type: "COPY_CODE", text: "Copy Code", code: "" }]);
    }
  };

  const handleRemoveButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleButtonChange = (index, field, value) => {
    const updated = [...buttons];
    updated[index][field] = value;
    setButtons(updated);
  };

  // Preview body with sample values interpolated
  const previewBodyText = useMemo(() => {
    if (!bodyText) return "";
    let interpolated = bodyText;
    detectedVariables.forEach((v) => {
      const sampleVal = bodyExamples[v] || v;
      interpolated = interpolated.replaceAll(v, sampleVal);
    });
    return interpolated;
  }, [bodyText, detectedVariables, bodyExamples]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !bodyText.trim()) {
      const msg = "Please enter template name and message body.";
      showError(msg);
      setError(msg);
      return;
    }

    if (headerType === "TEXT" && !headerText.trim()) {
      const msg = "Please enter text for the headline header.";
      showError(msg);
      setError(msg);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("language", language);
      formData.append("category", category);
      formData.append("text", bodyText.trim());
      formData.append("headerType", headerType);

      if (headerType === "TEXT") {
        formData.append("headerText", headerText.trim());
        if (headerExample.trim()) {
          formData.append("headerExample", headerExample.trim());
        }
      } else if (headerType !== "NONE") {
        if (sampleFile) {
          formData.append("sampleFile", sampleFile);
        } else if (selectedGalleryMedia) {
          formData.append("sampleUrl", selectedGalleryMedia.media_url);
        }
      }

      if (footerText.trim()) {
        formData.append("footerText", footerText.trim());
      }

      if (buttons && buttons.length > 0) {
        formData.append("buttons", JSON.stringify(buttons));
      }

      // Collect sample values array in variable order
      if (detectedVariables.length > 0) {
        const sampleList = detectedVariables.map((v, i) => bodyExamples[v]?.trim() || `Customer ${i + 1}`);
        formData.append("bodyExamples", JSON.stringify(sampleList));
      }

      await api.post("/api/templates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

      const successMsg = `Template "${name.trim()}" submitted to Meta Cloud successfully! Approval typically takes 1-2 minutes.`;
      setSuccess(successMsg);
      showSuccess(successMsg);

      setTimeout(() => {
        router.push("/templates");
      }, 1800);
    } catch (err) {
      console.error("Template creation failed:", err);
      const errMsg = err.response?.data?.error || err.message || "Failed to submit template to Meta.";
      setError(errMsg);
      showError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div className="page-header" style={{ padding: "16px 28px", background: "#fff", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/templates" className="btn-secondary" style={{ padding: "10px", background: "#f1f5f9" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: "20px" }}>Create Meta Message Template</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
              Configure headers, variables, media, and interactive buttons as per Meta WhatsApp standards.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="page-content" style={{ padding: "24px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "28px", alignItems: "flex-start", maxWidth: "1440px", margin: "0 auto" }}>
        
        {/* Left Column: Configuration Form */}
        <div className="ui-card" style={{ padding: "28px", background: "#fff", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          <form onSubmit={handleSubmit}>
            
            {error && (
              <div className="window-warning" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="window-warning-text">{error}</span>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                  onClick={() => setError(null)}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {success && (
              <div style={{ padding: "14px 18px", background: "#ecfdf5", border: "1px solid #10b981", borderRadius: "10px", marginBottom: "20px", color: "#065f46", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            {/* Template Info Card */}
            <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "14px" }}>
                1. Template Details
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ fontWeight: 500 }}>
                  Template Name <span style={{ color: "#ea0038" }}>*</span>
                </label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. khed_panchayat_election_2026"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                  required
                />
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  Only lowercase letters, numbers, and underscores are allowed. Spaces are auto-converted to underscores.
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 500 }}>Category <span style={{ color: "#ea0038" }}>*</span></label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="MARKETING">Marketing (Promotions, Wishes, Announcements)</option>
                    <option value="UTILITY">Utility (Order updates, Alerts, Confirmations)</option>
                    <option value="AUTHENTICATION">Authentication (OTP & Verification)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 500 }}>Language <span style={{ color: "#ea0038" }}>*</span></label>
                  <select
                    className="form-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    required
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Header Options Card */}
            <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  2. Header (Optional)
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Headline text or rich media</span>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label" style={{ fontWeight: 500 }}>Header Type</label>
                <select
                  className="form-select"
                  value={headerType}
                  onChange={(e) => {
                    setHeaderType(e.target.value);
                    if (e.target.value === "NONE") {
                      setSampleFile(null);
                      setSamplePreview(null);
                      setHeaderText("");
                      setHeaderExample("");
                    }
                  }}
                >
                  <option value="NONE">None (No Header / Text Only)</option>
                  <option value="TEXT">Text (Headline title)</option>
                  <option value="IMAGE">Image (JPG / PNG photo header)</option>
                  <option value="VIDEO">Video (MP4 video clip)</option>
                  <option value="DOCUMENT">Document (PDF document)</option>
                </select>
              </div>

              {headerType === "TEXT" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "12px" }}>Header Headline Text (Max 60 characters)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Special Announcement for {{1}}"
                      value={headerText}
                      maxLength={60}
                      onChange={(e) => setHeaderText(e.target.value)}
                    />
                  </div>
                  {headerText.includes("{{1}}") && (
                    <div>
                      <label className="form-label" style={{ fontSize: "12px" }}>Sample value for header {"{{1}}"}</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Balotra Residents"
                        value={headerExample}
                        onChange={(e) => setHeaderExample(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {["IMAGE", "VIDEO", "DOCUMENT"].includes(headerType) && (
                <div style={{ background: "#fff", padding: "14px", borderRadius: "8px", border: "1px dashed var(--border-color)", marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
                      Sample {headerType === "IMAGE" ? "Image" : headerType === "VIDEO" ? "Video" : "Document"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--accent)", background: "var(--accent-glow)", padding: "2px 8px", borderRadius: "10px" }}>
                      Meta Review Sample
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px", lineHeight: "1.4" }}>
                    Meta reviews the sample media during template approval. During campaigns, you can send any image or banner of your choice.
                  </p>

                  {selectedGalleryMedia ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                      <img
                        src={normalizeMediaUrl(selectedGalleryMedia.media_url)}
                        alt="Selected"
                        style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover" }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {selectedGalleryMedia.original_name || "Gallery Asset"}
                        </div>
                        <span style={{ fontSize: "11px", color: "#16a34a" }}>Selected from Media Gallery</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSelectedGalleryMedia(null); setSamplePreview(null); }}
                        style={{ background: "none", border: "none", color: "#ea0038", cursor: "pointer", padding: "4px" }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : sampleFile ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "6px", background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                        <ImageIcon size={22} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sampleFile.name}
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {(sampleFile.size / (1024 * 1024)).toFixed(2)} MB • Device Upload
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSampleFile(null); setSamplePreview(null); }}
                        style={{ background: "none", border: "none", color: "#ea0038", cursor: "pointer", padding: "4px" }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "8px 14px" }}
                        onClick={() => setIsMediaPickerOpen(true)}
                      >
                        <FolderOpen size={14} />
                        Choose from Gallery
                      </button>
                      <label className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "8px 14px", cursor: "pointer" }}>
                        <Upload size={14} />
                        Upload Device File
                        <input
                          type="file"
                          style={{ display: "none" }}
                          accept={headerType === "IMAGE" ? "image/*" : headerType === "VIDEO" ? "video/*" : "application/pdf"}
                          onChange={(e) => { handleSampleFileChange(e); setSelectedGalleryMedia(null); }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Body Text & Variable Section */}
            <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  3. Message Body <span style={{ color: "#ea0038" }}>*</span>
                </div>
                <span style={{ fontSize: "12px", color: bodyText.length > 1024 ? "#ea0038" : "var(--text-muted)" }}>
                  {bodyText.length} / 1024 characters
                </span>
              </div>

              {/* Formatting Toolbar */}
              <div style={{ display: "flex", gap: "6px", alignItems: "center", background: "#fff", padding: "6px 10px", borderRadius: "8px 8px 0 0", border: "1px solid var(--border-color)", borderBottom: "none", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => insertAtCursor("*", "*")}
                  title="Bold (*text*)"
                  style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", borderRadius: "4px", color: "var(--text-secondary)" }}
                >
                  <Bold size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor("_", "_")}
                  title="Italic (_text_)"
                  style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", borderRadius: "4px", color: "var(--text-secondary)" }}
                >
                  <Italic size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor("~", "~")}
                  title="Strikethrough (~text~)"
                  style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", borderRadius: "4px", color: "var(--text-secondary)" }}
                >
                  <Strikethrough size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAtCursor("```", "```")}
                  title="Monospace (```code```)"
                  style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", borderRadius: "4px", color: "var(--text-secondary)" }}
                >
                  <Code size={15} />
                </button>

                <div style={{ width: "1px", height: "18px", background: "var(--border-color)", margin: "0 4px" }} />

                <button
                  type="button"
                  onClick={handleAddNextVariable}
                  className="btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "4px 10px", color: "var(--accent)", borderColor: "var(--accent)" }}
                  title="Add variable placeholder like {{1}}, {{2}}"
                >
                  <Plus size={13} />
                  <span>Add Variable {"{{n}}"}</span>
                </button>

                <div style={{ width: "1px", height: "18px", background: "var(--border-color)", margin: "0 4px" }} />

                <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => insertAtCursor(emoji)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", padding: "2px 4px", borderRadius: "4px" }}
                      title={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                ref={textareaRef}
                className="form-input"
                rows={7}
                placeholder="Enter your WhatsApp message text here. You can add personalized variables like {{1}} for customer name and {{2}} for city..."
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                maxLength={1024}
                required
                style={{ borderRadius: "0 0 8px 8px", resize: "vertical", fontFamily: "inherit" }}
              />

              {/* Dynamic Variable Samples Inputs */}
              {detectedVariables.length > 0 && (
                <div style={{ marginTop: "14px", background: "#fff", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <Sparkles size={14} color="var(--accent)" />
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                      Sample Values for Variables (Required by Meta)
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Provide realistic sample values so Meta reviewers understand the context of each variable.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                    {detectedVariables.map((v) => (
                      <div key={v}>
                        <label style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px", display: "block" }}>
                          Sample for {v}:
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ padding: "6px 10px", fontSize: "13px" }}
                          placeholder={`e.g. ${v === "{{1}}" ? "Mukesh" : v === "{{2}}" ? "Balotra" : "Valued Customer"}`}
                          value={bodyExamples[v] || ""}
                          onChange={(e) => setBodyExamples({ ...bodyExamples, [v]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Text Section */}
            <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  4. Footer (Optional)
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  {footerText.length} / 60 characters
                </span>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Reply STOP to opt out • Powered by Morihix"
                value={footerText}
                maxLength={60}
                onChange={(e) => setFooterText(e.target.value)}
              />
            </div>

            {/* Buttons Section */}
            <div style={{ padding: "18px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border-color)", marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>
                  5. Interactive Buttons (Optional)
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Up to 3 buttons
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
                Add Call to Action buttons (Website, Phone, Copy Code) or Quick Replies for immediate engagement.
              </p>

              {buttons.map((btn, idx) => (
                <div key={idx} style={{ padding: "14px", background: "#fff", border: "1px solid var(--border-color)", borderRadius: "8px", marginBottom: "10px", position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveButton(idx)}
                    style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#ea0038", cursor: "pointer" }}
                    title="Remove button"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                    {btn.type === "QUICK_REPLY" && <MessageSquare size={13} />}
                    {btn.type === "URL" && <ExternalLink size={13} />}
                    {btn.type === "PHONE_NUMBER" && <Phone size={13} />}
                    {btn.type === "COPY_CODE" && <Copy size={13} />}
                    <span>{btn.type.replace("_", " ")}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: btn.type === "QUICK_REPLY" ? "1fr" : "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Button Label (Max 25 chars)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Interested / Visit Site"
                        value={btn.text}
                        maxLength={25}
                        onChange={(e) => handleButtonChange(idx, "text", e.target.value)}
                        required
                      />
                    </div>

                    {btn.type === "URL" && (
                      <div>
                        <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Website URL</label>
                        <input
                          type="url"
                          className="form-input"
                          placeholder="https://example.com"
                          value={btn.url}
                          onChange={(e) => handleButtonChange(idx, "url", e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {btn.type === "PHONE_NUMBER" && (
                      <div>
                        <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Phone with country code</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="+919413879444"
                          value={btn.phone_number}
                          onChange={(e) => handleButtonChange(idx, "phone_number", e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {btn.type === "COPY_CODE" && (
                      <div>
                        <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>Coupon / Promo Code</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. DIWALI2026"
                          value={btn.code || ""}
                          onChange={(e) => handleButtonChange(idx, "code", e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {buttons.length < 3 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleAddButton("QUICK_REPLY")}
                    style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <MessageSquare size={13} />
                    + Quick Reply
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleAddButton("URL")}
                    style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <ExternalLink size={13} />
                    + Website URL
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleAddButton("PHONE_NUMBER")}
                    style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Phone size={13} />
                    + Call Phone
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleAddButton("COPY_CODE")}
                    style={{ fontSize: "12px", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Copy size={13} />
                    + Copy Code
                  </button>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || !name.trim() || !bodyText.trim()}
                style={{ padding: "12px 24px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                    Submitting to Meta...
                  </>
                ) : (
                  <>
                    <LayoutTemplate size={16} />
                    Submit Template to Meta
                  </>
                )}
              </button>
              <Link href="/templates" className="btn-secondary" style={{ padding: "12px 20px", fontSize: "14px" }}>
                Cancel
              </Link>
            </div>

          </form>
        </div>

        {/* Right Column: Live WhatsApp Interactive Preview */}
        <div style={{ position: "sticky", top: "24px" }}>
          <div style={{ background: "#e5ddd5", borderRadius: "16px", overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.08)", border: "1px solid #d1d5db" }}>
            
            {/* WhatsApp Header Bar */}
            <div style={{ background: "#075e54", padding: "14px 18px", color: "white", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ImageIcon size={20} color="#075e54" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {name || "Template Preview"}
                </div>
                <div style={{ fontSize: "11px", opacity: 0.85 }}>Official WhatsApp Business Account</div>
              </div>
            </div>

            {/* Chat Body */}
            <div style={{ padding: "20px 16px", backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: "cover", minHeight: "420px" }}>
              
              {/* WhatsApp Bubble */}
              <div style={{ background: "#fff", borderRadius: "10px", padding: "12px", borderTopLeftRadius: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.12)", maxWidth: "92%" }}>
                
                {/* Header Render */}
                {headerType === "TEXT" && headerText && (
                  <div style={{ fontWeight: 700, fontSize: "15px", color: "#111827", marginBottom: "8px" }}>
                    {headerText.replace("{{1}}", headerExample || "{{1}}")}
                  </div>
                )}

                {headerType === "IMAGE" && (
                  <div style={{ width: "100%", background: "#f1f5f9", borderRadius: "8px", marginBottom: "10px", overflow: "hidden", minHeight: samplePreview ? "auto" : "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {samplePreview ? (
                      <img
                        src={samplePreview}
                        alt="Preview"
                        style={{ width: "100%", height: "auto", maxHeight: "260px", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", color: "#64748b", padding: "30px 0" }}>
                        <ImageIcon size={32} />
                        <span style={{ fontSize: "12px" }}>Image Header</span>
                      </div>
                    )}
                  </div>
                )}

                {headerType === "VIDEO" && (
                  <div style={{ width: "100%", height: "150px", background: "#cbd5e1", borderRadius: "8px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", gap: "8px" }}>
                    <Video size={28} />
                    <span style={{ fontSize: "13px", fontWeight: 500 }}>Video Header</span>
                  </div>
                )}

                {headerType === "DOCUMENT" && (
                  <div style={{ width: "100%", padding: "12px 14px", background: "#f1f5f9", borderRadius: "8px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <FileText size={24} color="#0284c7" />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a" }}>Document.pdf</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>PDF Document Header</div>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div style={{ fontSize: "14px", color: "#111", whiteSpace: "pre-wrap", lineHeight: "1.45" }}>
                  {previewBodyText || "Your message text will appear here with live variable substitutions..."}
                </div>

                {/* Footer Render */}
                {footerText && (
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                    {footerText}
                  </div>
                )}

                {/* Timestamp */}
                <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "right", marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "3px" }}>
                  <span>12:00 PM</span>
                  <span style={{ color: "#53bdeb" }}>✓✓</span>
                </div>

              </div>

              {/* Action Buttons Render */}
              {buttons.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px", maxWidth: "92%" }}>
                  {buttons.map((btn, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        padding: "10px",
                        borderRadius: "8px",
                        textAlign: "center",
                        fontSize: "13px",
                        color: "#00a884",
                        fontWeight: 600,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      {btn.type === "URL" && <ExternalLink size={14} />}
                      {btn.type === "PHONE_NUMBER" && <Phone size={14} />}
                      {btn.type === "COPY_CODE" && <Copy size={14} />}
                      {btn.type === "QUICK_REPLY" && <MessageSquare size={14} />}
                      <span>{btn.text || (btn.type === "COPY_CODE" ? (btn.code || "Copy Code") : "Button")}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(asset) => {
          setSelectedGalleryMedia(asset);
          setSampleFile(null);
          setSamplePreview(normalizeMediaUrl(asset.media_url));
        }}
        mediaType={headerType === "VIDEO" ? "video" : headerType === "DOCUMENT" ? "document" : "image"}
        title={`Select Sample ${headerType === "VIDEO" ? "Video" : headerType === "DOCUMENT" ? "Document" : "Image"} from Gallery`}
      />
    </div>
  );
}

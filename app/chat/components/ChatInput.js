"use client";

import { useState } from "react";
import { Send, AlertTriangle, LayoutTemplate, Paperclip } from "lucide-react";
import { sendMessage, sendTemplate, getTemplates, sendMedia } from "../../lib/api";

export default function ChatInput({ contactId, windowInfo, onMessageSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [languageCode, setLanguageCode] = useState("en_US");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateParams, setTemplateParams] = useState({});
  const [templateSending, setTemplateSending] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const isWindowClosed = windowInfo && !windowInfo.open;

  const handleSend = async () => {
    if (!text.trim() || sending || isWindowClosed) return;

    setSending(true);
    try {
      const res = await sendMessage(contactId, text.trim());
      onMessageSent(res.data);
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
      if (err.response?.data?.window_closed) {
        // Window just closed - UI will update via socket
        alert("24-hour window has closed. Please send a template message.");
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || isWindowClosed) return;
    
    setSelectedFile(file);
    setShowFileModal(true);
    e.target.value = null; // Reset input
  };

  const handleConfirmSendFile = async () => {
    if (!selectedFile || isWindowClosed) return;
    
    setSending(true);
    setShowFileModal(false);
    try {
      const res = await sendMedia(contactId, selectedFile);
      onMessageSent(res.data);
    } catch (err) {
      console.error("Media send failed:", err);
      alert(err.response?.data?.error || "Failed to send media");
    } finally {
      setSending(false);
      setSelectedFile(null);
    }
  };

  const openTemplateModal = async () => {
    setShowTemplateModal(true);
    if (templates.length === 0) {
      setLoadingTemplates(true);
      try {
        const res = await getTemplates();
        const approvedOnly = (res.data || []).filter(t => t.status === 'APPROVED');
        setTemplates(approvedOnly);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setLoadingTemplates(false);
      }
    }
  };

  const handleSendTemplate = async () => {
    if (!templateName.trim() || templateSending) return;

    const apiComponents = [];

    if (selectedTemplate) {
      const headerComp = selectedTemplate.components?.find(c => c.type === "HEADER");
      if (headerComp && ["IMAGE", "VIDEO", "DOCUMENT"].includes(headerComp.format)) {
        if (!templateParams.header_media) {
          alert(`Please provide a ${headerComp.format} URL`);
          return;
        }
        apiComponents.push({
          type: "header",
          parameters: [
            {
              type: headerComp.format.toLowerCase(),
              [headerComp.format.toLowerCase()]: { link: templateParams.header_media }
            }
          ]
        });
      }

      const bodyComp = selectedTemplate.components?.find(c => c.type === "BODY");
      if (bodyComp && bodyComp.text.includes("{{")) {
        const count = (bodyComp.text.match(/\{\{\d+\}\}/g) || []).length;
        const bodyParams = [];
        for (let i = 1; i <= count; i++) {
          if (!templateParams[`body_${i}`]) {
            alert(`Please provide a value for {{${i}}}`);
            return;
          }
          bodyParams.push({
            type: "text",
            text: templateParams[`body_${i}`]
          });
        }
        apiComponents.push({
          type: "body",
          parameters: bodyParams
        });
      }
    }

    setTemplateSending(true);
    try {
      const res = await sendTemplate(contactId, templateName.trim(), languageCode, apiComponents);
      onMessageSent(res.data);
      setTemplateName("");
      setSelectedTemplate(null);
      setTemplateParams({});
      setShowTemplateModal(false);
    } catch (err) {
      console.error("Template send failed:", err);
      alert(err.response?.data?.error || "Failed to send template");
    } finally {
      setTemplateSending(false);
    }
  };

  return (
    <div className="chat-input-container">
      {}
      {isWindowClosed && (
        <div className="window-warning">
          <AlertTriangle size={18} style={{ color: "var(--warning-text)", minWidth: "18px" }} />
          <span className="window-warning-text">
            24-hour window closed. Send a template to restart chat.
          </span>
          <button
            className="template-btn"
            onClick={openTemplateModal}
          >
            Send Template
          </button>
        </div>
      )}

      {}
      <div className="chat-input-wrapper">
        <textarea
          className="chat-input"
          placeholder={
            isWindowClosed
              ? "Window closed — use template to restart"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isWindowClosed || sending}
          rows={1}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!text.trim() || isWindowClosed || sending}
          title="Send message"
        >
          <Send size={18} />
        </button>
        <label
          className="send-btn"
          title="Send Media"
          style={{ 
            marginLeft: "8px", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", 
            cursor: isWindowClosed || sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            opacity: isWindowClosed || sending ? 0.6 : 1
          }}
        >
          <Paperclip size={18} />
          <input 
            type="file" 
            style={{ display: "none" }} 
            onChange={handleFileChange}
            accept="*/*"
            disabled={isWindowClosed || sending}
          />
        </label>
        <button
          className="send-btn"
          onClick={openTemplateModal}
          disabled={templateSending}
          title="Send Template"
          style={{ marginLeft: "8px", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        >
          <LayoutTemplate size={18} />
        </button>
      </div>

      {}
      {showTemplateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowTemplateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Send Template Message</h3>
            <div className="form-group">
              <label className="form-label">Template Name</label>
              {loadingTemplates ? (
                <div style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "14px" }}>
                  Loading templates...
                </div>
              ) : templates.length === 0 ? (
                <div style={{ padding: "10px", color: "var(--warning-text)", fontSize: "14px" }}>
                  No approved templates found.
                </div>
              ) : (
                <select
                  className="form-input form-select"
                  value={templateName}
                  onChange={(e) => {
                    const selected = templates.find(t => t.name === e.target.value);
                    if (selected) {
                      setTemplateName(selected.name);
                      setLanguageCode(selected.language);
                      setSelectedTemplate(selected);
                      setTemplateParams({});
                    } else {
                      setTemplateName("");
                      setLanguageCode("en_US");
                      setSelectedTemplate(null);
                      setTemplateParams({});
                    }
                  }}
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

            {selectedTemplate && selectedTemplate.components && (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedTemplate.components.map(comp => {
                  if (comp.type === "HEADER" && ["IMAGE", "VIDEO", "DOCUMENT"].includes(comp.format)) {
                    return (
                      <div key="header">
                        <label className="form-label">{comp.format} URL (Required)</label>
                        <input 
                          className="form-input" 
                          placeholder={`Enter ${comp.format.toLowerCase()} URL...`}
                          value={templateParams["header_media"] || ""}
                          onChange={(e) => setTemplateParams({...templateParams, header_media: e.target.value})}
                        />
                      </div>
                    );
                  }
                  if (comp.type === "BODY" && comp.text.includes("{{")) {
                    const count = (comp.text.match(/\{\{\d+\}\}/g) || []).length;
                    return Array.from({ length: count }).map((_, i) => (
                      <div key={`body_${i+1}`}>
                        <label className="form-label">Body Variable {`{{${i+1}}}`}</label>
                        <input 
                          className="form-input" 
                          placeholder={`Value for {{${i+1}}}`}
                          value={templateParams[`body_${i+1}`] || ""}
                          onChange={(e) => setTemplateParams({...templateParams, [`body_${i+1}`]: e.target.value})}
                        />
                      </div>
                    ));
                  }
                  return null;
                })}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: "24px" }}>
              <button
                className="btn-secondary"
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSendTemplate}
                disabled={!templateName.trim() || templateSending}
              >
                {templateSending ? "Sending..." : "Send Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Confirmation Modal */}
      {showFileModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFileModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Send Media/Document</h3>
            <div style={{ margin: "20px 0", color: "var(--text-primary)" }}>
              <p>Are you sure you want to send this file?</p>
              <div style={{ marginTop: "12px", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "8px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px" }}>
                <Paperclip size={20} className="text-muted" />
                <span style={{ fontWeight: 500, wordBreak: "break-all" }}>{selectedFile?.name}</span>
                <span className="text-muted" style={{ fontSize: "12px", marginLeft: "auto" }}>
                  {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: "24px" }}>
              <button
                className="btn-secondary"
                onClick={() => setShowFileModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirmSendFile}
              >
                Send File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

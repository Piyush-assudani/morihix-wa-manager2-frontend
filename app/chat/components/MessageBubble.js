"use client";

import { format } from "date-fns";
import { Check, CheckCheck, X, Trash2, FileText, Music, PlaySquare, Image as ImageIcon, File } from "lucide-react";

export default function MessageBubble({ message, templates, onImageClick, onDelete }) {
  const isOutbound = message.direction === "outbound";

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return "";
      return format(d, "HH:mm");
    } catch {
      return "";
    }
  };

  const renderStatus = () => {
    if (!isOutbound) return null;

    switch (message.status) {
      case "sent": return <span className="message-status sent"><Check size={14} /></span>;
      case "delivered": return <span className="message-status delivered"><CheckCheck size={14} /></span>;
      case "read": return <span className="message-status read"><CheckCheck size={14} /></span>;
      case "failed": return <span className="message-status failed"><X size={14} /></span>;
      default: return null;
    }
  };

  const renderMedia = () => {
    if (!message.media_url) return null;
    const url = message.media_url.toLowerCase();
    
    if (url.match(/\.(mp4|webm|mov)$/) || url.includes("video/upload")) {
      return (
        <video src={message.media_url} controls className="max-w-full rounded-md mb-2" style={{ maxHeight: "200px" }} />
      );
    }
    if (url.match(/\.(mp3|wav|ogg|aac|amr)$/) || url.includes("audio")) {
      return (
        <div style={{ padding: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "8px", marginBottom: "8px" }}>
          <audio src={message.media_url} controls style={{ width: "100%" }} />
        </div>
      );
    }
    if (url.match(/\.(pdf|doc|docx|xls|xlsx|csv|txt)$/) || url.includes("raw/upload")) {
      const fileName = message.media_url.split('/').pop() || "Document";
      return (
        <a href={message.media_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: "8px", textDecoration: "none", color: "var(--text-primary)", marginBottom: "8px" }}>
          <FileText size={24} color="var(--accent)" />
          <span style={{ fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{fileName}</span>
        </a>
      );
    }
    // Default to image
    return (
      <img 
        src={message.media_url} 
        alt="Media" 
        onClick={() => onImageClick?.(message.media_url)}
        className="max-w-full rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
        style={{ maxHeight: "200px", objectFit: "contain" }} 
        title="Click to view full image"
      />
    );
  };

  const renderTemplateBody = (templateMatch) => {
    const templateName = templateMatch[1];
    const template = templates?.find(t => t.name === templateName);

    if (!template) {
      return <div className="message-text">Template: {templateName} (Content hidden)</div>;
    }

    const header = template.components?.find(c => c.type === "HEADER");
    const body = template.components?.find(c => c.type === "BODY");
    const footer = template.components?.find(c => c.type === "FOOTER");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {header && header.format === "IMAGE" && (
          <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
            <ImageIcon size={32} color="#aaa" />
          </div>
        )}
        {header && header.format === "VIDEO" && (
          <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
            <PlaySquare size={32} color="#aaa" />
          </div>
        )}
        {header && header.format === "DOCUMENT" && (
          <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60px" }}>
            <File size={32} color="#aaa" />
          </div>
        )}
        {header && header.format === "TEXT" && (
          <div style={{ fontWeight: 600, fontSize: "15px" }}>{header.text}</div>
        )}
        
        {body && (
          <div className="message-text" style={{ whiteSpace: "pre-wrap" }}>
            {body.text.replace(/\{\{\d+\}\}/g, '___')}
          </div>
        )}
        
        {footer && (
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
            {footer.text}
          </div>
        )}
      </div>
    );
  };

  const renderMessageContent = () => {
    if (message.message_body === '[unsupported]') {
      return (
        <div className="message-text" style={{ color: "var(--warning-text)", display: "flex", alignItems: "center", gap: "6px", fontStyle: "italic" }}>
          <span role="img" aria-label="warning">⚠️</span> Unsupported message type
        </div>
      );
    }
    
    if (message.message_body?.startsWith('[Template:')) {
      const match = message.message_body.match(/^\[Template: (.+)\]$/);
      if (match) {
        return renderTemplateBody(match);
      }
    }
    
    if (message.message_body === '[Media]' && message.media_url) {
      return null; // Don't render "[Media]" text if we have the media URL
    }

    return <div className="message-text">{message.message_body}</div>;
  };

  return (
    <div className={`message-row ${isOutbound ? "outbound" : "inbound"} animate-fade-in`}>
      <div className={`message-bubble ${isOutbound ? "outbound" : "inbound"}`}>
        {renderMedia()}
        {renderMessageContent()}
        <div className="message-meta" style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end", marginTop: "4px" }}>
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {renderStatus()}
          {isOutbound && (
            <button 
              onClick={() => onDelete?.(message.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', marginLeft: '4px', opacity: 0.6, color: 'var(--text-muted)' }}
              title="Delete message"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

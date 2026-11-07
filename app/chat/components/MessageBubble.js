"use client";

import { Check, CheckCheck, X, Trash2, RotateCw, FileText, Music, PlaySquare, Image as ImageIcon, File } from "lucide-react";
import { normalizeMediaUrl } from "../../lib/api";
import { formatMessageTime } from "../../lib/dateUtils";

export function isImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false;
  if (/\s/.test(trimmed)) return false;
  return (
    /\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|tiff|heic)(\?.*)?$/i.test(trimmed) ||
    /googleusercontent\.com|encrypted-tbn[0-9]\.gstatic\.com\/images|images\.unsplash\.com|cdn\.pixabay\.com|res\.cloudinary\.com|lookaside\.fbsbx\.com|mmg\.whatsapp\.net/i.test(trimmed) ||
    /[?&]q=tbn:|[?&]mime=image|[?&]format=(jpg|jpeg|png|webp)/i.test(trimmed)
  );
}

export default function MessageBubble({ message, templates, onImageClick, onDelete, onRetry }) {
  const isOutbound = message.direction === "outbound";
  const isTemplate = message.message_body?.startsWith("[Template:");

  const formatTime = (timestamp) => {
    return formatMessageTime(timestamp);
  };

  const renderStatus = () => {
    if (!isOutbound) return null;

    switch (message.status) {
      case "sent": return <span className="message-status sent" title="Sent (Single Tick)"><Check size={14} /></span>;
      case "delivered": return <span className="message-status delivered" title="Delivered (Double Tick)"><CheckCheck size={14} /></span>;
      case "read": return <span className="message-status read" title="Read (Blue Tick)"><CheckCheck size={14} color="#53bdeb" /></span>;
      case "failed": return <span className="message-status failed" title={message.error_message || "Delivery Failed"}><X size={14} color="#ea0038" /></span>;
      default: return null;
    }
  };

  const renderMedia = () => {
    if (isTemplate) return null;

    const candidateUrl = message.media_url || (isImageUrl(message.message_body) ? message.message_body.trim() : null);
    if (!candidateUrl) return null;

    const mediaSrc = normalizeMediaUrl(candidateUrl);
    const url = mediaSrc.toLowerCase();
    
    const isAudio = url.match(/\.(mp3|wav|ogg|aac|amr|m4a)$/) || url.includes("audio") || message.message_body === "[Audio]";
    const isVideo = url.match(/\.(mp4|webm|mov)$/) || (url.includes("video/upload") && !isAudio);
    const isDocument = url.match(/\.(pdf|doc|docx|xls|xlsx|csv|txt)$/) || url.includes("raw/upload") || message.message_body === "[Document]";

    if (isAudio) {
      let audioUrl = mediaSrc;
      // Safari/Mac often fails to play .ogg files from WhatsApp.
      // Cloudinary can transcode on the fly if we append .mp3 to the URL.
      if (audioUrl.includes('cloudinary.com/')) {
        audioUrl = audioUrl.replace(/\.[^/.]+$/, "") + ".mp3";
      }
      
      return (
        <div style={{ padding: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "8px", marginBottom: "8px", minWidth: "260px" }}>
          <audio src={audioUrl} controls style={{ width: "100%", height: "40px" }} preload="metadata" />
        </div>
      );
    }
    
    if (isVideo) {
      return (
        <video 
          src={mediaSrc} 
          className="max-w-full rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
          style={{ maxHeight: "200px" }} 
          controls={false}
          onClick={(e) => {
            e.preventDefault();
            onImageClick?.({ url: mediaSrc, type: 'video' });
          }}
        />
      );
    }
    
    if (isDocument) {
      const fileName = mediaSrc.split('/').pop() || "Document";
      return (
        <a href={mediaSrc} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "rgba(0,0,0,0.05)", borderRadius: "8px", textDecoration: "none", color: "var(--text-primary)", marginBottom: "8px" }}>
          <FileText size={24} color="var(--accent)" />
          <span style={{ fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{fileName}</span>
        </a>
      );
    }
    // Default to image
    return (
      <img 
        src={mediaSrc} 
        alt="Media" 
        onClick={() => onImageClick?.({ url: mediaSrc, type: 'image' })}
        className="max-w-full rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
        style={{ maxHeight: "240px", objectFit: "contain" }} 
        title="Click to view full image"
      />
    );
  };

  const renderTemplateBody = (templateMatch) => {
    const templateName = templateMatch[1];
    const template = templates?.find(t => t.name === templateName);

    if (!template) {
      let fallbackMediaSrc = message.media_url ? normalizeMediaUrl(message.media_url) : null;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {fallbackMediaSrc && (
            <img 
              src={fallbackMediaSrc} 
              alt="Template Header" 
              onClick={() => onImageClick?.({ url: fallbackMediaSrc, type: 'image' })}
              className="w-full rounded-md object-contain cursor-pointer hover:opacity-95 transition-opacity" 
              style={{ maxHeight: "320px", width: "100%", height: "auto", objectFit: "contain" }} 
              title="Click to view full image"
            />
          )}
          <div className="message-text" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", background: "rgba(37, 211, 102, 0.12)", color: "#128C7E", padding: "3px 10px", borderRadius: "12px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              📋 Template: {templateName}
            </span>
          </div>
        </div>
      );
    }

    const header = template.components?.find(c => c.type === "HEADER");
    const body = template.components?.find(c => c.type === "BODY");
    const footer = template.components?.find(c => c.type === "FOOTER");

    let headerMediaSrc = null;
    if (message.media_url) {
      headerMediaSrc = normalizeMediaUrl(message.media_url);
    } else if (header && header.example?.header_handle?.[0]) {
      const handle = header.example.header_handle[0];
      if (typeof handle === "string" && (handle.startsWith("http://") || handle.startsWith("https://"))) {
        headerMediaSrc = normalizeMediaUrl(handle);
      }
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {header && header.format === "IMAGE" && (
          headerMediaSrc ? (
            <img 
              src={headerMediaSrc} 
              alt="Template Header" 
              onClick={() => onImageClick?.({ url: headerMediaSrc, type: 'image' })}
              className="w-full rounded-md object-contain cursor-pointer hover:opacity-95 transition-opacity" 
              style={{ maxHeight: "320px", width: "100%", height: "auto", objectFit: "contain" }} 
              title="Click to view full image"
            />
          ) : (
            <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
              <ImageIcon size={32} color="#aaa" />
            </div>
          )
        )}
        {header && header.format === "VIDEO" && (
          headerMediaSrc ? (
            <video 
              src={headerMediaSrc} 
              className="w-full rounded-md object-cover cursor-pointer" 
              style={{ maxHeight: "220px", width: "100%" }} 
              controls 
            />
          ) : (
            <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100px" }}>
              <PlaySquare size={32} color="#aaa" />
            </div>
          )
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
    if (message.message_body === '[unsupported]' && !message.media_url) {
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
    
    const hiddenMediaLabels = ['[Media]', '[Video]', '[Image]', '[Audio]', '[Document]', '[Sticker]', '[unsupported]'];
    if (hiddenMediaLabels.includes(message.message_body) && (message.media_url || isImageUrl(message.message_body))) {
      return null;
    }

    if (isImageUrl(message.message_body)) {
      return null;
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
          {isOutbound && message.status === 'failed' && onRetry && (
            <button 
              onClick={() => onRetry(message)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', marginLeft: '4px', color: '#ea0038', display: 'inline-flex', alignItems: 'center' }}
              title={message.error_message ? `Failed: ${message.error_message}. Click to retry.` : "Failed to deliver. Click to retry."}
            >
              <RotateCw size={12} />
            </button>
          )}
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
        {isOutbound && message.status === 'failed' && message.error_message && (
          <div style={{ color: "#ea0038", fontSize: "11px", marginTop: "4px", background: "rgba(234, 0, 56, 0.08)", padding: "4px 8px", borderRadius: "4px", wordBreak: "break-word" }}>
            ⚠️ {message.error_message}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { format } from "date-fns";
import { Check, CheckCheck, X, Trash2 } from "lucide-react";

export default function MessageBubble({ message, onImageClick, onDelete }) {
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
      case "sent":
        return (
          <span className="message-status sent">
            <Check size={14} />
          </span>
        );
      case "delivered":
        return (
          <span className="message-status delivered">
            <CheckCheck size={14} />
          </span>
        );
      case "read":
        return (
          <span className="message-status read">
            <CheckCheck size={14} />
          </span>
        );
      case "failed":
        return (
          <span className="message-status failed">
            <X size={14} />
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`message-row ${isOutbound ? "outbound" : "inbound"} animate-fade-in`}
    >
      <div className={`message-bubble ${isOutbound ? "outbound" : "inbound"}`}>
        {message.media_url && (
          <div className="message-media">
            {message.media_url.endsWith(".mp4") || message.media_url.endsWith(".webm") || message.media_url?.includes("video/upload") ? (
              <video src={message.media_url} controls className="max-w-full rounded-md mb-2" style={{ maxHeight: "200px" }} />
            ) : (
              <img 
                src={message.media_url} 
                alt="Media" 
                onClick={() => onImageClick?.(message.media_url)}
                className="max-w-full rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
                style={{ maxHeight: "200px", objectFit: "contain" }} 
                title="Click to view full image"
              />
            )}
          </div>
        )}
        <div className="message-text">{message.message_body}</div>
        <div className="message-meta" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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

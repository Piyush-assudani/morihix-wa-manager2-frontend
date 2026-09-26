"use client";

import { formatDistanceToNow } from "date-fns";

export default function ContactItem({ contact, isActive, onClick }) {
  const getInitials = () => {
    if (contact.name) {
      return contact.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2);
    }
    // Use last 2 digits of phone
    return contact.phone_number?.slice(-2) || "?";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return "";
      return formatDistanceToNow(d, { addSuffix: false });
    } catch {
      return "";
    }
  };

  const truncate = (text, maxLen = 40) => {
    if (!text) return "";
    return text.length > maxLen ? text.substring(0, maxLen) + "..." : text;
  };

  return (
    <div
      className={`contact-item animate-slide-in ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="contact-avatar">{getInitials()}</div>

      <div className="contact-info">
        <div className="contact-name-row">
          <span className="contact-name">
            {contact.name || contact.phone_number}
          </span>
          <span className="contact-time">
            {formatTime(contact.last_message_time)}
          </span>
        </div>

        <div className="contact-preview-row">
          <span className="contact-preview">
            {contact.last_message_direction === "outbound" && (
              <span style={{ color: "var(--text-muted)", marginRight: "4px" }}>
                ↩
              </span>
            )}
            {truncate(contact.last_message) || "No messages yet"}
          </span>

          {Number(contact.unread_count) > 0 ? (
            <span className="unread-badge">{contact.unread_count}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

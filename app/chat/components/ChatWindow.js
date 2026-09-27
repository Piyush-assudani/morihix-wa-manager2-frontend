"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { ArrowDown, Phone, Trash2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { deleteMessage } from "../../lib/api";

export default function ChatWindow({
  contact,
  messages,
  windowInfo,
  loading,
  onMessageSent,
  onDeleteContact,
}) {
  const chatMessagesRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [lastSeenMessageCount, setLastSeenMessageCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const hasNewMessages =
    messages.length > lastSeenMessageCount && !isAtBottom;

  const scrollToLatest = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    isAtBottomRef.current = true;
  }, []);

  const handleScrollToLatest = () => {
    setIsAtBottom(true);
    setLastSeenMessageCount(messages.length);
    scrollToLatest();
  };

  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToLatest();
    }
  }, [messages, scrollToLatest]);

  useEffect(() => {
    if (!loading) {
      scrollToLatest("auto");
    }
  }, [contact.id, loading, scrollToLatest]);

  const handleMessagesScroll = () => {
    const container = chatMessagesRef.current;
    if (!container) return;

    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80;
    isAtBottomRef.current = atBottom;
    setIsAtBottom(atBottom);
    if (atBottom) setLastSeenMessageCount(messages.length);
  };

  const formatDateLabel = (date) => {
    if (!date) return "Unknown Date";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Unknown Date";
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMMM d, yyyy");
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteMessage(msgId);
    } catch (err) {
      console.error("Delete message failed", err);
      alert("Failed to delete message");
    }
  };

  
  const renderMessages = () => {
    if (!messages || messages.length === 0) {
      return (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          No messages yet
        </div>
      );
    }

    const elements = [];
    let lastDate = null;

    messages.forEach((msg, idx) => {
      const msgDate = new Date(msg.timestamp);

      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        elements.push(
          <div className="date-separator" key={`date-${idx}`}>
            <span className="date-separator-label">
              {formatDateLabel(msgDate)}
            </span>
          </div>
        );
        lastDate = msgDate;
      }

      elements.push(
        <MessageBubble 
          key={msg.id || idx} 
          message={msg} 
          onImageClick={setSelectedImage}
          onDelete={handleDeleteMessage}
        />
      );
    });

    return elements;
  };

  return (
    <div className="chat-window">
      {}
      <div className="chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="contact-avatar">
            {contact.name
              ? contact.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .substring(0, 2)
              : contact.phone_number?.slice(-2)}
          </div>
          <div className="chat-header-info">
            <div className="chat-header-name">
              {contact.name || contact.phone_number}
            </div>
            <div className="chat-header-phone">
              {contact.name ? contact.phone_number : ""}
              {windowInfo?.open && (
                <span
                  style={{
                    marginLeft: "8px",
                    color: "var(--accent)",
                    fontSize: "12px",
                  }}
                >
                  ● Window open
                </span>
              )}
              {windowInfo && !windowInfo.open && (
                <span
                  style={{
                    marginLeft: "8px",
                    color: "var(--warning-text)",
                    fontSize: "12px",
                  }}
                >
                  ● Window closed
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href={`tel:${contact.phone_number.startsWith('+') ? contact.phone_number : '+' + contact.phone_number}`}
            style={{ color: "var(--text-secondary)", cursor: "pointer" }}
            title={`Call ${contact.name || contact.phone_number}`}
          >
            <Phone size={20} />
          </a>
          <button
            onClick={() => onDeleteContact?.(contact.id)}
            style={{ background: "none", border: "none", color: "var(--warning-text)", cursor: "pointer" }}
            title="Delete Contact"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {}
      <div
        className="chat-messages"
        ref={chatMessagesRef}
        onScroll={handleMessagesScroll}
      >
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : (
          <>
            {renderMessages()}
            <div ref={messagesEndRef} />
          </>
        )}
        {hasNewMessages && !loading && (
          <button
            className="chat-latest-button"
            onClick={handleScrollToLatest}
            aria-label="Scroll to latest message"
          >
            <ArrowDown size={16} />
            Latest messages
          </button>
        )}
      </div>

      {}
      <ChatInput
        contactId={contact.id}
        windowInfo={windowInfo}
        onMessageSent={onMessageSent}
      />
      {/* Image Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "40px"
          }}
        >
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
            <button 
              onClick={() => setSelectedImage(null)}
              style={{ position: "absolute", top: "-40px", right: "0", background: "none", border: "none", color: "white", fontSize: "24px", cursor: "pointer" }}
            >
              ✕
            </button>
            <img src={selectedImage} alt="Full screen" style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: "8px" }} />
          </div>
        </div>
      )}
    </div>
  );
}

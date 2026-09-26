"use client";

import { Search } from "lucide-react";
import ContactItem from "./ContactItem";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

export default function ChatSidebar({
  contacts,
  selectedContact,
  onSelectContact,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  loading,
}) {
  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-header">
        <h1 className="chat-sidebar-title">Chats</h1>
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="chat-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`chat-filter-btn ${activeFilter === f.key ? "active" : ""}`}
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="contact-list">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
          </div>
        ) : contacts.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            <p style={{ fontSize: "14px" }}>
              {searchQuery
                ? "No contacts match your search"
                : activeFilter !== "all"
                ? `No ${activeFilter} contacts`
                : "No contacts yet. Incoming messages will appear here."}
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              isActive={selectedContact?.id === contact.id}
              onClick={() => onSelectContact(contact)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

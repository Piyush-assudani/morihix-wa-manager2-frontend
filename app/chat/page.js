"use client";

import { useState, useEffect, useCallback } from "react";
import { getContacts, getMessages, markMessagesAsRead } from "../lib/api";
import { getSocket } from "../lib/socket";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [windowInfo, setWindowInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      const res = await getContacts();
      setContacts(res.data);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a contact
  const fetchMessages = useCallback(async (contactId) => {
    setMessagesLoading(true);
    try {
      const res = await getMessages(contactId);
      setMessages(res.data.messages);
      setWindowInfo(res.data.window);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const markContactRead = useCallback(async (contactId) => {
    try {
      await markMessagesAsRead(contactId);
      setContacts((prev) =>
        prev.map((contact) =>
          String(contact.id) === String(contactId)
            ? { ...contact, unread_count: 0 }
            : contact
        )
      );
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
      await fetchContacts();
    }
  }, [fetchContacts]);

  // Select a contact
  const handleSelectContact = useCallback(
    async (contact) => {
      setSelectedContact(contact);
      fetchMessages(contact.id);
      await markContactRead(contact.id);
    },
    [fetchMessages, markContactRead]
  );

  // Delete a contact
  const handleDeleteContact = useCallback(async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact and all their messages?")) return;
    
    try {
      const { deleteContact } = await import("../lib/api");
      await deleteContact(contactId);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
      alert("Failed to delete contact. Please try again.");
    }
  }, [selectedContact]);

  // Initial load
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Socket.io real-time updates
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (msg) => {
      // Update messages if viewing this contact's chat
      const isSelectedContact =
        selectedContact &&
        String(msg.contact_id) === String(selectedContact.id);
      if (isSelectedContact) {
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id || (msg.meta_message_id && m.meta_message_id === msg.meta_message_id))) return prev;
          return [...prev, msg];
        });

        // If inbound, update window info
        if (msg.direction === "inbound") {
          setWindowInfo((prev) => ({
            ...prev,
            open: true,
            last_inbound_at: msg.timestamp,
            expires_at: new Date(
              new Date(msg.timestamp).getTime() + 24 * 60 * 60 * 1000
            ).toISOString(),
          }));
          
          markContactRead(msg.contact_id);
        }
      }

      
      setContacts((prev) => {
        const idx = prev.findIndex((c) => c.id === msg.contact_id);
        if (idx === -1) {
          
          return [
            {
              id: msg.contact_id,
              phone_number: msg.contact_phone,
              name: msg.contact_name,
              last_message: msg.message_body,
              last_message_direction: msg.direction,
              last_message_time: msg.timestamp,
              unread_count: msg.direction === "inbound" ? 1 : 0,
            },
            ...prev,
          ];
        }

        const updated = [...prev];
        const contact = {
          ...updated[idx],
          last_message: msg.message_body,
          last_message_direction: msg.direction,
          last_message_time: msg.timestamp,
        };

        
        if (
          msg.direction === "inbound" &&
          !isSelectedContact
        ) {
          contact.unread_count = (contact.unread_count || 0) + 1;
        }

        if (msg.direction === "inbound") {
          contact.last_inbound_time = msg.timestamp;
        }

        
        updated.splice(idx, 1);
        return [contact, ...updated];
      });
    };

    const handleStatusUpdate = (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.meta_message_id === data.meta_message_id
            ? { ...m, status: data.status }
            : m
        )
      );
    };

    const handleMessageDeleted = (data) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.id));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_status", handleStatusUpdate);
    socket.on("message_deleted", handleMessageDeleted);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_status", handleStatusUpdate);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, [markContactRead, selectedContact]);

  
  const handleMessageSent = (newMsg) => {
    setMessages((prev) => [...prev, newMsg]);
  };

  
  const filteredContacts = contacts.filter((c) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        c.phone_number?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.last_message?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Category filter
    switch (activeFilter) {
      case "unread":
        return (c.unread_count || 0) > 0;
      case "read":
        return (c.unread_count || 0) === 0;
      case "window_open":
        if (!c.last_inbound_time) return false;
        return new Date() - new Date(c.last_inbound_time) < 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  });

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <ChatSidebar
        contacts={filteredContacts}
        selectedContact={selectedContact}
        onSelectContact={handleSelectContact}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        loading={loading}
      />

      {selectedContact ? (
        <ChatWindow
          key={selectedContact.id}
          contact={selectedContact}
          messages={messages}
          windowInfo={windowInfo}
          loading={messagesLoading}
          onMessageSent={handleMessageSent}
          onDeleteContact={handleDeleteContact}
        />
      ) : (
        <div className="chat-window" style={{ flex: 1 }}>
          <div className="chat-window-empty">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain rounded-2xl shadow-lg bg-white" />
            </div>
            <h2>MAA AAINATH GOU SEVA SAMITI BALOTRA</h2>
            <p>
              Select a contact from the sidebar to view your conversation
              history and send messages. Inbound messages will appear here in
              real-time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

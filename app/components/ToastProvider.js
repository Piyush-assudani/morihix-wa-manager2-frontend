"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title = null) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast = {
      id,
      type,
      message: typeof message === "string" ? message : JSON.stringify(message),
      title: title || (type === "success" ? "Success" : type === "error" ? "Error" : type === "warning" ? "Notice" : "Information"),
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const showSuccess = useCallback((message, title) => addToast("success", message, title), [addToast]);
  const showError = useCallback((message, title) => addToast("error", message, title), [addToast]);
  const showWarning = useCallback((message, title) => addToast("warning", message, title), [addToast]);
  const showInfo = useCallback((message, title) => addToast("info", message, title), [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <aside
        aria-label="Notifications"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "420px",
          width: "calc(100% - 40px)",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";

          const bg = isSuccess
            ? "#ecfdf5"
            : isError
            ? "#fef2f2"
            : isWarning
            ? "#fffbeb"
            : "#eff6ff";

          const border = isSuccess
            ? "#a7f3d0"
            : isError
            ? "#fecaca"
            : isWarning
            ? "#fde68a"
            : "#bfdbfe";

          const titleColor = isSuccess
            ? "#065f46"
            : isError
            ? "#991b1b"
            : isWarning
            ? "#92400e"
            : "#1e40af";

          const textColor = isSuccess
            ? "#047857"
            : isError
            ? "#b91c1c"
            : isWarning
            ? "#b45309"
            : "#1d4ed8";

          const IconComponent = isSuccess
            ? CheckCircle2
            : isError
            ? AlertCircle
            : isWarning
            ? AlertTriangle
            : Info;

          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                pointerEvents: "auto",
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: "12px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                animation: "toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ flexShrink: 0, marginTop: "2px" }}>
                <IconComponent size={20} color={titleColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{ fontSize: "13px", fontWeight: "700", color: titleColor, marginBottom: "2px" }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: "13px", color: textColor, lineHeight: "1.45", wordBreak: "break-word" }}>
                  {toast.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: titleColor,
                  opacity: 0.6,
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if invoked outside ToastProvider
    return {
      showSuccess: (msg) => console.log("Success:", msg),
      showError: (msg) => console.error("Error:", msg),
      showWarning: (msg) => console.warn("Warning:", msg),
      showInfo: (msg) => console.info("Info:", msg),
    };
  }
  return context;
}


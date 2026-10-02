import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = React.createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showError = (message) => addToast(message, "error", 4000);
  const showSuccess = (message) => addToast(message, "success", 3000);
  const showWarning = (message) => addToast(message, "warning", 3500);
  const showInfo = (message) => addToast(message, "info", 3000);

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const colors = {
    error: "bg-red-500 dark:bg-red-600",
    success: "bg-emerald-500 dark:bg-emerald-600",
    warning: "bg-amber-500 dark:bg-amber-600",
    info: "bg-blue-500 dark:bg-blue-600",
  };

  const icons = {
    error: XCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
  };
  const Icon = icons[toast.type] || Info;

  return (
    <div
      className={`${colors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="leading-none hover:opacity-75 transition-opacity"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

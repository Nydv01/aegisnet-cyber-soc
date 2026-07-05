import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * Toast notification system with slide-in animation, auto-dismiss
 * progress bar, and severity-based accent colors.
 */

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, { severity = 'info', duration = 4000, icon = null } = {}) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev.slice(-4), { id, message, severity, duration, icon, createdAt: Date.now() }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (toast.duration <= 0) return;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(onDismiss, 300);
  };

  const severityConfig = {
    info: { accent: 'var(--neon-blue)', bg: 'rgba(59, 130, 246, 0.08)', icon: '💡' },
    success: { accent: 'var(--neon-green)', bg: 'rgba(16, 185, 129, 0.08)', icon: '✅' },
    warning: { accent: 'var(--neon-orange)', bg: 'rgba(245, 158, 11, 0.08)', icon: '⚠️' },
    danger: { accent: 'var(--neon-red)', bg: 'rgba(239, 68, 68, 0.08)', icon: '🚨' },
    agent: { accent: 'var(--neon-purple)', bg: 'rgba(168, 85, 247, 0.08)', icon: '🤖' },
  };

  const cfg = severityConfig[toast.severity] || severityConfig.info;

  return (
    <div
      className={`toast-item ${exiting ? 'toast-exit' : 'toast-enter'}`}
      style={{
        borderLeftColor: cfg.accent,
        background: cfg.bg,
      }}
      onClick={handleDismiss}
      role="alert"
    >
      <span className="toast-icon">{toast.icon || cfg.icon}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={handleDismiss}>✕</button>
      {toast.duration > 0 && (
        <div
          className="toast-progress"
          style={{
            background: cfg.accent,
            animationDuration: `${toast.duration}ms`,
          }}
        />
      )}
    </div>
  );
}

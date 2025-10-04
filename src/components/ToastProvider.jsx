// src/components/ToastProvider.jsx
import React, { useState, createContext, useContext, useCallback } from "react";

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      const id = Date.now();
      // Add toast with an 'entering' state to trigger fade-in
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, message, type, state: "entering" },
      ]);

      // After a short delay (e.g., matching the animation duration),
      // transition to 'idle' state (effectively 'entered')
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.map((toast) =>
            toast.id === id ? { ...toast, state: "idle" } : toast
          )
        );
      }, 500); // This should match the customFadeIn duration

      // After the main duration, set state to 'leaving' to trigger fade-out
      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.map((toast) =>
            toast.id === id ? { ...toast, state: "leaving" } : toast
          )
        );
        // The actual removal from DOM will happen on animationEnd event
        // (handled by onAnimationEnd prop)
      }, duration);
    },
    []
  );

  // This function is passed to each toast and called when its fade-out animation ends
  const handleAnimationEnd = useCallback((id, state) => {
    if (state === "leaving") {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }
  }, []);

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onAnimationEnd={() => handleAnimationEnd(toast.id, toast.state)}
            className={`
              px-6 py-3 rounded-lg shadow-lg text-white font-semibold transform
              ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}
              ${
                // Apply specific animation classes based on toast state
                toast.state === "entering"
                  ? "animate-custom-fade-in-slide-in" // Combined animation for entering
                  : toast.state === "leaving"
                  ? "animate-custom-fade-out-slide-out" // Combined animation for leaving
                  : "" // No animation when 'idle' (already visible)
              }
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

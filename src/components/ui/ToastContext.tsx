import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

 
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const borderColors = {
            success: 'border-emerald-500 text-emerald-900 bg-emerald-50',
            error: 'border-red-500 text-red-900 bg-red-50',
            warning: 'border-amber-500 text-amber-900 bg-amber-50',
            info: 'border-[#1C1917] text-[#1C1917] bg-[#FFFFFF]',
          };

          const icons = {
            success: '🎉',
            error: '⚠️',
            warning: '🔔',
            info: '💡',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border-2 ${borderColors[toast.type]} rounded-2xl p-4 shadow-[4px_4px_0px_0px_#1C1917] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base shrink-0">{icons[toast.type]}</span>
                <p className="text-xs font-bold leading-snug">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-xs font-black opacity-60 hover:opacity-100 shrink-0 p-1"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
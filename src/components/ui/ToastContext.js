import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
const ToastContext = createContext({});
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const showToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 4000);
    }, []);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);
    return (_jsxs(ToastContext.Provider, { value: { showToast }, children: [children, _jsx("div", { className: "fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0", children: toasts.map((toast) => {
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
                    return (_jsxs("div", { className: `pointer-events-auto border-2 ${borderColors[toast.type]} rounded-2xl p-4 shadow-[4px_4px_0px_0px_#1C1917] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-base shrink-0", children: icons[toast.type] }), _jsx("p", { className: "text-xs font-bold leading-snug", children: toast.message })] }), _jsx("button", { type: "button", onClick: () => removeToast(toast.id), className: "text-xs font-black opacity-60 hover:opacity-100 shrink-0 p-1", children: "\u2715" })] }, toast.id));
                }) })] }));
};
export const useToast = () => useContext(ToastContext);

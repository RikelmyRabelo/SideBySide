import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (_jsxs("div", { className: "w-full flex flex-col gap-1.5", children: [label && (_jsx("label", { className: "text-xs font-medium text-slate-300", children: label })), _jsx("input", { ref: ref, className: `w-full px-4 py-2.5 bg-slate-800/80 border text-white placeholder-slate-400 text-sm rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent ${error ? 'border-brand-danger focus:ring-brand-danger' : 'border-slate-700'} ${className}`, ...props }), error && _jsx("span", { className: "text-xs text-brand-danger", children: error })] }));
});
Input.displayName = 'Input';

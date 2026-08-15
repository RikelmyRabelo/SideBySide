import { jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
const variants = {
    emerald: 'bg-emerald-500/10 text-brand-emerald border-emerald-500/20',
    blue: 'bg-blue-500/10 text-brand-blue border-blue-500/20',
    warning: 'bg-amber-500/10 text-brand-warning border-amber-500/20',
    danger: 'bg-red-500/10 text-brand-danger border-red-500/20',
};
export const Badge = memo(({ children, variant = 'blue' }) => {
    return (_jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border ${variants[variant]}`, children: children }));
});
Badge.displayName = 'Badge';

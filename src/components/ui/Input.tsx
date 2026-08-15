import React, { forwardRef, memo } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = '', ...props }, ref) => {
      return (
        <div className="w-full flex flex-col gap-1.5">
          {label && (
            <label className="text-xs font-medium text-slate-300">
              {label}
            </label>
          )}
          <input
            ref={ref}
            className={`w-full px-4 py-2.5 bg-slate-800/80 border text-white placeholder-slate-400 text-sm rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent ${
              error ? 'border-brand-danger focus:ring-brand-danger' : 'border-slate-700'
            } ${className}`}
            {...props}
          />
          {error && <span className="text-xs text-brand-danger">{error}</span>}
        </div>
      );
    }
  )
);

Input.displayName = 'Input';
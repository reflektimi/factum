import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const inputId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={clsx(
                        'block w-full min-h-[100px] rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] focus:border-primary-500 focus:ring-4 focus:ring-primary-50 px-4 py-3 transition-all text-slate-700 placeholder:text-slate-400 antialiased outline-none resize-none',
                        error && 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/30',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 animate-slide-in">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export default Textarea;

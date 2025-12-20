import React, { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className, id, ...props }, ref) => {
        const inputId = id || props.name;

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (props.type === 'number') {
                // Prevent invalid numeric characters for financial inputs
                if (['-', '+', 'e', 'E'].includes(e.key)) {
                    e.preventDefault();
                }
            }
            props.onKeyDown?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (props.type === 'number') {
                // Sanitize leading zeros (e.g., "0100" -> "100")
                const val = e.target.value;
                if (val.length > 1 && val.startsWith('0') && val[1] !== '.') {
                    e.target.value = parseInt(val).toString();
                }
            }
            props.onChange?.(e);
        };

        return (
            <div className="w-full group/input">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none">
                            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={clsx(
                            'block w-full h-10 rounded-lg border border-slate-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 px-3.5 transition-all placeholder:text-slate-400 text-slate-900 text-sm antialiased',
                            icon && 'pl-10',
                            error && 'border-red-300 focus:border-red-500 focus:ring-red-50 focus:ring-4 bg-red-50/10',
                            className
                        )}
                        onKeyDown={handleKeyDown}
                        onChange={handleChange}
                        {...props}
                    />
                    
                    {/* Custom Error Modal/Tooltip Logic */}
                    {error && (
                        <div className="absolute right-0 -bottom-1 transform translate-y-full z-20">
                            <div className="bg-red-600 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-1 fade-in duration-200 after:content-[''] after:absolute after:bottom-full after:right-4 after:border-l-[6px] after:border-r-[6px] after:border-b-[6px] after:border-transparent after:border-b-red-600">
                                <span className="uppercase tracking-wider">Invalid</span>
                                <span className="w-px h-3 bg-white/20"></span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;

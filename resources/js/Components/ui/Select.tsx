import React, { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export default function Select({ label, error, icon, children, className, id, ...props }: SelectProps) {
    const selectId = id || props.name;

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-slate-700 mb-1.5 ml-1"
                >
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className={clsx(
                        "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200",
                        error ? "text-red-400" : "text-slate-400 group-focus-within:text-primary-500"
                    )}>
                        {icon}
                    </div>
                )}
                <select
                    id={selectId}
                    className={clsx(
                        'block w-full h-10 rounded-lg border border-slate-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-900 text-sm appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] antialiased truncate',
                        icon ? 'pl-10' : 'pl-3.5',
                        'pr-10',
                        error && 'border-red-300 focus:border-red-500 focus:ring-red-50 focus:ring-4 bg-red-50/10',
                        className
                    )}
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                    }}
                    {...props}
                >
                    {children}
                </select>
            </div>
            {error && (
                <p className="mt-1.5 text-xs font-semibold text-red-600 ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                    {error}
                </p>
            )}
        </div>
    );
}

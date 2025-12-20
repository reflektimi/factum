import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';
import { getStatusColor } from '@/utils/format';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'status' | 'soft';
    status?: string;
}

export default function Badge({
    variant = 'default',
    status,
    children,
    className,
    ...props
}: BadgeProps) {
    const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold transition-all antialiased select-none';
    
    const variants = {
        default: 'bg-slate-100 text-slate-700',
        primary: 'bg-primary-50 text-primary-700 font-bold',
        secondary: 'bg-slate-200 text-slate-800',
        success: 'bg-emerald-50 text-emerald-700',
        danger: 'bg-red-50 text-red-700',
        warning: 'bg-amber-50 text-amber-700',
        info: 'bg-sky-50 text-sky-700',
        soft: 'bg-white shadow-sm border border-slate-100 text-slate-600',
        status: status ? getStatusColor(status) : 'bg-slate-100 text-slate-700',
    };
    
    const colorClasses = variant === 'status' ? variants.status : (variants[variant] || variants.default);
    
    return (
        <span
            className={clsx(baseClasses, colorClasses, className)}
            {...props}
        >
            {children || (status && status.charAt(0).toUpperCase() + status.slice(1))}
        </span>
    );
}

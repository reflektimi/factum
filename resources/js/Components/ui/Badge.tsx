import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';
import { getStatusColor } from '@/utils/format';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'status' | 'success' | 'danger' | 'warning' | 'info';
    status?: string;
}

export default function Badge({
    variant = 'default',
    status,
    children,
    className,
    ...props
}: BadgeProps) {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    let colorClasses = 'bg-primary-100 text-primary-800'; // default

    if (variant === 'status' && status) {
        colorClasses = getStatusColor(status);
    } else {
        const variants = {
            default: 'bg-gray-100 text-gray-800',
            success: 'bg-green-100 text-green-800',
            danger: 'bg-red-100 text-red-800',
            warning: 'bg-yellow-100 text-yellow-800',
            info: 'bg-blue-100 text-blue-800',
        };
        // @ts-ignore
        if (variants[variant]) {
             // @ts-ignore
            colorClasses = variants[variant];
        }
    }
    
    return (
        <span
            className={clsx(baseClasses, colorClasses, className)}
            {...props}
        >
            {children || (status && status.charAt(0).toUpperCase() + status.slice(1))}
        </span>
    );
}

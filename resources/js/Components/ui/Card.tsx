import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
}

export default function Card({
    padding = 'none',
    hoverable = false,
    children,
    className,
    ...props
}: CardProps) {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };
    
    return (
        <div
            className={clsx(
                'bg-white rounded-xl border border-slate-200/60 shadow-sm transition-all duration-200',
                paddingClasses[padding],
                hoverable && 'hover:shadow-md hover:-translate-y-0.5',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
    return (
        <div className={clsx('mb-4', className)} {...props}>
            {children}
        </div>
    );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
    return (
        <h3 className={clsx('text-lg font-heading font-semibold text-gray-900', className)} {...props}>
            {children}
        </h3>
    );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export function CardContent({ children, className, ...props }: CardContentProps) {
    return (
        <div className={clsx('text-gray-700', className)} {...props}>
            {children}
        </div>
    );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
    return (
        <div className={clsx('mt-4 pt-4 border-t border-gray-200', className)} {...props}>
            {children}
        </div>
    );
}

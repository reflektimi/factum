import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: ReactNode;
    subtitle?: string;
    actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 py-2 border-b border-slate-200/60 mb-8">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    {title}
                </div>
                {subtitle && (
                    <p className="text-sm text-slate-500 font-medium tracking-tight">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-3 pb-1">
                    {actions}
                </div>
            )}
        </div>
    );
}

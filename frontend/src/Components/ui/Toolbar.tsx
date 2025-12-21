import { type ReactNode } from 'react';
import clsx from 'clsx';

interface ToolbarProps {
    children: ReactNode;
    className?: string;
}

export default function Toolbar({ children, className }: ToolbarProps) {
    return (
        <div className={clsx("flex flex-col md:flex-row items-center gap-4 bg-white border border-slate-200 rounded-xl p-3 shadow-sm", className)}>
            {children}
        </div>
    );
}

export function ToolbarGroup({ children, className }: ToolbarProps) {
    return (
        <div className={clsx("flex items-center gap-3 w-full md:w-auto", className)}>
            {children}
        </div>
    );
}

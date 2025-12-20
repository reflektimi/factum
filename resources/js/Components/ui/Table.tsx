import React, { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import clsx from 'clsx';

// Generic Table Container (Add horizontal scroll handling)
export function Table({ className, children, ...props }: HTMLAttributes<HTMLTableElement>) {
    return (
        <div className="w-full overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
            <table className={clsx("w-full caption-bottom text-sm", className)} {...props}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <thead className={clsx("bg-slate-50/50 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-md", className)} {...props}>
            {children}
        </thead>
    );
}

export function TableBody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tbody className={clsx("divide-y divide-slate-100", className)} {...props}>
            {children}
        </tbody>
    );
}

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, children, ...props }, ref) => (
    <tr
        ref={ref}
        className={clsx(
            "transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100",
            className
        )}
        {...props}
    >
        {children}
    </tr>
));
TableRow.displayName = "TableRow";

export interface TableCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
    align?: 'left' | 'center' | 'right';
}

export function TableHead({ className, children, align = 'left', ...props }: TableCellProps) {
    return (
        <th
            className={clsx(
                "h-12 px-6 text-slate-500 font-semibold text-xs uppercase tracking-wider align-middle",
                align === 'left' && "text-left",
                align === 'center' && "text-center",
                align === 'right' && "text-right",
                className
            )}
            {...props}
        >
            {children}
        </th>
    );
}

export function TableCell({ className, children, align = 'left', ...props }: TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' | 'right' }) {
    return (
        <td
            className={clsx(
                "px-6 py-4 align-middle font-body text-slate-600 text-sm whitespace-nowrap",
                align === 'left' && "text-left",
                align === 'center' && "text-center",
                align === 'right' && "text-right",
                className
            )}
            {...props}
        >
            {children}
        </td>
    );
}

// Utility for actions column
export function TableActions({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx("flex items-center justify-end gap-2", className)} {...props}>
            {children}
        </div>
    );
}

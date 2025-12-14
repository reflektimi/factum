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
        <thead className={clsx("[&_tr]:border-b bg-slate-50/50", className)} {...props}>
            {children}
        </thead>
    );
}

export function TableBody({ className, children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
    return (
        <tbody className={clsx("[&_tr:last-child]:border-0", className)} {...props}>
            {children}
        </tbody>
    );
}

export function TableRow({ className, children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
    return (
        <tr 
            className={clsx(
                "border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50",
                className
            )} 
            {...props}
        >
            {children}
        </tr>
    );
}

export function TableHead({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
    return (
        <th
            className={clsx(
                "h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0",
                className
            )}
            {...props}
        >
            {children}
        </th>
    );
}

export function TableCell({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
    return (
        <td
            className={clsx(
                "p-4 align-middle [&:has([role=checkbox])]:pr-0 font-body text-slate-700",
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

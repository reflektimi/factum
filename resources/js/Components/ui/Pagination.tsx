import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface PaginationProps {
    data: PaginationData;
    className?: string;
}

export default function Pagination({ data, className }: PaginationProps) {
    if (data.last_page <= 1) {
        return null; // Don't show pagination if only one page
    }

    return (
        <div className={clsx('flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6', className)}>
            {/* Mobile: Simple prev/next */}
            <div className="flex flex-1 justify-between sm:hidden">
                {data.links[0]?.url ? (
                    <Link
                        href={data.links[0].url!}
                        className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Previous
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed">
                        Previous
                    </span>
                )}
                {data.links[data.links.length - 1]?.url ? (
                    <Link
                        href={data.links[data.links.length - 1].url!}
                        className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Next
                    </Link>
                ) : (
                    <span className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed">
                        Next
                    </span>
                )}
            </div>

            {/* Desktop: Full pagination */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-slate-700">
                        Showing <span className="font-medium">{data.from}</span> to{' '}
                        <span className="font-medium">{data.to}</span> of{' '}
                        <span className="font-medium">{data.total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        {/* Previous Button */}
                        {data.links[0]?.url ? (
                            <Link
                                href={data.links[0].url!}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </Link>
                        ) : (
                            <span className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-300 ring-1 ring-inset ring-slate-300 cursor-not-allowed bg-slate-50">
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </span>
                        )}

                        {/* Page Numbers */}
                        {data.links.slice(1, -1).map((link, index) => {
                            if (!link.url) {
                                return (
                                    <span
                                        key={index}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={index}
                                    href={link.url!}
                                    className={clsx(
                                        'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-slate-300 focus:z-20 focus:outline-offset-0',
                                        link.active
                                            ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                            : 'text-slate-900 hover:bg-slate-50'
                                    )}
                                    aria-current={link.active ? 'page' : undefined}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}

                        {/* Next Button */}
                        {data.links[data.links.length - 1]?.url ? (
                            <Link
                                href={data.links[data.links.length - 1].url!}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </Link>
                        ) : (
                            <span className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-300 ring-1 ring-inset ring-slate-300 cursor-not-allowed bg-slate-50">
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </span>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
}

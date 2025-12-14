import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import StatusBadge from '@/Components/ui/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import Dropdown from '@/Components/Dropdown';
import { Plus, Search, Filter, FileOutput, Calendar, MoreVertical, Edit, FileText } from 'lucide-react';
import { PaginatedData, Quote } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';

interface QuotesProps {
    quotes: PaginatedData<Quote>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Quotes({ quotes, filters }: QuotesProps) {
    const [search, setSearch] = useState(filters.search || '');
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('quotes.index'),
                    { search, status: filters.status },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-heading">
                            Quotes
                        </h2>
                        <p className="text-sm text-gray-500">
                            Create and manage estimates for your clients.
                        </p>
                    </div>
                    <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => router.visit(route('quotes.create'))}>
                        Create Quote
                    </Button>
                </div>
            }
        >
            <Head title="Quotes" />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                 <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search quotes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border-0 bg-transparent focus:ring-0 placeholder:text-gray-400"
                    />
                </div>
                <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                <Button variant="ghost" size="sm" icon={<Filter className="w-4 h-4" />}>
                    Status
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Quote #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quotes.data.length > 0 ? (
                        quotes.data.map((quote) => (
                            <TableRow key={quote.id}>
                                <TableCell className="font-medium text-gray-900">
                                    <Link
                                        href={route('quotes.show', quote.id)}
                                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        <FileOutput className="w-4 h-4" />
                                        {quote.number}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {quote.customer?.name}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {formatDate(quote.date)}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        {formatDate(quote.expiry_date)}
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900">
                                    {formatCurrency(quote.total_amount)}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={quote.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <TableActions>
                                        <Dropdown>
                                             <Dropdown.Trigger>
                                                <button className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content align="right" width="48">
                                                <Dropdown.Link href={route('quotes.show', quote.id)}>
                                                    View Details
                                                </Dropdown.Link>
                                                <Dropdown.Link href={route('quotes.edit', quote.id)}>
                                                    Edit Quote
                                                </Dropdown.Link>
                                                <Dropdown.Link href={route('quotes.show', quote.id) + '/pdf'} as="a" target="_blank">
                                                    Download PDF
                                                </Dropdown.Link>
                                                 {quote.status !== 'converted' && (
                                                    <>
                                                        <div className="border-t border-gray-100"></div>
                                                        <Dropdown.Link 
                                                            href={route('quotes.convert', quote.id)} 
                                                            method="post"
                                                            as="button"
                                                            className="text-indigo-600 hover:bg-indigo-50"
                                                        >
                                                            Convert to Invoice
                                                        </Dropdown.Link>
                                                    </>
                                                )}
                                                <div className="border-t border-gray-100"></div>
                                                <Dropdown.Link 
                                                    href={route('quotes.destroy', quote.id)} 
                                                    method="delete" 
                                                    as="button"
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </TableActions>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                No quotes found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </AuthenticatedLayout>
    );
}

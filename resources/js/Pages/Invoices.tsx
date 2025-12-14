import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import StatusBadge from '@/Components/ui/StatusBadge';
import Button from '@/Components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import { formatCurrency, formatDate } from '@/utils/format';
import { Plus, Search, Filter, MoreVertical, FileText } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';

import { router } from '@inertiajs/react';
import { PaginatedData, Invoice } from '@/types/models';
import { useState, useEffect } from 'react';

interface InvoicesProps {
    invoices: PaginatedData<Invoice>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Invoices({ invoices, filters }: InvoicesProps) {
    const [search, setSearch] = useState(filters.search || '');
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('invoices.index'),
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
                            Invoices
                        </h2>
                        <p className="text-sm text-gray-500">
                            Manage and track your invoices.
                        </p>
                    </div>
                    <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => router.visit(route('invoices.create'))}>
                        Create Invoice
                    </Button>
                </div>
            }
        >
            <Head title="Invoices" />

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                 <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Filter invoices..."
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

            {/* Invoices Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.data.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                                <Link
                                    href={route('invoices.show', invoice.id)}
                                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    {invoice.number}
                                </Link>
                            </TableCell>
                            <TableCell>{invoice.customer?.name}</TableCell>
                            <TableCell className="text-gray-500">{formatDate(invoice.date)}</TableCell>
                            <TableCell className="text-gray-500">{formatDate(invoice.due_date)}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(invoice.total_amount)}</TableCell>
                            <TableCell>
                                <StatusBadge status={invoice.status} />
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
                                            <Dropdown.Link href={route('invoices.show', invoice.id)}>
                                                View Details
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('invoices.edit', invoice.id)}>
                                                Edit Invoice
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('invoices.show', invoice.id) + '/pdf'} as="a" target="_blank">
                                                Download PDF
                                            </Dropdown.Link>
                                            <div className="border-t border-gray-100"></div>
                                            <Dropdown.Link 
                                                href={route('invoices.destroy', invoice.id)} 
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
                    ))}
                    {invoices.data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                                No invoices found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </AuthenticatedLayout>
    );
}

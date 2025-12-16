import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import StatusBadge from '@/Components/ui/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import Input from '@/Components/ui/Input';
import { Plus, Search, Filter } from 'lucide-react';
import { PaginatedData, CreditNote } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';

interface CreditNotesProps {
    creditNotes: PaginatedData<CreditNote>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function CreditNotes({ creditNotes, filters }: CreditNotesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '') || statusFilter !== (filters.status || 'all')) {
                router.get(
                    route('credit-notes.index'),
                    { search, status: statusFilter },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        Credit Notes
                    </h2>
                    <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => router.visit(route('credit-notes.create'))}>
                        Create Credit Note
                    </Button>
                </div>
            }
        >
            <Head title="Credit Notes" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search credit notes..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <select
                                    className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 h-[42px]"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Credit Notes Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Number</TableHead>
                                            <TableHead>Customer</TableHead>
                                            {/*<TableHead>Ref Invoice</TableHead>*/}
                                            <TableHead>Date</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {creditNotes.data.length > 0 ? (
                                            creditNotes.data.map((note) => (
                                                <TableRow key={note.id}>
                                                    <TableCell className="font-medium">
                                                        <Link
                                                            href={route('credit-notes.show', note.id)}
                                                            className="text-primary-600 hover:text-primary-700"
                                                        >
                                                            {note.number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900">
                                                        {note.customer?.name}
                                                    </TableCell>
                                                    {/*<TableCell className="text-gray-600">
                                                        {note.invoice ? note.invoice.number : '-'}
                                                    </TableCell>*/}
                                                    <TableCell className="text-gray-600">
                                                        {formatDate(note.date)}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-gray-900">
                                                        {formatCurrency(note.amount)}
                                                    </TableCell>
                                                    <TableCell>
                                                         <StatusBadge status={note.status} />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link href={route('credit-notes.show', note.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-gray-500 h-24">
                                                    No credit notes found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

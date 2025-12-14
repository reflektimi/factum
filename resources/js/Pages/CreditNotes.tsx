import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import StatusBadge from '@/Components/ui/StatusBadge';
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
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search credit notes..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        icon={<Search className="w-5 h-5" />}
                                    />
                                </div>
                                <select
                                    className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                        <CardHeader>
                            <CardTitle>All Credit Notes</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            {/*<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ref Invoice
                                            </th>*/}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {creditNotes.data.length > 0 ? (
                                            creditNotes.data.map((note) => (
                                                <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Link
                                                            href={route('credit-notes.show', note.id)}
                                                            className="font-medium text-primary-600 hover:text-primary-700"
                                                        >
                                                            {note.number}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                        {note.customer?.name}
                                                    </td>
                                                    {/*<td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {note.invoice ? note.invoice.number : '-'}
                                                    </td>*/}
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {formatDate(note.date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                                        {formatCurrency(note.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                         <StatusBadge status={note.status} />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link href={route('credit-notes.show', note.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                                    No credit notes found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

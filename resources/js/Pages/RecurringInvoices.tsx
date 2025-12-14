import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import StatusBadge from '@/Components/ui/StatusBadge';
import Badge from '@/Components/ui/Badge';
import Input from '@/Components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import Dropdown from '@/Components/Dropdown';
import { Plus, Search, Repeat, Calendar, MoreVertical, Edit2, Trash2, Filter } from 'lucide-react';
import { PaginatedData,  RecurringInvoice } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState } from 'react';

interface RecurringInvoicesProps {
    recurringInvoices: PaginatedData<RecurringInvoice>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function RecurringInvoices({ recurringInvoices, filters }: RecurringInvoicesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('recurring-invoices.index'), { search, status: statusFilter }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-heading">
                            Recurring Invoices
                        </h2>
                        <p className="text-sm text-gray-500">
                            Automate your billing with recurring profiles.
                        </p>
                    </div>
                    <Link href={route('recurring-invoices.create')}>
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                            New Recurring Profile
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Recurring Invoices" />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                 <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search profiles or customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border-0 bg-transparent focus:ring-0 placeholder:text-gray-400"
                    />
                </div>
                 <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center gap-2">
                    <select
                         className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="ended">Ended</option>
                    </select>
                    <Button onClick={handleSearch} variant="ghost" size="sm">
                        Apply
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Profile Name</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Interval</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {recurringInvoices.data.length > 0 ? (
                        recurringInvoices.data.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        <Repeat className="w-4 h-4 text-indigo-500" />
                                        {invoice.profile_name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {invoice.customer?.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="default" className="capitalize bg-purple-50 text-purple-700 border-purple-200">
                                        {invoice.interval}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        {invoice.next_run_date ? formatDate(invoice.next_run_date) : '-'}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-gray-900">
                                    {formatCurrency(invoice.total_amount)}
                                </TableCell>
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
                                                <Dropdown.Link href={route('recurring-invoices.show', invoice.id)}>
                                                    View Profile
                                                </Dropdown.Link>
                                                <Dropdown.Link href={route('recurring-invoices.edit', invoice.id)}>
                                                    Edit Profile
                                                </Dropdown.Link>
                                                <div className="border-t border-gray-100"></div>
                                                <Dropdown.Link 
                                                    href={route('recurring-invoices.destroy', invoice.id)} 
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
                                No recurring invoice profiles found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </AuthenticatedLayout>
    );
}

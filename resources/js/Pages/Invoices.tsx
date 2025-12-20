import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import PageHeader from '@/Components/ui/PageHeader';
import Toolbar from '@/Components/ui/Toolbar';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import { formatCurrency, formatDate } from '@/utils/format';
import { Plus, Search, FileText, MoreVertical, ExternalLink, Edit2, Trash2, Calendar, User, DollarSign, Activity } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import DeleteConfirmation from '@/Components/DeleteConfirmation';
import Pagination from '@/Components/ui/Pagination';
import { PaginatedData, Invoice } from '@/types/models';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

interface InvoicesProps {
    invoices: PaginatedData<Invoice>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Invoices({ invoices, filters }: InvoicesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                const params = { search, status: filters.status };
                const cleanParams = Object.fromEntries(
                    Object.entries(params).filter(([_, v]) => v)
                );
                
                router.get(
                    route('invoices.index'),
                    cleanParams,
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'unpaid': return 'danger';
            case 'overdue': return 'danger';
            case 'pending': return 'warning';
            case 'draft': return 'secondary';
            case 'sent': return 'primary';
            default: return 'soft';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Billing Ledger - Invoices" />

            <PageHeader 
                title="Invoices"
                subtitle="High-performance document management for accounts receivable and customer billing"
                actions={
                    <Button 
                        variant="primary" 
                        icon={<Plus className="w-5 h-5" />} 
                        onClick={() => router.visit(route('invoices.create'))}
                    >
                        Issue Invoice
                    </Button>
                }
            />

            <Toolbar className="mb-8 p-4">
                <div className="flex flex-col md:flex-row gap-4 w-full items-center">
                    <div className="relative flex-1 w-full">
                        <Input
                            placeholder="Locate invoice by number, customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full md:w-64">
                         <Select
                            value={filters.status || ''}
                            onChange={(e) => {
                                const params = { search, status: e.target.value };
                                const cleanParams = Object.fromEntries(
                                    Object.entries(params).filter(([_, v]) => v)
                                );
                                
                                router.get(
                                    route('invoices.index'),
                                    cleanParams,
                                    { preserveState: true, replace: true }
                                );
                            }}
                            icon={<Activity className="w-4 h-4" />}
                        >
                            <option value="">Fulfillment Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="unpaid">Unpaid</option>
                        </Select>
                    </div>
                </div>
            </Toolbar>

            <Card className="border-none shadow-premium-soft overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Invoice #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Timeline</TableHead>
                            <TableHead align="right">Fulfillment</TableHead>
                            <TableHead align="right" className="pr-6">Amount</TableHead>
                            <TableHead align="right" className="pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.data.length > 0 ? (
                            invoices.data.map((invoice) => (
                                <TableRow key={invoice.id} className="group hover:bg-slate-50/50 transition-all border-slate-50">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <Link
                                                    href={route('invoices.show', invoice.id)}
                                                    className="text-sm font-semibold text-slate-900 hover:text-primary-600 transition-colors block"
                                                >
                                                    {invoice.number}
                                                </Link>
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    ID: #{invoice.id}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-slate-700">
                                            {invoice.customer?.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[13px] text-slate-600 font-medium">
                                                {formatDate(invoice.date)}
                                            </div>
                                            <div className="text-[11px] text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded w-fit">
                                                Due {formatDate(invoice.due_date)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Badge
                                            variant={getStatusVariant(invoice.status)}
                                            className="font-medium text-[10px] uppercase tracking-wide"
                                        >
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell align="right" className="pr-6">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-slate-900">
                                                {formatCurrency(invoice.total_amount)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell align="right" className="pr-6">
                                        <TableActions>
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all border border-transparent">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link href={route('invoices.show', invoice.id)} className="flex items-center gap-2">
                                                        <ExternalLink className="w-4 h-4 opacity-50" />
                                                        View Details
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('invoices.edit', invoice.id)} className="flex items-center gap-2">
                                                        <Edit2 className="w-4 h-4 opacity-50" />
                                                        Edit Invoice
                                                    </Dropdown.Link>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <button
                                                        onClick={() => setDeleteId(invoice.id)}
                                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 opacity-50" />
                                                        Delete
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </TableActions>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="py-32 text-center bg-slate-50/20">
                                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-premium-soft flex items-center justify-center text-slate-200">
                                            <FileText className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-base font-black text-slate-900 uppercase tracking-widest">Clear Ledger</p>
                                            <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">
                                                No invoice records identified within the current fiscal scope.
                                            </p>
                                        </div>
                                        <Button 
                                            variant="soft" 
                                            className="h-11 border-slate-200"
                                            onClick={() => router.visit(route('invoices.create'))}
                                        >
                                            Initialize First Document
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Pagination data={invoices} />

            <DeleteConfirmation
                show={deleteId !== null}
                title="Archive Document Record"
                message="Are you sure you want to permanently purge this invoice from the document ledger? This action will impact fiscal reports."
                onConfirm={() => {
                    router.delete(route('invoices.destroy', deleteId!), {
                        onSuccess: () => setDeleteId(null),
                    });
                }}
                onCancel={() => setDeleteId(null)}
            />
        </AuthenticatedLayout>
    );
}

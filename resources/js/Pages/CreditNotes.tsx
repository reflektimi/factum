import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import DeleteConfirmation from '@/Components/DeleteConfirmation';
import Pagination from '@/Components/ui/Pagination';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import Toolbar from '@/Components/ui/Toolbar';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import { Plus, Search, FileText, ExternalLink, Calendar, User, MoreVertical, Activity, Edit2 } from 'lucide-react';
import { PaginatedData, CreditNote } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import Dropdown from '@/Components/Dropdown';

interface CreditNotesProps {
    creditNotes: PaginatedData<CreditNote>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function CreditNotes({ creditNotes, filters }: CreditNotesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '') || statusFilter !== (filters.status || '')) {
                const params = { search, status: statusFilter };
                const cleanParams = Object.fromEntries(
                    Object.entries(params).filter(([_, v]) => v)
                );
                
                router.get(
                    route('credit-notes.index'),
                    cleanParams,
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'sent':
                return 'primary';
            case 'refunded':
                return 'success';
            case 'draft':
                return 'secondary';
            default:
                return 'soft';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Credit Notes Management" />

            <PageHeader 
                title="Credit Notes"
                subtitle="Issue and manage credit memos and customer refunds"
                actions={
                    <Button 
                        variant="primary" 
                        icon={<Plus className="w-5 h-5" />} 
                        onClick={() => router.visit(route('credit-notes.create'))}
                    >
                        New Credit Note
                    </Button>
                }
            />

            <Toolbar className="mb-8 p-4">
                <div className="flex flex-col md:flex-row gap-4 w-full items-center">
                    <div className="relative flex-1 w-full">
                        <Input
                            placeholder="Locate note by number or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full md:w-64">
                         <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            icon={<Activity className="w-4 h-4 text-slate-400" />}
                        >
                            <option value="">Note Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="refunded">Refunded</option>
                        </Select>
                    </div>
                </div>
            </Toolbar>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Note #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead align="right">Amount</TableHead>
                            <TableHead align="right">Status</TableHead>
                            <TableHead align="right" className="pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {creditNotes.data.length > 0 ? (
                            creditNotes.data.map((note) => (
                                <TableRow key={note.id} className="group">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <Link
                                                href={route('credit-notes.show', note.id)}
                                                className="text-sm font-semibold text-slate-900 hover:text-primary-600 transition-colors block"
                                            >
                                                {note.number}
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-slate-700">
                                            {note.customer?.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-[13px] text-slate-600 font-medium">
                                            {formatDate(note.date)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <span className="text-sm font-bold text-slate-900">
                                            {formatCurrency(note.amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Badge 
                                            variant={getStatusVariant(note.status)} 
                                            className="font-medium text-[10px] uppercase tracking-wide"
                                        >
                                            {note.status}
                                        </Badge>
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
                                                    <Dropdown.Link href={route('credit-notes.show', note.id)} className="flex items-center gap-2 text-sm">
                                                        <ExternalLink className="w-4 h-4 opacity-50" />
                                                        View Details
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('credit-notes.edit', note.id)} className="flex items-center gap-2 text-sm">
                                                        <Edit2 className="w-4 h-4 opacity-50" />
                                                        Edit Record
                                                    </Dropdown.Link>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </TableActions>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <div className="p-4 bg-slate-50 rounded-full">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">No credit notes found</p>
                                        <p className="text-xs">Issued credit memos will appear here when created.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Pagination data={creditNotes} />
        </AuthenticatedLayout>
    );
}

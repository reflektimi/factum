import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Pagination from '@/Components/ui/Pagination';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import Toolbar from '@/Components/ui/Toolbar';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import { Plus, Search, FileText, ExternalLink, Activity, MoreVertical, Edit2 } from 'lucide-react';
import type { PaginatedData, CreditNote } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Dropdown from '@/Components/Dropdown';
import api from '@/lib/api';

export default function CreditNotes() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [creditNotes, setCreditNotes] = useState<PaginatedData<CreditNote> | null>(null);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');

    const fetchCreditNotes = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/credit-notes', {
                params: {
                    page: searchParams.get('page') || 1,
                    search: searchParams.get('search'),
                    status: searchParams.get('status'),
                }
            });
            setCreditNotes(response.data.creditNotes);
        } catch (error) {
            console.error('Failed to fetch credit notes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCreditNotes();
    }, [searchParams]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            if (search) newParams.set('search', search);
            else newParams.delete('search');
            
            if (statusFilter) newParams.set('status', statusFilter);
            else newParams.delete('status');
            
            newParams.set('page', '1');
            setSearchParams(newParams);
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
                        onClick={() => navigate('/credit-notes/create')}
                        className="shadow-lg shadow-indigo-100"
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

            <Card className="border-none shadow-premium-soft overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="pl-6 font-bold text-[10px] uppercase tracking-widest py-4">Note #</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Customer</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Date</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Amount</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Status</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={6} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400 animate-pulse">
                                        <div className="p-4 bg-slate-50 rounded-full">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">Synchronizing ledger...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : creditNotes?.data && creditNotes.data.length > 0 ? (
                            creditNotes.data.map((note) => (
                                <TableRow key={note.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shadow-sm">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <Link
                                                to={`/credit-notes/${note.id}`}
                                                className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors block"
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
                                        <span className="text-sm font-bold text-slate-900 font-mono">
                                            {formatCurrency(note.amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Badge 
                                            variant={getStatusVariant(note.status)} 
                                            className="font-bold text-[10px] uppercase tracking-wide px-2.5 py-1"
                                        >
                                            {note.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell align="right" className="pr-6">
                                        <TableActions>
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className="p-2 rounded-xl hover:bg-white hover:shadow-premium-soft text-slate-400 hover:text-slate-900 transition-all border border-transparent">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link to={`/credit-notes/${note.id}`} className="flex items-center gap-2 text-sm font-medium">
                                                        <ExternalLink className="w-4 h-4 opacity-50" />
                                                        View Details
                                                    </Dropdown.Link>
                                                    <Dropdown.Link to={`/credit-notes/${note.id}/edit`} className="flex items-center gap-2 text-sm font-medium">
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
                                        <p className="text-xs font-medium">Issued credit memos will appear here when created.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {creditNotes && <Pagination data={creditNotes} />}
        </AuthenticatedLayout>
    );
}

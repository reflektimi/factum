import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import Toolbar from '@/Components/ui/Toolbar';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import { Plus, Search, RefreshCw, MoreVertical, Edit2, Trash2, ExternalLink, Activity } from 'lucide-react';
import type { PaginatedData, RecurringInvoice } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';
import DeleteConfirmation from '@/Components/DeleteConfirmation';
import Pagination from '@/Components/ui/Pagination';
import Dropdown from '@/Components/Dropdown';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '@/lib/api';

export default function RecurringInvoices() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    
    const [recurringInvoices, setRecurringInvoices] = useState<PaginatedData<RecurringInvoice> | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(queryParams.get('search') || '');
    const [status, setStatus] = useState(queryParams.get('status') || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (status) params.status = status;
            params.page = queryParams.get('page') || 1;
            
            const response = await api.get('/api/recurring-invoices', { params });
            setRecurringInvoices(response.data.recurringInvoices);
        } catch (error) {
            console.error('Failed to fetch recurring invoices', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [location.search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentSearch = queryParams.get('search') || '';
            if (search !== currentSearch) {
                const newParams = new URLSearchParams(location.search);
                if (search) newParams.set('search', search); else newParams.delete('search');
                newParams.set('page', '1');
                navigate({ search: newParams.toString() }, { replace: true });
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'paused': return 'warning';
            case 'ended': return 'danger';
            default: return 'soft';
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/api/recurring-invoices/${deleteId}`);
            setDeleteId(null);
            fetchData();
        } catch (error) {
            console.error('Failed to delete recurring invoice', error);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Automation Registry - Recurring Invoices" />

            <PageHeader 
                title="Recurring Invoices"
                subtitle="Automated document generation for subscription-based models and scheduled billing"
                actions={
                    <Button 
                        variant="primary" 
                        icon={<Plus className="w-5 h-5" />} 
                        onClick={() => navigate('/recurring-invoices/create')}
                    >
                        Schedule Profile
                    </Button>
                }
            />

            <Toolbar className="mb-8 p-4">
                <div className="flex flex-col md:flex-row gap-4 w-full items-center">
                    <div className="relative flex-1 w-full">
                        <Input
                            placeholder="Identify automation profile by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            value={status}
                            onChange={(e) => {
                                const newStatus = e.target.value;
                                setStatus(newStatus);
                                const newParams = new URLSearchParams(location.search);
                                if (newStatus) newParams.set('status', newStatus); else newParams.delete('status');
                                newParams.set('page', '1');
                                navigate({ search: newParams.toString() }, { replace: true });
                            }}
                            icon={<Activity className="w-4 h-4" />}
                        >
                            <option value="">Automation State</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="ended">Ended</option>
                        </Select>
                    </div>
                </div>
            </Toolbar>

            <Card className="border-none shadow-premium-soft overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Profile Name</TableHead>
                            <TableHead>Interval</TableHead>
                            <TableHead>Chronology</TableHead>
                            <TableHead align="right">State</TableHead>
                            <TableHead align="right" className="pr-6">Amount</TableHead>
                            <TableHead align="right" className="pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-20 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-400 font-medium animate-pulse">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                        <span>Syncing automation registry...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : recurringInvoices?.data && recurringInvoices.data.length > 0 ? (
                            recurringInvoices.data.map((profile) => (
                                <TableRow key={profile.id} className="group hover:bg-slate-50/50 transition-all border-slate-50">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                <RefreshCw className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <Link 
                                                    to={`/recurring-invoices/${profile.id}`}
                                                    className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors block"
                                                >
                                                    {profile.profile_name}
                                                </Link>
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    ID: REC-{String(profile.id).padStart(5, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            {profile.interval}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[11px] text-slate-400 font-medium uppercase tracking-tight">
                                                Last: {profile.last_run_date ? formatDate(profile.last_run_date) : 'Infinite Wait'}
                                            </div>
                                            <div className="text-[11px] text-indigo-500 font-semibold uppercase tracking-tight bg-indigo-50 px-1.5 py-0.5 rounded w-fit">
                                                Next: {profile.next_run_date ? formatDate(profile.next_run_date) : 'No Schedule'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Badge 
                                            variant={getStatusVariant(profile.status)} 
                                            className="font-medium text-[10px] uppercase tracking-wide"
                                        >
                                            {profile.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell align="right" className="pr-6">
                                        <span className="text-sm font-bold text-slate-900">
                                            {formatCurrency(profile.total_amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right" className="pr-6">
                                        <TableActions>
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className="p-2.5 rounded-xl hover:bg-white hover:shadow-md text-slate-400 hover:text-slate-900 transition-all active:scale-95 border border-transparent hover:border-slate-100">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link to={`/recurring-invoices/${profile.id}`} className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all">
                                                        <ExternalLink className="w-4 h-4 opacity-50" />
                                                        Verify Profile
                                                    </Dropdown.Link>
                                                    <Dropdown.Link to={`/recurring-invoices/${profile.id}/edit`} className="flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-amber-600 hover:bg-amber-50/50 rounded-xl transition-all">
                                                        <Edit2 className="w-4 h-4 opacity-50" />
                                                        Refine Engine
                                                    </Dropdown.Link>
                                                    <div className="h-px bg-slate-50 my-1 mx-2"></div>
                                                    <button
                                                        onClick={() => setDeleteId(profile.id)}
                                                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50/50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4 opacity-50" />
                                                        Kill Process
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
                                            <RefreshCw className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-base font-black text-slate-900 uppercase tracking-widest">Automation Idle</p>
                                            <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">
                                                No recurring automation profiles indexed in the current administrative registry.
                                            </p>
                                        </div>
                                        <Button 
                                            variant="soft" 
                                            className="h-11 border-slate-200"
                                            onClick={() => navigate('/recurring-invoices/create')}
                                        >
                                            Schedule First Profile
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {recurringInvoices && <Pagination data={recurringInvoices} />}

            <DeleteConfirmation
                show={deleteId !== null}
                title="Decommission Automation Profile"
                message="Are you sure you want to kill this automation profile? Scheduled document generation will cease immediately."
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
            />
        </AuthenticatedLayout>
    );
}

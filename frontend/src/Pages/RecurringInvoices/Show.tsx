import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import Badge from '@/Components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import { ArrowLeft, Printer, Edit2, RefreshCw, Mail, Clock, FileText, Activity } from 'lucide-react';
import type { RecurringInvoice, Setting, ActivityLog } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import ActivityFeed from '@/Components/ui/ActivityFeed';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfirmModal from '@/Components/ui/ConfirmModal';
import api from '@/lib/api';

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export default function Show() {
    const { id } = useParams<{ id: string }>();
    const [recurringInvoice, setRecurringInvoice] = useState<(RecurringInvoice & { 
        customer?: { name: string; contact_info?: { email?: string; address?: string } };
        activity_logs?: ActivityLog[];
    }) | null>(null);
    const [settings, setSettings] = useState<Setting | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [showRunModal, setShowRunModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/api/recurring-invoices/${id}`);
                setRecurringInvoice(response.data.recurringInvoice);
                setSettings(response.data.settings || (await api.get('/api/settings')).data);
            } catch (error) {
                console.error('Failed to fetch profile details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleForceRun = async () => {
        setIsRunning(true);
        try {
            await api.post(`/api/recurring-invoices/${id}/run`);
            // Refresh data to show new activity logs or run dates
            const response = await api.get(`/api/recurring-invoices/${id}`);
            setRecurringInvoice(response.data.recurringInvoice);
        } catch (error) {
            console.error('Failed to manually execute profile:', error);
        } finally {
            setIsRunning(false);
            setShowRunModal(false);
        }
    };

    if (loading || !recurringInvoice) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Synchronising automation manifest...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const items = (Array.isArray(recurringInvoice.items) ? recurringInvoice.items : JSON.parse(recurringInvoice.items as unknown as string || '[]')) as InvoiceItem[];
    const primaryColor = settings?.primary_color || '#3b82f6';

    return (
        <AuthenticatedLayout>
            <Head title={`Recurring Profile - ${recurringInvoice.profile_name}`} />

            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                <PageHeader 
                    title={
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/recurring-invoices"
                                className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm group print:hidden mr-1"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            </Link>
                            <span>Profile: {recurringInvoice.profile_name}</span>
                        </div>
                    }
                    subtitle={`Automatic ${recurringInvoice.interval} billing for ${recurringInvoice.customer?.name}`}
                    actions={
                        <div className="flex gap-3 print:hidden">
                            <Button 
                                variant="soft" 
                                onClick={() => window.print()}
                                className="bg-white border-slate-200"
                                icon={<Printer className="w-4 h-4" />}
                            >
                                Print
                            </Button>
                            <Link to={`/recurring-invoices/${recurringInvoice.id}/edit`}>
                                <Button 
                                    variant="soft" 
                                    className="bg-white border-slate-200"
                                    icon={<Edit2 className="w-4 h-4" />}
                                >
                                    Edit Profile
                                </Button>
                            </Link>
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Document Content */}
                    <div className="lg:col-span-8">
                        <Card className="border-none shadow-premium-soft overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Visual Accent Top */}
                            <div className="h-2 w-full" style={{ backgroundColor: primaryColor }}></div>
                            
                            <CardContent className="p-0">
                                <div className="p-8 md:p-12 space-y-12">
                                    {/* Brand & Identity */}
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-6 font-heading">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-slate-50">
                                                    <RefreshCw className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-black tracking-tight text-slate-900 leading-none">RECURRING</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automation Engine</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-1 text-sm">
                                                    <p className="font-bold text-slate-900 text-base">{settings?.company_name || 'Financial Services Inc.'}</p>
                                                    <p className="text-slate-500 whitespace-pre-line leading-relaxed max-w-xs italic text-xs">{settings?.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right space-y-4">
                                            <h2 className="text-6xl font-black text-slate-900 tracking-tighter opacity-[0.03] absolute right-8 top-12 pointer-events-none select-none">DOC:RECURRING</h2>
                                            <div className="inline-flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing Interval</span>
                                                <Badge
                                                    variant="primary"
                                                    className="uppercase tracking-[0.2em] text-[10px] py-1.5 px-4 font-bold shadow-sm"
                                                >
                                                    {recurringInvoice.interval}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cycle Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-10 border-y border-slate-50/80">
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest inline-flex items-center gap-2">
                                                <span className="w-4 h-px bg-slate-200"></span>
                                                Subscribed Recipient
                                            </h4>
                                            <div className="space-y-4 pl-4 border-l-2 border-slate-200">
                                                <p className="text-2xl font-bold text-slate-900 leading-tight">{recurringInvoice.customer?.name}</p>
                                                <div className="text-sm text-slate-500 space-y-2 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5 opacity-50" />
                                                        {recurringInvoice.customer?.contact_info?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6 md:pl-12">
                                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest inline-flex items-center gap-2">
                                                <span className="w-4 h-px bg-slate-200"></span>
                                                Chronology Context
                                            </h4>
                                            <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50 flex flex-col gap-1 shadow-inner">
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Start Point</span>
                                                    <span className="font-bold text-slate-900">{formatDate(recurringInvoice.start_date)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Next Execution</span>
                                                    <span className="font-bold text-indigo-600">{recurringInvoice.next_run_date ? formatDate(recurringInvoice.next_run_date) : '-'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Last Run</span>
                                                    <span className="font-bold text-slate-500">{recurringInvoice.last_run_date ? formatDate(recurringInvoice.last_run_date) : 'Never executed'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line Items Table */}
                                    <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="py-5 text-slate-900 font-bold text-[10px] uppercase tracking-widest pl-6">Service Pattern</TableHead>
                                                    <TableHead className="py-5 text-slate-900 font-bold text-[10px] uppercase tracking-widest text-right">Qty</TableHead>
                                                    <TableHead className="py-5 text-slate-900 font-bold text-[10px] uppercase tracking-widest text-right">Unit price</TableHead>
                                                    <TableHead className="py-5 text-slate-900 font-bold text-[10px] uppercase tracking-widest pr-6 text-right">Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {items.map((item, index) => (
                                                    <TableRow key={index} className="hover:bg-slate-50/30 border-slate-50 group">
                                                        <TableCell className="py-6 pl-6 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                            {item.description}
                                                        </TableCell>
                                                        <TableCell className="py-6 text-slate-500 font-bold text-right">
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell className="py-6 text-slate-500 font-bold font-mono text-xs text-right">
                                                            {formatCurrency(item.price)}
                                                        </TableCell>
                                                        <TableCell className="py-6 pr-6 text-slate-900 font-bold font-mono text-sm text-right">
                                                            {formatCurrency(item.quantity * item.price)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="flex flex-col md:flex-row gap-12 justify-between items-end pt-8">
                                        <div className="w-full max-w-[280px]">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div className="text-[10px] leading-relaxed font-bold text-slate-500 uppercase tracking-tight">
                                                    Cycle automated via system scheduler
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full max-w-sm space-y-4 bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-100/50 text-right">
                                           <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Per Cycle</span>
                                                <span className="text-4xl font-bold text-slate-900 font-mono tracking-tighter">
                                                    {formatCurrency(recurringInvoice.total_amount)}
                                                </span>
                                           </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6 print:hidden">
                        <Card className="border-none shadow-premium-soft overflow-hidden group">
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Automation History</h3>
                                    <Activity className="w-4 h-4 text-slate-300" />
                                </div>
                                
                                <ActivityFeed activities={recurringInvoice.activity_logs || []} />

                                <div className="space-y-3 pt-6 border-t border-slate-50">
                                    <Button 
                                        variant="soft" 
                                        fullWidth 
                                        className="h-10 text-[10px] font-bold uppercase tracking-widest bg-white hover:bg-slate-50 border-slate-100"
                                        onClick={() => setShowRunModal(true)}
                                        loading={isRunning}
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 mr-2" />
                                        Force Run Now
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-none shadow-premium-soft bg-slate-900 text-white overflow-hidden relative">
                             <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                <FileText className="w-32 h-32" />
                             </div>
                            <CardContent className="p-8 space-y-6 relative z-10">
                                <div>
                                    <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400 mb-1">Enginge Status</h3>
                                    <p className="text-2xl font-bold tracking-tight capitalize">{recurringInvoice.status}</p>
                                </div>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    This profile currently generates active ledger entries based on its interval.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showRunModal}
                onClose={() => setShowRunModal(false)}
                onConfirm={handleForceRun}
                title="Trigger Manual Execution?"
                message="This will immediately generate a new invoice entry for this cycle regardless of the scheduled date. This action will be logged in the audit trail."
                confirmText="Execute Now"
                variant="warning"
                loading={isRunning}
            />
        </AuthenticatedLayout>
    );
}

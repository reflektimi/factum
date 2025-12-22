import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import PageHeader from '@/Components/ui/PageHeader';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/Table';
import { ArrowLeft, Printer, Download, Mail, ExternalLink, Activity, CreditCard, Send, CheckCircle2 } from 'lucide-react';
import type { Invoice, Setting, ActivityLog } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import ActivityFeed from '@/Components/ui/ActivityFeed';
import EngagementCard from '@/Components/ui/EngagementCard';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import ConfirmModal from '@/Components/ui/ConfirmModal';

export default function Show() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<(Invoice & { 
        customer: { name: string; contact_info?: { email?: string; address?: string } };
        activity_logs?: ActivityLog[];
    }) | null>(null);
    const [settings, setSettings] = useState<Setting | null>(null);
    const [loading, setLoading] = useState(true);
    const [isResending, setIsResending] = useState(false);
    const [showPublicModal, setShowPublicModal] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch invoice (which now includes settings in the JSON response!)
                const response = await api.get(`/api/invoices/${id}`);
                setInvoice(response.data.invoice);
                // The controller now sends 'settings' in the same response
                if (response.data.settings) {
                    setSettings(response.data.settings);
                } else {
                    // Fallback if settings not in response (though I added them)
                    const settingsRes = await api.get('/api/settings');
                    setSettings(settingsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch invoice details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading || !invoice) {
        return (
            <AuthenticatedLayout>
                 <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Loading invoice details...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const items = (Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items as unknown as string || '[]')) as any[];

    const primaryColor = settings?.primary_color || '#3b82f6';

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'unpaid': return 'danger';
            case 'overdue': return 'danger';
            case 'sent': return 'primary';
            case 'draft': return 'secondary';
            default: return 'soft';
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await api.post(`/api/invoices/${invoice.id}/resend`);
            // Success notification could be added here
        } catch (error) {
            console.error('Failed to resend invoice:', error);
        } finally {
            setIsResending(false);
        }
    };

    const handlePublicUrl = () => {
        const url = `${window.location.origin}/public/invoices/${invoice.id}`;
        navigator.clipboard.writeText(url);
        setShowPublicModal(true);
    };

    const handleDownload = () => {
        window.open(`${api.defaults.baseURL}/api/invoices/${invoice.id}/download`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Invoice Review - ${invoice.number}`} />

            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                <PageHeader 
                    title={
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/invoices"
                                className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm group print:hidden mr-1"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            </Link>
                            <span>Invoice {invoice.number}</span>
                        </div>
                    }
                    subtitle={`Generated for ${invoice.customer?.name} on ${formatDate(invoice.date)}`}
                    actions={
                        <div className="flex gap-3 print:hidden">
                            <Button 
                                variant="soft" 
                                onClick={() => window.print()}
                                className="bg-white"
                                icon={<Printer className="w-4 h-4" />}
                            >
                                Print
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={handleDownload}
                                className="shadow-lg shadow-indigo-100"
                                icon={<Download className="w-4 h-4" />}
                            >
                                Get PDF
                            </Button>
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
                                            {settings?.logo_path ? (
                                                <img src={settings.logo_path} alt="Company Logo" className="h-14 object-contain mb-6" />
                                            ) : (
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-slate-50">
                                                        {settings?.company_name?.[0] || 'F'}
                                                    </div>
                                                    <span className="text-2xl font-black tracking-tight text-slate-900">{settings?.company_name || 'Finances'}</span>
                                                </div>
                                            )}
                                            <div className="space-y-4">
                                                <div className="space-y-1 text-sm">
                                                    <p className="font-bold text-slate-900 text-base">{settings?.company_name || 'Financial Services Inc.'}</p>
                                                    <p className="text-slate-500 whitespace-pre-line leading-relaxed max-w-xs">{settings?.address}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {settings?.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left md:text-right space-y-4">
                                            <h2 className="text-6xl font-black text-slate-900 tracking-tighter opacity-[0.03] absolute right-8 top-12 pointer-events-none select-none">DOC:INVOICE</h2>
                                            <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shadow-inner">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No.</span>
                                                <span className="text-lg font-bold text-slate-900 px-2">#{invoice.number}</span>
                                            </div>
                                            <div className="pt-2">
                                                <Badge
                                                    variant={getStatusVariant(invoice.status)}
                                                    className="uppercase tracking-[0.2em] text-[10px] py-1.5 px-4 font-black shadow-sm"
                                                >
                                                    {invoice.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer & Billing Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-10 border-y border-slate-50/80">
                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest inline-flex items-center gap-2">
                                                <span className="w-4 h-px bg-slate-200"></span>
                                                Recipient
                                            </h4>
                                            <div className="space-y-4 pl-4 border-l-2 border-indigo-100">
                                                <p className="text-2xl font-black text-slate-900 leading-tight">{invoice.customer?.name}</p>
                                                <div className="text-sm text-slate-500 space-y-2 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5 opacity-50" />
                                                        {invoice.customer?.contact_info?.email}
                                                    </div>
                                                    <p className="whitespace-pre-line leading-relaxed italic">{invoice.customer?.contact_info?.address}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-6 md:pl-12">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest inline-flex items-center gap-2">
                                                <span className="w-4 h-px bg-slate-200"></span>
                                                Financial Profile
                                            </h4>
                                            <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50 flex flex-col gap-1 shadow-inner">
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Issue Date</span>
                                                    <span className="font-bold text-slate-900">{formatDate(invoice.date)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Due Until</span>
                                                    <span className="font-bold text-red-600">{formatDate(invoice.due_date)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm px-1">
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Account ID</span>
                                                    <span className="font-bold text-slate-900 font-mono text-xs">ACC-{invoice.customer_id.toString().padStart(5, '0')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line Items Table */}
                                    <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
                                        <Table>
                                            <TableHeader className="bg-slate-50/80 border-b border-slate-100">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="py-5 text-slate-900 font-black text-[10px] uppercase tracking-widest pl-6">Service Description</TableHead>
                                                    <TableHead className="py-5 text-slate-900 font-black text-[10px] uppercase tracking-widest text-right">Qty</TableHead>
                                                    <TableHead className="py-5 text-slate-900 font-black text-[10px] uppercase tracking-widest text-right">Unit Price</TableHead>
                                                    <TableHead className="py-5 text-slate-900 font-black text-[10px] uppercase tracking-widest text-right pr-6">Amount</TableHead>
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
                                                        <TableCell className="py-6 pr-6 text-slate-900 font-black font-mono text-sm text-right">
                                                            {formatCurrency(item.total)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Totals Section */}
                                    <div className="flex flex-col md:flex-row gap-12 justify-between items-end pt-8">
                                        <div className="w-full max-w-[280px]">
                                            <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <div className="text-[10px] leading-relaxed font-bold text-indigo-700 uppercase tracking-tight">
                                                    Verified for payment processing
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full max-w-sm space-y-4 bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-100/50">
                                            <div className="flex justify-between items-center text-sm px-2">
                                                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Subtotal (NET)</span>
                                                <span className="text-slate-900 font-bold font-mono">{formatCurrency(invoice.total_amount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm px-2">
                                                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Applicable TAX (0%)</span>
                                                <span className="text-slate-400 font-bold font-mono">$0.00</span>
                                            </div>
                                            <div className="pt-6 border-t border-slate-200/60 flex justify-between items-end px-2">
                                                <div>
                                                    <span className="text-2xl font-black text-slate-900 tracking-tight block">TOTAL</span>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Gross Payable</span>
                                                </div>
                                                <span className="text-4xl font-black text-slate-900 font-mono tracking-tighter" style={{ color: primaryColor }}>
                                                    {formatCurrency(invoice.total_amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-slate-100/80">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest inline-flex items-center gap-2">
                                                <span className="w-4 h-px bg-slate-200"></span>
                                                Payment Instructions
                                            </h4>
                                            <div className="bg-slate-50/80 rounded-3xl p-6 text-[11px] text-slate-500 font-bold whitespace-pre-line leading-relaxed shadow-inner border border-slate-100/50">
                                                {settings?.bank_details || 'Please contact binary-ops for settlement details.'}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest inline-flex items-center gap-2">
                                                <span className="w-4 h-px bg-slate-200"></span>
                                                Terms & Privacy
                                            </h4>
                                            <div className="p-2 space-y-4">
                                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                                                    Payment terms are {Math.ceil((new Date(invoice.due_date).getTime() - new Date(invoice.date).getTime()) / (1000 * 60 * 60 * 24))} days from the issue date. Late settlements may incur administrative overhead charges as per section 4.2 of the master agreement.
                                                </p>
                                                <div className="pt-4 flex items-center gap-2 text-slate-300">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                        <Activity className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Digital-Auth: {invoice.id}-{Date.now()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Actions / Metadata */}
                    <div className="lg:col-span-4 space-y-6 print:hidden">
                        <Card className="border-none shadow-premium-soft overflow-hidden group">
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Document Lifecycle</h3>
                                    <Activity className="w-4 h-4 text-slate-300" />
                                </div>
                                
                                <ActivityFeed activities={invoice.activity_logs || []} />

                                <div className="space-y-3 pt-6 border-t border-slate-50">
                                    <Button 
                                        variant="soft" 
                                        fullWidth 
                                        className="h-10 text-[10px] font-bold uppercase tracking-widest bg-white hover:bg-slate-50 border-slate-100"
                                        onClick={handleResend}
                                        loading={isResending}
                                    >
                                        <Send className="w-3.5 h-3.5 mr-2" />
                                        Resend Notification
                                    </Button>
                                    <Button 
                                        variant="soft" 
                                        fullWidth 
                                        className="h-10 text-[10px] font-bold uppercase tracking-widest bg-white hover:bg-slate-50 border-slate-100"
                                        onClick={handlePublicUrl}
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                        Public URL
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <EngagementCard activities={invoice.activity_logs || []} />
                        
                        <Card className="border-none shadow-premium-soft bg-slate-900 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                <CreditCard className="w-32 h-32" />
                            </div>
                            <CardContent className="p-8 space-y-6 relative z-10">
                                <div>
                                    <h3 className="font-bold uppercase tracking-widest text-[10px] text-slate-400 mb-1">Settlement Status</h3>
                                    <p className="text-2xl font-bold tracking-tight capitalize">{invoice.status}</p>
                                </div>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                    {invoice.status === 'paid' ? 'This document has been fully settled and reconciled.' : 'No transaction records have been reconciled for this ledger entry yet.'}
                                </p>
                                <div className="pt-2">
                                    <Button 
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white border-none font-bold h-11 text-xs uppercase tracking-widest shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                                        fullWidth
                                        onClick={() => navigate(`/payments/create?invoice_id=${invoice.id}`)}
                                        disabled={invoice.status === 'paid'}
                                    >
                                        Register Settlement
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showPublicModal}
                onClose={() => setShowPublicModal(false)}
                onConfirm={() => setShowPublicModal(false)}
                title="Public URL Copied"
                message="The guest access URL has been copied to your clipboard. You can now share it with the recipient for direct viewing without authentication."
                confirmText="Got it"
                variant="primary"
            />
        </AuthenticatedLayout>
    );
}

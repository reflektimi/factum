import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import PageHeader from '@/Components/ui/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import { ArrowLeft, Printer, FileCheck, Edit2, Download, Building2, User2, Clock, CheckCircle2, FileText, Send, Activity, ExternalLink } from 'lucide-react';
import type { Quote, Setting, ActivityLog } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import ActivityFeed from '@/Components/ui/ActivityFeed';
import EngagementCard from '@/Components/ui/EngagementCard';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfirmModal from '@/Components/ui/ConfirmModal';
import api from '@/lib/api';

interface QuoteItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export default function Show() {
    const { id } = useParams<{ id: string }>();
    const [quote, setQuote] = useState<(Quote & { activity_logs?: ActivityLog[] }) | null>(null);
    const [settings, setSettings] = useState<Setting | null>(null);
    const [loading, setLoading] = useState(true);
    const [isResending, setIsResending] = useState(false);
    const [showPublicModal, setShowPublicModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [quoteRes, settingsRes] = await Promise.all([
                    api.get(`/api/quotes/${id}`),
                    api.get('/api/settings')
                ]);
                setQuote(quoteRes.data);
                setSettings(settingsRes.data);
            } catch (error) {
                console.error('Failed to fetch quote data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const items = quote ? (Array.isArray(quote.items) ? quote.items : JSON.parse(quote.items as unknown as string || '[]')) as QuoteItem[] : [];

    const primaryColor = settings?.primary_color || '#3b82f6';

    const handleConvert = async () => {
        setIsConverting(true);
        try {
            await api.post(`/api/quotes/${id}/convert`);
            setShowConvertModal(false);
            // Refresh quote data to show converted status or redirect to the new invoice
            const response = await api.get(`/api/quotes/${id}`);
            setQuote(response.data.quote);
        } catch (error) {
            console.error('Failed to convert quote:', error);
        } finally {
            setIsConverting(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await api.post(`/api/quotes/${id}/resend`);
        } catch (error) {
            console.error('Failed to resend quote:', error);
        } finally {
            setIsResending(false);
        }
    };

    const handlePublicUrl = () => {
        // In a real SPA, this would be the actual public route
        const url = `${window.location.origin}/public/quotes/${quote?.id}`;
        navigator.clipboard.writeText(url);
        setShowPublicModal(true);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'rejected': return 'danger';
            case 'converted': return 'success';
            case 'accepted': return 'success';
            default: return 'secondary';
        }
    };

    if (loading || !quote) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Rendering proposal artifact...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Quote ${quote.number}`} />

            <PageHeader 
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/quotes"
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm group print:hidden mr-1"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="font-heading font-black text-2xl tracking-tight">Quote</span>
                            <span className="text-slate-400 font-mono text-xl">{quote.number}</span>
                            <Badge variant={getStatusVariant(quote.status)} className="capitalize px-3 py-1 font-bold tracking-wide">
                                {quote.status}
                            </Badge>
                        </div>
                    </div>
                }
                actions={
                    <div className="flex gap-3 print:hidden">
                        <Button 
                            variant="soft" 
                            icon={<Printer className="w-4 h-4" />} 
                            onClick={() => window.print()}
                            className="bg-white border-slate-200 h-10"
                        >
                            Print
                        </Button>
                        <Button 
                            variant="soft" 
                            icon={<Download className="w-4 h-4" />} 
                            className="bg-white border-slate-200 h-10"
                            onClick={() => window.open(`${api.defaults.baseURL}/api/quotes/${quote.id}/download`, '_blank')}
                        >
                            PDF
                        </Button>
                        <Link to={`/quotes/${quote.id}/edit`}>
                            <Button variant="soft" icon={<Edit2 className="w-4 h-4" />} className="bg-white border-slate-200 h-10">
                                Edit
                            </Button>
                        </Link>
                        {quote.status !== 'converted' && (
                            <Button 
                                variant="primary" 
                                icon={<FileCheck className="w-5 h-5 font-black" />} 
                                onClick={() => setShowConvertModal(true)}
                                className="shadow-lg shadow-indigo-100 h-10"
                            >
                                Convert to Invoice
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Quote Document */}
                <div className="lg:col-span-12 xl:col-span-9 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="border-none shadow-premium-soft overflow-hidden print:shadow-none print:border-none">
                        {/* High-fidelity Header Branding */}
                        <div className="h-2 w-full" style={{ backgroundColor: primaryColor }}></div>
                        
                        <CardContent className="p-8 md:p-12 space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-100 pb-12">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {settings?.logo_path ? (
                                                <img src={settings.logo_path} alt="CMS" className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText className="w-8 h-8" />
                                            )}
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{settings?.company_name || 'FINANCE-SAAS'}</h1>
                                            <p className="text-slate-400 font-mono text-xs font-bold tracking-widest px-0.5">ESTIMATION DOCUMENT</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            {settings?.company_name}
                                        </p>
                                        <p className="text-xs text-slate-500 max-w-xs leading-relaxed pl-6">
                                            {settings?.address || 'Primary Business Registered Address'}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Quote Reference</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter font-mono">{quote.number}</p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Issuance</span>
                                            <span className="font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-slate-700">{formatDate(quote.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Valid Until</span>
                                            <span className="font-mono bg-red-50 px-3 py-1 rounded-lg border border-red-100 text-red-600 font-bold">{formatDate(quote.expiry_date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recipient / Financial Profile */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <User2 className="w-3.5 h-3.5" />
                                        Recipient Information
                                    </h3>
                                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 space-y-3">
                                        <p className="text-xl font-black text-slate-900 tracking-tight">{quote.customer?.name}</p>
                                        <div className="space-y-1 text-sm text-slate-500 font-medium">
                                            <p>{quote.customer?.contact_info?.email}</p>
                                            <p className="leading-relaxed">{quote.customer?.contact_info?.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 md:text-right">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-end gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        Approval Summary
                                    </h3>
                                    <div className="p-6 space-y-3">
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter truncate">
                                            {formatCurrency(quote.total_amount)}
                                        </p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">
                                            Estimated Total Gross
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="pt-4">
                                <Table>
                                    <TableHeader className="bg-slate-50 border-b-2 border-slate-100">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 py-6 pl-6">Service / Description</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 text-right">Quantity</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 text-right">Unit Rate</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 text-right pr-6">Line Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="py-6 pl-6">
                                                    <p className="font-bold text-slate-900">{item.description}</p>
                                                    <p className="text-xs text-slate-400 font-mono mt-0.5">Item Ref: #{index + 101}</p>
                                                </TableCell>
                                                <TableCell className="py-6 text-right font-bold text-slate-600">{item.quantity}</TableCell>
                                                <TableCell className="py-6 text-right font-mono text-slate-600">{formatCurrency(item.price)}</TableCell>
                                                <TableCell className="py-6 text-right font-black text-slate-900 pr-6 font-mono tracking-tight">
                                                    {formatCurrency(item.total)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Totals Section */}
                            <div className="flex flex-col md:flex-row justify-between gap-12 pt-8">
                                <div className="flex-1 space-y-4">
                                    <div className="p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 flex items-start gap-4 max-w-md">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">Estimation Verified</p>
                                            <p className="text-[10px] text-indigo-700 leading-relaxed font-semibold">
                                                This quotation is valid for thirty (30) days from the issuance date. Upon acceptance, the terms and pricing are bound for the service execution.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {quote.notes && (
                                        <div className="space-y-2 max-w-md ml-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Notes</p>
                                            <p className="text-xs text-slate-500 leading-relaxed italic">{quote.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-80 space-y-4">
                                    <div className="px-6 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Subtotal Result</span>
                                            <span className="font-mono font-bold text-slate-600">{formatCurrency(quote.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Value Added Tax</span>
                                            <span className="font-mono text-slate-400 italic">Excluded</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group">
                                         <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <FileText className="w-20 h-20 text-white transform rotate-12" />
                                        </div>
                                        <div className="relative z-10 space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">TOTAL QUOTE VALUE</span>
                                            <div className="flex items-baseline justify-between text-white">
                                                <span className="text-3xl font-black font-mono tracking-tighter">
                                                    {formatCurrency(quote.total_amount)}
                                                </span>
                                                <span className="text-xs font-black text-slate-500 italic uppercase">USD</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details & Terms */}
                            <div className="pt-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 items-end opacity-60">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Execution Terms</p>
                                        <p className="text-[9px] text-slate-500 leading-relaxed font-medium uppercase tracking-tighter">
                                            Standard service level agreements apply. Digital authorization of this document constitutes a binding intent for engagement.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Digital-Auth: {quote.id.toString().padStart(6, '0')}</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ISO-9001 COMPLIANT</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Registry</p>
                                    <p className="text-xs text-slate-900 font-bold uppercase italic tracking-tighter">
                                        {settings?.company_name || 'FINANCE-SAAS GLOBAL LEDGER'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Engagement Sidebar - Visual Polish */}
                <div className="lg:col-span-12 xl:col-span-3 space-y-6 print:hidden">
                    <Card className="border-none shadow-premium-soft overflow-hidden group">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Document Lifecycle</h3>
                                <Activity className="w-4 h-4 text-slate-300" />
                            </div>
                            
                            <ActivityFeed activities={quote.activity_logs || []} />

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

                    <EngagementCard activities={quote.activity_logs || []} />
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

            <ConfirmModal
                isOpen={showConvertModal}
                onClose={() => setShowConvertModal(false)}
                onConfirm={handleConvert}
                title="Convert to Invoice"
                message="This will generate a formal ledger entry and close this quotation for further adjustments. This action is audited and permanent."
                confirmText="Proceed with Conversion"
                variant="primary"
                loading={isConverting}
            />
        </AuthenticatedLayout>
    );
}

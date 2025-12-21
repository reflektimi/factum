import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import PageHeader from '@/Components/ui/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import { ArrowLeft, Printer, Edit2, Building2, User2, Clock, CheckCircle2, FileText, Send, Download, Activity } from 'lucide-react';
import type { CreditNote, Setting, ActivityLog } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import ActivityFeed from '@/Components/ui/ActivityFeed';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/lib/api';

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export default function Show() {
    const { id } = useParams<{ id: string }>();
    const [creditNote, setCreditNote] = useState<(CreditNote & { activity_logs?: ActivityLog[] }) | null>(null);
    const [settings, setSettings] = useState<Setting | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [noteRes, settingsRes] = await Promise.all([
                    api.get(`/api/credit-notes/${id}`),
                    api.get('/api/settings')
                ]);
                setCreditNote(noteRes.data.creditNote);
                setSettings(settingsRes.data);
            } catch (error) {
                console.error('Failed to fetch credit note show data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const items = creditNote ? (typeof creditNote.items === 'string' ? JSON.parse(creditNote.items) : creditNote.items) as InvoiceItem[] : [];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'refunded': return 'success';
            case 'sent': return 'primary';
            case 'draft': return 'secondary';
            default: return 'soft';
        }
    };

    if (loading || !creditNote) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Processing adjustment request...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Credit Note ${creditNote.number}`} />

            <PageHeader 
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/credit-notes"
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm group print:hidden"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="font-heading font-black text-2xl tracking-tight text-slate-900">Credit Note</span>
                            <span className="text-slate-400 font-mono text-xl">{creditNote.number}</span>
                            <Badge variant={getStatusVariant(creditNote.status)} className="capitalize px-3 py-1 font-bold tracking-wide">
                                {creditNote.status}
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
                            onClick={() => window.open(`${api.defaults.baseURL}/api/credit-notes/${creditNote.id}/download`, '_blank')}
                        >
                            PDF
                        </Button>
                        <Link to={`/credit-notes/${creditNote.id}/edit`}>
                            <Button variant="soft" icon={<Edit2 className="w-4 h-4" />} className="bg-white border-slate-200 h-10">
                                Edit
                            </Button>
                        </Link>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
                {/* Main Credit Note Document */}
                <div className="lg:col-span-12 xl:col-span-9 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Card className="border-none shadow-premium-soft overflow-hidden print:shadow-none print:border-none uppercase-labels">
                        {/* High-fidelity Header Branding */}
                        <div className="h-2 w-full" style={{ backgroundColor: '#ef4444' }}></div>
                        
                        <CardContent className="p-8 md:p-12 space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-100 pb-12">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0"
                                            style={{ backgroundColor: '#ef4444' }}
                                        >
                                            {settings?.logo_path ? (
                                                <img src={settings.logo_path} alt="CMS" className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText className="w-8 h-8" />
                                            )}
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{settings?.company_name || 'FINANCE-SAAS'}</h1>
                                            <p className="text-red-500 font-mono text-xs font-black tracking-widest px-0.5 underline decoration-2 underline-offset-4">CREDIT ADJUSTMENT</p>
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
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Document Ref</p>
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter font-mono">{creditNote.number}</p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Credit Date</span>
                                            <span className="font-mono bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-slate-700">{formatDate(creditNote.date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recipient / Financial Profile */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <User2 className="w-3.5 h-3.5" />
                                        Adjusted Account
                                    </h3>
                                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 space-y-3">
                                        <p className="text-xl font-black text-slate-900 tracking-tight">{creditNote.customer?.name}</p>
                                        <div className="space-y-1 text-sm text-slate-500 font-medium">
                                            <p>{creditNote.customer?.contact_info?.email}</p>
                                            <p className="leading-relaxed">{creditNote.customer?.contact_info?.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 md:text-right">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-end gap-2">
                                        <Clock className="w-3.5 h-3.5" />
                                        Balance Adjustment
                                    </h3>
                                    <div className="p-6 space-y-3">
                                        <p className="text-3xl font-black text-red-600 tracking-tighter truncate">
                                            -{formatCurrency(creditNote.amount)}
                                        </p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">
                                            Total Credit Amount
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="pt-4 overflow-hidden rounded-2xl border border-slate-100">
                                <Table>
                                    <TableHeader className="bg-slate-50 border-b-2 border-slate-100">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 py-6 pl-8">Adjustment Item</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 text-right">Quantity</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 text-right">Base Rate</TableHead>
                                            <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800 text-right pr-8">Total Credit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="py-6 pl-8">
                                                    <p className="font-bold text-slate-900">{item.description}</p>
                                                    <p className="text-xs text-slate-400 font-mono mt-0.5">Ref: #ADJ-{index + 201}</p>
                                                </TableCell>
                                                <TableCell className="py-6 text-right font-bold text-slate-600">{item.quantity}</TableCell>
                                                <TableCell className="py-6 text-right font-mono text-slate-600">{formatCurrency(item.price)}</TableCell>
                                                <TableCell className="py-6 text-right font-black text-red-600 pr-8 font-mono tracking-tight">
                                                    -{formatCurrency((item.quantity || 0) * (item.price || 0))}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Totals Section */}
                            <div className="flex flex-col md:flex-row justify-between gap-12 pt-8">
                                <div className="flex-1 space-y-4">
                                    <div className="p-6 rounded-2xl bg-red-50/30 border border-red-100/50 flex items-start gap-4 max-w-md">
                                        <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-red-900 uppercase tracking-widest">Document Integrity</p>
                                            <p className="text-[10px] text-red-700 leading-relaxed font-semibold">
                                                This credit note serves as a legal adjustment to previously issued billing. It identifies a reduction in the account balance.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {creditNote.notes && (
                                        <div className="space-y-2 max-w-md ml-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason for Adjustment</p>
                                            <p className="text-xs text-slate-500 leading-relaxed italic">{creditNote.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full md:w-80 space-y-4">
                                    <div className="px-6 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Gross Reduction</span>
                                            <span className="font-mono font-black text-red-600">-{formatCurrency(creditNote.amount)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 relative overflow-hidden group">
                                         <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <FileText className="w-20 h-20 text-white transform rotate-12" />
                                        </div>
                                        <div className="relative z-10 space-y-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">TOTAL ADJUSTMENT</span>
                                            <div className="flex items-baseline justify-between text-white">
                                                <span className="text-3xl font-black font-mono tracking-tighter">
                                                    {formatCurrency(creditNote.amount)}
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
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Certification</p>
                                        <p className="text-[9px] text-slate-500 leading-relaxed font-medium uppercase tracking-tighter">
                                            Balance reversal documents are issued in accordance with standard accounting principles and tax regulations.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {creditNote.id.toString().padStart(6, '0')}</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">COMPLIANT-LEDGER</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Authenticated By</p>
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
                                <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Adjustment Lifecycle</h3>
                                <Activity className="w-4 h-4 text-slate-300" />
                            </div>
                            
                            <ActivityFeed activities={creditNote.activity_logs || []} />

                            <div className="space-y-3 pt-6 border-t border-slate-50">
                                <Button variant="soft" fullWidth className="h-10 text-[10px] font-bold uppercase tracking-widest bg-white hover:bg-slate-50 border-slate-100">
                                    <Send className="w-3.5 h-3.5 mr-2" />
                                    Resend Notification
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-premium-soft overflow-hidden bg-slate-50/50">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Processed</h3>
                            </div>
                            <p className="text-sm font-bold text-slate-900">Reconciled in Main Ledger</p>
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

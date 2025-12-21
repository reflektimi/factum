import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import PageHeader from '@/Components/ui/PageHeader';
import { ArrowLeft, Printer, CheckCircle, FileText, Hash, CreditCard, User, ShieldCheck, ExternalLink, Calendar } from 'lucide-react';
import type { Payment } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/lib/api';

export default function Show() {
    const { id } = useParams<{ id: string }>();
    const [payment, setPayment] = useState<(Payment & {
        invoice: {
            number: string;
            customer: {
                name: string;
                contact_info: any;
            };
        };
    }) | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const response = await api.get(`/api/payments/${id}`);
                setPayment(response.data.payment);
            } catch (error) {
                console.error('Failed to fetch payment:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            default: return 'secondary';
        }
    };

    if (loading || !payment) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Loading payment record...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Payment Receipt #${payment.id}`} />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/payments"
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm group print:hidden"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="flex items-baseline gap-3">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Receipt</h2>
                                <span className="text-slate-400 font-mono text-xl">#{payment.id}</span>
                            </div>
                            <Badge variant={getStatusVariant(payment.status)} className="uppercase tracking-widest text-[9px] px-3 py-1">
                                {payment.status}
                            </Badge>
                        </div>
                    </div>
                }
                subtitle="Official document confirming fund reconciliation and settlement"
                actions={
                    <div className="flex gap-3 print:hidden">
                        <Button 
                            variant="soft" 
                            size="lg"
                            className="h-12 border-slate-200"
                            icon={<Printer className="w-4 h-4" />} 
                            onClick={() => window.print()}
                        >
                            Print Receipt
                        </Button>
                    </div>
                }
            />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-8">
                    {/* Main Receipt Artifact */}
                    <Card className="border-none shadow-premium-soft overflow-hidden print:shadow-none print:bg-white">
                        <div className="h-2 w-full bg-emerald-500"></div>
                        <CardContent className="p-12 space-y-12">
                            {/* Hero Confirmation */}
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Settlement</p>
                                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter font-mono">
                                        {formatCurrency(payment.amount)}
                                    </h1>
                                </div>
                                <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>Settled on {formatDate(payment.date)}</span>
                                </div>
                            </div>

                            {/* Detailed Parameters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 border-y border-slate-100">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <Hash className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
                                            <p className="font-mono font-bold text-slate-900">PAY-{payment.id.toString().padStart(6, '0')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Instrument</p>
                                            <p className="font-bold text-slate-900 capitalize italic">{payment.payment_method.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payor Account</p>
                                            <p className="font-bold text-slate-900">{payment.invoice.customer.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied to</p>
                                            <Link 
                                                to={`/invoices/${payment.invoice_id}`} 
                                                className="group inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                            >
                                                {payment.invoice.number}
                                                <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Authentication Footnote */}
                            <div className="space-y-6">
                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden group">
                                    <ShieldCheck className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-200/50 rotate-12 group-hover:text-emerald-500/10 transition-colors duration-700" />
                                    <h4 className="font-black text-[10px] text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        Official Validation
                                    </h4>
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed relative z-10 pr-12">
                                        This document serves as an electronic confirmation of fulfillment. The associated funds have been successfully reconciled against Invoice {payment.invoice.number} and verified by the administrative settlement system.
                                    </p>
                                </div>
                                
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">Generated by administrative protocol</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Access Card - Non-Print */}
                    <div className="flex justify-center print:hidden">
                        <Link to="/payments">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-900">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Return to Payments Ledger
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

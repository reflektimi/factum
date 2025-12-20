import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import PageHeader from '@/Components/ui/PageHeader';
import { ArrowLeft, Save, CreditCard, Calendar, Hash, Activity, Calculator, FileText, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface InvoiceSummary {
    id: number;
    number: string;
    customer_name: string;
    amount: number;
    balance: number;
}

interface CreateProps {
    invoices: InvoiceSummary[];
}

export default function Create({ invoices }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        invoice_id: '',
        amount: '',
        payment_method: 'bank_transfer',
        date: new Date().toISOString().split('T')[0],
        status: 'completed'
    });

    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSummary | null>(null);

    // Update amount when invoice selected
    useEffect(() => {
        if (data.invoice_id) {
            const inv = invoices.find(i => i.id.toString() === data.invoice_id);
            if (inv) {
                setSelectedInvoice(inv);
                setData('amount', inv.balance.toString());
            }
        } else {
            setSelectedInvoice(null);
            setData('amount', '');
        }
    }, [data.invoice_id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('payments.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Record Settlement" />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('payments.index')}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50/50 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Record Payment</h2>
                    </div>
                }
                subtitle="Reconcile incoming funds against outstanding invoices"
            />

            <form onSubmit={submit} className="relative" noValidate>
                <div className="grid grid-cols-12 gap-8">
                    {/* Primary Recording Workspace */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* Transaction Context Card */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Document</span>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <Select
                                    label="Source Invoice"
                                    value={data.invoice_id}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('invoice_id', e.target.value)}
                                    error={errors.invoice_id}
                                    className="h-10 text-sm font-medium"
                                    icon={<Hash className="w-5 h-5" />}
                                    required
                                >
                                    <option value="">Select an outstanding invoice...</option>
                                    {invoices.map(inv => (
                                        <option key={inv.id} value={inv.id.toString()}>
                                            {inv.number} — {inv.customer_name} ({formatCurrency(inv.balance)} due)
                                        </option>
                                    ))}
                                </Select>

                                {selectedInvoice && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Original Total</span>
                                            <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">{formatCurrency(selectedInvoice.amount)}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining Balance</span>
                                            <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">{formatCurrency(selectedInvoice.balance)}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Configuration Card */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settlement Parameters</span>
                            </div>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <Input
                                        type="date"
                                        label="Transaction Date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        error={errors.date}
                                        className="h-10"
                                        icon={<DollarSign className="w-4 h-4" />}
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-6">
                                    <Select
                                        label="Payment Method"
                                        value={data.payment_method}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('payment_method', e.target.value)}
                                        error={errors.payment_method}
                                        className="h-10"
                                        icon={<CheckCircle2 className="w-4 h-4" />}
                                    >
                                        <option value="completed">Completed / Cleared</option>
                                        <option value="pending">Pending Verification</option>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meta & Summary Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        <Card className="border-none shadow-premium-soft overflow-hidden sticky top-8">
                            <div className="h-1.5 w-full bg-slate-900"></div>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Financial Impact</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reconciliation</span>
                                            <span className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                                                +{formatCurrency(parseFloat(data.amount) || 0)}
                                            </span>
                                        </div>
                                        {selectedInvoice && (
                                            <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Pro-forma Balance</span>
                                                    <span className="text-xs font-black text-emerald-700 font-mono italic">
                                                        {formatCurrency(Math.max(0, selectedInvoice.balance - (parseFloat(data.amount) || 0)))}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                         <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                         <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Administrative Prompt</h3>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-bold leading-relaxed">
                                        Recording this payment will automatically update the invoice status if the balance reaches zero. Ensure all transaction IDs are cross-referenced for audit compliance.
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    Record Payment
                                </Button>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Secured Action</h3>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold leading-relaxed px-1">
                                        This action is permanent and will be logged in the global audit trail for financial reconciliation purposes.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}

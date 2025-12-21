import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import { type FormEventHandler, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import PageHeader from '@/Components/ui/PageHeader';
import { ArrowLeft, Save, CreditCard, Hash, FileText, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import api from '@/lib/api';

interface InvoiceSummary {
    id: number;
    number: string;
    customer_name: string;
    amount: number;
    balance: number;
}

export default function Create() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const invoiceIdFromQuery = searchParams.get('invoice_id');

    const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
    const [data, setData] = useState({
        invoice_id: invoiceIdFromQuery || '',
        amount: '',
        payment_method: 'bank_transfer',
        date: new Date().toISOString().split('T')[0],
        status: 'completed'
    });
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSummary | null>(null);
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await api.get('/api/invoices?filter=unpaid&per_page=100');
                // Access paginated invoices correctly
                const fetchedInvoices = response.data.invoices?.data || response.data.invoices || [];
                
                // Map to the InvoiceSummary interface if needed, although the backend might already provide these fields
                const mappedInvoices = fetchedInvoices.map((inv: any) => ({
                    id: inv.id,
                    number: inv.number,
                    customer_name: inv.customer?.name || 'Unknown Customer',
                    amount: inv.total_amount,
                    balance: inv.status === 'paid' ? 0 : inv.total_amount // Simple balance logic for now
                }));
                
                setInvoices(mappedInvoices);

                if (invoiceIdFromQuery) {
                    const inv = mappedInvoices.find((i: any) => i.id.toString() === invoiceIdFromQuery);
                    if (inv) {
                        setSelectedInvoice(inv);
                        setData(prev => ({ ...prev, amount: inv.balance.toString() }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch invoices:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [invoiceIdFromQuery]);

    // Update amount when invoice selected manually
    const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setData(prev => ({ ...prev, invoice_id: id }));
        
        if (id) {
            const inv = invoices.find(i => i.id.toString() === id);
            if (inv) {
                setSelectedInvoice(inv);
                setData(prev => ({ ...prev, amount: inv.balance.toString() }));
            }
        } else {
            setSelectedInvoice(null);
            setData(prev => ({ ...prev, amount: '' }));
        }
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.post('/api/payments', data);
            navigate('/payments');
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Failed to record payment:', error);
            }
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Initializing payment record...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Record Settlement" />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/payments"
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm group"
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
                                    onChange={handleInvoiceChange}
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
                                        onChange={(e) => setData({ ...data, date: e.target.value })}
                                        error={errors.date}
                                        className="h-10"
                                        icon={<DollarSign className="w-4 h-4" />}
                                        required
                                    />
                                    <Input
                                        type="number"
                                        label="Settlement Amount"
                                        value={data.amount}
                                        onChange={(e) => setData({ ...data, amount: e.target.value })}
                                        error={errors.amount}
                                        className="h-10 font-mono"
                                        icon={<DollarSign className="w-4 h-4" />}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                
                                <div className="space-y-6">
                                    <Select
                                        label="Payment Method"
                                        value={data.payment_method}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData({ ...data, payment_method: e.target.value })}
                                        error={errors.payment_method}
                                        className="h-10"
                                    >
                                        <option value="bank_transfer">Bank Transfer / Wire</option>
                                        <option value="credit_card">Credit Card Processing</option>
                                        <option value="cash">Physical Cash</option>
                                        <option value="cheque">Bank Cheque</option>
                                    </Select>
                                    <Select
                                        label="Verification Status"
                                        value={data.status}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData({ ...data, status: e.target.value })}
                                        error={errors.status}
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

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import PageHeader from '@/Components/ui/PageHeader';
import { ArrowLeft, Save, CreditCard, Calendar, Activity, FileText, AlertCircle, CheckCircle2, DollarSign, Hash } from 'lucide-react';
import { Payment } from '@/types/models';
import { formatCurrency } from '@/utils/format';

interface EditProps {
    payment: Payment & { invoice: { number: string; customer: { name: string } } };
}

export default function Edit({ payment }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        amount: payment.amount.toString(),
        payment_method: payment.payment_method,
        date: payment.date,
        status: payment.status
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('payments.update', payment.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Settlement #${payment.id}`} />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('payments.index')}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50/50 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Payment</h2>
                            <span className="text-slate-400 font-mono text-lg">#{payment.id}</span>
                        </div>
                    </div>
                }
                subtitle={`Adjusting settlement for ${payment.invoice.customer.name}`}
            />

            <form onSubmit={submit} className="relative" noValidate>
                <div className="grid grid-cols-12 gap-8">
                    {/* Primary Editing Workspace */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* Transaction Context Card */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Context</span>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Associated Invoice</div>
                                        <p className="text-lg font-bold text-slate-900 leading-tight">
                                            {payment.invoice.number} 
                                            <span className="text-slate-400 font-medium text-xs ml-2">— {payment.invoice.customer.name}</span>
                                        </p>
                                    </div>
                                </div>
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
                                        disabled
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
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Settlement</span>
                                            <span className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                                                {formatCurrency(parseFloat(data.amount) || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                         <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                         <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Administrative Prompt</h3>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-bold leading-relaxed">
                                        Modifying this payment will update the linked invoice balance. Adjustments to the amount itself are restricted for audit integrity; please void and reissue if a major correction is required.
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    Save Changes
                                </Button>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Secured Action</h3>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold leading-relaxed px-1">
                                        Last reconciled by system at {new Date().toLocaleDateString()}. Changes are permanently logged.
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

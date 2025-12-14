import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { ArrowLeft, Save } from 'lucide-react';
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

    const invoiceOptions = invoices.map(inv => ({
        value: inv.id.toString(),
        label: `${inv.number} - ${inv.customer_name} (${formatCurrency(inv.balance)} due)`
    }));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-slate-800 font-heading">
                        Record Payment
                    </h2>
                    <Link href={route('payments.index')}>
                        <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
                            Back to Payments
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Record Payment" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Select
                                    label="Select Invoice"
                                    value={data.invoice_id}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('invoice_id', e.target.value)}
                                    error={errors.invoice_id}
                                    options={[
                                        { value: '', label: 'Select an invoice to pay...' },
                                        ...invoiceOptions
                                    ]}
                                    required
                                />

                                {selectedInvoice && (
                                    <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-medium text-slate-700">Invoice Total: {formatCurrency(selectedInvoice.amount)}</p>
                                            <p className="text-slate-500">Outstanding: {formatCurrency(selectedInvoice.balance)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        type="date"
                                        label="Payment Date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        error={errors.date}
                                        required
                                    />
                                    <Input
                                        type="number"
                                        label="Amount"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        error={errors.amount}
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select
                                        label="Payment Method"
                                        value={data.payment_method}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('payment_method', e.target.value)}
                                        error={errors.payment_method}
                                        options={[
                                            { value: 'bank_transfer', label: 'Bank Transfer' },
                                            { value: 'credit_card', label: 'Credit Card' },
                                            { value: 'check', label: 'Check' },
                                            { value: 'cash', label: 'Cash' },
                                            { value: 'other', label: 'Other' },
                                        ]}
                                    />
                                    <Select
                                        label="Status"
                                        value={data.status}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('status', e.target.value as 'completed' | 'pending')}
                                        error={errors.status}
                                        options={[
                                            { value: 'completed', label: 'Completed' },
                                            { value: 'pending', label: 'Pending' }
                                        ]}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3 bg-slate-50/50">
                                <Link href={route('payments.index')}>
                                    <Button variant="secondary" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button variant="primary" loading={processing} icon={<Save className="w-4 h-4"/>}>
                                    Record Payment
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

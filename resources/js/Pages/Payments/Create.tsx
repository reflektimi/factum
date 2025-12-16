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
                <div className="flex items-center gap-4">
                    <Link href={route('payments.index')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        Record Payment
                    </h2>
                </div>
            }
        >
            <Head title="Record Payment" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <div className="grid grid-cols-12 gap-6">
                            {/* Left Column - 70% */}
                            <div className="col-span-12 lg:col-span-8 space-y-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-base font-semibold">Payment Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                       <Select
                                            label="Select Invoice"
                                            value={data.invoice_id}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('invoice_id', e.target.value)}
                                            error={errors.invoice_id}
                                            className="rounded-md"
                                            options={[
                                                { value: '', label: 'Select an invoice to pay...' },
                                                ...invoiceOptions
                                            ]}
                                            required
                                        />

                                        {selectedInvoice && (
                                            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center text-sm border border-gray-100">
                                                <div>
                                                    <p className="font-medium text-gray-700">Invoice Total: {formatCurrency(selectedInvoice.amount)}</p>
                                                    <p className="text-gray-500">Outstanding: {formatCurrency(selectedInvoice.balance)}</p>
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
                                                className="rounded-md"
                                                required
                                            />
                                            <Input
                                                type="number"
                                                label="Amount"
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                                error={errors.amount}
                                                step="0.01"
                                                className="rounded-md"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Select
                                                label="Payment Method"
                                                value={data.payment_method}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('payment_method', e.target.value)}
                                                error={errors.payment_method}
                                                className="rounded-md"
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
                                                className="rounded-md"
                                                options={[
                                                    { value: 'completed', label: 'Completed' },
                                                    { value: 'pending', label: 'Pending' }
                                                ]}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - 30% - Sticky Actions */}
                            <div className="col-span-12 lg:col-span-4 relative">
                                <div className="lg:sticky lg:top-6 space-y-6">
                                    <Card className="border-t-4 border-t-indigo-500">
                                        <CardHeader className="pb-3 border-b border-gray-100">
                                            <CardTitle className="text-base font-semibold">Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-6">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                loading={processing}
                                                className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                                icon={<Save className="w-5 h-5" />}
                                            >
                                                Record Payment
                                            </Button>
                                             <Link href={route('payments.index')} className="block">
                                                <Button variant="secondary" type="button" className="w-full">
                                                    Cancel
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

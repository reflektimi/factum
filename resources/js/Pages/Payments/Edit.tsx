import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { ArrowLeft, Save } from 'lucide-react';
import { Payment } from '@/types/models';

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
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-slate-800 font-heading">
                        Edit Payment #{payment.id}
                    </h2>
                    <Link href={route('payments.index')}>
                        <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
                            Back to Payments
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Payment #${payment.id}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <form onSubmit={submit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                                <p className="text-sm text-slate-500 mt-1">
                                    For Invoice: <span className="font-medium text-slate-900">{payment.invoice.number}</span> ({payment.invoice.customer.name})
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
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
                                        disabled // Usually changing amount affects invoice calculation logic which might be sensitive, but controller handles validation. I'll enable it?
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
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

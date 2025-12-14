import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import StatusBadge from '@/Components/ui/StatusBadge';
import { ArrowLeft, Printer, Download, CheckCircle, Clock } from 'lucide-react';
import { Payment } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';

interface ShowProps {
    payment: Payment & {
        invoice: {
            number: string;
            customer: {
                name: string;
                contact_info: any;
            };
        };
    };
}

export default function Show({ payment }: ShowProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('payments.index')} className="text-slate-500 hover:text-slate-700 print:hidden">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-slate-800 font-heading">
                            Payment Receipt #{payment.id}
                        </h2>
                        <StatusBadge status={payment.status} className="ml-2" />
                    </div>
                    <div className="flex gap-3 print:hidden">
                        <Button variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                            Print Receipt
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Payment #${payment.id}`} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <Card className="print:shadow-none print:border-none">
                        <CardContent className="p-8 space-y-8">
                            <div className="text-center border-b border-slate-100 pb-8">
                                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900">{formatCurrency(payment.amount)}</h1>
                                <p className="text-slate-500 mt-2">Payment successfully received</p>
                                <p className="text-slate-400 text-sm mt-1">{formatDate(payment.date)}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-500">Payment Reference ID</span>
                                    <span className="font-medium text-slate-900">PAY-{payment.id}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-500">Payment Method</span>
                                    <span className="font-medium text-slate-900 capitalize">{payment.payment_method.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-500">Invoice Number</span>
                                    <Link href={route('invoices.show', payment.invoice_id)} className="font-medium text-blue-600 hover:underline">
                                        {payment.invoice.number}
                                    </Link>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-50">
                                    <span className="text-slate-500">Customer</span>
                                    <span className="font-medium text-slate-900">{payment.invoice.customer.name}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-lg mt-8">
                                <h4 className="font-medium text-slate-900 mb-2">Note</h4>
                                <p className="text-sm text-slate-600">
                                    This receipt confirms that the payment has been recorded in the system.
                                    For any questions, please contact billing support.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

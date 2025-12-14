import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { ArrowLeft, Edit, Mail, Phone, MapPin, DollarSign, FileText, CreditCard } from 'lucide-react';
import { Account, Invoice, Payment } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState } from 'react';

interface ShowProps {
    account: Account & {
        invoices: Invoice[];
        payments: Payment[];
    };
}

export default function Show({ account }: ShowProps) {
    const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('accounts.index')} className="text-slate-500 hover:text-slate-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-slate-800 font-heading">
                            {account.name}
                        </h2>
                        <Badge variant={account.type === 'customer' ? 'default' : 'info'}>
                            {account.type.toUpperCase()}
                        </Badge>
                    </div>
                    <Link href={route('accounts.edit', account.id)}>
                        <Button variant="secondary" icon={<Edit className="w-4 h-4" />}>
                            Edit Account
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={account.name} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Overview Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Current Balance</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(account.balance)}</h3>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardContent className="p-6">
                                <h4 className="text-sm font-medium text-slate-500 mb-4">Contact Information</h4>
                                <div className="space-y-3">
                                    {account.contact_info?.email && (
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            {account.contact_info.email}
                                        </div>
                                    )}
                                    {account.contact_info?.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            {account.contact_info.phone}
                                        </div>
                                    )}
                                    {account.contact_info?.address && (
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {account.contact_info.address}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('invoices')}
                                className={`${
                                    activeTab === 'invoices'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                            >
                                <FileText className="w-4 h-4" />
                                Invoices ({account.invoices?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={`${
                                    activeTab === 'payments'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                            >
                                <CreditCard className="w-4 h-4" />
                                Payments ({account.payments?.length || 0})
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <Card>
                        <CardContent className="p-0">
                            {activeTab === 'invoices' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Number</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {account.invoices?.length > 0 ? (
                                                account.invoices.map((invoice) => (
                                                    <tr key={invoice.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 font-medium text-slate-900">{invoice.number}</td>
                                                        <td className="px-6 py-4 text-slate-500">{formatDate(invoice.date)}</td>
                                                        <td className="px-6 py-4 text-slate-900">{formatCurrency(invoice.total_amount)}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'}>
                                                                {invoice.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Link href={route('invoices.show', invoice.id)} className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No invoices found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Method</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-200">
                                            {account.payments?.length > 0 ? (
                                                account.payments.map((payment) => (
                                                    <tr key={payment.id} className="hover:bg-slate-50">
                                                        <td className="px-6 py-4 text-slate-500">{formatDate(payment.date)}</td>
                                                        <td className="px-6 py-4 text-slate-900 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                                                        <td className="px-6 py-4 text-slate-900">{formatCurrency(payment.amount)}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={payment.status === 'completed' ? 'success' : 'warning'}>
                                                                {payment.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No payments found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

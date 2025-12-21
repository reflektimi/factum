import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { ArrowLeft, Edit, Mail, Phone, MapPin, DollarSign, FileText, CreditCard } from 'lucide-react';
import type { Account, Invoice, Payment } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '@/lib/api';

export default function Show() {
    const { id } = useParams<{ id: string }>();
    const [account, setAccount] = useState<(Account & {
        invoices: Invoice[];
        payments: Payment[];
    }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await api.get(`/api/accounts/${id}`);
                setAccount(response.data.account);
            } catch (error) {
                console.error('Failed to fetch account:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAccount();
    }, [id]);

    if (loading || !account) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Loading account details...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={account.name} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link to="/accounts" className="text-slate-500 hover:text-indigo-600 transition-colors">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                                {account.name}
                            </h2>
                            <Badge variant={account.type === 'customer' ? 'default' : 'info'} className="uppercase tracking-widest text-[10px] font-bold">
                                {account.type}
                            </Badge>
                        </div>
                        <Link to={`/accounts/${account.id}/edit`}>
                            <Button variant="secondary" icon={<Edit className="w-4 h-4" />}>
                                Edit Account
                            </Button>
                        </Link>
                    </div>

                    {/* Overview Cards */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Balance</p>
                                    <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{formatCurrency(account.balance)}</h3>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="md:col-span-2 border-none shadow-sm">
                            <CardContent className="p-6">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {account.contact_info?.email && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <span className="truncate">{account.contact_info.email}</span>
                                        </div>
                                    )}
                                    {account.contact_info?.phone && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <span>{account.contact_info.phone}</span>
                                        </div>
                                    )}
                                    {account.contact_info?.address && (
                                        <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <span className="truncate">{account.contact_info.address}</span>
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
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all`}
                            >
                                <FileText className="w-4 h-4" />
                                Invoices <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{account.invoices?.length || 0}</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('payments')}
                                className={`${
                                    activeTab === 'payments'
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all`}
                            >
                                <CreditCard className="w-4 h-4" />
                                Payments <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{account.payments?.length || 0}</span>
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            {activeTab === 'invoices' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Number</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest pr-8">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-50">
                                            {account.invoices?.length > 0 ? (
                                                account.invoices.map((invoice) => (
                                                    <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-6 py-5 font-bold text-slate-900 pl-8 group-hover:text-indigo-600">{invoice.number}</td>
                                                        <td className="px-6 py-5 text-slate-500 font-medium">{formatDate(invoice.date)}</td>
                                                        <td className="px-6 py-5 text-slate-900 font-black font-mono text-sm">{formatCurrency(invoice.total_amount)}</td>
                                                        <td className="px-6 py-5">
                                                            <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'danger' : 'warning'} className="uppercase tracking-widest text-[9px]">
                                                                {invoice.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-5 text-right pr-8">
                                                            <Link to={`/invoices/${invoice.id}`} className="text-indigo-600 hover:text-indigo-800 text-xs font-black uppercase tracking-widest">
                                                                Review →
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center">
                                                        <FileText className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                                        <p className="text-sm text-slate-400 font-medium">No invoice records indexed for this entity.</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Date</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pr-8">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-slate-50">
                                            {account.payments?.length > 0 ? (
                                                account.payments.map((payment) => (
                                                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-5 text-slate-500 font-medium pl-8">{formatDate(payment.date)}</td>
                                                        <td className="px-6 py-5 text-slate-900 font-bold capitalize">{payment.payment_method.replace('_', ' ')}</td>
                                                        <td className="px-6 py-5 text-slate-900 font-black font-mono text-sm">{formatCurrency(payment.amount)}</td>
                                                        <td className="px-6 py-5 pr-8">
                                                            <Badge variant={payment.status === 'completed' ? 'success' : 'warning'} className="uppercase tracking-widest text-[9px]">
                                                                {payment.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center">
                                                        <CreditCard className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                                        <p className="text-sm text-slate-400 font-medium">No settlement records indexed for this entity.</p>
                                                    </td>
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

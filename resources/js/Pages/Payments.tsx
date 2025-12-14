import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import StatusBadge from '@/Components/ui/StatusBadge';
import Button from '@/Components/ui/Button';
import { formatCurrency, formatDate } from '@/utils/format';
import { Plus, Search, Filter } from 'lucide-react';

import { router } from '@inertiajs/react';
import { PaginatedData, Payment } from '@/types/models';
import { useState, useEffect } from 'react';

interface PaymentsProps {
    payments: PaginatedData<Payment>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Payments({ payments, filters }: PaymentsProps) {
    const [search, setSearch] = useState(filters.search || '');
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('payments.index'),
                    { search, status: filters.status },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        Payments
                    </h2>
                    <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => router.visit(route('payments.create'))}>
                        Record Payment
                    </Button>
                </div>
            }
        >
            <Head title="Payments" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search payments..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <Button variant="secondary" icon={<Filter className="w-5 h-5" />}>
                                    Filter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payments Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Payments</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Invoice #
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment Method
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {payments.data.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={route('invoices.show', payment.invoice_id)}
                                                        className="font-medium text-primary-600 hover:text-primary-700"
                                                    >
                                                        {payment.invoice?.number}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                                    {payment.customer?.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {formatDate(payment.date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {payment.payment_method}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge status={payment.status} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={route('payments.show', payment.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

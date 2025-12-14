import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { formatCurrency, formatDate } from '@/utils/format';
import { Plus, Search, Filter, Receipt } from 'lucide-react';
import { PaginatedData, Expense } from '@/types/models';
import { useState, useEffect } from 'react';

interface ExpensesProps {
    expenses: PaginatedData<Expense>;
    filters: {
        search?: string;
        category?: string;
    };
}

export default function Expenses({ expenses, filters }: ExpensesProps) {
    const [search, setSearch] = useState(filters.search || '');
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('expenses.index'),
                    { search, category: filters.category },
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
                        Expenses
                    </h2>
                    <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => router.visit(route('expenses.create'))}>
                        New Expense
                    </Button>
                </div>
            }
        >
            <Head title="Expenses" />

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
                                        placeholder="Search expenses..."
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

                    {/* Expenses Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Expenses</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Merchant
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Receipt
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {expenses.data.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                                 <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {formatDate(expense.date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                                                    {expense.description}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="default" className="bg-slate-100 text-slate-800">
                                                        {expense.category}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {expense.merchant || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                                    {formatCurrency(expense.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    {expense.receipt_path ? (
                                                        <a href={expense.receipt_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                            <Receipt className="w-5 h-5 inline" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">No Receipt</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={route('expenses.show', expense.id)}>
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

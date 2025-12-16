import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
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
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Merchant</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead className="text-right">Receipt</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expenses.data.map((expense) => (
                                            <TableRow key={expense.id}>
                                                <TableCell className="text-gray-600">
                                                    {formatDate(expense.date)}
                                                </TableCell>
                                                <TableCell className="text-gray-900 font-medium">
                                                    {expense.description}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="default" className="bg-slate-100 text-slate-800">
                                                        {expense.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-gray-600">
                                                    {expense.merchant || '-'}
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-900">
                                                    {formatCurrency(expense.amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {expense.receipt_path ? (
                                                        <a href={expense.receipt_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                            <Receipt className="w-5 h-5 inline" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">No Receipt</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={route('expenses.show', expense.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

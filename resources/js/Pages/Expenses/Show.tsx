import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { Expense } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';

interface ShowProps {
    expense: Expense;
}

export default function Show({ expense }: ShowProps) {
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this expense?')) {
            router.delete(route('expenses.destroy', expense.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('expenses.index')} className="text-slate-500 hover:text-slate-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-slate-800 font-heading">
                            Expense Details
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <Link href={route('expenses.edit', expense.id)}>
                            <Button variant="secondary" icon={<Edit2 className="w-4 h-4" />}>
                                Edit
                            </Button>
                        </Link>
                        <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Expense ${expense.description}`} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500">Description</h3>
                                    <p className="text-lg font-medium text-slate-900">{expense.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <h3 className="text-sm font-medium text-slate-500">Amount</h3>
                                        <p className="text-lg font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500">Date</h3>
                                        <p className="text-slate-900">{formatDate(expense.date)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <h3 className="text-sm font-medium text-slate-500">Category</h3>
                                        <Badge variant="default" className="mt-1">{expense.category}</Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500">Merchant</h3>
                                        <p className="text-slate-900">{expense.merchant || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Receipt */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Receipt</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {expense.receipt_path ? (
                                    <div className="rounded-lg overflow-hidden border border-slate-200">
                                        <a href={expense.receipt_path} target="_blank" rel="noopener noreferrer">
                                            <img 
                                                src={expense.receipt_path} 
                                                alt="Receipt" 
                                                className="w-full h-auto object-contain max-h-96 hover:opacity-90 transition-opacity"
                                            />
                                        </a>
                                        <div className="bg-slate-50 p-2 text-center text-xs text-slate-500">
                                            Click to view full size
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                                        <p>No receipt uploaded</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

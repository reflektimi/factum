import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import { Save, ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Expense } from '@/types/models';

interface EditProps {
    expense: Expense;
}

export default function Edit({ expense }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        description: expense.description,
        amount: expense.amount.toString(),
        date: expense.date,
        category: expense.category,
        merchant: expense.merchant || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('expenses.update', expense.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('expenses.index')} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                            Edit Expense
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Edit Expense" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Expense Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Input
                                    label="Description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={errors.description}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        error={errors.amount}
                                    />
                                    <Input
                                        label="Date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        error={errors.date}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     <Select
                                        label="Category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        error={errors.category}
                                        options={[
                                            { label: 'Select Category', value: '' },
                                            { label: 'Office', value: 'Office' },
                                            { label: 'Travel', value: 'Travel' },
                                            { label: 'Meals', value: 'Meals' },
                                            { label: 'Utilities', value: 'Utilities' },
                                            { label: 'Software', value: 'Software' },
                                            { label: 'Equipment', value: 'Equipment' },
                                            { label: 'Other', value: 'Other' },
                                        ]}
                                    />
                                    <Input
                                        label="Merchant (Optional)"
                                        value={data.merchant}
                                        onChange={(e) => setData('merchant', e.target.value)}
                                        error={errors.merchant}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    icon={<Save className="w-5 h-5" />}
                                >
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

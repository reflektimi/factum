import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        merchant: '',
        receipt: null as File | null
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('expenses.store'), {
            forceFormData: true,
        });
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
                            Record New Expense
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="New Expense" />

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
                                    placeholder="e.g. Office Supplies"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        error={errors.amount}
                                        placeholder="0.00"
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
                                        placeholder="e.g. Amazon"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (Image)</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-500 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label htmlFor="receipt-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                                    <span>Upload a file</span>
                                                    <input 
                                                        id="receipt-upload" 
                                                        name="receipt" 
                                                        type="file" 
                                                        className="sr-only" 
                                                        accept="image/*"
                                                        onChange={(e) => setData('receipt', e.target.files ? e.target.files[0] : null)}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                        </div>
                                    </div>
                                    {data.receipt && <p className="mt-2 text-sm text-green-600">Selected: {data.receipt.name}</p>}
                                    {errors.receipt && <p className="mt-2 text-sm text-red-600">{errors.receipt}</p>}
                                </div>

                            </CardContent>
                            <CardFooter className="flex justify-end border-t pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    icon={<Save className="w-5 h-5" />}
                                >
                                    Save Expense
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

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
                <div className="flex items-center gap-4">
                    <Link href={route('expenses.index')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        Record New Expense
                    </h2>
                </div>
            }
        >
            <Head title="New Expense" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-12 gap-6">
                            {/* Left Column - 70% */}
                            <div className="col-span-12 lg:col-span-8 space-y-6">
                                <Card>
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-base font-semibold">Expense Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        <Input
                                            label="Description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            error={errors.description}
                                            placeholder="e.g. Office Supplies"
                                            className="rounded-md"
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
                                                className="rounded-md"
                                            />
                                            <Input
                                                label="Date"
                                                type="date"
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                error={errors.date}
                                                className="rounded-md"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                             <Select
                                                label="Category"
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                                error={errors.category}
                                                className="rounded-md"
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
                                                className="rounded-md"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (Image)</label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors">
                                                <div className="space-y-1 text-center">
                                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600">
                                                        <label htmlFor="receipt-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
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
                                </Card>
                            </div>

                            {/* Right Column - 30% - Sticky Actions */}
                            <div className="col-span-12 lg:col-span-4 relative">
                                <div className="lg:sticky lg:top-6 space-y-6">
                                    <Card className="border-t-4 border-t-indigo-500">
                                        <CardHeader className="pb-3 border-b border-gray-100">
                                            <CardTitle className="text-base font-semibold">Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-6">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                loading={processing}
                                                className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                                icon={<Save className="w-5 h-5" />}
                                            >
                                                Save Expense
                                            </Button>
                                             <Link href={route('expenses.index')} className="block">
                                                <Button variant="secondary" type="button" className="w-full">
                                                    Cancel
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

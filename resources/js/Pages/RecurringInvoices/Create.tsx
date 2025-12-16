import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Account } from '@/types/models';
import { formatCurrency } from '@/utils/format';

interface CreateProps {
    customers: Account[];
}

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export default function Create({ customers }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        profile_name: '',
        customer_id: '',
        interval: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        auto_send: false,
        items: [{ description: '', quantity: 1, price: 0 }] as InvoiceItem[],
    });

    const [total, setTotal] = useState(0);

    useEffect(() => {
        const newTotal = data.items.reduce((sum, item) => {
            return sum + (item.quantity * item.price);
        }, 0);
        setTotal(newTotal);
    }, [data.items]);

    const addItem = () => {
        setData('items', [...data.items, { description: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('recurring-invoices.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('recurring-invoices.index')} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        New Recurring Invoice Profile
                    </h2>
                </div>
            }
        >
            <Head title="New Recurring Invoice" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-12 gap-6">
                            {/* Left Column - 70% */}
                            <div className="col-span-12 lg:col-span-8 space-y-6">
                                {/* Profile Details */}
                                <Card>
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-base font-semibold">Profile Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 pt-6">
                                        <Input
                                            label="Profile Name"
                                            value={data.profile_name}
                                            onChange={(e) => setData('profile_name', e.target.value)}
                                            error={errors.profile_name}
                                            placeholder="e.g. Monthly Web Hosting"
                                            className="rounded-md"
                                            required
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Customer Selection */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                                <select
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    value={data.customer_id}
                                                    onChange={(e) => setData('customer_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select a customer</option>
                                                    {customers.map((customer) => (
                                                        <option key={customer.id} value={customer.id}>
                                                            {customer.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
                                            </div>

                                            {/* Interval */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                                                <select
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    value={data.interval}
                                                    onChange={(e) => setData('interval', e.target.value)}
                                                    required
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="yearly">Yearly</option>
                                                </select>
                                                {errors.interval && <p className="mt-1 text-sm text-red-600">{errors.interval}</p>}
                                            </div>

                                            {/* Start Date */}
                                            <Input
                                                type="date"
                                                label="Start Date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                error={errors.start_date}
                                                className="rounded-md"
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Items Section */}
                                <Card className="overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 bg-gray-50/50">
                                        <CardTitle className="text-base font-semibold">Invoice Items</CardTitle>
                                        <Button type="button" variant="secondary" size="sm" onClick={addItem} icon={<Plus className="w-4 h-4" />}>
                                            Add Item
                                        </Button>
                                    </CardHeader>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                                    <TableHead className="w-[45%] font-bold text-gray-900">Description</TableHead>
                                                    <TableHead className="w-[15%] font-bold text-gray-900 text-right">Qty</TableHead>
                                                    <TableHead className="w-[20%] font-bold text-gray-900 text-right">Price</TableHead>
                                                    <TableHead className="w-[15%] font-bold text-gray-900 text-right">Total</TableHead>
                                                    <TableHead className="w-[5%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.items.map((item, index) => (
                                                    <TableRow key={index} className="hover:bg-gray-50/30">
                                                        <TableCell className="align-top">
                                                            <Input
                                                                value={item.description}
                                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                placeholder="Item description"
                                                                className="rounded-md border-gray-300 focus:border-indigo-500"
                                                                required
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                                min={0.01}
                                                                step="0.01"
                                                                className="text-right rounded-md border-gray-300 focus:border-indigo-500"
                                                                required
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="number"
                                                                value={item.price}
                                                                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                                                min={0}
                                                                step="0.01"
                                                                className="text-right rounded-md border-gray-300 focus:border-indigo-500"
                                                                required
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-gray-900 pt-5 align-top">
                                                            {formatCurrency(item.quantity * item.price)}
                                                        </TableCell>
                                                        <TableCell className="text-right align-top pt-4">
                                                            {data.items.length > 1 && (
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => removeItem(index)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {errors.items && (
                                        <div className="p-4 bg-red-50 text-red-600 text-sm border-t border-red-100">
                                            {errors.items}
                                        </div>
                                    )}
                                </Card>
                            </div>

                            {/* Right Column - 30% - Sticky Summary */}
                            <div className="col-span-12 lg:col-span-4 relative">
                                <div className="lg:sticky lg:top-6 space-y-6">
                                    <Card className="border-t-4 border-t-indigo-500">
                                        <CardHeader className="pb-3 border-b border-gray-100">
                                            <CardTitle className="text-base font-semibold">Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-6">
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <span>Items Count</span>
                                                <span>{data.items.length}</span>
                                            </div>
                                            <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                                                <span className="text-base font-bold text-gray-900">Total Per Interval</span>
                                                <span className="text-2xl font-bold text-indigo-600">{formatCurrency(total)}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-4 pb-6 px-6 border-0">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                loading={processing}
                                                className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                                icon={<Save className="w-5 h-5" />}
                                            >
                                                Create Profile
                                            </Button>
                                        </CardFooter>
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

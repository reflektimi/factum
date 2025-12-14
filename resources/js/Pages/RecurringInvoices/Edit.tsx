import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Account } from '@/types/models';
import { formatCurrency } from '@/utils/format';

interface RecurringInvoice {
    id: number;
    profile_name: string;
    customer_id: number;
    interval: string;
    start_date: string;
    status: string;
    auto_send: boolean;
    items: InvoiceItem[] | string;
}

interface EditProps {
    recurringInvoice: RecurringInvoice;
    customers: Account[];
}

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export default function Edit({ recurringInvoice, customers }: EditProps) {
    // Parse items if string
    const initialItems = (typeof recurringInvoice.items === 'string' 
        ? JSON.parse(recurringInvoice.items) 
        : recurringInvoice.items) as InvoiceItem[];

    const { data, setData, put, processing, errors } = useForm({
        profile_name: recurringInvoice.profile_name,
        customer_id: recurringInvoice.customer_id,
        interval: recurringInvoice.interval,
        start_date: recurringInvoice.start_date.split('T')[0],
        status: recurringInvoice.status,
        auto_send: recurringInvoice.auto_send,
        items: initialItems.length > 0 ? initialItems : [{ description: '', quantity: 1, price: 0 }] as InvoiceItem[],
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
        if (data.items.length === 1) return;
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
        put(route('recurring-invoices.update', recurringInvoice.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('recurring-invoices.index')} className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        Edit Recurring Profile: {recurringInvoice.profile_name}
                    </h2>
                </div>
            }
        >
            <Head title={`Edit ${recurringInvoice.profile_name}`} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Profile Name */}
                                <Input
                                    label="Profile Name"
                                    value={data.profile_name}
                                    onChange={(e) => setData('profile_name', e.target.value)}
                                    error={errors.profile_name}
                                    placeholder="e.g. Monthly Web Hosting"
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Customer Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                        <select
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            value={data.customer_id}
                                            onChange={(e) => setData('customer_id', parseInt(e.target.value))}
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
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                                        required
                                    />
                                    
                                     {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            required
                                        >
                                            <option value="active">Active</option>
                                            <option value="paused">Paused</option>
                                            <option value="ended">Ended</option>
                                        </select>
                                        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                    </div>
                                </div>

                                {/* Items Section */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Items</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            <div className="col-span-6">Description</div>
                                            <div className="col-span-2 text-right">Qty</div>
                                            <div className="col-span-3 text-right">Price</div>
                                            <div className="col-span-1"></div>
                                        </div>

                                        {data.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-6">
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                        min={0.01}
                                                        step="0.01"
                                                        className="text-right"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <Input
                                                        type="number"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                                        min={0}
                                                        step="0.01"
                                                        className="text-right"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    {data.items.length > 1 && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex justify-between items-center">
                                        <Button type="button" variant="ghost" onClick={addItem} icon={<Plus className="w-4 h-4" />}>
                                            Add Item
                                        </Button>
                                        <div className="text-xl font-bold text-gray-900">
                                            Total: {formatCurrency(total)}
                                        </div>
                                    </div>
                                    {errors.items && <p className="mt-2 text-sm text-red-600">{errors.items}</p>}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    icon={<Save className="w-5 h-5" />}
                                >
                                    Update Profile
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

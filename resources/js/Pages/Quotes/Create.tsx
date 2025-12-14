import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Account } from '@/types/models';
import { FormEventHandler, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';

interface CreateQuoteProps {
    customers: Account[];
}

interface QuoteItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export default function Create({ customers }: CreateQuoteProps) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, price: 0, total: 0 }],
        total_amount: 0,
        notes: ''
    });

    useEffect(() => {
        const newItems = data.items.map(item => ({
            ...item,
            total: item.quantity * item.price
        }));
        
        // Deep compare check skipped for simplicity
        const total = newItems.reduce((sum, item) => sum + item.total, 0);
        
        if (total !== data.total_amount) {
            setData('total_amount', total);
        }
    }, [data.items]); // Triggers on reference change, handles manual changes inside updateItem properly

    const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...data.items];
        // @ts-ignore
        newItems[index][field] = value;
        
        if (field === 'quantity' || field === 'price') {
             newItems[index].total = newItems[index].quantity * newItems[index].price;
        }

        const total = newItems.reduce((sum, item) => sum + item.total, 0);

        setData(prev => ({
            ...prev,
            items: newItems,
            total_amount: total
        }));
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            { description: '', quantity: 1, price: 0, total: 0 }
        ]);
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) return;
        const newItems = data.items.filter((_, i) => i !== index);
        const total = newItems.reduce((sum, item) => sum + item.total, 0);
        
        setData(prev => ({
            ...prev,
            items: newItems,
            total_amount: total
        }));
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('quotes.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('quotes.index')} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                            Create New Quote
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Create Quote" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="md:col-span-2 space-y-6">
                                {/* Quote Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quote Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <Select
                                                label="Customer"
                                                value={data.customer_id}
                                                onChange={(e) => setData('customer_id', e.target.value)}
                                                error={errors.customer_id}
                                                options={[
                                                    { label: 'Select a customer', value: '' },
                                                    ...customers.map(c => ({ label: c.name, value: c.id }))
                                                ]}
                                            />
                                        </div>
                                        <Input
                                            label="Quote Date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            error={errors.date}
                                        />
                                        <Input
                                            label="Valid Until"
                                            type="date"
                                            value={data.expiry_date}
                                            onChange={(e) => setData('expiry_date', e.target.value)}
                                            error={errors.expiry_date}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Items */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Items</CardTitle>
                                        <Button type="button" variant="secondary" size="sm" onClick={addItem} icon={<Plus className="w-4 h-4"/>}>
                                            Add Item
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg animate-fade-in">
                                                <div className="flex-1 space-y-4 sm:space-y-0 sm:flex sm:gap-4">
                                                    <div className="flex-[2]">
                                                        <Input
                                                            placeholder="Description"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                            aria-label="Description"
                                                        />
                                                    </div>
                                                    <div className="w-20">
                                                        <Input
                                                            type="number"
                                                            placeholder="Qty"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                            aria-label="Quantity"
                                                        />
                                                    </div>
                                                    <div className="w-32">
                                                        <Input
                                                            type="number"
                                                            placeholder="Price"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                                            aria-label="Price"
                                                        />
                                                    </div>
                                                    <div className="w-32 pt-2 text-right font-semibold text-gray-900">
                                                        {formatCurrency(item.total)}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors mt-2"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                {/* Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center text-lg font-bold">
                                            <span>Total Amount</span>
                                            <span>{formatCurrency(data.total_amount)}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end border-t pt-4">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={processing}
                                            className="w-full"
                                            icon={<Save className="w-5 h-5" />}
                                        >
                                            Save Quote
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

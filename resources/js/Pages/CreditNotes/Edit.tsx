import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Account, CreditNote } from '@/types/models';
import { formatCurrency } from '@/utils/format';

interface EditProps {
    creditNote: CreditNote;
    customers: Account[];
}

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export default function Edit({ creditNote, customers }: EditProps) {
     // Parse items
     const initialItems = (typeof creditNote.items === 'string' 
        ? JSON.parse(creditNote.items) 
        : creditNote.items) as InvoiceItem[];

    const { data, setData, put, processing, errors } = useForm({
        number: creditNote.number,
        customer_id: creditNote.customer_id,
        date: creditNote.date.split('T')[0],
        status: creditNote.status,
        notes: creditNote.notes || '',
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
        put(route('credit-notes.update', creditNote.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('credit-notes.index')} className="text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        Edit Credit Note {data.number}
                    </h2>
                </div>
            }
        >
            <Head title={`Edit ${data.number}`} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Credit Note Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Credit Note Number"
                                        value={data.number}
                                        onChange={(e) => setData('number', e.target.value)}
                                        error={errors.number}
                                        required
                                    />
                                    
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

                                    <Input
                                        type="date"
                                        label="Date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        error={errors.date}
                                        required
                                    />

                                     {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value as any)}
                                            required
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="sent">Sent</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                        rows={2}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Reason for credit..."
                                    ></textarea>
                                </div>

                                {/* Items Section */}
                                <div className="border-t pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
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
                                    Update Credit Note
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

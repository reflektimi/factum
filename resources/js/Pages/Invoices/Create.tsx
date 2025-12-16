import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Account } from '@/types/models';
import { FormEventHandler, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';

interface CreateInvoiceProps {
    customers: Account[];
}

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export default function Create({ customers }: CreateInvoiceProps) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, price: 0, total: 0 }],
        total_amount: 0,
    });

    // Calculate totals whenever items change
    useEffect(() => {
        const newItems = data.items.map(item => ({
            ...item,
            total: item.quantity * item.price
        }));
        
        // Deep comparison to avoid infinite loop if no change in calculated values
        if (JSON.stringify(newItems) !== JSON.stringify(data.items)) {
             // We can't set items here directly to avoid loop if we map nicely, 
             // but here we just want to update total_amount
             // However, strictly we should update items total status too.
        }

        const total = newItems.reduce((sum, item) => sum + item.total, 0);
        
        if (total !== data.total_amount) {
            setData('total_amount', total);
        }
    }, [data.items]); // This might cause loop if we update items inside.

    // Better approach: Update items on input change
    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...data.items];
        // @ts-ignore
        newItems[index][field] = value;
        
        // Recalculate line total
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
        post(route('invoices.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('invoices.index')} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                            Create New Invoice
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Create Invoice" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-12 gap-6">
                            {/* Left Column - 70% */}
                            <div className="col-span-12 lg:col-span-8 space-y-6">
                                {/* Invoice Details */}
                                <Card>
                                    <CardHeader className="pb-3 border-b border-gray-100">
                                        <CardTitle className="text-base font-semibold">Invoice Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid gap-6 sm:grid-cols-2 pt-6">
                                        <div className="sm:col-span-2">
                                            <Select
                                                label="Customer"
                                                value={data.customer_id}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('customer_id', e.target.value)}
                                                error={errors.customer_id}
                                                className="rounded-md"
                                                options={[
                                                    { label: 'Select a customer', value: '' },
                                                    ...customers.map(c => ({ label: c.name, value: c.id }))
                                                ]}
                                            />
                                        </div>
                                        <Input
                                            label="Invoice Date"
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            error={errors.date}
                                            className="rounded-md"
                                        />
                                        <Input
                                            label="Due Date"
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            error={errors.due_date}
                                            className="rounded-md"
                                        />
                                    </CardContent>
                                </Card>

                                {/* Items */}
                                <Card className="overflow-hidden">
                                     <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 bg-gray-50/50">
                                        <CardTitle className="text-base font-semibold">Items</CardTitle>
                                        <Button type="button" variant="secondary" size="sm" onClick={addItem} icon={<Plus className="w-4 h-4"/>}>
                                            Add Item
                                        </Button>
                                    </CardHeader>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                                    <TableHead className="w-[45%] font-bold text-gray-900">Description</TableHead>
                                                    <TableHead className="w-[15%] font-bold text-gray-900 text-right">Quantity</TableHead>
                                                    <TableHead className="w-[20%] font-bold text-gray-900 text-right">Rate</TableHead>
                                                    <TableHead className="w-[15%] font-bold text-gray-900 text-right">Amount</TableHead>
                                                    <TableHead className="w-[5%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.items.map((item, index) => (
                                                    <TableRow key={index} className="hover:bg-gray-50/30">
                                                        <TableCell className="align-top">
                                                            <Input
                                                                placeholder="Description"
                                                                value={item.description}
                                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                aria-label="Description"
                                                                className="rounded-md border-gray-300 focus:border-indigo-500"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                                aria-label="Quantity"
                                                                className="rounded-md text-right border-gray-300 focus:border-indigo-500"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.price}
                                                                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                                                aria-label="Price"
                                                                className="rounded-md text-right border-gray-300 focus:border-indigo-500"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-medium text-gray-900 pt-5 align-top">
                                                            {formatCurrency(item.total)}
                                                        </TableCell>
                                                        <TableCell className="text-right align-top pt-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(index)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
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
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span className="font-medium">{formatCurrency(data.total_amount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <span>Tax (0%)</span>
                                                <span>$0.00</span>
                                            </div>
                                            <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                                                <span className="text-base font-bold text-gray-900">Total Amount</span>
                                                <span className="text-2xl font-bold text-indigo-600">{formatCurrency(data.total_amount)}</span>
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
                                                Save Invoice
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

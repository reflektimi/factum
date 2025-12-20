import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent, CardFooter } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import { Save, Plus, Trash2, ArrowLeft, Calculator, FileText, UserPlus, Calendar, Activity } from 'lucide-react';
import { Account } from '@/types/models';
import { FormEventHandler, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';
import clsx from 'clsx';

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
        <AuthenticatedLayout>
            <Head title="Create New Invoice" />

            <PageHeader 
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('invoices.index')}
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-100 hover:bg-primary-50/50 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">New Invoice</span>
                    </div>
                }
                subtitle="Generate a professional billing document for your customer"
            />

            <div className="max-w-7xl">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-12 gap-8 items-start">
                        {/* Primary Workspace - 8 Columns */}
                        <div className="col-span-12 lg:col-span-8 space-y-8">
                            {/* Document Meta Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-900 font-bold px-1">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Details</h3>
                                </div>
                                
                                <Card className="border-none shadow-sm overflow-hidden animate-in fade-in duration-500">
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="md:col-span-2">
                                                <Select
                                                    label="Customer Selection"
                                                    value={data.customer_id}
                                                    onChange={(e) => setData('customer_id', e.target.value)}
                                                    error={errors.customer_id}
                                                    className="h-10"
                                                    icon={<UserPlus className="w-4 h-4" />}
                                                >
                                                    <option value="">Select an account...</option>
                                                    {customers.map(c => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <Input
                                                label="Issuance Date"
                                                type="date"
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                error={errors.date}
                                                icon={<Calendar className="w-4 h-4" />}
                                                className="h-10"
                                            />
                                            <Input
                                                label="Maturity / Due Date"
                                                type="date"
                                                value={data.due_date}
                                                onChange={(e) => setData('due_date', e.target.value)}
                                                error={errors.due_date}
                                                icon={<Calendar className="w-4 h-4" />}
                                                className="h-10 text-red-600"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </section>

                            {/* Line Items Section */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                                        <Calculator className="w-4 h-4 text-slate-400" />
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Line Items</h3>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="soft" 
                                        size="sm" 
                                        onClick={addItem} 
                                        icon={<Plus className="w-4 h-4"/>}
                                        className="bg-white border-slate-200"
                                    >
                                        Insert Row
                                    </Button>
                                </div>

                                <Card className="border-none shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-slate-50 border-b border-slate-100">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-[50%] font-black text-[10px] uppercase tracking-widest text-slate-900 pl-6">Description / Service</TableHead>
                                                    <TableHead className="w-[12%] font-black text-[10px] uppercase tracking-widest text-slate-900 text-right">Qty</TableHead>
                                                    <TableHead className="w-[18%] font-black text-[10px] uppercase tracking-widest text-slate-900 text-right">Rate</TableHead>
                                                    <TableHead className="w-[15%] font-black text-[10px] uppercase tracking-widest text-slate-900 text-right pr-6">Amount</TableHead>
                                                    <TableHead className="w-[5%]"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {data.items.map((item, index) => (
                                                    <TableRow key={index} className="hover:bg-slate-50/30 group border-slate-50">
                                                        <TableCell className="py-4 pl-6 align-top">
                                                            <Input
                                                                placeholder="Project task or item description..."
                                                                value={item.description}
                                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                                className="border-transparent bg-transparent hover:border-slate-200 focus:bg-white transition-all shadow-none focus:shadow-sm"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-4 align-top">
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                                className="text-right border-transparent bg-transparent hover:border-slate-200 focus:bg-white shadow-none"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-4 align-top">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.price}
                                                                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                                                className="text-right font-mono border-transparent bg-transparent hover:border-slate-200 focus:bg-white shadow-none"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="py-2.5 text-right font-bold text-slate-900 pr-6 align-top font-mono text-sm">
                                                            {formatCurrency(item.total)}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right align-top pr-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(index)}
                                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-2 bg-white rounded-lg hover:shadow-sm border border-transparent hover:border-red-100 mt-1"
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
                                        <div className="p-4 bg-red-50 text-red-700 text-xs font-bold border-t border-red-100 flex items-center gap-2">
                                            <Activity className="w-4 h-4" />
                                            {errors.items}
                                        </div>
                                    )}
                                </Card>
                            </section>
                        </div>

                        {/* Summary Sidebar - 4 Columns */}
                        <div className="col-span-12 lg:col-span-4 sticky top-8">
                            <Card className="border-none shadow-premium-soft overflow-hidden group">
                                <div className="h-1.5 w-full bg-primary-600"></div>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Pricing Summary</h3>
                                        <Calculator className="w-4 h-4 text-slate-400" />
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Subtotal</span>
                                            <span className="font-bold text-slate-900 font-mono tracking-tight">{formatCurrency(data.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Taxation (0%)</span>
                                            <span className="text-slate-400 font-bold font-mono">$0.00</span>
                                        </div>
                                        <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                                            <div>
                                                <span className="text-xl font-bold text-slate-900 tracking-tight block uppercase">Total</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gross Result</span>
                                            </div>
                                            <span className="text-3xl font-black text-slate-900 font-mono tracking-tighter">
                                                {formatCurrency(data.total_amount)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-4">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={processing}
                                            className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                                            icon={<Save className="w-4 h-4" />}
                                        >
                                            Save Invoice
                                        </Button>
                                        <p className="text-[10px] text-slate-400 text-center leading-relaxed font-medium px-4">
                                            By saving, you confirm these charges are accurate and conform to the service agreement.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed text-center">
                                <UserPlus className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <h4 className="text-sm font-bold text-slate-900 mb-1">New Customer?</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">You can register accounts directly from the accounts section.</p>
                                <Link 
                                    href={route('accounts.index')}
                                    className="text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
                                >
                                    Manage Accounts →
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

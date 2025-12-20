import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import { Save, Plus, Trash2, ArrowLeft, Calculator, FileText, UserPlus, Calendar, Activity, Hash, AlertCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Account } from '@/types/models';
import { formatCurrency } from '@/utils/format';

interface CreateProps {
    customers: Account[];
}

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export default function Create({ customers }: CreateProps) {
    const generateCNNumber = () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `CN-${year}-${random}`;
    };

    const { data, setData, post, processing, errors } = useForm({
        number: generateCNNumber(),
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        notes: '',
        items: [{ description: '', quantity: 1, price: 0, total: 0 }] as InvoiceItem[],
        total_amount: 0,
    });

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
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
        post(route('credit-notes.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Credit Note" />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('credit-notes.index')}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <span>New Credit Note</span>
                    </div>
                }
                subtitle="Issue a balance adjustment for an existing account"
            />

            <form onSubmit={handleSubmit} className="relative">
                <div className="grid grid-cols-12 gap-8">
                    {/* Primary Editing Workspace */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* Transaction Context Card */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Context</span>
                            </div>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <Input
                                        label="Reference Number"
                                        value={data.number}
                                        onChange={(e) => setData('number', e.target.value)}
                                        error={errors.number}
                                        className="h-10"
                                        icon={<Hash className="w-4 h-4" />}
                                    />
                                    
                                    <Select
                                        label="Customer Account"
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
                                
                                <div className="space-y-6">
                                    <Input
                                        label="Adjustment Date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        error={errors.date}
                                        className="h-10"
                                        icon={<Calendar className="w-4 h-4" />}
                                    />
                                    
                                    <Select
                                        label="Initial Status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        error={errors.status}
                                        className="h-10"
                                        icon={<Activity className="w-4 h-4" />}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="sent">Dispatched</option>
                                        <option value="refunded">Refunded</option>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Line Items Workspace */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-6 py-3">
                                <div className="flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adjustment Items</span>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="soft" 
                                    size="sm" 
                                    onClick={addItem} 
                                    icon={<Plus className="w-3.5 h-3.5" />}
                                    className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white border-slate-200"
                                >
                                    Add Line
                                </Button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4 pl-8">Description</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Qty</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Rate</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right pr-8">Credit</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.items.map((item, index) => (
                                            <TableRow key={index} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                                                <TableCell className="py-2 pl-8">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Reason for adjustment..."
                                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300 p-0"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-2 text-right">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                        className="w-20 bg-transparent border-none focus:ring-0 text-right text-sm font-mono text-slate-600 p-0"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-2 text-right">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.price}
                                                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                                        className="w-32 bg-transparent border-none focus:ring-0 text-right text-sm font-mono text-slate-600 p-0"
                                                    />
                                                </TableCell>
                                                <TableCell className="py-2 text-right pr-8 font-bold text-red-600 font-mono text-sm tracking-tight">
                                                    {formatCurrency(item.total)}
                                                </TableCell>
                                                <TableCell className="py-2">
                                                    {data.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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
                                <div className="p-4 flex items-center gap-3 bg-red-50 border-t border-red-100 text-red-600 text-xs font-bold animate-in slide-in-from-bottom-2">
                                    <Activity className="w-4 h-4" />
                                    {errors.items}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Meta & Summary Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        <Card className="border-none shadow-premium-soft overflow-hidden sticky top-8">
                            <div className="h-1.5 w-full bg-red-600"></div>
                            <CardContent className="p-6 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Financial Impact</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Credit</span>
                                            <span className="text-2xl font-bold text-red-600 font-mono tracking-tighter">
                                                -{formatCurrency(data.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                         <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                         <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Internal Narrative</h3>
                                    </div>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Reason for adjustment, internal references, or audit notes..."
                                        className="w-full min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-sm placeholder:text-slate-300"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    Issue Credit Note
                                </Button>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                    <Activity className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                        Issuing this document will reduce the customer's outstanding balance. This action will be logged in the system audit trail.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import { Save, Plus, Trash2, ArrowLeft, Calculator, FileText, UserPlus, Calendar, Activity } from 'lucide-react';
import type { Account } from '@/types/models';
import { useState, useEffect, type FormEventHandler } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/format';
import api from '@/lib/api';

interface QuoteItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export default function Create() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    
    const [data, setData] = useState({
        customer_id: '',
        date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: '', quantity: 1, price: 0, total: 0 }] as QuoteItem[],
        total_amount: 0,
        notes: ''
    });

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await api.get('/api/accounts?type=customer&per_page=100');
                setCustomers(response.data.accounts?.data || response.data.accounts || []);
            } catch (error) {
                console.error('Failed to fetch customers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...data.items];
        // @ts-ignore
        newItems[index][field] = value;
        
        if (field === 'quantity' || field === 'price') {
             newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].price || 0);
        }

        const total = newItems.reduce((sum, item) => sum + (item.total || 0), 0);

        setData(prev => ({
            ...prev,
            items: newItems,
            total_amount: total
        }));
    };

    const addItem = () => {
        setData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, price: 0, total: 0 }]
        }));
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) return;
        const newItems = data.items.filter((_, i) => i !== index);
        const total = newItems.reduce((sum, item) => sum + (item.total || 0), 0);
        
        setData(prev => ({
            ...prev,
            items: newItems,
            total_amount: total
        }));
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.post('/api/quotes', data);
            navigate('/quotes');
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Failed to create quote:', error);
            }
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Initializing quote engine...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Create Quote" />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/quotes"
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <span>New Quote</span>
                    </div>
                }
                subtitle="Generate a professional estimation for your prospective customer"
            />

            <form onSubmit={handleSubmit} className="relative" noValidate>
                <div className="grid grid-cols-12 gap-8">
                    {/* Primary Editing Workspace */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* Transaction Context Card */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quote Context</span>
                            </div>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Select
                                        label="Customer Selection"
                                        value={data.customer_id}
                                        onChange={(e) => setData({ ...data, customer_id: e.target.value })}
                                        error={errors.customer_id}
                                        className="h-10"
                                        icon={<UserPlus className="w-4 h-4" />}
                                        required
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
                                    onChange={(e) => setData({ ...data, date: e.target.value })}
                                    error={errors.date}
                                    className="h-10"
                                    icon={<Calendar className="w-4 h-4" />}
                                    required
                                />
                                
                                <Input
                                    label="Valid Until"
                                    type="date"
                                    value={data.expiry_date}
                                    onChange={(e) => setData({ ...data, expiry_date: e.target.value })}
                                    error={errors.expiry_date}
                                    className="h-10"
                                    icon={<Calendar className="w-4 h-4" />}
                                    required
                                />
                            </CardContent>
                        </Card>

                        {/* Line Items Workspace */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-6 py-3">
                                <div className="flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Line Items</span>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="soft" 
                                    size="sm" 
                                    onClick={addItem} 
                                    icon={<Plus className="w-3.5 h-3.5" />}
                                    className="h-8 text-[10px] font-bold uppercase tracking-widest"
                                >
                                    Add Line
                                </Button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="hover:bg-transparent border-slate-100">
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4 pl-6">Description</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Qty</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Price</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right pr-6">Total</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.items.map((item, index) => (
                                            <TableRow key={index} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                                                <TableCell className="py-2 pl-6">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        placeholder="Describe service or product..."
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
                                                <TableCell className="py-2 text-right pr-6 font-bold text-slate-900 font-mono text-sm tracking-tight">
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
                            <div className="h-1.5 w-full bg-slate-900"></div>
                            <CardContent className="p-6 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Financial Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Total</span>
                                            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">
                                                {formatCurrency(data.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Notes & Terms</h3>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData({ ...data, notes: e.target.value })}
                                        placeholder="Internal notes or customer terms..."
                                        className="w-full min-h-[120px] rounded-2xl border-slate-200 bg-slate-50 focus:border-slate-300 focus:ring-4 focus:ring-slate-50 transition-all text-sm placeholder:text-slate-300 font-medium p-4"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    Save Quote
                                </Button>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                    <Activity className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                                        Ensure customer details are accurate. Quotes are valid for 30 days once issued.
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

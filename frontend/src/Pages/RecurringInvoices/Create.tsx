import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import { ArrowLeft, Save, Plus, Trash2, FileText, Calculator, Calendar } from 'lucide-react';
import { useState, useEffect, type FormEventHandler } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Account } from '@/types/models';
import { formatCurrency } from '@/utils/format';
import PageHeader from '@/Components/ui/PageHeader';
import Select from '@/Components/ui/Select';
import api from '@/lib/api';

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export default function Create() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [customers, setCustomers] = useState<Account[]>([]);

    const [data, setData] = useState({
        profile_name: '',
        customer_id: '',
        interval: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        auto_send: false,
        items: [{ description: '', quantity: 1, price: 0 }] as InvoiceItem[],
    });

    const [total, setTotal] = useState(0);

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

    useEffect(() => {
        const newTotal = data.items.reduce((sum, item) => {
            return sum + (item.quantity * item.price);
        }, 0);
        setTotal(newTotal);
    }, [data.items]);

    const addItem = () => {
        setData({ ...data, items: [...data.items, { description: '', quantity: 1, price: 0 }] });
    };

    const removeItem = (index: number) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData({ ...data, items: newItems });
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData({ ...data, items: newItems });
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.post('/api/recurring-invoices', data);
            navigate('/recurring-invoices');
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Failed to create recurring profile:', error);
            }
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Initialising automation workspace...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <PageHeader 
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/recurring-invoices"
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <span>New Recurring Profile</span>
                    </div>
                }
                subtitle="Configure automated billing cycles for long-term customer accounts"
            />
            <Head title="New Recurring Invoice" />

            <div className="max-w-7xl">
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-12 gap-6">
                        {/* Left Column - 70% */}
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            {/* Profile Details */}
                            <Card className="border-none shadow-premium-soft overflow-hidden">
                                <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Configuration</span>
                                </div>
                                <CardContent className="p-6 space-y-6">
                                    <Input
                                        label="Profile Designation"
                                        value={data.profile_name}
                                        onChange={(e) => setData({ ...data, profile_name: e.target.value })}
                                        error={errors.profile_name}
                                        placeholder="e.g. Monthly Web Hosting"
                                        className="h-10"
                                        required
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Customer Selection */}
                                        <Select
                                            label="Target Customer"
                                            value={data.customer_id}
                                            onChange={(e) => setData({ ...data, customer_id: e.target.value })}
                                            error={errors.customer_id}
                                            className="h-10"
                                            required
                                        >
                                            <option value="">Select a customer</option>
                                            {customers.map((customer) => (
                                                <option key={customer.id} value={customer.id}>
                                                    {customer.name}
                                                </option>
                                            ))}
                                        </Select>

                                        {/* Interval */}
                                        <Select
                                            label="Recurrence Frequency"
                                            value={data.interval}
                                            onChange={(e) => setData({ ...data, interval: e.target.value })}
                                            error={errors.interval}
                                            className="h-10"
                                            required
                                        >
                                            <option value="monthly">Monthly Cycle</option>
                                            <option value="quarterly">Quarterly Cycle</option>
                                            <option value="yearly">Yearly Cycle</option>
                                        </Select>

                                        {/* Start Date */}
                                        <Input
                                            type="date"
                                            label="Activation Date"
                                            value={data.start_date}
                                            onChange={(e) => setData({ ...data, start_date: e.target.value })}
                                            error={errors.start_date}
                                            className="h-10"
                                            required
                                            icon={<Calendar className="w-4 h-4" />}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Items Section */}
                            <Card className="border-none shadow-premium-soft overflow-hidden">
                                <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        <Calculator className="w-4 h-4 text-slate-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Defined Line Items</span>
                                    </div>
                                    <Button type="button" variant="soft" size="sm" onClick={addItem} icon={<Plus className="w-4 h-4" />} className="bg-white border-slate-200">
                                        Insert Row
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-[45%] font-bold text-[10px] uppercase tracking-widest text-slate-900 pl-6">Service Description</TableHead>
                                                <TableHead className="w-[15%] font-bold text-[10px] uppercase tracking-widest text-slate-900 text-right">Quantity</TableHead>
                                                <TableHead className="w-[20%] font-bold text-[10px] uppercase tracking-widest text-slate-900 text-right">Rate</TableHead>
                                                <TableHead className="w-[15%] font-bold text-[10px] uppercase tracking-widest text-slate-900 text-right pr-6">Amount</TableHead>
                                                <TableHead className="w-[5%]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.items.map((item, index) => (
                                                <TableRow key={index} className="hover:bg-gray-50/30">
                                                    <TableCell className="align-top pl-6 py-4">
                                                        <Input
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                            placeholder="Item description"
                                                            className="h-10"
                                                            required
                                                        />
                                                    </TableCell>
                                                    <TableCell className="align-top py-4 text-right">
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                                            min={0.01}
                                                            step="0.01"
                                                            className="h-10 text-right"
                                                            required
                                                        />
                                                    </TableCell>
                                                    <TableCell className="align-top py-4 text-right">
                                                        <Input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                                            min={0}
                                                            step="0.01"
                                                            className="h-10 text-right font-mono"
                                                            required
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-slate-900 pr-6 pt-6 align-top font-mono text-sm">
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
                                <Card className="border-none shadow-premium-soft overflow-hidden">
                                    <div className="h-1.5 w-full bg-slate-900"></div>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Financial Summary</h3>
                                            <Calculator className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Base Rate</span>
                                                <span className="font-bold text-slate-900 font-mono tracking-tight">{formatCurrency(total)}</span>
                                            </div>
                                            <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                                                <div>
                                                    <span className="text-xl font-bold text-slate-900 tracking-tight block uppercase">Total</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Per Interval</span>
                                                </div>
                                                <span className="text-3xl font-black text-slate-900 font-mono tracking-tighter">
                                                    {formatCurrency(total)}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={processing}
                                            className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                                            icon={<Save className="w-4 h-4" />}
                                        >
                                            Create Profile
                                        </Button>
                                        <p className="text-[10px] text-slate-400 text-center leading-relaxed font-medium px-4">
                                            Automated billing will commence on the defined activation date using the provided parameters.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

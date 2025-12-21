import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import { Save, Plus, Trash2, ArrowLeft, Calculator, FileText, UserPlus, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import type { Account } from '@/types/models';
import { useState, useEffect, type FormEventHandler } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '@/utils/format';
import api from '@/lib/api';

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export default function Edit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Account[]>([]);
    const [data, setData] = useState({
        customer_id: '',
        date: '',
        due_date: '',
        items: [] as InvoiceItem[],
        total_amount: 0,
        status: 'pending' as any
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invoiceRes, customersRes] = await Promise.all([
                    api.get(`/api/invoices/${id}`),
                    api.get('/api/accounts')
                ]);
                
                const invoice = invoiceRes.data.invoice;
                const items = (Array.isArray(invoice.items) ? invoice.items : JSON.parse(invoice.items as unknown as string || '[]')) as any[];
                
                setCustomers(customersRes.data.accounts?.data || customersRes.data.accounts || []);
                setData({
                    customer_id: invoice.customer_id.toString(),
                    date: invoice.date,
                    due_date: invoice.due_date,
                    items: items.map(i => ({...i, total: Number(i.quantity) * Number(i.price)})),
                    total_amount: invoice.total_amount,
                    status: invoice.status
                });
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...data.items];
        // @ts-ignore
        newItems[index][field] = value;
        
        if (field === 'quantity' || field === 'price') {
             newItems[index].total = Number(newItems[index].quantity || 0) * Number(newItems[index].price || 0);
        }

        const total = newItems.reduce((sum, item) => sum + item.total, 0);

        setData({
            ...data,
            items: newItems,
            total_amount: total
        });
    };

    const addItem = () => {
        setData({
            ...data,
            items: [
                ...data.items,
                { description: '', quantity: 1, price: 0, total: 0 }
            ]
        });
    };

    const removeItem = (index: number) => {
        if (data.items.length === 1) return;
        const newItems = data.items.filter((_, i) => i !== index);
        const total = newItems.reduce((sum, item) => sum + item.total, 0);
        
        setData({
            ...data,
            items: newItems,
            total_amount: total
        });
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            await api.put(`/api/invoices/${id}`, data);
            navigate('/invoices');
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Failed to update invoice:', error);
            }
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="text-slate-500 animate-pulse font-medium">Loading invoice editor...</div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Invoice`} />

            <PageHeader 
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/invoices"
                            className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-slate-900 tracking-tight">Edit Invoice</span>
                        </div>
                    </div>
                }
                subtitle="Modify professional billing document and update settlement status"
            />

            <div className="max-w-7xl pb-20">
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
                                                    onChange={(e) => setData({ ...data, customer_id: e.target.value })}
                                                    error={errors.customer_id}
                                                    className="h-10"
                                                    icon={<UserPlus className="w-4 h-4" />}
                                                >
                                                    <option value="">Select an account...</option>
                                                    {customers.map(c => (
                                                        <option key={c.id} value={c.id.toString()}>{c.name}</option>
                                                    ))}
                                                </Select>
                                            </div>
                                            <Input
                                                label="Issuance Date"
                                                type="date"
                                                value={data.date}
                                                onChange={(e) => setData({ ...data, date: e.target.value })}
                                                error={errors.date}
                                                icon={<Calendar className="w-4 h-4" />}
                                                className="h-10"
                                            />
                                            <Input
                                                label="Maturity / Due Date"
                                                type="date"
                                                value={data.due_date}
                                                onChange={(e) => setData({ ...data, due_date: e.target.value })}
                                                error={errors.due_date}
                                                icon={<Calendar className="w-4 h-4" />}
                                                className="h-10 text-red-600"
                                            />
                                            <div className="md:col-span-2">
                                                <Select
                                                    label="Settlement Status"
                                                    value={data.status}
                                                    onChange={(e) => setData({ ...data, status: e.target.value })}
                                                    error={errors.status}
                                                    icon={<Activity className="w-4 h-4" />}
                                                >
                                                    <option value="pending">Pending Settlement</option>
                                                    <option value="paid">Fully Settled</option>
                                                    <option value="overdue">Overdue / Arrears</option>
                                                </Select>
                                            </div>
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
                                <div className="h-1.5 w-full bg-indigo-600"></div>
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
                                            Save Changes
                                        </Button>
                                        <p className="text-[10px] text-slate-400 text-center leading-relaxed font-medium px-4">
                                            Validation of financial records is required before committing changes to the ledger.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed text-center">
                                <CheckCircle2 className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                                <h4 className="text-sm font-bold text-slate-900 mb-1">Audit Trail</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">Every change to this document is logged for compliance and transparency.</p>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Security Verified
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

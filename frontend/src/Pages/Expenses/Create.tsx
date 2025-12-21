import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import { Save, ArrowLeft, Upload, FileText, DollarSign, Calendar, Tag, Store, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/format';
import api from '@/lib/api';

export default function Create() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const [data, setData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        merchant: '',
        receipt: null as File | null
    });

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('description', data.description);
        formData.append('amount', data.amount);
        formData.append('date', data.date);
        formData.append('category', data.category);
        formData.append('merchant', data.merchant || '');
        if (data.receipt) {
            formData.append('receipt', data.receipt);
        }

        try {
            await api.post('/api/expenses', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            navigate('/expenses');
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Failed to record expense:', error);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Log Disbursement" />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/expenses"
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <span>Record Expense</span>
                    </div>
                }
                subtitle="Track corporate spending and manage digital receipts"
            />

            <form onSubmit={handleSubmit} className="relative" noValidate>
                <div className="grid grid-cols-12 gap-8">
                    {/* Primary Recording Workspace */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* Core Details Card */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expense Parameters</span>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <Input
                                    label="Disbursement Description"
                                    value={data.description}
                                    onChange={(e) => setData({ ...data, description: e.target.value })}
                                    error={errors.description}
                                    placeholder="e.g. Q4 Cloud Infrastructure, Office Supplies..."
                                    className="h-10 text-sm font-medium"
                                    icon={<FileText className="w-4 h-4" />}
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Total Amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData({ ...data, amount: e.target.value })}
                                        error={errors.amount}
                                        placeholder="0.00"
                                        className="h-10 font-mono"
                                        icon={<DollarSign className="w-4 h-4" />}
                                        required
                                    />
                                    <Input
                                        label="Transaction Date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData({ ...data, date: e.target.value })}
                                        error={errors.date}
                                        className="h-10"
                                        icon={<Calendar className="w-4 h-4" />}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <Select
                                        label="Budget Category"
                                        value={data.category}
                                        onChange={(e) => setData({ ...data, category: e.target.value })}
                                        error={errors.category}
                                        className="h-10"
                                        icon={<Tag className="w-4 h-4" />}
                                        required
                                    >
                                        <option value="">Select Category...</option>
                                        <option value="Office">Office & Workspace</option>
                                        <option value="Travel">Business Travel</option>
                                        <option value="Meals">Hospitality & Meals</option>
                                        <option value="Utilities">Utilities & Connectivity</option>
                                        <option value="Software">SaaS & Infrastructure</option>
                                        <option value="Marketing">Growth & Marketing</option>
                                        <option value="Rent">Facility & Rent</option>
                                        <option value="Equipment">Hardware & Equipment</option>
                                        <option value="Other">Miscellaneous</option>
                                     </Select>
                                    <Input
                                        label="Merchant Entity"
                                        value={data.merchant}
                                        onChange={(e) => setData({ ...data, merchant: e.target.value })}
                                        error={errors.merchant}
                                        placeholder="e.g. AWS, Staples, Uber..."
                                        className="h-10"
                                        icon={<Store className="w-4 h-4" />}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Evidence & Receipts Workspace */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documentary Evidence</span>
                            </div>
                            <CardContent className="p-6">
                                <div className="p-12 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-amber-300 transition-all group relative cursor-pointer">
                                    <input 
                                        id="receipt-upload" 
                                        name="receipt" 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                        accept="image/*"
                                        onChange={(e) => setData({ ...data, receipt: e.target.files ? e.target.files[0] : null })}
                                    />
                                    <div className="text-center space-y-4">
                                        <div className="mx-auto w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-slate-300 group-hover:text-amber-500 group-hover:scale-110 transition-all border border-slate-100 shadow-sm">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
                                                {data.receipt ? data.receipt.name : 'Click or Drag Receipt'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-bold">
                                                Accepted formats: PNG, JPG (Max 2MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {errors.receipt && (
                                    <div className="mt-4 p-4 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl animate-in slide-in-from-top-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.receipt}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meta & Summary Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        <Card className="border-none shadow-premium-soft overflow-hidden sticky top-8">
                            <div className="h-1.5 w-full bg-slate-900"></div>
                            <CardContent className="p-6 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Expense Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gross Disbursement</span>
                                            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">
                                                -{formatCurrency(parseFloat(data.amount) || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                         <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                         <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Audit Context</h3>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium leading-relaxed">
                                        Expenses are categorized for fiscal reporting. Ensure the receipt is clearly legible for tax compliance and internal audits. 
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    Record Expense
                                </Button>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Compliance Locked</h3>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed px-1 italic">
                                        Transaction will be recorded in the general ledger immediately upon submission.
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

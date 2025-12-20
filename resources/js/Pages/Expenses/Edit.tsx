import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import PageHeader from '@/Components/ui/PageHeader';
import { Save, ArrowLeft, FileText, DollarSign, Calendar, Tag, Store, AlertCircle, CheckCircle2, History } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Expense } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';

interface EditProps {
    expense: Expense;
}

export default function Edit({ expense }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        description: expense.description,
        amount: expense.amount.toString(),
        date: expense.date,
        category: expense.category,
        merchant: expense.merchant || '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('expenses.update', expense.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Disbursement #${expense.id}`} />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('expenses.index')}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <span>Edit Expense</span>
                            <span className="text-slate-400 font-mono text-lg font-medium">#{expense.id}</span>
                        </div>
                    </div>
                }
                subtitle={`Adjusting disbursement details for ${expense.merchant || 'unspecified merchant'}`}
            />

            <form onSubmit={handleSubmit} className="relative" noValidate>
                <div className="grid grid-cols-12 gap-8">
                    {/* Primary Editing Workspace */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {/* Transaction Parameters Card */}
                        <Card className="border-none shadow-premium-soft overflow-hidden">
                            <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                <History className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modification Horizon</span>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <Input
                                    label="Disbursement Description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    error={errors.description}
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
                                        onChange={(e) => setData('amount', e.target.value)}
                                        error={errors.amount}
                                        className="h-10 font-mono"
                                        icon={<DollarSign className="w-4 h-4" />}
                                        required
                                    />
                                    <Input
                                        label="Transaction Date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
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
                                        onChange={(e) => setData('category', e.target.value)}
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
                                        onChange={(e) => setData('merchant', e.target.value)}
                                        error={errors.merchant}
                                        placeholder="e.g. AWS, Staples, Uber..."
                                        className="h-10"
                                        icon={<Store className="w-4 h-4" />}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audit Integrity Section */}
                        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Audit Transparency Note</h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    Adjustments to existing expenses are logged for fiscal transparency. If you are modifying the amount or category, ensure the linked receipt (accessible via the "Show" page) remains valid for the updated data.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta & Summary Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        <Card className="border-none shadow-premium-soft overflow-hidden sticky top-8">
                            <div className="h-1.5 w-full bg-slate-900"></div>
                            <CardContent className="p-6 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Revised Impact</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Disbursement</span>
                                            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">
                                                -{formatCurrency(parseFloat(data.amount) || 0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiscal Category</p>
                                            <Badge variant="soft" className="mt-1 border-slate-200 text-slate-600 font-bold px-3 uppercase tracking-widest text-[9px]">
                                                {expense.category}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                         <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                         <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Record Status</h3>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium leading-relaxed">
                                        This expense was originally recorded on {formatDate(expense.date)}. Updates will be reflected in current period financial reports. 
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={processing}
                                    className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800"
                                    icon={<Save className="w-4 h-4" />}
                                >
                                    Save Changes
                                </Button>

                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Secured Edit</h3>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed px-1">
                                        Modifications are permanently logged in the disbursement audit trail.
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

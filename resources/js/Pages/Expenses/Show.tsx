import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import PageHeader from '@/Components/ui/PageHeader';
import { ArrowLeft, Edit2, Trash2, FileText, Hash, DollarSign, Calendar, Tag, Store, Image as ImageIcon, ExternalLink, ShieldCheck, AlertCircle, History, CheckCircle2, Activity, Send } from 'lucide-react';
import { Expense, ActivityLog } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import ActivityFeed from '@/Components/ui/ActivityFeed';
import { useState } from 'react';
import ConfirmModal from '@/Components/ui/ConfirmModal';

interface ShowProps {
    expense: Expense & { activity_logs?: ActivityLog[] };
}

export default function Show({ expense }: ShowProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('expenses.destroy', expense.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Disbursement: ${expense.description}`} />

            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('expenses.index')}
                            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-100 hover:bg-amber-50/50 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex items-baseline gap-3">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Expense Details</h2>
                            <span className="text-slate-400 font-mono text-xl">#{expense.id}</span>
                        </div>
                    </div>
                }
                subtitle="Verification of recorded corporate expenditure and associated documentary evidence"
                actions={
                    <div className="flex gap-3">
                        <Link href={route('expenses.edit', expense.id)}>
                            <Button 
                                variant="soft" 
                                className="h-11 border-slate-200"
                                icon={<Edit2 className="w-4 h-4" />}
                            >
                                Edit Record
                            </Button>
                        </Link>
                        <Button 
                            variant="danger" 
                            className="h-11"
                            icon={<Trash2 className="w-4 h-4" />} 
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Purge Record
                        </Button>
                    </div>
                }
            />

            <div className="py-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-12 gap-8 items-start">
                        {/* Primary Data Pane */}
                        <div className="col-span-12 xl:col-span-8 space-y-8">
                            <Card className="border-none shadow-premium-soft overflow-hidden">
                                <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disbursement Parameters</span>
                                </div>
                                <CardContent className="p-8 space-y-12">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Abstract</p>
                                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                                            {expense.description}
                                        </h1>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm">
                                                    <DollarSign className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Amount</p>
                                                    <p className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">
                                                        {formatCurrency(expense.amount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Effective Date</p>
                                                    <p className="text-lg font-bold text-slate-900 tracking-tight">
                                                        {formatDate(expense.date)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                                    <Tag className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fiscal Category</p>
                                                    <Badge variant="soft" className="mt-1 border-slate-200 text-slate-600 font-bold px-3 uppercase tracking-widest text-[9px]">
                                                        {expense.category}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                                    <Store className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Merchant Entity</p>
                                                    <p className="text-lg font-bold text-slate-900 tracking-tight italic">
                                                        {expense.merchant || 'Unclassified Merchant'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                 {/* Evidence Pane */}
                                <Card className="border-none shadow-premium-soft overflow-hidden flex flex-col">
                                    <div className="p-1 bg-slate-50 border-b border-slate-100 flex items-center gap-2 px-6 py-3">
                                        <ImageIcon className="w-4 h-4 text-slate-400" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documentary Evidence</span>
                                    </div>
                                    <CardContent className="p-8 flex-1 flex flex-col">
                                        {expense.receipt_path ? (
                                            <div className="space-y-6 flex-1 flex flex-col">
                                                <div className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-white flex-1 min-h-[300px]">
                                                    <a href={expense.receipt_path} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                                        <img 
                                                            src={expense.receipt_path} 
                                                            alt="Receipt Evidence" 
                                                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest bg-slate-900/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                                                                <ExternalLink className="w-3 h-3" />
                                                                Expand Visual
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Authentic Document Attached</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-300 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 space-y-4">
                                                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm text-slate-200">
                                                    <ImageIcon className="w-8 h-8" />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <p className="text-xs font-bold uppercase tracking-widest">No Evidence Recorded</p>
                                                    <p className="text-[10px] font-medium text-slate-400">Please upload a receipt for audit compliance</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Verification Footer merged into grid */}
                                <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col gap-6 relative overflow-hidden group">
                                    <History className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-sm shrink-0 border border-white/10">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative Audit Trail</h4>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                                            Recorded on {formatDate(expense.created_at || new Date().toISOString())}. This entry is cleared for operational reporting. Any modifications will be logged against the initiating account.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Sidebar */}
                        <div className="col-span-12 xl:col-span-4 space-y-6">
                            <Card className="border-none shadow-premium-soft overflow-hidden group">
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Audit History</h3>
                                        <Activity className="w-4 h-4 text-slate-300" />
                                    </div>
                                    
                                    <ActivityFeed activities={expense.activity_logs || []} />

                                    <div className="space-y-3 pt-6 border-t border-slate-50">
                                        <Button variant="soft" fullWidth className="h-10 text-[10px] font-bold uppercase tracking-widest bg-white hover:bg-slate-50 border-slate-100">
                                            <Send className="w-3.5 h-3.5 mr-2" />
                                            Email Receipt
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Purge Disbursement Record?"
                message="This will permanently delete this expense from the ledger and remove any associated receipt files. This action cannot be reversed."
                confirmText="Purge Record"
                variant="danger"
                loading={isDeleting}
            />
        </AuthenticatedLayout>
    );
}

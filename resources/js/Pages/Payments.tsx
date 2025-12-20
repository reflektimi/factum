import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import Toolbar from '@/Components/ui/Toolbar';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import { Plus, Search, CreditCard, MoreVertical, Edit2, Trash2, ExternalLink, Calendar, User, DollarSign, Activity, Wallet, Banknote } from 'lucide-react';
import { PaginatedData, Payment } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';
import DeleteConfirmation from '@/Components/DeleteConfirmation';
import Pagination from '@/Components/ui/Pagination';
import Dropdown from '@/Components/Dropdown';
import clsx from 'clsx';

interface PaymentsProps {
    payments: PaginatedData<Payment>;
    filters: {
        search?: string;
        method?: string;
    };
}

export default function Payments({ payments, filters }: PaymentsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                const params = { search, method: filters.method };
                const cleanParams = Object.fromEntries(
                    Object.entries(params).filter(([_, v]) => v)
                );

                router.get(
                    route('payments.index'),
                    cleanParams,
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    const getMethodIcon = (method: string) => {
        switch (method?.toLowerCase()) {
            case 'bank_transfer': return <Banknote className="w-4 h-4" />;
            case 'cash': return <Wallet className="w-4 h-4" />;
            default: return <CreditCard className="w-4 h-4" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Settlement Ledger - Payment Management" />

            <PageHeader 
                title="Payments"
                subtitle="Comprehensive reconciliation of customer settlements and accounts receivable"
                actions={
                    <Button 
                        variant="primary" 
                        icon={<Plus className="w-5 h-5" />} 
                        onClick={() => router.visit(route('payments.create'))}
                    >
                        Register Payment
                    </Button>
                }
            />

            <Toolbar className="mb-8 p-4">
                <div className="flex flex-col md:flex-row gap-4 w-full items-center">
                    <div className="relative flex-1 w-full">
                        <Input
                            placeholder="Locate payment by reference, ID, or customer metadata..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            value={filters.method || ''}
                            onChange={(e) => {
                                const params = { search, method: e.target.value };
                                const cleanParams = Object.fromEntries(
                                    Object.entries(params).filter(([_, v]) => v)
                                );
                                
                                router.get(
                                    route('payments.index'),
                                    cleanParams,
                                    { preserveState: true, replace: true }
                                );
                            }}
                            icon={<Wallet className="w-4 h-4" />}
                        >
                            <option value="">Settlement Channel</option>
                            <option value="bank_transfer">Bank Transfer (EFT)</option>
                            <option value="credit_card">Card Transaction</option>
                            <option value="cash">Direct Cash</option>
                            <option value="other">Alternative Method</option>
                        </Select>
                    </div>
                </div>
            </Toolbar>

            <Card className="border-none shadow-premium-soft overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Date</TableHead>
                            <TableHead>Settlement ID</TableHead>
                            <TableHead>Fiscal Channel</TableHead>
                            <TableHead align="right">Status</TableHead>
                            <TableHead align="right">Amount</TableHead>
                            <TableHead align="right" className="pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.data.length > 0 ? (
                            payments.data.map((payment) => (
                                <TableRow key={payment.id} className="group hover:bg-slate-50/50 transition-all border-slate-50">
                                    <TableCell className="pl-6">
                                        <span className="text-[13px] text-slate-600 font-medium">
                                            {formatDate(payment.date)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <Link 
                                                href={route('payments.show', payment.id)}
                                                className="text-sm font-semibold text-slate-900 hover:text-primary-600 transition-colors block"
                                            >
                                                PAY-{String(payment.id).padStart(5, '0')}
                                            </Link>
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                Ref: {payment.reference || 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="text-slate-400">
                                                {getMethodIcon(payment.payment_method)}
                                            </div>
                                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-tight">
                                                {payment.payment_method.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Badge variant="success" className="font-medium text-[10px] uppercase tracking-wide">
                                            Settled
                                        </Badge>
                                    </TableCell>
                                    <TableCell align="right">
                                        <span className="text-sm font-bold text-slate-900">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right" className="pr-6">
                                        <TableActions>
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all border border-transparent">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link href={route('payments.show', payment.id)} className="flex items-center gap-2 text-sm">
                                                        <ExternalLink className="w-4 h-4 opacity-50" />
                                                        Trace Transaction
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('payments.edit', payment.id)} className="flex items-center gap-2 text-sm">
                                                        <Edit2 className="w-4 h-4 opacity-50" />
                                                        Adjust Record
                                                    </Dropdown.Link>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <button
                                                        onClick={() => setDeleteId(payment.id)}
                                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 opacity-50" />
                                                        Invalidate Payment
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </TableActions>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="py-32 text-center bg-slate-50/20">
                                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-premium-soft flex items-center justify-center text-slate-200">
                                            <DollarSign className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-base font-black text-slate-900 uppercase tracking-widest">Null Settlement</p>
                                            <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">
                                                No payment settlements identified within the current transaction ledger.
                                            </p>
                                        </div>
                                        <Button 
                                            variant="soft" 
                                            className="h-11 border-slate-200"
                                            onClick={() => router.visit(route('payments.create'))}
                                        >
                                            Register First Settlement
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Pagination data={payments} />

            <DeleteConfirmation
                show={deleteId !== null}
                title="Invalidate Settlement Record"
                message="Are you sure you want to invalidate this payment record? This will reopen any associated liabilities in the document ledger."
                onConfirm={() => {
                    router.delete(route('payments.destroy', deleteId!), {
                        onSuccess: () => setDeleteId(null),
                    });
                }}
                onCancel={() => setDeleteId(null)}
            />
        </AuthenticatedLayout>
    );
}

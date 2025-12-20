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
import { Plus, Search, Receipt, MoreVertical, Edit2, Trash2, ExternalLink, Tag, Calendar, Store, Activity, DollarSign } from 'lucide-react';
import { PaginatedData, Expense } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';
import DeleteConfirmation from '@/Components/DeleteConfirmation';
import Dropdown from '@/Components/Dropdown';
import clsx from 'clsx';

interface ExpensesProps {
    expenses: PaginatedData<Expense>;
    filters: {
        search?: string;
        category?: string;
    };
}

export default function Expenses({ expenses, filters }: ExpensesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                const params = { search, category: filters.category };
                const cleanParams = Object.fromEntries(
                    Object.entries(params).filter(([_, v]) => v)
                );

                router.get(
                    route('expenses.index'),
                    cleanParams,
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <AuthenticatedLayout>
            <Head title="Expenditure Ledger - Expense Management" />

            <PageHeader 
                title="Expenses"
                subtitle="Efficiently track business expenditures and maintain digital receipts for fiscal compliance"
                actions={
                    <Button 
                        variant="primary" 
                        icon={<Plus className="w-5 h-5" />} 
                        onClick={() => router.visit(route('expenses.create'))}
                    >
                        Log Expense
                    </Button>
                }
            />

            <Toolbar className="mb-8 p-4">
                <div className="flex flex-col md:flex-row gap-4 w-full items-center">
                    <div className="relative flex-1 w-full">
                        <Input
                            placeholder="Locate expense by description, merchant, or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full md:w-64">
                         <Select
                            value={filters.category || ''}
                            onChange={(e) => {
                                const params = { search, category: e.target.value };
                                const cleanParams = Object.fromEntries(
                                    Object.entries(params).filter(([_, v]) => v)
                                );
                                
                                router.get(
                                    route('expenses.index'),
                                    cleanParams,
                                    { preserveState: true, replace: true }
                                );
                            }}
                            icon={<Tag className="w-4 h-4" />}
                        >
                            <option value="">All Categories</option>
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
                    </div>
                </div>
            </Toolbar>

            <Card className="border-none shadow-premium-soft overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Merchant</TableHead>
                            <TableHead align="right">Amount</TableHead>
                            <TableHead align="center">Proof</TableHead>
                            <TableHead align="right" className="pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.data.length > 0 ? (
                            expenses.data.map((expense) => (
                                <TableRow key={expense.id} className="group hover:bg-slate-50/50 transition-all border-slate-50">
                                    <TableCell className="pl-6">
                                        <span className="text-[13px] text-slate-600 font-medium">
                                            {formatDate(expense.date)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <Link 
                                                href={route('expenses.show', expense.id)}
                                                className="text-sm font-semibold text-slate-900 hover:text-primary-600 transition-colors block"
                                            >
                                                {expense.description}
                                            </Link>
                                            <span className="text-[11px] text-slate-400 font-medium">
                                                ID: EXP-{String(expense.id).padStart(5, '0')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="soft" className="font-medium text-[10px] uppercase tracking-wide">
                                            {expense.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-slate-700">
                                            {expense.merchant || 'Unrecorded'}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <span className="text-sm font-bold text-slate-900">
                                            {formatCurrency(expense.amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center" className="py-6">
                                        {expense.receipt_path ? (
                                            <a 
                                                href={expense.receipt_path} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100"
                                                title="View Receipt Proof"
                                            >
                                                <Receipt className="w-4.5 h-4.5" />
                                            </a>
                                        ) : (
                                            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-200 flex items-center justify-center border border-slate-100/50 cursor-not-allowed">
                                                <Receipt className="w-4.5 h-4.5 opacity-40" />
                                            </div>
                                        )}
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
                                                    <Dropdown.Link href={route('expenses.show', expense.id)} className="flex items-center gap-2 text-sm">
                                                        <ExternalLink className="w-4 h-4 opacity-50" />
                                                        Verify Entry
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('expenses.edit', expense.id)} className="flex items-center gap-2 text-sm">
                                                        <Edit2 className="w-4 h-4 opacity-50" />
                                                        Modify Record
                                                    </Dropdown.Link>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <button
                                                        onClick={() => setDeleteId(expense.id)}
                                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 opacity-50" />
                                                        Purge Entry
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </TableActions>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="py-32 text-center bg-slate-50/20">
                                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-premium-soft flex items-center justify-center text-slate-200">
                                            <Receipt className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-base font-black text-slate-900 uppercase tracking-widest">Zero Expenditure</p>
                                            <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">
                                                No expense logs identified in the current fiscal registry.
                                            </p>
                                        </div>
                                        <Button 
                                            variant="soft" 
                                            className="h-11 border-slate-200"
                                            onClick={() => router.visit(route('expenses.create'))}
                                        >
                                            Log Initial Expense
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <DeleteConfirmation
                show={deleteId !== null}
                title="Purge Expenditure Record"
                message="Are you sure you want to permanently delete this expenditure entry? Digital evidence and audit data will be lost."
                onConfirm={() => {
                    router.delete(route('expenses.destroy', deleteId!), {
                        onSuccess: () => setDeleteId(null),
                    });
                }}
                onCancel={() => setDeleteId(null)}
            />
        </AuthenticatedLayout>
    );
}

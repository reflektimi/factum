import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import PageHeader from '@/Components/ui/PageHeader';
import Toolbar from '@/Components/ui/Toolbar';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableActions } from '@/Components/ui/Table';
import { formatCurrency } from '@/utils/format';
import { Plus, Search, Mail, Phone, MoreVertical, Edit2, Trash2, User, Building2, ExternalLink, Users, Activity, Tag, ShieldCheck } from 'lucide-react';
import { PaginatedData, Account } from '@/types/models';
import { useState, useEffect } from 'react';
import DeleteConfirmation from '@/Components/DeleteConfirmation';
import Dropdown from '@/Components/Dropdown';
import clsx from 'clsx';

interface AccountsProps {
    accounts: PaginatedData<Account>;
    filters: {
        search?: string;
        type?: string;
    };
}

export default function Accounts({ accounts, filters }: AccountsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                const params = { search, type: filters.type };
                const cleanParams = Object.fromEntries(
                    Object.entries(params).filter(([_, v]) => v)
                );
                
                router.get(
                    route('accounts.index'),
                    cleanParams,
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <AuthenticatedLayout>
            <Head title="Account Directory - Administrative Control" />

            <PageHeader 
                title="Accounts"
                subtitle="Centralized registry for customer profiles, suppliers, and strategic partners"
                actions={
                    <Button 
                        variant="primary" 
                        icon={<Plus className="w-5 h-5" />} 
                        onClick={() => router.visit(route('accounts.create'))}
                    >
                        Create Account
                    </Button>
                }
            />

            <Toolbar className="mb-8 p-4">
                <div className="flex flex-col md:flex-row gap-4 w-full items-center">
                    <div className="relative flex-1 w-full">
                        <Input
                            placeholder="Identify account by name, email, or entity ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            value={filters.type || ''}
                            onChange={(e) => {
                                const params = { search, type: e.target.value };
                                const cleanParams = Object.fromEntries(
                                    Object.entries(params).filter(([_, v]) => v)
                                );
                                
                                router.get(
                                    route('accounts.index'),
                                    cleanParams,
                                    { preserveState: true, replace: true }
                                );
                            }}
                            icon={<Tag className="w-4 h-4" />}
                        >
                            <option value="">All Account Classifications</option>
                            <option value="customer">Client / Customer</option>
                            <option value="supplier">Vendor / Supplier</option>
                        </Select>
                    </div>
                </div>
            </Toolbar>

            <Card className="border-none shadow-premium-soft overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Account Name</TableHead>
                            <TableHead>Classification</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead align="right">Balance</TableHead>
                            <TableHead align="right" className="pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.data.length > 0 ? (
                            accounts.data.map((account) => (
                                <TableRow key={account.id} className="group hover:bg-slate-50/50 transition-all border-slate-50">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm border",
                                                account.type === 'customer' 
                                                    ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                                                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            )}>
                                                {account.name.charAt(0)}
                                            </div>
                                            <div>
                                                <Link
                                                    href={route('accounts.show', account.id)}
                                                    className="text-sm font-semibold text-slate-900 hover:text-primary-600 transition-colors block"
                                                >
                                                    {account.name}
                                                </Link>
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    ID: ACC-{String(account.id).padStart(5, '0')}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={account.type === 'customer' ? 'primary' : 'success'} 
                                            className="font-medium text-[10px] uppercase tracking-wide"
                                        >
                                            {account.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {account.contact_info?.email && (
                                                <div className="text-[13px] text-slate-600 font-medium">
                                                    {account.contact_info.email}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="flex flex-col items-end">
                                            <span className={clsx(
                                                "text-sm font-bold",
                                                account.balance > 0 ? "text-slate-900" : "text-emerald-600"
                                            )}>
                                                {formatCurrency(account.balance)}
                                            </span>
                                        </div>
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
                                                    <Dropdown.Link href={route('accounts.show', account.id)} className="flex items-center gap-2 text-sm">
                                                        <ExternalLink className="w-4 h-4 opacity-50" />
                                                        View Details
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('accounts.edit', account.id)} className="flex items-center gap-2 text-sm">
                                                        <Edit2 className="w-4 h-4 opacity-50" />
                                                        Edit Profile
                                                    </Dropdown.Link>
                                                    <div className="h-px bg-slate-100 my-1"></div>
                                                    <button
                                                        onClick={() => setDeleteId(account.id)}
                                                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 opacity-50" />
                                                        Archive Account
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </TableActions>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="py-32 text-center bg-slate-50/20">
                                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-premium-soft flex items-center justify-center text-slate-200">
                                            <Users className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-base font-black text-slate-900 uppercase tracking-widest">Isolated Environment</p>
                                            <p className="text-xs text-slate-400 font-bold leading-relaxed px-4">
                                                No active accounts currently indexed in the administrative registry.
                                            </p>
                                        </div>
                                        <Button 
                                            variant="soft" 
                                            className="h-11 border-slate-200"
                                            onClick={() => router.visit(route('accounts.create'))}
                                        >
                                            Register First Profile
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
                title="Decommission Account Profile"
                message="Are you sure you want to transition this account to the archive? This will impact fiscal ledger visibility for associated records."
                onConfirm={() => {
                    router.delete(route('accounts.destroy', deleteId!), {
                        onSuccess: () => setDeleteId(null),
                    });
                }}
                onCancel={() => setDeleteId(null)}
            />
        </AuthenticatedLayout>
    );
}

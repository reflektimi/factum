import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import { formatCurrency, formatDate } from '@/utils/format';
import { Plus, Search, Filter, Phone, Mail, MapPin } from 'lucide-react';
import { PaginatedData, Account } from '@/types/models';
import { useState, useEffect } from 'react';

interface AccountsProps {
    accounts: PaginatedData<Account>;
    filters: {
        search?: string;
        type?: string;
    };
}

export default function Accounts({ accounts, filters }: AccountsProps) {
    const [search, setSearch] = useState(filters.search || '');
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('accounts.index'),
                    { search, type: filters.type },
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                        Accounts
                    </h2>
                    <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => router.visit(route('accounts.create'))}>
                        Add Account
                    </Button>
                </div>
            }
        >
            <Head title="Accounts" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search accounts..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <Button variant="secondary" icon={<Filter className="w-5 h-5" />}>
                                    Filter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Accounts Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Contact Info</TableHead>
                                            <TableHead>Balance</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accounts.data.map((account) => (
                                            <TableRow key={account.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                                            {account.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{account.name}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={account.type === 'customer' ? 'default' : 'status'} status={account.type} className={account.type === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                                                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col space-y-1 text-sm text-gray-500">
                                                        {account.contact_info?.email && (
                                                            <div className="flex items-center gap-1">
                                                                <Mail className="w-3 h-3" />
                                                                {account.contact_info.email}
                                                            </div>
                                                        )}
                                                        {account.contact_info?.phone && (
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="w-3 h-3" />
                                                                {account.contact_info.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-900">
                                                    {formatCurrency(account.balance)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={route('accounts.show', account.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

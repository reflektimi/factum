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
import Dropdown from '@/Components/Dropdown';
import { Plus, Search, FileOutput, Calendar, MoreVertical, Edit2, Trash2, ExternalLink, FileText, ArrowRightLeft, Activity } from 'lucide-react';
import { PaginatedData, Quote } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';
import { useState, useEffect } from 'react';
import DeleteConfirmation from '@/Components/DeleteConfirmation';
import Pagination from '@/Components/ui/Pagination';
import clsx from 'clsx';

interface QuotesProps {
    quotes: PaginatedData<Quote>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Quotes({ quotes, filters }: QuotesProps) {
    const [search, setSearch] = useState(filters.search || '');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                const params = { search, status: filters.status };
                const cleanParams = Object.fromEntries(
                    Object.entries(params).filter(([_, v]) => v)
                );

                router.get(
                    route('quotes.index'),
                    cleanParams,
                    { preserveState: true, replace: true }
                );
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [search]);

    const [deleteId, setDeleteId] = useState<number | null>(null);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'accepted':
            case 'converted':
                return 'success';
            case 'sent':
                return 'primary';
            case 'rejected':
                return 'danger';
            case 'draft':
                return 'secondary';
            default:
                return 'soft';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Quotes & Estimates" />

            <PageHeader 
                title="Quotes"
                subtitle="Create and manage professional estimates for your clients"
                actions={
                    <Button 
                        variant="primary" 
                        icon={<Plus className="w-5 h-5" />} 
                        onClick={() => router.visit(route('quotes.create'))}
                    >
                        Create Quote
                    </Button>
                }
            />

            <Toolbar className="mb-8 p-4">
                <div className="flex flex-col md:flex-row gap-4 w-full items-center">
                    <div className="relative flex-1 w-full">
                        <Input
                            placeholder="Search by quote number or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search className="w-4 h-4" />}
                        />
                    </div>
                    <div className="w-full md:w-64">
                         <Select
                            value={filters.status || ''}
                            onChange={(e) => {
                                const params = { search, status: e.target.value };
                                const cleanParams = Object.fromEntries(
                                    Object.entries(params).filter(([_, v]) => v)
                                );
                                
                                router.get(
                                    route('quotes.index'),
                                    cleanParams,
                                    { preserveState: true, replace: true }
                                );
                            }}
                            icon={<Activity className="w-4 h-4 text-slate-400" />}
                        >
                            <option value="">Quote Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="converted">Converted</option>
                        </Select>
                    </div>
                </div>
            </Toolbar>

            <Card className="border-none shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="pl-6">Quote #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Timeline</TableHead>
                            <TableHead align="right">Amount</TableHead>
                            <TableHead align="right">Status</TableHead>
                            <TableHead align="right" className="pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.data.length > 0 ? (
                            quotes.data.map((quote) => (
                                <TableRow key={quote.id} className="group">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <Link
                                                href={route('quotes.show', quote.id)}
                                                className="text-sm font-semibold text-slate-900 hover:text-primary-600 transition-colors block"
                                            >
                                                {quote.number}
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-slate-700">
                                            {quote.customer?.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[13px] text-slate-600 font-medium">
                                                {formatDate(quote.date)}
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-medium">
                                                Expires {formatDate(quote.expiry_date)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell align="right">
                                        <span className="text-sm font-bold text-slate-900">
                                            {formatCurrency(quote.total_amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Badge 
                                            variant={getStatusVariant(quote.status)} 
                                            className="font-medium text-[10px] uppercase tracking-wide"
                                        >
                                            {quote.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell align="right">
                                        <TableActions>
                                            <Dropdown>
                                                <Dropdown.Trigger>
                                                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </Dropdown.Trigger>
                                                <Dropdown.Content align="right" width="48">
                                                    <Dropdown.Link href={route('quotes.show', quote.id)} className="flex items-center gap-2">
                                                        <ExternalLink className="w-4 h-4 opacity-50" />
                                                        View Quote
                                                    </Dropdown.Link>
                                                    <Dropdown.Link href={route('quotes.edit', quote.id)} className="flex items-center gap-2">
                                                        <Edit2 className="w-4 h-4 opacity-50" />
                                                        Edit Details
                                                    </Dropdown.Link>
                                                    
                                                    {quote.status !== 'converted' && (
                                                        <>
                                                            <div className="border-t border-slate-50 my-1"></div>
                                                            <Dropdown.Link 
                                                                href={route('quotes.convert', quote.id)} 
                                                                method="post"
                                                                as="button"
                                                                className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 font-medium"
                                                            >
                                                                <ArrowRightLeft className="w-4 h-4" />
                                                                Convert to Invoice
                                                            </Dropdown.Link>
                                                        </>
                                                    )}
                                                    
                                                    <div className="border-t border-slate-50 my-1"></div>
                                                    <button
                                                        onClick={() => setDeleteId(quote.id)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                                                    >
                                                        <Trash2 className="w-4 h-4 opacity-50" />
                                                        Delete Quote
                                                    </button>
                                                </Dropdown.Content>
                                            </Dropdown>
                                        </TableActions>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <div className="p-4 bg-slate-50 rounded-full">
                                            <FileOutput className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">No quotes found</p>
                                        <p className="text-xs">Try adjusting your filters or search terms.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Pagination data={quotes} />

            <DeleteConfirmation
                show={deleteId !== null}
                title="Delete Quote"
                message="Are you sure you want to delete this quote? This action cannot be undone."
                onConfirm={() => {
                    router.delete(route('quotes.destroy', deleteId!), {
                        onSuccess: () => setDeleteId(null),
                    });
                }}
                onCancel={() => setDeleteId(null)}
            />
        </AuthenticatedLayout>
    );
}

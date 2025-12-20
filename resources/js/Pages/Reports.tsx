import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import Card, { CardContent } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import PageHeader from '@/Components/ui/PageHeader';
import Input from '@/Components/ui/Input';
import { formatDate } from '@/utils/format';
import Pagination from '@/Components/ui/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import { Plus, TrendingUp, DollarSign, Activity, Calendar, FileText, ChevronRight, BarChart3, Clock, User as UserIcon } from 'lucide-react';
import { PaginatedData, Report } from '@/types/models';
import { useState } from 'react';
import clsx from 'clsx';

interface ReportsProps {
    reports: PaginatedData<Report>;
}

export default function Reports({ reports }: ReportsProps) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        type: 'profit_loss' as 'profit_loss' | 'balance_sheet' | 'cash_flow',
        start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        as_of_date: new Date().toISOString().split('T')[0],
    });

    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('reports.store'), {
            onSuccess: () => {
                setShowForm(false);
            },
        });
    };

    const reportTypes = [
        {
            id: 'profit_loss',
            name: 'Profit & Loss',
            icon: <BarChart3 className="w-5 h-5" />,
            color: 'indigo',
            description: 'Detailed analysis of revenues and expenses.',
            requiresDateRange: true,
        },
        {
            id: 'balance_sheet',
            name: 'Balance Sheet',
            icon: <DollarSign className="w-5 h-5" />,
            color: 'emerald',
            description: 'Real-time snapshot of assets and liabilities.',
            requiresDateRange: false,
        },
        {
            id: 'cash_flow',
            name: 'Statement of Cash Flows',
            icon: <Activity className="w-5 h-5" />,
            color: 'amber',
            description: 'Track liquidity movements in the business.',
            requiresDateRange: true,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Financial Reports" />

            <PageHeader 
                title="Financial Reports"
                subtitle="Generate and analyze comprehensive business insights"
                actions={
                    <Button 
                        variant={showForm ? 'soft' : 'primary'}
                        icon={showForm ? undefined : <Plus className="w-5 h-5" />}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : 'Run New Report'}
                    </Button>
                }
            />

            <div className="space-y-8 pb-20">
                {/* Status Feedback */}
                {(errors as any).error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                        <Activity className="w-5 h-5" />
                        <p className="font-bold text-sm">{(errors as any).error}</p>
                    </div>
                )}

                {/* Report Type Selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reportTypes.map((type) => (
                        <div 
                            key={type.id}
                            onClick={() => {
                                setData('type', type.id as any);
                                if (!showForm) setShowForm(true);
                                setTimeout(() => {
                                    document.getElementById('report-config')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                            }}
                            className={clsx(
                                "cursor-pointer transition-all duration-300 group relative overflow-hidden bg-white border rounded-2xl p-6",
                                data.type === type.id
                                    ? "border-primary-500 ring-4 ring-primary-50 bg-primary-50/10 shadow-lg"
                                    : "border-slate-200 hover:border-slate-300 hover:shadow-subtle"
                            )}
                        >
                            <div className={clsx(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                                type.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                                type.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                "bg-amber-50 text-amber-600"
                            )}>
                                {type.icon}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{type.name}</h3>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{type.description}</p>
                            
                            <div className={clsx(
                                "mt-6 flex items-center gap-2 text-xs font-bold transition-all uppercase tracking-widest",
                                data.type === type.id ? "text-primary-600 opacity-100" : "text-slate-400 opacity-0 group-hover:opacity-100"
                            )}>
                                {data.type === type.id ? 'Active' : 'Select'}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Configuration Panel */}
                {showForm && (
                    <Card id="report-config" className="border-primary-100 bg-primary-50/30 overflow-hidden shadow-sm">
                        <CardContent className="p-8">
                            <form onSubmit={handleGenerateReport} className="flex flex-col md:flex-row items-end gap-6">
                                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.type === 'balance_sheet' ? (
                                        <div className="lg:col-span-3">
                                            <Input
                                                label="As of Date"
                                                type="date"
                                                value={data.as_of_date}
                                                onChange={(e) => setData('as_of_date', e.target.value)}
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <Input
                                                label="Start Date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                required
                                            />
                                            <Input
                                                label="End Date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                required
                                            />
                                            <div className="hidden lg:block items-center justify-center pt-8">
                                                <div className="flex items-center gap-2 p-3 bg-white/60 border border-primary-100 rounded-xl text-xs text-primary-700 font-medium">
                                                    <Calendar className="w-4 h-4" />
                                                    Historical analysis enabled
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="w-full md:w-auto">
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        loading={processing}
                                        className="w-full sm:min-w-[160px]"
                                    >
                                        Run Report
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Activity Feed */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Report Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Reference Period</TableHead>
                                <TableHead>Generation Metadata</TableHead>
                                <TableHead align="right" className="pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.data.length > 0 ? (
                                reports.data.map((report) => (
                                    <TableRow key={report.id} className="group">
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900">{report.title}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium">
                                                        ID: {report.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="soft" className="font-medium text-[10px] uppercase tracking-wide">
                                                {(report.type || 'standard').replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[13px] text-slate-600 font-medium">
                                                {report.type === 'balance_sheet' 
                                                    ? `Snapshot: ${formatDate(report.as_of_date, 'short')}`
                                                    : `${formatDate(report.start_date, 'short')} — ${formatDate(report.end_date, 'short')}`
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                <div className="text-[11px] text-slate-500 font-medium">
                                                    {report.generated_at ? formatDate(report.generated_at, 'long') : 'System Process'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-medium lowercase">
                                                    By {typeof report.generated_by === 'object' ? report.generated_by?.name : 'Automated'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell align="right" className="pr-6">
                                            <Link href={route('reports.show', report.id)}>
                                                <Button variant="soft" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Open Report
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                        <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-slate-900">Archive is currently empty</p>
                                        <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                                            Run your first financial simulation to see reports listed here.
                                        </p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>

                <Pagination data={reports} />
            </div>
        </AuthenticatedLayout>
    );
}

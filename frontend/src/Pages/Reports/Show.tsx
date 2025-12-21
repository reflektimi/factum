import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@/Components/InertiaShim';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import { formatCurrency, formatDate } from '@/utils/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/Table';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/lib/api';

interface ReportLineItem {
    id: number;
    section: string;
    category: string;
    subcategory?: string;
    line_item_name: string;
    amount: number;
    description?: string;
    source_transactions?: any[];
    display_order: number;
}

interface Report {
    id: number;
    title: string;
    type: string;
    start_date?: string;
    end_date?: string;
    as_of_date?: string;
    currency: string;
    data: any;
    generated_at: string;
    generated_by?: { name: string };
    line_items?: ReportLineItem[];
}

export default function Show() {
    const { id } = useParams<{ id: string }>();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [drillDownData, setDrillDownData] = useState<any>(null);
    const [showDrillDown, setShowDrillDown] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/api/reports/${id}`);
                setReport(response.data.report);
            } catch (error) {
                console.error('Failed to fetch report:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('print') === 'true' && !loading) {
            setTimeout(() => window.print(), 1000);
        }
    }, [loading]);

    const handleDrillDown = async (lineItemId: number) => {
        if (!report) return;
        try {
            // Note: api.post automatically handles CSRF token if set up correctly
            const response = await api.post(`/api/reports/${report.id}/drilldown`, { line_item_id: lineItemId });
            setDrillDownData(response.data);
            setShowDrillDown(true);
        } catch (error) {
            console.error('Failed to fetch drill-down data:', error);
        }
    };

    if (loading || !report) {
        return (
            <AuthenticatedLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    <span className="ml-2 text-slate-500 font-medium">Loading report...</span>
                </div>
            </AuthenticatedLayout>
        );
    }

    const groupedLineItems = (report.line_items || []).reduce((acc, item) => {
        if (!acc[item.section]) {
            acc[item.section] = [];
        }
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, ReportLineItem[]>);

    const getSectionTitle = (section: string) => {
        const titles: Record<string, string> = {
            revenue: 'Revenue',
            expenses: 'Operating Expenses',
            profit: 'Net Profit',
            assets: 'Assets',
            liabilities: 'Liabilities',
            equity: 'Equity',
            operating: 'Operating Activities',
            summary: 'Cash Position',
        };
        return titles[section] || section.toUpperCase();
    };

    const getSectionColor = (section: string) => {
        if (section === 'profit' || section === 'revenue') return 'text-green-700';
        if (section === 'expenses') return 'text-red-700';
        return 'text-gray-900';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/reports" className="text-gray-500 hover:text-gray-700 print:hidden">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 font-heading">
                            {report?.title || 'Report'}
                        </h2>
                    </div>
                    <div className="flex gap-2 print:hidden">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`${api.defaults.baseURL}/api/reports/${report.id}/download`, '_blank')}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export Excel
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={report?.title || 'Report'} />

            <div className="py-8">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    {/* Report Header */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Report Type</p>
                                    <p className="font-semibold text-gray-900">
                                        {(report.type || '').replace('_', ' ').toUpperCase()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Period</p>
                                    <p className="font-semibold text-gray-900">
                                        {report.type === 'balance_sheet'
                                            ? `As of ${formatDate(report.as_of_date || '', 'short')}`
                                            : [formatDate(report.start_date || '', 'short'), formatDate(report.end_date || '', 'short')].filter(d => d !== 'N/A').join(' - ') || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Generated</p>
                                    <p className="font-semibold text-gray-900">
                                        {report.generated_at ? formatDate(report.generated_at, 'short') : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Generated By</p>
                                    <p className="font-semibold text-gray-900">
                                        {report.generated_by?.name || 'System'}
                                    </p>
                                </div>
                            </div>

                            {/* Summary Cards for P&L */}
                            {report.type === 'profit_loss' && report.data?.summary && (
                                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Net Revenue</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(report.data.summary.net_revenue)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Total Expenses</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {formatCurrency(report.data.summary.total_expenses)}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Net Profit</p>
                                        <p className={`text-2xl font-bold ${report.data.summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(report.data.summary.net_profit)}
                                            {report.data.summary.net_profit >= 0 ? (
                                                <TrendingUp className="inline-block w-5 h-5 ml-2" />
                                            ) : (
                                                <TrendingDown className="inline-block w-5 h-5 ml-2" />
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {report.data.summary.profit_margin?.toFixed(1)}% margin
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Report Line Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Statement</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableBody>
                                        {Object.entries(groupedLineItems).map(([section, items]) => (
                                            <>
                                                {/* Section Header */}
                                                <TableRow key={`${section}-header`} className="bg-gray-50">
                                                    <TableCell colSpan={3} className={`font-bold text-lg py-4 ${getSectionColor(section)}`}>
                                                        {getSectionTitle(section)}
                                                    </TableCell>
                                                </TableRow>

                                                {/* Line Items */}
                                                {items.map((item) => {
                                                    const isTotal = item.category === 'Total' || item.category === 'Bottom Line';
                                                    const isSubcategory = !!item.subcategory;
                                                    const hasTransactions = item.source_transactions && item.source_transactions.length > 0;

                                                    return (
                                                        <TableRow
                                                            key={item.id}
                                                            className={`${isTotal ? 'bg-gray-50 border-t-2 border-gray-300' : ''} ${hasTransactions ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                                                            onClick={() => hasTransactions && handleDrillDown(item.id)}
                                                        >
                                                            <TableCell className={`${isTotal ? 'font-bold' : ''} ${isSubcategory ? 'pl-8' : 'pl-4'}`}>
                                                                {item.line_item_name}
                                                                {item.description && (
                                                                    <span className="text-sm text-gray-500 ml-2">
                                                                        ({item.description})
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {hasTransactions && (
                                                                    <Badge variant="default" className="mr-2 text-xs">
                                                                        {item.source_transactions?.length || 0} items
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className={`text-right ${isTotal ? 'font-bold text-lg' : ''} ${item.amount < 0 ? 'text-red-600' : ''}`}>
                                                                {formatCurrency(Math.abs(item.amount))}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Drill-Down Modal */}
                    {showDrillDown && drillDownData && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDrillDown(false)}>
                            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                <div className="p-6 border-b">
                                    <h3 className="text-lg font-semibold">Transaction Details: {drillDownData.line_item.line_item_name}</h3>
                                </div>
                                <div className="overflow-auto max-h-[60vh]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Number</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {drillDownData.transactions.map((txn: any, idx: number) => (
                                                <TableRow key={idx}>
                                                    <TableCell><Badge>{txn.type}</Badge></TableCell>
                                                    <TableCell className="font-mono text-sm">{txn.number}</TableCell>
                                                    <TableCell>{formatDate(txn.date, 'short')}</TableCell>
                                                    <TableCell>{txn.description}</TableCell>
                                                    <TableCell className="text-right font-semibold">{formatCurrency(txn.amount)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={txn.status === 'paid' || txn.status === 'completed' ? 'success' : 'default'}>
                                                            {txn.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="p-4 border-t flex justify-end">
                                    <Button onClick={() => setShowDrillDown(false)}>Close</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

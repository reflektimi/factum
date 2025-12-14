import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { ArrowLeft, Printer, Download, Calendar, User, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';

interface Report {
    id: number;
    title: string;
    type: string;
    data: any;
    generated_at: string;
    generated_by?: {
        name: string;
    };
}

interface ShowProps {
    report: Report;
}

export default function Show({ report }: ShowProps) {
    const renderReportContent = () => {
        const { data } = report;
        
        switch (report.type) {
            case 'income':
                return (
                    <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 p-6 rounded-xl">
                                <p className="text-sm text-slate-500 font-medium uppercase">Total Revenue</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(data.total_revenue)}</p>
                            </div>
                             <div className="bg-red-50 p-6 rounded-xl">
                                <p className="text-sm text-red-500 font-medium uppercase">Total Expenses</p>
                                <p className="text-3xl font-bold text-red-700 mt-2">{formatCurrency(data.total_expenses)}</p>
                            </div>
                            <div className={`p-6 rounded-xl ${data.net_profit >= 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                                <p className={`text-sm font-medium uppercase ${data.net_profit >= 0 ? 'text-green-600' : 'text-orange-600'}`}>Net Profit</p>
                                <p className={`text-3xl font-bold mt-2 ${data.net_profit >= 0 ? 'text-green-800' : 'text-orange-800'}`}>{formatCurrency(data.net_profit)}</p>
                            </div>
                        </div>
                        <div className="bg-white border rounded-xl p-6">
                            <h4 className="font-semibold text-gray-800 mb-4">Details</h4>
                             <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Revenue (This Month)</span>
                                <span className="font-medium">{formatCurrency(data.monthly_revenue)}</span>
                            </div>
                        </div>
                    </div>
                );
            
            case 'outstanding':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 p-6 rounded-xl">
                                <p className="text-sm text-slate-500 font-medium uppercase">Total Outstanding</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{formatCurrency(data.total_outstanding)}</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-xl">
                                <p className="text-sm text-red-500 font-medium uppercase">Overdue Amount</p>
                                <p className="text-3xl font-bold text-red-700 mt-2">{formatCurrency(data.total_overdue)}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <p className="text-sm text-gray-500 font-medium uppercase">Draft Invoices</p>
                                <p className="text-3xl font-bold text-gray-700 mt-2">{formatCurrency(data.total_draft)}</p>
                            </div>
                        </div>
                    </div>
                );

            case 'cash_flow':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-green-50 p-6 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                    <p className="text-sm text-green-600 font-medium uppercase">Inflow</p>
                                </div>
                                <p className="text-2xl font-bold text-green-800">{formatCurrency(data.inflow)}</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                    <p className="text-sm text-red-600 font-medium uppercase">Outflow</p>
                                </div>
                                <p className="text-2xl font-bold text-red-800">{formatCurrency(data.outflow)}</p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 h-4 text-blue-600" />
                                    <p className="text-sm text-blue-600 font-medium uppercase">Net Cash Flow</p>
                                </div>
                                <p className="text-2xl font-bold text-blue-800">{formatCurrency(data.net)}</p>
                            </div>
                        </div>
                    </div>
                );

            case 'expenses':
                return (
                    <div className="space-y-6">
                        <div className="bg-red-50 p-6 rounded-xl max-w-sm">
                            <p className="text-sm text-red-500 font-medium uppercase">Total Expenses</p>
                            <p className="text-3xl font-bold text-red-700 mt-2">{formatCurrency(data.total_expenses)}</p>
                        </div>
                        
                        <div className="bg-white border rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h4 className="font-semibold text-gray-800">Breakdown by Category</h4>
                            </div>
                            <div className="divide-y">
                                {Object.entries(data.by_category || {}).map(([category, amount]) => (
                                    <div key={category} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                                        <span className="font-medium text-gray-700">{category}</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(amount as number)}</span>
                                    </div>
                                ))}
                                {Object.keys(data.by_category || {}).length === 0 && (
                                    <div className="px-6 py-8 text-center text-gray-500">
                                        No expenses recorded.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <pre className="text-sm overflow-auto text-slate-700">{JSON.stringify(data, null, 2)}</pre>
                    </div>
                );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('reports.index')} className="text-slate-500 hover:text-slate-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-slate-800 font-heading">
                            {report.title}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                            {report.type.replace('_', ' ')}
                        </span>
                    </div>
                    <Button variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                        Print Report
                    </Button>
                </div>
            }
        >
            <Head title={`Report: ${report.title}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card className="print:shadow-none print:border-none">
                        <CardHeader>
                            <div className="flex justify-between items-center text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Generated on {new Date(report.generated_at).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Generated by {report.generated_by?.name || 'System'}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {renderReportContent()}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

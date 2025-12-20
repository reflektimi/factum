import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import InsightCard from '@/Components/InsightCard';
import CashFlowForecastCard from '@/Components/CashFlowForecastCard';
import PageHeader from '@/Components/ui/PageHeader';
import { formatCurrency, formatNumber } from '@/utils/format';
import { FileText, CreditCard, TrendingUp, AlertCircle, ArrowUpRight, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
    totalInvoices: number;
    totalRevenue: number;
    outstandingAmount: number;
    paymentsReceived: number;
    overdueCount: number;
}

interface DashboardProps {
    stats: DashboardStats;
    recentInvoices: any[];
    recentPayments: any[];
    chartData: any[];
    insights: any[];
    forecasts: any;
}

export default function Dashboard({ stats, recentInvoices, recentPayments, chartData, insights, forecasts }: DashboardProps) {

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <PageHeader 
                title="Dashboard" 
                subtitle="Overview of your financial performance." 
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.post(route('forecast.refresh-all'), {}, {
                            preserveScroll: true,
                        })}
                        icon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh Data
                    </Button>
                }
            />

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Revenue */}
                <Card className="hover:shadow-subtle transition-all duration-300 border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Revenue</p>
                            <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                <DollarSign className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(stats.totalRevenue)}</div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                                +12%
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Outstanding Amount */}
                <Card className="hover:shadow-subtle transition-all duration-300 border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Outstanding</p>
                            <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(stats.outstandingAmount)}</div>
                        </div>
                        <p className="text-[11px] text-amber-600 mt-2 font-medium">
                            {stats.overdueCount} invoices overdue
                        </p>
                    </CardContent>
                </Card>

                {/* Total Invoices */}
                <Card className="hover:shadow-subtle transition-all duration-300 border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Invoices</p>
                            <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                <FileText className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{formatNumber(stats.totalInvoices, 0)}</div>
                        <p className="text-[11px] text-slate-400 mt-2 font-medium">
                            Issued this year
                        </p>
                    </CardContent>
                </Card>

                {/* Payments Received */}
                <Card className="hover:shadow-subtle transition-all duration-300 border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Payments</p>
                            <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                <Activity className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{formatCurrency(stats.paymentsReceived)}</div>
                        <p className="text-[11px] text-slate-400 mt-2 font-medium">
                            Received this month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Insights & Forecast */}
            <div className="grid gap-6 md:grid-cols-2">
                {insights && insights.length > 0 && (
                     <InsightCard insights={insights} />
                )}
                {forecasts && (
                     <CashFlowForecastCard forecasts={forecasts} />
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <Card className="col-span-4 border-none shadow-sm">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-lg font-bold text-slate-900">Revenue Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[350px] w-full">
                            {chartData && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#94a3b8" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
                                            dy={10}
                                        />
                                        <YAxis 
                                            stroke="#94a3b8" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickFormatter={(value) => `$${value}`} 
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: 'none', 
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                                            }}
                                            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#6366f1" 
                                            strokeWidth={3} 
                                            fillOpacity={1} 
                                            fill="url(#colorRevenue)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-400">
                                    No data available for chart
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3 border-none shadow-sm">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-lg font-bold text-slate-900">Recent Activity</CardTitle>
                        <p className="text-sm text-slate-500">
                            Latest invoices and payments
                        </p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {recentInvoices.slice(0, 3).map((invoice) => (
                                <div key={`inv-${invoice.id}`} className="flex items-center group cursor-pointer">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                                        <FileText className="h-5 w-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                                    </div>
                                    <div className="ml-4 space-y-0.5">
                                        <p className="text-sm font-bold text-slate-900">
                                            Invoice {invoice.number}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {invoice.customer}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-bold text-sm text-slate-900">
                                        +{formatCurrency(invoice.amount)}
                                    </div>
                                </div>
                            ))}
                            {recentPayments.slice(0, 3).map((payment) => (
                                <div key={`pay-${payment.id}`} className="flex items-center group cursor-pointer">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                                        <CreditCard className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="ml-4 space-y-0.5">
                                        <p className="text-sm font-bold text-slate-900">
                                            Payment Received
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {payment.invoice}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-bold text-sm text-emerald-600">
                                        +{formatCurrency(payment.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

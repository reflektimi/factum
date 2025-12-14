import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import { formatCurrency, formatNumber } from '@/utils/format';
import { FileText, CreditCard, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, DollarSign, Activity } from 'lucide-react';
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
}

export default function Dashboard({ stats, recentInvoices, recentPayments, chartData }: DashboardProps) {

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-heading">
                        Dashboard
                    </h2>
                    <p className="text-sm text-gray-500">
                        Overview of your financial performance.
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Total Revenue */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold font-heading">{formatCurrency(stats.totalRevenue)}</div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center">
                                +12% <ArrowUpRight className="w-3 h-3 ml-0.5" />
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Outstanding Amount */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-gray-500">Outstanding</p>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold font-heading">{formatCurrency(stats.outstandingAmount)}</div>
                        </div>
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                            {stats.overdueCount} invoices overdue
                        </p>
                    </CardContent>
                </Card>

                {/* Total Invoices */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-gray-500">Invoices</p>
                            <FileText className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-2xl font-bold font-heading">{formatNumber(stats.totalInvoices, 0)}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Issued this year
                        </p>
                    </CardContent>
                </Card>

                {/* Payments Received */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-gray-500">Payments</p>
                            <Activity className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="text-2xl font-bold font-heading">{formatCurrency(stats.paymentsReceived)}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Received this month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full">
                            {chartData && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#94a3b8" 
                                            fontSize={12} 
                                            tickLine={false} 
                                            axisLine={false} 
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
                                                border: '1px solid #e2e8f0', 
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                            }}
                                            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="revenue" 
                                            stroke="#4f46e5" 
                                            strokeWidth={2} 
                                            fillOpacity={1} 
                                            fill="url(#colorRevenue)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    No data available for chart
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <p className="text-sm text-gray-500">
                            Latest invoices and payments
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentInvoices.slice(0, 3).map((invoice) => (
                                <div key={`inv-${invoice.id}`} className="flex items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                                        <FileText className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-gray-900">
                                            New Invoice {invoice.number}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {invoice.customer}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm text-gray-900">
                                        +{formatCurrency(invoice.amount)}
                                    </div>
                                </div>
                            ))}
                            {recentPayments.slice(0, 3).map((payment) => (
                                <div key={`pay-${payment.id}`} className="flex items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                                        <CreditCard className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-gray-900">
                                            Payment Received
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {payment.invoice}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm text-emerald-600">
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

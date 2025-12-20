import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface ForecastData {
    forecast_date: string;
    scenario: string;
    projected_balance: number;
    total_inflow: number;
    total_outflow: number;
    net_cash_flow: number;
    confidence_score: number;
}

interface CashFlowForecastCardProps {
    forecasts: {
        optimistic: ForecastData[];
        conservative: ForecastData[];
        pessimistic: ForecastData[];
    };
}

export default function CashFlowForecastCard({ forecasts }: CashFlowForecastCardProps) {
    if (!forecasts || !forecasts.conservative || forecasts.conservative.length === 0) {
        return (
            <Card className="border-none shadow-sm h-full">
                <CardHeader className="border-b border-slate-50">
                    <CardTitle className="text-lg font-bold text-slate-900">Cash Flow Forecast</CardTitle>
                    <p className="text-sm text-slate-500">
                        12-month predictive projection
                    </p>
                </CardHeader>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                            <TrendingUp className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">Analytics preparing</p>
                        <p className="text-xs text-slate-500 mt-1">Generate your first forecast to see projections.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Transform data for chart
    const chartData = forecasts.conservative.map((item, index) => {
        const date = new Date(item.forecast_date);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        return {
            month: monthLabel,
            optimistic: forecasts.optimistic[index]?.projected_balance || 0,
            conservative: item.projected_balance,
            pessimistic: forecasts.pessimistic[index]?.projected_balance || 0,
        };
    });

    // Get final balances
    const finalOptimistic = forecasts.optimistic[forecasts.optimistic.length - 1];
    const finalConservative = forecasts.conservative[forecasts.conservative.length - 1];
    const finalPessimistic = forecasts.pessimistic[forecasts.pessimistic.length - 1];

    // Check for potential issues
    const hasNegativeBalance = finalPessimistic.projected_balance < 0 || finalConservative.projected_balance < 0;
    const isLowBalance = finalConservative.projected_balance < 10000 && finalConservative.projected_balance > 0;

    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className="border-b border-slate-50">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900">Cash Flow Forecast</CardTitle>
                        <p className="text-sm text-slate-500">
                            {forecasts.conservative.length}-month multi-scenario projection
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {hasNegativeBalance && (
                            <Badge variant="danger" className="animate-pulse">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Liquidity Risk
                            </Badge>
                        )}
                        {isLowBalance && !hasNegativeBalance && (
                            <Badge variant="warning">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Low Runway
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {/* Chart */}
                <div className="h-72 mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="month" 
                                stroke="#94a3b8"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#94a3b8"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                                formatter={(value: any) => formatCurrency(Number(value || 0))}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: '11px', paddingTop: '20px', fontWeight: 600 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="optimistic" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                dot={false}
                                name="Optimistic"
                                strokeDasharray="5 5"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="conservative" 
                                stroke="#6366f1" 
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                name="Conservative"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="pessimistic" 
                                stroke="#f59e0b" 
                                strokeWidth={2}
                                dot={false}
                                name="Pessimistic"
                                strokeDasharray="3 3"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Scenario Summaries */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Optimistic */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 transition-all hover:bg-emerald-50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Optimistic</h4>
                            <div className="p-1.5 bg-white/50 rounded-lg">
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-base font-bold text-emerald-900 truncate">
                            {formatCurrency(finalOptimistic.projected_balance)}
                        </p>
                        <p className="text-[10px] text-emerald-600 mt-1 font-medium leading-tight">
                            Growth Scenario
                        </p>
                    </div>

                    {/* Conservative */}
                    <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4 transition-all hover:bg-primary-50 shadow-sm shadow-primary-100/20">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary-800">Conservative</h4>
                            <div className="p-1.5 bg-white/50 rounded-lg">
                                <Activity className="h-3.5 w-3.5 text-primary-600" />
                            </div>
                        </div>
                        <p className="text-base font-bold text-primary-900 truncate">
                            {formatCurrency(finalConservative.projected_balance)}
                        </p>
                        <p className="text-[10px] text-primary-600 mt-1 font-medium leading-tight">
                            Base Expectations
                        </p>
                    </div>

                    {/* Pessimistic */}
                    <div className={`${
                        finalPessimistic.projected_balance < 0 
                            ? 'bg-red-50/50 border-red-100' 
                            : 'bg-amber-50/50 border-amber-100'
                    } border rounded-xl p-4 transition-all hover:opacity-90`}>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-[10px] font-bold uppercase tracking-wider ${
                                finalPessimistic.projected_balance < 0 ? 'text-red-800' : 'text-amber-800'
                            }`}>
                                Pessimistic
                            </h4>
                            <div className="p-1.5 bg-white/50 rounded-lg">
                                <AlertTriangle className={`h-3.5 w-3.5 ${finalPessimistic.projected_balance < 0 ? 'text-red-600' : 'text-amber-600'}`} />
                            </div>
                        </div>
                        <p className={`text-base font-bold truncate ${
                            finalPessimistic.projected_balance < 0 ? 'text-red-900' : 'text-amber-900'
                        }`}>
                            {formatCurrency(finalPessimistic.projected_balance)}
                        </p>
                        <p className={`text-[10px] mt-1 font-medium leading-tight ${
                            finalPessimistic.projected_balance < 0 ? 'text-red-600' : 'text-amber-600'
                        }`}>
                            Risk Scenario
                        </p>
                    </div>
                </div>

                {/* Warning if negative */}
                {hasNegativeBalance && (
                    <div className= "mt-6 p-4 bg-red-50/50 border border-red-100 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-red-900">Immediate Action Recommended</p>
                                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                                    Projected liquidity falls below safety thresholds in pessimistic simulations. 
                                    Strategic cost reallocation or credit facility review may be necessary.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

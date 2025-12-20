import React from 'react';
import { AlertCircle, TrendingDown, TrendingUp, AlertTriangle, Info, Lightbulb, CheckCircle } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import { formatCurrency } from '@/utils/format';

interface Insight {
    id: number;
    type: 'anomaly' | 'trend' | 'warning' | 'opportunity' | 'explanation';
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    recommendation?: string;
    impact_amount?: number;
    detected_at: string;
}

interface InsightCardProps {
    insights: Insight[];
}

export default function InsightCard({ insights }: InsightCardProps) {
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-50/50 border-red-100 text-red-900';
            case 'high':
                return 'bg-amber-50/50 border-amber-100 text-amber-900';
            case 'medium':
                return 'bg-indigo-50/50 border-indigo-100 text-indigo-900';
            case 'low':
                return 'bg-slate-50 border-slate-200 text-slate-700';
            default:
                return 'bg-slate-50 border-slate-200 text-slate-700';
        }
    };

    const getTypeIcon = (type: string, severity: string) => {
        const iconClass = severity === 'critical' || severity === 'high' ? 'text-red-500' : 'text-slate-400';
        
        switch (type) {
            case 'anomaly':
                return <AlertCircle className={`h-5 w-5 ${iconClass}`} />;
            case 'warning':
                return <AlertTriangle className={`h-5 w-5 ${iconClass}`} />;
            case 'trend':
                return severity === 'critical' || severity === 'high' 
                    ? <TrendingDown className="h-5 w-5 text-red-500" />
                    : <TrendingUp className="h-5 w-5 text-emerald-500" />;
            case 'opportunity':
                return <Lightbulb className="h-5 w-5 text-emerald-500" />;
            case 'explanation':
                return <Info className="h-5 w-5 text-primary-500" />;
            default:
                return <Info className="h-5 w-5 text-slate-400" />;
        }
    };

    if (!insights || insights.length === 0) {
        return (
            <Card className="border-none shadow-sm h-full">
                <CardHeader className="border-b border-slate-50">
                    <CardTitle className="text-lg font-bold text-slate-900">Financial Insights</CardTitle>
                    <p className="text-sm text-slate-500">
                        AI-powered analysis of your financial performance
                    </p>
                </CardHeader>
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <p className="text-sm font-bold text-slate-900">All systems optimized</p>
                        <p className="text-xs text-slate-500 mt-1">We'll notify you when we find areas for improvement.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm h-full">
            <CardHeader className="border-b border-slate-50">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900">Financial Insights</CardTitle>
                        <p className="text-sm text-slate-500">
                            {insights.length} active observation{insights.length !== 1 ? 's' : ''} 
                        </p>
                    </div>
                    <div className="p-2 bg-primary-50 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-primary-600" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {insights.map((insight) => (
                        <div 
                            key={insight.id} 
                            className={`p-4 rounded-xl border transition-all hover:bg-white hover:shadow-subtle ${getSeverityStyles(insight.severity)}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getTypeIcon(insight.type, insight.severity)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="text-sm font-bold truncate">
                                            {insight.title}
                                        </h4>
                                        <Badge 
                                            className="uppercase text-[10px] tracking-widest font-bold px-1.5 py-0"
                                            variant={
                                                insight.severity === 'critical' ? 'danger' :
                                                insight.severity === 'high' ? 'warning' :
                                                insight.severity === 'medium' ? 'primary' :
                                                'secondary'
                                            }
                                        >
                                            {insight.severity}
                                        </Badge>
                                    </div>
                                    <p className="text-sm opacity-90 leading-relaxed mb-3">
                                        {insight.description}
                                    </p>
                                    {insight.recommendation && (
                                        <div className="bg-white/40 border border-white/20 rounded-lg p-3 mb-3 backdrop-blur-sm">
                                            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1.5">
                                                <Lightbulb className="w-3 h-3" />
                                                Action Suggestion
                                            </p>
                                            <p className="text-xs font-medium">
                                                {insight.recommendation}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/10">
                                        <span className="text-[10px] font-medium opacity-60">
                                            DETECTED {insight.detected_at}
                                        </span>
                                        {insight.impact_amount && insight.impact_amount > 0 && (
                                            <span className="text-xs font-bold">
                                                EST. IMPACT: {formatCurrency(insight.impact_amount)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

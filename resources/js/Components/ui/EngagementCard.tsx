import React from 'react';
import Card from './Card';
import { Calendar, TrendingUp } from 'lucide-react';
import { ActivityLog } from '@/types/models';

interface EngagementCardProps {
    activities: ActivityLog[];
}

export default function EngagementCard({ activities }: EngagementCardProps) {
    const viewCount = activities.filter(a => a.event === 'viewed').length;
    const isSent = activities.some(a => a.event === 'sent');
    
    // Simple heuristic for score
    let score = isSent ? 20 : 0;
    score += Math.min(viewCount * 15, 80);
    
    // Cap at 100
    score = Math.min(score, 100);

    const getAnalysis = () => {
        if (score >= 80) return "High probability of conversion detected by analysis.";
        if (score >= 40) return "Moderate interest detected in document lifecycle.";
        if (score > 0) return "Initial interaction phase. Awaiting further engagement.";
        return "Awaiting initial document dispatch.";
    };

    const getScoreColor = () => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 40) return 'bg-amber-500';
        return 'bg-slate-400';
    };

    const getAccentColor = () => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 40) return 'text-amber-500';
        return 'text-slate-400';
    };

    return (
        <Card className="border-none shadow-premium-soft overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${getAccentColor()}`} />
                        <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Engagement Score</h3>
                    </div>
                    <span className={`text-[10px] font-black ${getAccentColor()}`}>{score}%</span>
                </div>
                
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${getScoreColor()} transition-all duration-1000 ease-out rounded-full shadow-sm`}
                        style={{ width: `${score}%` }}
                    ></div>
                </div>
                
                <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                    {getAnalysis()}
                </p>
            </div>
        </Card>
    );
}

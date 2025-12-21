import { useState } from 'react';
import type { ActivityLog } from '@/types/models';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Eye, 
    CheckCircle, 
    XCircle, 
    Clock, 
    User,
    Globe,
    Terminal,
    ArrowRight,
    Circle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
    activities: ActivityLog[];
    className?: string;
    initialLimit?: number;
}

const getEventIcon = (event: string) => {
    switch (event.toLowerCase()) {
        case 'created': return <Plus className="w-3.5 h-3.5" />;
        case 'updated': return <Edit2 className="w-3.5 h-3.5" />;
        case 'deleted': return <Trash2 className="w-3.5 h-3.5" />;
        case 'viewed': return <Eye className="w-3.5 h-3.5" />;
        case 'accepted': return <CheckCircle className="w-3.5 h-3.5" />;
        case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
        case 'sent': return <Globe className="w-3.5 h-3.5" />;
        case 'run': return <Terminal className="w-3.5 h-3.5" />;
        default: return <Circle className="w-3.5 h-3.5" />;
    }
};

const getEventColor = (event: string) => {
    switch (event.toLowerCase()) {
        case 'created': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'updated': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'deleted': return 'bg-red-50 text-red-600 border-red-100';
        case 'viewed': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
        case 'sent': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
        case 'run': return 'bg-slate-900 text-slate-100 border-slate-800';
        default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
};

export default function ActivityFeed({ activities, className, initialLimit = 5 }: ActivityFeedProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!activities || activities.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                    <Clock className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">No activity recorded yet</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Transaction History remains empty</p>
            </div>
        );
    }

    const displayedActivities = isExpanded ? activities : activities.slice(0, initialLimit);
    const hasMore = activities.length > initialLimit;

    return (
        <div className={cn("space-y-6 relative", className)}>
            {/* Timeline Line */}
            <div className="absolute left-[17.5px] top-2 bottom-2 w-px bg-slate-100" />

            {displayedActivities.map((activity, index) => (
                <div key={activity.id} className="relative pl-10 group animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms` }}>
                    {/* Activity Indicator */}
                    <div className={cn(
                        "absolute left-0 top-0.5 w-9 h-9 rounded-xl border flex items-center justify-center z-10 transition-all group-hover:scale-110 group-hover:shadow-sm",
                        getEventColor(activity.event)
                    )}>
                        {getEventIcon(activity.event)}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-bold text-slate-900 capitalize">
                                {activity.event}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                            </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {activity.description || `${activity.event} this document`}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            {activity.user && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    <User className="w-3 h-3" />
                                    <span>{activity.user.name}</span>
                                </div>
                            )}
                            {activity.ip_address && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    <Globe className="w-3 h-3" />
                                    <span>{activity.ip_address}</span>
                                </div>
                            )}
                        </div>

                        {/* Optional: Diffs/Properties if needed in future */}
                        {activity.properties && Object.keys(activity.properties).length > 0 && activity.event === 'updated' && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100/50 hidden group-hover:block transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <Terminal className="w-3 h-3 text-slate-400" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Modified Fields</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(activity.properties).map(([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">{key}</span>
                                            <span className="text-[10px] text-slate-600 font-mono truncate">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            {hasMore && (
                <div className="pl-10 relative">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-primary-600 uppercase tracking-widest transition-colors group"
                    >
                        {isExpanded ? (
                            <>Show Less History</>
                        ) : (
                            <>
                                View Full History ({activities.length - initialLimit} more)
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

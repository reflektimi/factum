import { HTMLAttributes } from 'react';
import Badge from './Badge';
import { 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    FileText, 
    Send, 
    XCircle, 
    RefreshCw, 
    PauseCircle, 
    StopCircle 
} from 'lucide-react';

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    status: string;
    icon?: boolean;
}

export default function StatusBadge({ status, icon = true, className, ...props }: StatusBadgeProps) {
    const getIcon = (s: string) => {
        switch (s.toLowerCase()) {
            case 'paid':
            case 'completed':
            case 'accepted':
            case 'active':
                return <CheckCircle className="w-3 h-3 mr-1" />;
            case 'pending':
            case 'paused':
                return <Clock className="w-3 h-3 mr-1" />;
            case 'overdue':
            case 'rejected':
                return <AlertCircle className="w-3 h-3 mr-1" />;
            case 'draft':
                return <FileText className="w-3 h-3 mr-1" />;
            case 'sent':
                return <Send className="w-3 h-3 mr-1" />;
            case 'converted':
                return <RefreshCw className="w-3 h-3 mr-1" />;
            case 'ended':
                return <StopCircle className="w-3 h-3 mr-1" />;
            default:
                return null;
        }
    };

    return (
        <Badge 
            variant="status" 
            status={status} 
            className={`border ${className || ''}`}
            {...props}
        >
            {icon && getIcon(status)}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}

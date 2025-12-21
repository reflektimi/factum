import { useState, useEffect } from 'react';
import { Bell, Check, Loader2, FileText, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import Dropdown from '@/Components/Dropdown';

interface NotificationData {
    message: string;
    action_url: string;
    icon?: string;
    color?: string;
}

interface UserNotification {
    id: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);


    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.post(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            ));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.post('/api/notifications/read-all');
             setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
           console.error('Failed to mark all as read');
        }
    };

    const getIcon = (iconName?: string) => {
        switch (iconName) {
            case 'file-text': return <FileText className="w-5 h-5 text-blue-500" />;
            case 'credit-card': return <CreditCard className="w-5 h-5 text-green-500" />;
            case 'check-circle': return <Check className="w-5 h-5 text-gray-500" />;
            default: return <Bell className="w-5 h-5 text-indigo-500" />;
        }
    };

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors focus:outline-none">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                    )}
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content align="right" width="80">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <button 
                            onClick={markAllAsRead}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 py-8">
                            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            No notifications yet
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <Link 
                                key={notification.id}
                                to={notification.data.action_url || '#'}
                                className={`block px-4 py-3 hover:bg-slate-50 transition-colors border-b border-gray-50 last:border-0 relative group ${!notification.read_at ? 'bg-indigo-50/30' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(notification.data.icon)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notification.read_at ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                            {notification.data.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!notification.read_at && (
                                        <button
                                            onClick={(e) => markAsRead(notification.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-all absolute top-2 right-2"
                                            title="Mark as read"
                                        >
                                            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                        </button>
                                    )}
                                </div>
                            </Link>
                        ))
                    )}
                </div>
                
                <div className="px-4 py-2 border-t border-gray-100 text-center bg-gray-50">
                    <Link to="#" className="text-xs text-gray-500 hover:text-gray-700">
                        View all notifications
                    </Link>
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}

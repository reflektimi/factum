import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    FileText, 
    Repeat, 
    FileOutput, 
    CreditCard, 
    Landmark, 
    Receipt, 
    BarChart3, 
    Users, 
    Settings, 
    LogOut,
    ChevronLeft,
    ChevronRight,
    Undo2
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useState } from 'react';
import clsx from 'clsx';
import { PageProps, User } from '@/types/models';

interface SidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
    const { url } = usePage(); // Get current URL path
    
    // Function to check active state
    const isActive = (path: string) => {
        // Simple check: if current url starts with path
        // url usually starts with /, so we match '/path'
        return url.startsWith(path) || (path === '/' && url === '/');
    };

    const navItems = [
        {
            group: 'Overview',
            items: [
                { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            ]
        },
        {
            group: 'Sales',
            items: [
                { label: 'Invoices', href: '/invoices', icon: FileText },
                { label: 'Recurring', href: '/recurring-invoices', icon: Repeat },
                { label: 'Quotes', href: '/quotes', icon: FileOutput },
                { label: 'Credit Notes', href: '/credit-notes', icon: Undo2 },
            ]
        },
        {
            group: 'Finance',
            items: [
                { label: 'Payments', href: '/payments', icon: CreditCard },
                { label: 'Expenses', href: '/expenses', icon: Receipt },
                { label: 'Accounts', href: '/accounts', icon: Landmark },
            ]
        },
        {
            group: 'Analysis',
            items: [
                { label: 'Reports', href: '/reports', icon: BarChart3 },
            ]
        },
        {
            group: 'System',
            items: [
                { label: 'Users', href: '/users', icon: Users, adminOnly: true },
                { label: 'Settings', href: '/settings', icon: Settings },
            ]
        }
    ];

    const { auth } = usePage<any>().props;
    const user = auth.user;

    return (
        <aside 
            className={clsx(
                "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-sidebar-active bg-sidebar text-sidebar-text flex flex-col",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Area */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-active/50">
                <div className={clsx("flex items-center gap-3 overflow-hidden", isCollapsed && "justify-center w-full")}>
                    <ApplicationLogo className="h-9 w-9 shrink-0" />
                    <span className={clsx("font-bold text-xl tracking-tight text-white whitespace-nowrap transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                        Factum
                    </span>
                </div>
                {/* Toggle Button (Desktop only usually, but handled by props) */}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {navItems.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {!isCollapsed && (
                            <div className="px-3 mb-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
                                {group.group}
                            </div>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                if (item.adminOnly && user.role !== 'admin') return null;
                                
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={clsx(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                                            active 
                                                ? "bg-indigo-600/10 text-indigo-400" 
                                                : "text-sidebar-text hover:bg-sidebar-hover",
                                            isCollapsed && "justify-center px-2"
                                        )}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <item.icon className={clsx("w-5 h-5 shrink-0", active ? "text-indigo-400" : "text-sidebar-muted group-hover:text-white")} />
                                        <span className={clsx("whitespace-nowrap transition-opacity duration-200", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                                            {item.label}
                                        </span>
                                        {active && !isCollapsed && (
                                            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                        {/* Divider between groups if expanded */}
                        {!isCollapsed && groupIndex < navItems.length - 1 && (
                            <div className="mx-3 mt-4 border-b border-sidebar-active/30" />
                        )}
                    </div>
                ))}
            </div>

            {/* Bottom Section (User/Logout) */}
            <div className="p-4 border-t border-sidebar-active/50 bg-sidebar-hover/30">
                <div className={clsx("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                        {user.name.charAt(0)}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-sidebar-muted truncate">{user.email}</p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <Link href={route('logout')} method="post" as="button" className="text-sidebar-muted hover:text-white transition-colors">
                            <LogOut className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </div>
            
             {/* Collapse Toggle Button (Absolute positioned on border) */}
             <button 
                onClick={toggleSidebar}
                className="absolute -right-3 top-20 bg-sidebar border border-sidebar-active text-sidebar-muted hover:text-white rounded-full p-1 shadow-md z-50 hidden md:flex"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>
        </aside>
    );
}

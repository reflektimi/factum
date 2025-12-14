import { Bell, Search, Menu } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import SearchBox from '@/Components/SearchBox';
import NotificationDropdown from '@/Components/NotificationDropdown';
import { User } from '@/types/models';

interface TopHeaderProps {
    toggleSidebar: () => void;
}

export default function TopHeader({ toggleSidebar }: TopHeaderProps) {
    const { auth } = usePage<any>().props;
    const user = auth.user;

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 shadow-nav">
             {/* Mobile Menu Toggle */}
             <button 
                className="mr-4 text-slate-500 hover:text-indigo-600 md:hidden"
                onClick={toggleSidebar}
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Global Search */}
            <div className="flex flex-1 items-center max-w-lg relative">
                <SearchBox />
            </div>

            {/* Right Side Icons */}
            <div className="ml-auto flex items-center space-x-4">
                {/* Notifications */}
                <NotificationDropdown />

                {/* Profile Dropdown */}
                <div className="relative">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center space-x-3 rounded-full md:rounded-lg p-1 md:px-3 md:py-1.5 hover:bg-slate-50 transition-colors focus:ring-2 focus:ring-indigo-500">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="hidden text-sm font-medium text-slate-700 md:block">
                                    {user.name}
                                </div>
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content align="right">
                             <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('settings.index')}>Settings</Dropdown.Link>
                            <div className="border-t border-gray-100"></div>
                            <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-600 hover:bg-red-50">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}

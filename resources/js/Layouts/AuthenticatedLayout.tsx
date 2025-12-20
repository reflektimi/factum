import { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import Sidebar from '@/Components/Layout/Sidebar';
import TopHeader from '@/Components/Layout/TopHeader';
import { usePage } from '@inertiajs/react';

import FlashMessage from '@/Components/FlashMessage';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    
    // Auto-collapse on mobile/small screens initially
    useEffect(() => {
        const handleResize = () => {
             if (window.innerWidth < 1024) {
                 setIsSidebarCollapsed(true);
             } else {
                 setIsSidebarCollapsed(false);
             }
        };
        
        // Set initial state
        handleResize();
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    return (
        <>
            <FlashMessage />
            <div className="min-h-screen font-sans flex bg-slate-50 text-slate-900">
                
                {/* Sidebar */}
                <div className="print:hidden">
                    <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} print:ml-0 overflow-hidden`}>
                    
                    {/* Header */}
                    <div className="print:hidden border-b border-slate-200 bg-white">
                        <TopHeader toggleSidebar={toggleSidebar} />
                    </div>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto animate-fade-in p-6 lg:p-10">
                        <div className="max-w-7xl mx-auto w-full">
                            {header && (
                                <div className="mb-6">
                                     {header}
                                </div>
                            )}
                            <div className="w-full">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

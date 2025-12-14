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
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
                
                {/* Sidebar */}
                <div className="print:hidden">
                    <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                </div>

                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} print:ml-0`}>
                    
                    {/* Header */}
                    <div className="print:hidden">
                        <TopHeader toggleSidebar={toggleSidebar} />
                    </div>

                    {/* Page Content */}
                    <main className="flex-1 p-6 md:p-8 animate-fade-in">
                        {header && (
                            <div className="mb-8">
                                 {header}
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}

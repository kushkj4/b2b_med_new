'use client';

import { useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import Header from './Header';
import { UserRole } from '@/types';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (status === 'unauthenticated' || !session?.user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Redirecting...</div>
            </div>
        );
    }

    const user = {
        name: session.user.name || 'User',
        email: session.user.email || '',
        role: session.user.role as UserRole,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar
                role={user.role}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="lg:pl-64">
                <Header
                    user={user}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <DashboardContent>{children}</DashboardContent>
        </SessionProvider>
    );
}

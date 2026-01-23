import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/Sidebar';

export const metadata = {
    title: 'Admin - BY TRANG',
    description: 'Quản lý cửa hàng BY TRANG',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Check authentication
    if (!session?.user) {
        redirect('/login');
    }

    // Check admin role
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-neutral-950">
            <AdminSidebar />

            {/* Main content */}
            <main className="lg:ml-64 min-h-screen">
                {/* Header */}
                <header className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-medium text-white">
                            Admin Panel
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-400">
                            {session.user.name || session.user.email}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-sm font-medium">
                            {(session.user.name || session.user.email)?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

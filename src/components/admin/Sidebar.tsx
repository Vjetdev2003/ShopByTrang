'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    Users,
    Star,
    Ticket,
    RotateCcw,
    BarChart3,
    Settings,
    ChevronLeft,
    LogOut,
    Menu,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Danh mục', href: '/admin/categories', icon: FolderTree },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Khách hàng', href: '/admin/customers', icon: Users },
    { name: 'Đánh giá', href: '/admin/reviews', icon: Star },
    { name: 'Khuyến mãi', href: '/admin/coupons', icon: Ticket },
    { name: 'Đổi/Trả', href: '/admin/returns', icon: RotateCcw },
    { name: 'Báo cáo', href: '/admin/reports', icon: BarChart3 },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-neutral-800 rounded-lg text-white"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed left-0 top-0 h-screen bg-neutral-900 border-r border-neutral-800
                    transition-all duration-300 z-40
                    ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64'}
                `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
                    {!collapsed && (
                        <Link href="/admin" className="flex items-center gap-2">
                            <span className="text-xl font-light tracking-wider text-white">BY TRANG</span>
                            <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded">Admin</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:block p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                                    ${isActive
                                        ? 'bg-white text-neutral-900'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                                    }
                                `}
                                title={collapsed ? item.name : undefined}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="text-sm">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-neutral-800">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
                            text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-all
                        `}
                        title={collapsed ? 'Đăng xuất' : undefined}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {!collapsed && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setCollapsed(true)}
                />
            )}
        </>
    );
}

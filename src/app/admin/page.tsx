import { prisma } from '@/lib/db/prisma';
import { OrderStatus } from '@prisma/client';
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    AlertTriangle,
    TrendingUp,
} from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import Link from 'next/link';

// Format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format number with compact notation
function formatCompact(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenue stats
    const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
        prisma.order.aggregate({
            where: {
                createdAt: { gte: startOfToday },
                status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED] },
            },
            _sum: { total: true },
        }),
        prisma.order.aggregate({
            where: {
                createdAt: { gte: startOfWeek },
                status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED] },
            },
            _sum: { total: true },
        }),
        prisma.order.aggregate({
            where: {
                createdAt: { gte: startOfMonth },
                status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED] },
            },
            _sum: { total: true },
        }),
    ]);

    // Order counts by status
    const orderCounts = await prisma.order.groupBy({
        by: ['status'],
        _count: true,
    });

    const orderStats = {
        pending: orderCounts.find(o => o.status === OrderStatus.PENDING)?._count || 0,
        processing: orderCounts.find(o => o.status === OrderStatus.PROCESSING)?._count || 0,
        shipped: orderCounts.find(o => o.status === OrderStatus.SHIPPED)?._count || 0,
        delivered: orderCounts.find(o => o.status === OrderStatus.DELIVERED)?._count || 0,
        total: orderCounts.reduce((sum, o) => sum + o._count, 0),
    };

    // New customers this month
    const newCustomers = await prisma.user.count({
        where: {
            createdAt: { gte: startOfMonth },
            role: 'CUSTOMER',
        },
    });

    // Low stock products
    const lowStockProducts = await prisma.inventory.count({
        where: {
            AND: [
                { quantity: { lte: 5 } },
                { quantity: { gt: 0 } },
            ],
        },
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
            items: { include: { variant: { include: { product: true } } } },
        },
    });

    // Top selling products this month
    const topProducts = await prisma.orderItem.groupBy({
        by: ['variantId'],
        where: {
            order: {
                createdAt: { gte: startOfMonth },
                status: { not: OrderStatus.CANCELLED },
            },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
    });

    const topProductDetails = await Promise.all(
        topProducts.map(async (item) => {
            const variant = await prisma.variant.findUnique({
                where: { id: item.variantId },
                include: { product: true, pricing: true },
            });
            return {
                ...item,
                variant,
            };
        })
    );

    return {
        revenue: {
            today: todayRevenue._sum.total || 0,
            week: weekRevenue._sum.total || 0,
            month: monthRevenue._sum.total || 0,
        },
        orders: orderStats,
        newCustomers,
        lowStockProducts,
        recentOrders,
        topProducts: topProductDetails,
    };
}

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-6">
            {/* Page title */}
            <div>
                <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                <p className="text-neutral-400 text-sm mt-1">
                    Tổng quan hoạt động cửa hàng
                </p>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Doanh thu hôm nay"
                    value={formatCurrency(stats.revenue.today)}
                    icon={<DollarSign className="w-5 h-5" />}
                />
                <StatCard
                    title="Doanh thu tuần"
                    value={formatCurrency(stats.revenue.week)}
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                    title="Doanh thu tháng"
                    value={formatCurrency(stats.revenue.month)}
                    icon={<DollarSign className="w-5 h-5" />}
                />
                <StatCard
                    title="Khách hàng mới"
                    value={stats.newCustomers}
                    subtitle="Tháng này"
                    icon={<Users className="w-5 h-5" />}
                />
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Tổng đơn hàng"
                    value={stats.orders.total}
                    icon={<ShoppingCart className="w-5 h-5" />}
                />
                <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-6">
                    <p className="text-sm text-yellow-400 mb-1">Chờ xác nhận</p>
                    <p className="text-2xl font-semibold text-yellow-300">{stats.orders.pending}</p>
                </div>
                <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-6">
                    <p className="text-sm text-blue-400 mb-1">Đang xử lý</p>
                    <p className="text-2xl font-semibold text-blue-300">{stats.orders.processing}</p>
                </div>
                <div className="bg-purple-900/20 border border-purple-800/50 rounded-xl p-6">
                    <p className="text-sm text-purple-400 mb-1">Đang giao</p>
                    <p className="text-2xl font-semibold text-purple-300">{stats.orders.shipped}</p>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-6">
                    <p className="text-sm text-emerald-400 mb-1">Hoàn thành</p>
                    <p className="text-2xl font-semibold text-emerald-300">{stats.orders.delivered}</p>
                </div>
            </div>

            {/* Alerts */}
            {stats.lowStockProducts > 0 && (
                <div className="bg-orange-900/20 border border-orange-800/50 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-2 bg-orange-800/50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-orange-300 font-medium">Cảnh báo tồn kho</p>
                        <p className="text-orange-400/80 text-sm">
                            {stats.lowStockProducts} sản phẩm sắp hết hàng (tồn kho ≤ 5)
                        </p>
                    </div>
                    <Link
                        href="/admin/products?filter=low-stock"
                        className="ml-auto px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg transition-colors"
                    >
                        Xem chi tiết
                    </Link>
                </div>
            )}

            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                        <h2 className="text-lg font-medium text-white">Đơn hàng gần đây</h2>
                        <Link href="/admin/orders" className="text-sm text-neutral-400 hover:text-white">
                            Xem tất cả →
                        </Link>
                    </div>
                    <div className="divide-y divide-neutral-800">
                        {stats.recentOrders.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500">
                                Chưa có đơn hàng nào
                            </div>
                        ) : (
                            stats.recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
                                >
                                    <div>
                                        <p className="text-white font-medium">#{order.orderNumber}</p>
                                        <p className="text-sm text-neutral-400">{order.user.name || order.user.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white">{formatCurrency(order.total)}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400' :
                                            order.status === 'PROCESSING' ? 'bg-blue-900/50 text-blue-400' :
                                                order.status === 'SHIPPED' ? 'bg-purple-900/50 text-purple-400' :
                                                    order.status === 'DELIVERED' ? 'bg-emerald-900/50 text-emerald-400' :
                                                        'bg-neutral-800 text-neutral-400'
                                            }`}>
                                            {order.status === 'PENDING' ? 'Chờ xác nhận' :
                                                order.status === 'PROCESSING' ? 'Đang xử lý' :
                                                    order.status === 'SHIPPED' ? 'Đang giao' :
                                                        order.status === 'DELIVERED' ? 'Hoàn thành' :
                                                            order.status === 'CANCELLED' ? 'Đã hủy' : order.status}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                        <h2 className="text-lg font-medium text-white">Sản phẩm bán chạy</h2>
                        <span className="text-sm text-neutral-500">Tháng này</span>
                    </div>
                    <div className="divide-y divide-neutral-800">
                        {stats.topProducts.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500">
                                Chưa có dữ liệu
                            </div>
                        ) : (
                            stats.topProducts.map((item, index) => (
                                <div key={item.variantId} className="p-4 flex items-center gap-4">
                                    <span className="w-6 h-6 flex items-center justify-center bg-neutral-800 rounded-full text-sm text-neutral-400">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white truncate">
                                            {item.variant?.product.name || 'Unknown'}
                                        </p>
                                        <p className="text-sm text-neutral-400">
                                            {item.variant?.color} - {item.variant?.size}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-medium">{item._sum.quantity} đã bán</p>
                                        <p className="text-sm text-neutral-400">
                                            {item.variant?.pricing && formatCurrency(item.variant.pricing.salePrice || item.variant.pricing.basePrice)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

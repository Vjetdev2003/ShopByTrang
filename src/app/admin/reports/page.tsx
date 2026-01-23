import { prisma } from '@/lib/db/prisma';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Users,
    Package,
    Calendar
} from 'lucide-react';

// Format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

async function getReportData(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default: // today
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Previous period for comparison
    const periodLength = now.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodLength);
    const prevEndDate = startDate;

    // Current period stats
    const [
        currentRevenue,
        currentOrders,
        currentCustomers,
        prevRevenue,
        prevOrders,
        topProducts,
        ordersByStatus,
        lowStockProducts,
        recentOrders,
    ] = await Promise.all([
        prisma.order.aggregate({
            where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } },
            _sum: { total: true },
        }),
        prisma.order.count({
            where: { createdAt: { gte: startDate } },
        }),
        prisma.user.count({
            where: { createdAt: { gte: startDate }, role: 'CUSTOMER' },
        }),
        prisma.order.aggregate({
            where: {
                createdAt: { gte: prevStartDate, lt: prevEndDate },
                status: { not: 'CANCELLED' },
            },
            _sum: { total: true },
        }),
        prisma.order.count({
            where: { createdAt: { gte: prevStartDate, lt: prevEndDate } },
        }),
        prisma.orderItem.groupBy({
            by: ['variantId'],
            where: { order: { createdAt: { gte: startDate } } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 10,
        }),
        prisma.order.groupBy({
            by: ['status'],
            where: { createdAt: { gte: startDate } },
            _count: true,
        }),
        prisma.inventory.findMany({
            where: { quantity: { lte: 10, gt: 0 } },
            include: { variant: { include: { product: true } } },
            take: 10,
        }),
        prisma.order.findMany({
            where: { createdAt: { gte: startDate } },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { name: true, email: true } } },
        }),
    ]);

    // Get product info for top products
    const productDetails = await Promise.all(
        topProducts.map(async (item) => {
            const variant = await prisma.variant.findUnique({
                where: { id: item.variantId },
                include: { product: true },
            });
            return {
                ...item,
                variant,
            };
        })
    );

    // Calculate trends
    const currentRevenueValue = currentRevenue._sum.total || 0;
    const prevRevenueValue = prevRevenue._sum.total || 0;
    const revenueTrend = prevRevenueValue > 0
        ? ((currentRevenueValue - prevRevenueValue) / prevRevenueValue) * 100
        : 0;

    const ordersTrend = prevOrders > 0
        ? ((currentOrders - prevOrders) / prevOrders) * 100
        : 0;

    return {
        revenue: currentRevenueValue,
        orders: currentOrders,
        customers: currentCustomers,
        revenueTrend,
        ordersTrend,
        topProducts: productDetails,
        ordersByStatus: ordersByStatus.reduce((acc, s) => {
            acc[s.status] = s._count;
            return acc;
        }, {} as Record<string, number>),
        lowStockProducts,
        recentOrders,
    };
}

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const period = params.period || 'month';
    const data = await getReportData(period);

    const periods = [
        { key: 'today', label: 'Hôm nay' },
        { key: 'week', label: 'Tuần này' },
        { key: 'month', label: 'Tháng này' },
        { key: 'year', label: 'Năm nay' },
    ];

    const statusLabels: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-500' },
        CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-500' },
        PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-500' },
        SHIPPED: { label: 'Đang giao', color: 'bg-purple-500' },
        DELIVERED: { label: 'Hoàn thành', color: 'bg-emerald-500' },
        CANCELLED: { label: 'Đã hủy', color: 'bg-red-500' },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Báo cáo & Thống kê</h1>
                    <p className="text-neutral-400 text-sm mt-1">Phân tích hiệu suất kinh doanh</p>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg p-1">
                    {periods.map((p) => (
                        <a
                            key={p.key}
                            href={`/admin/reports?period=${p.key}`}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${period === p.key
                                    ? 'bg-neutral-700 text-white'
                                    : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            {p.label}
                        </a>
                    ))}
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Revenue */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-900/50 rounded-xl">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-neutral-400 text-sm">Doanh thu</p>
                            <p className="text-2xl font-bold text-white">
                                {formatCurrency(data.revenue)}
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${data.revenueTrend >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {data.revenueTrend >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        <span>
                            {data.revenueTrend >= 0 ? '+' : ''}{data.revenueTrend.toFixed(1)}% so với kỳ trước
                        </span>
                    </div>
                </div>

                {/* Orders */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-900/50 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-neutral-400 text-sm">Đơn hàng</p>
                            <p className="text-2xl font-bold text-white">{data.orders}</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${data.ordersTrend >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {data.ordersTrend >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        <span>
                            {data.ordersTrend >= 0 ? '+' : ''}{data.ordersTrend.toFixed(1)}% so với kỳ trước
                        </span>
                    </div>
                </div>

                {/* Customers */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-900/50 rounded-xl">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-neutral-400 text-sm">Khách hàng mới</p>
                            <p className="text-2xl font-bold text-white">{data.customers}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders by Status */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-lg font-medium text-white mb-4">Đơn hàng theo trạng thái</h2>
                    <div className="space-y-3">
                        {Object.entries(statusLabels).map(([status, config]) => {
                            const count = data.ordersByStatus[status] || 0;
                            const percentage = data.orders > 0 ? (count / data.orders) * 100 : 0;
                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-neutral-400">{config.label}</span>
                                        <span className="text-sm text-white">{count}</span>
                                    </div>
                                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${config.color} rounded-full transition-all`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-lg font-medium text-white mb-4">Sản phẩm bán chạy</h2>
                    <div className="space-y-3">
                        {data.topProducts.length === 0 ? (
                            <p className="text-neutral-500 text-sm">Chưa có dữ liệu</p>
                        ) : (
                            data.topProducts.map((item, index) => (
                                <div key={item.variantId} className="flex items-center gap-3">
                                    <span className="text-neutral-500 text-sm w-6">{index + 1}.</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">
                                            {item.variant?.product?.name || 'Sản phẩm'}
                                        </p>
                                        <p className="text-neutral-500 text-xs">
                                            {item.variant?.color} / {item.variant?.size}
                                        </p>
                                    </div>
                                    <span className="text-emerald-400 text-sm font-medium">
                                        {item._sum.quantity} đã bán
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-yellow-400" />
                        Sản phẩm sắp hết hàng
                    </h2>
                    <div className="space-y-3">
                        {data.lowStockProducts.length === 0 ? (
                            <p className="text-neutral-500 text-sm">Không có sản phẩm nào</p>
                        ) : (
                            data.lowStockProducts.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-white text-sm truncate">
                                            {item.variant.product.name}
                                        </p>
                                        <p className="text-neutral-500 text-xs">
                                            {item.variant.color} / {item.variant.size}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-medium ${item.quantity <= 5 ? 'text-red-400' : 'text-yellow-400'
                                        }`}>
                                        Còn {item.quantity}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        Đơn hàng gần đây
                    </h2>
                    <div className="space-y-3">
                        {data.recentOrders.length === 0 ? (
                            <p className="text-neutral-500 text-sm">Chưa có đơn hàng nào</p>
                        ) : (
                            data.recentOrders.map((order) => (
                                <a
                                    key={order.id}
                                    href={`/admin/orders/${order.id}`}
                                    className="flex items-center justify-between hover:bg-neutral-800 -mx-2 px-2 py-1 rounded transition-colors"
                                >
                                    <div>
                                        <span className="text-white text-sm">#{order.orderNumber}</span>
                                        <p className="text-neutral-500 text-xs">
                                            {order.user.name || order.user.email}
                                        </p>
                                    </div>
                                    <span className="text-emerald-400 text-sm">
                                        {formatCurrency(order.total)}
                                    </span>
                                </a>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

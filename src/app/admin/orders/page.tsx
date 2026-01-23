import { prisma } from '@/lib/db/prisma';
import { OrderStatus } from '@prisma/client';
import Link from 'next/link';
import { Eye, Truck, CheckCircle, XCircle, Clock, Package } from 'lucide-react';

// Format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Format date
function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-900/50 text-yellow-400 border-yellow-800', icon: <Clock className="w-4 h-4" /> },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-900/50 text-blue-400 border-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
    PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-900/50 text-indigo-400 border-indigo-800', icon: <Package className="w-4 h-4" /> },
    SHIPPED: { label: 'Đang giao', color: 'bg-purple-900/50 text-purple-400 border-purple-800', icon: <Truck className="w-4 h-4" /> },
    DELIVERED: { label: 'Hoàn thành', color: 'bg-emerald-900/50 text-emerald-400 border-emerald-800', icon: <CheckCircle className="w-4 h-4" /> },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-900/50 text-red-400 border-red-800', icon: <XCircle className="w-4 h-4" /> },
};

async function getOrders(searchParams: { [key: string]: string | undefined }) {
    const page = parseInt(searchParams.page || '1');
    const limit = 10;
    const status = searchParams.status as OrderStatus | undefined;
    const search = searchParams.search || '';

    const where = {
        ...(status && { status }),
        ...(search && {
            OR: [
                { orderNumber: { contains: search } },
                { user: { name: { contains: search } } },
                { user: { email: { contains: search } } },
            ],
        }),
    };

    const [orders, total, statusCounts] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                user: { select: { name: true, email: true, phone: true } },
                address: true,
                items: {
                    include: {
                        variant: {
                            include: { product: true },
                        },
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
        prisma.order.groupBy({
            by: ['status'],
            _count: true,
        }),
    ]);

    const counts: Record<string, number> = {
        all: await prisma.order.count(),
    };
    statusCounts.forEach((s) => {
        counts[s.status] = s._count;
    });

    return { orders, total, totalPages: Math.ceil(total / limit), page, counts };
}

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const { orders, total, totalPages, page, counts } = await getOrders(params);

    const tabs = [
        { key: '', label: 'Tất cả', count: counts.all || 0 },
        { key: 'PENDING', label: 'Chờ xác nhận', count: counts.PENDING || 0 },
        { key: 'CONFIRMED', label: 'Đã xác nhận', count: counts.CONFIRMED || 0 },
        { key: 'PROCESSING', label: 'Đang xử lý', count: counts.PROCESSING || 0 },
        { key: 'SHIPPED', label: 'Đang giao', count: counts.SHIPPED || 0 },
        { key: 'DELIVERED', label: 'Hoàn thành', count: counts.DELIVERED || 0 },
        { key: 'CANCELLED', label: 'Đã hủy', count: counts.CANCELLED || 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">Đơn hàng</h1>
                <p className="text-neutral-400 text-sm mt-1">{total} đơn hàng</p>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <Link
                        key={tab.key}
                        href={`/admin/orders${tab.key ? `?status=${tab.key}` : ''}`}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.status === tab.key || (!params.status && !tab.key)
                                ? 'bg-white text-neutral-900'
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-2 text-xs opacity-70">({tab.count})</span>
                    </Link>
                ))}
            </div>

            {/* Search */}
            <form className="max-w-md">
                <input
                    type="text"
                    name="search"
                    placeholder="Tìm theo mã đơn, tên khách hàng..."
                    defaultValue={params.search}
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                />
            </form>

            {/* Orders Table */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-800/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Mã đơn</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Khách hàng</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Sản phẩm</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Tổng tiền</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Ngày đặt</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                                    Không có đơn hàng nào
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => {
                                const config = statusConfig[order.status];
                                return (
                                    <tr key={order.id} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-4 py-4">
                                            <span className="text-white font-medium">#{order.orderNumber}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-white">{order.user.name || 'Khách hàng'}</p>
                                                <p className="text-sm text-neutral-500">{order.user.phone || order.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-300">
                                            {order.items.length} sản phẩm
                                        </td>
                                        <td className="px-4 py-4 text-white font-medium">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border ${config.color}`}>
                                                {config.icon}
                                                {config.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-400 text-sm">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors inline-flex"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-500">
                        Trang {page} / {totalPages}
                    </p>
                    <div className="flex gap-2">
                        {page > 1 && (
                            <Link
                                href={`/admin/orders?page=${page - 1}${params.status ? `&status=${params.status}` : ''}`}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                            >
                                ← Trước
                            </Link>
                        )}
                        {page < totalPages && (
                            <Link
                                href={`/admin/orders?page=${page + 1}${params.status ? `&status=${params.status}` : ''}`}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                            >
                                Sau →
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

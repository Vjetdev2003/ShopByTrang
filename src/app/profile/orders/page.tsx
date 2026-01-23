import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import Header from '@/components/Header';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import { OrderStatus } from '@prisma/client';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
    PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800' },
    SHIPPED: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
    DELIVERED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

async function getOrders(userId: string) {
    return prisma.order.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function OrderHistoryPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/login?callbackUrl=/profile/orders');
    }

    const orders = await getOrders(session.user.id as string);

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại giỏ hàng
                    </Link>
                </div>

                <h1 className="text-2xl font-light text-neutral-900 mb-6">Lịch sử đơn hàng</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-500 mb-6">Bạn chưa có đơn hàng nào</p>
                        <Link
                            href="/products"
                            className="inline-block px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                            Bắt đầu mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            // Get first product image for preview
                            let previewImage = null;
                            for (const item of order.items) {
                                try {
                                    const images = JSON.parse(item.variant.product.images);
                                    if (images.length > 0) {
                                        previewImage = images[0];
                                        break;
                                    }
                                } catch { /* ignore */ }
                            }

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-mono font-medium text-neutral-900">
                                                #{order.orderNumber}
                                            </p>
                                            <p className="text-sm text-neutral-500">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusConfig[order.status].color}`}>
                                            {statusConfig[order.status].label}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex gap-4">
                                            {/* Preview image */}
                                            <div className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {previewImage ? (
                                                    <img
                                                        src={previewImage}
                                                        alt="Order preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl">
                                                        👗
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-neutral-600 mb-1">
                                                    {order.items.length} sản phẩm
                                                </p>
                                                <p className="text-sm text-neutral-500 truncate">
                                                    {order.items.map(i => i.variant.product.name).join(', ')}
                                                </p>
                                            </div>

                                            {/* Total and action */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-medium text-neutral-900">
                                                    {formatCurrency(order.total)}
                                                </p>
                                                <Link
                                                    href={`/profile/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 mt-2"
                                                >
                                                    Chi tiết
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

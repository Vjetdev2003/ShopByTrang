import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import Header from '@/components/Header';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
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

async function getOrder(orderId: string, userId: string) {
    return prisma.order.findFirst({
        where: { id: orderId, userId },
        include: {
            address: true,
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                },
            },
            coupon: true,
            statusHistory: {
                orderBy: { createdAt: 'desc' },
            },
        },
    });
}

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/login?callbackUrl=/profile/orders');
    }

    const { id } = await params;
    const order = await getOrder(id, session.user.id as string);

    if (!order) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link
                        href="/profile/orders"
                        className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại lịch sử đơn hàng
                    </Link>
                </div>

                {/* Order Header */}
                <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-medium text-neutral-900">
                                Đơn hàng #{order.orderNumber}
                            </h1>
                            <p className="text-sm text-neutral-500 mt-1">
                                Đặt lúc {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <span className={`px-4 py-2 text-sm font-medium rounded-full ${statusConfig[order.status].color}`}>
                            {statusConfig[order.status].label}
                        </span>
                    </div>

                    {/* Status Timeline */}
                    {order.statusHistory.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-sm font-medium text-neutral-700 mb-3">Lịch sử trạng thái</h3>
                            <div className="space-y-2">
                                {order.statusHistory.map((history, index) => (
                                    <div key={history.id} className="flex items-center gap-3 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-neutral-300'}`} />
                                        <span className="text-neutral-600">{statusConfig[history.status].label}</span>
                                        <span className="text-neutral-400">{formatDate(history.createdAt)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                            <div className="p-4 border-b border-neutral-100 flex items-center gap-2">
                                <Package className="w-5 h-5 text-neutral-400" />
                                <h2 className="font-medium">Sản phẩm ({order.items.length})</h2>
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {order.items.map((item) => {
                                    let image = null;
                                    try {
                                        const images = JSON.parse(item.variant.product.images);
                                        if (images.length > 0) image = images[0];
                                    } catch { /* ignore */ }

                                    return (
                                        <div key={item.id} className="p-4 flex gap-4">
                                            <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={item.variant.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                                        👗
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-neutral-900 truncate">
                                                    {item.variant.product.name}
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    {item.variant.color} / {item.variant.size}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-neutral-900">
                                                    {formatCurrency(item.price)} × {item.quantity}
                                                </p>
                                                <p className="font-medium text-neutral-700">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-4 mt-6">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-neutral-600">
                                    <span>Tạm tính</span>
                                    <span>{formatCurrency(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-600">
                                    <span>Phí vận chuyển</span>
                                    <span>{order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá {order.coupon && `(${order.coupon.code})`}</span>
                                        <span>-{formatCurrency(order.discount)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2 mt-2 flex justify-between font-medium text-lg text-neutral-900">
                                    <span>Tổng cộng</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-neutral-400" />
                                <h3 className="font-medium text-neutral-700">Địa chỉ giao hàng</h3>
                            </div>
                            <div className="text-sm space-y-1">
                                <p className="font-medium text-neutral-900">{order.address.fullName}</p>
                                <p className="text-neutral-600">{order.address.phone}</p>
                                <p className="text-neutral-600">
                                    {order.address.street}, {order.address.ward}
                                </p>
                                <p className="text-neutral-600">
                                    {order.address.district}, {order.address.city}
                                </p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <CreditCard className="w-4 h-4 text-neutral-400" />
                                <h3 className="font-medium text-neutral-700">Thanh toán</h3>
                            </div>
                            <p className="text-sm text-neutral-600">
                                {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
                            </p>
                        </div>

                        {/* Customer Note */}
                        {order.note && (
                            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Truck className="w-4 h-4 text-neutral-400" />
                                    <h3 className="font-medium text-neutral-700">Ghi chú</h3>
                                </div>
                                <p className="text-sm text-neutral-600">{order.note}</p>
                            </div>
                        )}

                        {/* Contact */}
                        <div className="bg-neutral-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-neutral-600 mb-2">Cần hỗ trợ?</p>
                            <p className="font-medium text-neutral-900">0935 136 369</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

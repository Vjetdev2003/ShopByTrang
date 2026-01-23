import { prisma } from '@/lib/db/prisma';
import { OrderStatus } from '@prisma/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package, User, MapPin, CreditCard, MessageSquare, Printer } from 'lucide-react';
import OrderStatusUpdater from './OrderStatusUpdater';
import NoteEditor from '@/components/admin/NoteEditor';

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

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-900/50 text-yellow-400 border-yellow-800' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-900/50 text-blue-400 border-blue-800' },
    PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-900/50 text-indigo-400 border-indigo-800' },
    SHIPPED: { label: 'Đang giao', color: 'bg-purple-900/50 text-purple-400 border-purple-800' },
    DELIVERED: { label: 'Hoàn thành', color: 'bg-emerald-900/50 text-emerald-400 border-emerald-800' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-900/50 text-red-400 border-red-800' },
};

async function getOrder(id: string) {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true },
            },
            address: true,
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                            pricing: true,
                        },
                    },
                },
            },
            statusHistory: {
                orderBy: { createdAt: 'desc' },
            },
            coupon: true,
        },
    });

    return order;
}

export default async function OrderDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const order = await getOrder(id);

    if (!order) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/orders"
                        className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-white">
                            Đơn hàng #{order.orderNumber}
                        </h1>
                        <p className="text-neutral-400 text-sm mt-1">
                            Đặt lúc {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">
                        <Printer className="w-4 h-4" />
                        In hóa đơn
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
                        <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                            <Package className="w-5 h-5 text-neutral-400" />
                            <h2 className="text-lg font-medium text-white">
                                Sản phẩm ({order.items.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-neutral-800">
                            {order.items.map((item) => {
                                // Try variant images first, then fallback to product images
                                let firstImage = null;
                                try {
                                    const variantImages = item.variant.images ? JSON.parse(item.variant.images) : [];
                                    if (variantImages.length > 0) {
                                        firstImage = variantImages[0];
                                    }
                                } catch { /* ignore */ }

                                if (!firstImage) {
                                    try {
                                        const productImages = item.variant.product.images ? JSON.parse(item.variant.product.images) : [];
                                        if (productImages.length > 0) {
                                            firstImage = productImages[0];
                                        }
                                    } catch { /* ignore */ }
                                }

                                return (
                                    <div key={item.id} className="p-4 flex items-center gap-4">
                                        <div className="w-16 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                            {firstImage ? (
                                                <img
                                                    src={firstImage}
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
                                            <p className="text-white font-medium truncate">
                                                {item.variant.product.name}
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                                {item.variant.color} / {item.variant.size}
                                                {item.variant.material && ` / ${item.variant.material}`}
                                            </p>
                                            <p className="text-sm text-neutral-500">
                                                SKU: {item.variant.sku}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white">
                                                {formatCurrency(item.price)} × {item.quantity}
                                            </p>
                                            <p className="text-neutral-400 font-medium">
                                                {formatCurrency(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="space-y-3">
                            <div className="flex justify-between text-neutral-400">
                                <span>Tạm tính</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-neutral-400">
                                <span>Phí vận chuyển</span>
                                <span>{formatCurrency(order.shippingFee)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                    <span>Giảm giá {order.coupon && `(${order.coupon.code})`}</span>
                                    <span>-{formatCurrency(order.discount)}</span>
                                </div>
                            )}
                            <div className="border-t border-neutral-800 pt-3 flex justify-between text-white text-lg font-medium">
                                <span>Tổng cộng</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {order.note && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-neutral-400 mb-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-sm">Ghi chú từ khách hàng</span>
                            </div>
                            <p className="text-white">{order.note}</p>
                        </div>
                    )}

                    {/* Internal Note */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <NoteEditor
                            initialValue={order.internalNote || ''}
                            label="Ghi chú nội bộ"
                            placeholder="Thêm ghi chú nội bộ (chỉ admin thấy)..."
                            apiEndpoint={`/api/admin/orders/${order.id}`}
                            fieldKey="internalNote"
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <h3 className="text-white font-medium mb-4">Trạng thái đơn hàng</h3>
                        <div className="mb-4">
                            <span className={`inline-flex px-3 py-1.5 text-sm rounded-full border ${statusConfig[order.status].color}`}>
                                {statusConfig[order.status].label}
                            </span>
                        </div>
                        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                    </div>

                    {/* Customer Info */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-neutral-400" />
                            <h3 className="text-white font-medium">Khách hàng</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="text-white">{order.user.name || 'Không có tên'}</p>
                            <p className="text-neutral-400">{order.user.email}</p>
                            {order.user.phone && (
                                <p className="text-neutral-400">{order.user.phone}</p>
                            )}
                            <Link
                                href={`/admin/customers/${order.user.id}`}
                                className="text-blue-400 hover:text-blue-300 inline-block mt-2"
                            >
                                Xem hồ sơ khách hàng →
                            </Link>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-neutral-400" />
                            <h3 className="text-white font-medium">Địa chỉ giao hàng</h3>
                        </div>
                        <div className="space-y-1 text-sm">
                            <p className="text-white">{order.address.fullName}</p>
                            <p className="text-neutral-400">{order.address.phone}</p>
                            <p className="text-neutral-400">
                                {order.address.street}, {order.address.ward}
                            </p>
                            <p className="text-neutral-400">
                                {order.address.district}, {order.address.city}
                            </p>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-neutral-400" />
                            <h3 className="text-white font-medium">Thanh toán</h3>
                        </div>
                        <p className="text-neutral-300">
                            {order.paymentMethod || 'COD - Thanh toán khi nhận hàng'}
                        </p>
                    </div>

                    {/* Status History */}
                    {order.statusHistory.length > 0 && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                            <h3 className="text-white font-medium mb-4">Lịch sử trạng thái</h3>
                            <div className="space-y-3">
                                {order.statusHistory.map((history) => (
                                    <div key={history.id} className="text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className={`${statusConfig[history.status].color.split(' ')[1]}`}>
                                                {statusConfig[history.status].label}
                                            </span>
                                            <span className="text-neutral-500">
                                                {formatDate(history.createdAt)}
                                            </span>
                                        </div>
                                        {history.note && (
                                            <p className="text-neutral-400 mt-1">{history.note}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

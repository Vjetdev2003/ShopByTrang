import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react';

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(price);
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export default async function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
        redirect('/login');
    }

    const order = await prisma.order.findFirst({
        where: {
            id: id,
            userId: session.user.id
        },
        include: {
            address: true,
            items: {
                include: {
                    variant: {
                        include: {
                            product: true
                        }
                    }
                }
            },
            coupon: true
        }
    });

    if (!order) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href="/" className="text-2xl font-light tracking-wider text-neutral-900">
                        BY TRANG
                    </Link>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Success Message */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-light text-neutral-900 mb-2">
                        Đặt hàng thành công!
                    </h1>
                    <p className="text-neutral-600">
                        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.
                    </p>
                </div>

                {/* Order Info Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    {/* Order Header */}
                    <div className="bg-neutral-900 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-neutral-400 text-sm">Mã đơn hàng</p>
                                <p className="text-xl font-mono font-bold">{order.orderNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-neutral-400 text-sm">Ngày đặt</p>
                                <p>{formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-neutral-700" />
                            <h2 className="font-medium">Sản phẩm đã đặt</h2>
                        </div>
                        <div className="space-y-3">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{item.variant.product.name}</p>
                                        <p className="text-sm text-neutral-500">
                                            {item.variant.color} / {item.variant.size} × {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-neutral-700" />
                            <h2 className="font-medium">Địa chỉ giao hàng</h2>
                        </div>
                        <div className="text-neutral-600">
                            <p className="font-medium text-neutral-900">{order.address.fullName}</p>
                            <p>{order.address.phone}</p>
                            <p>{order.address.street}, {order.address.ward}, {order.address.district}, {order.address.city}</p>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="w-5 h-5 text-neutral-700" />
                            <h2 className="font-medium">Phương thức thanh toán</h2>
                        </div>
                        <p className="text-neutral-600">
                            {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}
                        </p>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6 bg-neutral-50">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-600">Tạm tính</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-600">Phí vận chuyển</span>
                                <span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá {order.coupon && `(${order.coupon.code})`}</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            <hr className="my-2" />
                            <div className="flex justify-between font-medium text-lg">
                                <span>Tổng cộng</span>
                                <span className="text-neutral-900">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Note */}
                {order.note && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="font-medium mb-2">Ghi chú đơn hàng</h2>
                        <p className="text-neutral-600">{order.note}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/profile"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        Theo dõi đơn hàng
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>

                {/* Contact Info */}
                <div className="text-center mt-12 text-sm text-neutral-500">
                    <p>Nếu có thắc mắc, vui lòng liên hệ:</p>
                    <p className="font-medium text-neutral-700 mt-1">0935 136 369 | 088 681 12 87</p>
                </div>
            </div>
        </div>
    );
}

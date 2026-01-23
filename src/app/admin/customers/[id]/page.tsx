import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, Ruler } from 'lucide-react';
import MeasurementForm from './MeasurementForm';
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
    }).format(new Date(date));
}

async function getCustomer(id: string) {
    const customer = await prisma.user.findUnique({
        where: { id },
        include: {
            addresses: true,
            measurement: true,
            orders: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    items: {
                        include: {
                            variant: { include: { product: true } },
                        },
                    },
                },
            },
            _count: { select: { orders: true, reviews: true } },
        },
    });

    if (!customer || customer.role !== 'CUSTOMER') {
        return null;
    }

    const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);

    return { ...customer, totalSpent };
}

export default async function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const customer = await getCustomer(id);

    if (!customer) {
        notFound();
    }

    const statusLabels: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'Chờ xác nhận', color: 'text-yellow-400' },
        CONFIRMED: { label: 'Đã xác nhận', color: 'text-blue-400' },
        PROCESSING: { label: 'Đang xử lý', color: 'text-indigo-400' },
        SHIPPED: { label: 'Đang giao', color: 'text-purple-400' },
        DELIVERED: { label: 'Hoàn thành', color: 'text-emerald-400' },
        CANCELLED: { label: 'Đã hủy', color: 'text-red-400' },
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/customers"
                    className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-neutral-800 rounded-full flex items-center justify-center">
                        {customer.avatar ? (
                            <img
                                src={customer.avatar}
                                alt={customer.name}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <User className="w-7 h-7 text-neutral-500" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-white">
                            {customer.name || 'Khách hàng'}
                        </h1>
                        <p className="text-neutral-400 text-sm mt-1">
                            Khách từ {formatDate(customer.createdAt)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                            <p className="text-sm text-neutral-400">Tổng đơn hàng</p>
                            <p className="text-2xl font-semibold text-white mt-1">
                                {customer._count.orders}
                            </p>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                            <p className="text-sm text-neutral-400">Tổng chi tiêu</p>
                            <p className="text-2xl font-semibold text-white mt-1">
                                {formatCurrency(customer.totalSpent)}
                            </p>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                            <p className="text-sm text-neutral-400">Đánh giá</p>
                            <p className="text-2xl font-semibold text-white mt-1">
                                {customer._count.reviews}
                            </p>
                        </div>
                    </div>

                    {/* Measurements - Đặc thù áo dài */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
                        <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                            <Ruler className="w-5 h-5 text-neutral-400" />
                            <h2 className="text-lg font-medium text-white">Số đo áo dài</h2>
                        </div>
                        <div className="p-4">
                            <MeasurementForm
                                userId={customer.id}
                                initialData={customer.measurement}
                            />
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
                        <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-neutral-400" />
                            <h2 className="text-lg font-medium text-white">Lịch sử mua hàng</h2>
                        </div>
                        <div className="divide-y divide-neutral-800">
                            {customer.orders.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500">
                                    Chưa có đơn hàng nào
                                </div>
                            ) : (
                                customer.orders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/admin/orders/${order.id}`}
                                        className="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
                                    >
                                        <div>
                                            <p className="text-white font-medium">
                                                #{order.orderNumber}
                                            </p>
                                            <p className="text-sm text-neutral-400">
                                                {order.items.length} sản phẩm • {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white">{formatCurrency(order.total)}</p>
                                            <span className={`text-sm ${statusLabels[order.status]?.color || 'text-neutral-400'}`}>
                                                {statusLabels[order.status]?.label || order.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
                        <h3 className="text-white font-medium">Thông tin liên hệ</h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-neutral-500" />
                                <span className="text-neutral-300">{customer.email}</span>
                            </div>
                            {customer.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-neutral-500" />
                                    <span className="text-neutral-300">{customer.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <h3 className="text-white font-medium mb-4">Địa chỉ</h3>

                        {customer.addresses.length === 0 ? (
                            <p className="text-neutral-500 text-sm">Chưa có địa chỉ</p>
                        ) : (
                            <div className="space-y-4">
                                {customer.addresses.map((address) => (
                                    <div key={address.id} className="text-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-4 h-4 text-neutral-500" />
                                            <span className="text-neutral-400">{address.label}</span>
                                            {address.isDefault && (
                                                <span className="px-1.5 py-0.5 bg-emerald-900/50 text-emerald-400 text-xs rounded">
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-neutral-300">{address.fullName}</p>
                                        <p className="text-neutral-400">{address.phone}</p>
                                        <p className="text-neutral-500">
                                            {address.street}, {address.ward}, {address.district}, {address.city}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <NoteEditor
                            initialValue={customer.note || ''}
                            label="Ghi chú"
                            placeholder="Thêm ghi chú về khách hàng..."
                            apiEndpoint={`/api/admin/customers/${customer.id}`}
                            fieldKey="note"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

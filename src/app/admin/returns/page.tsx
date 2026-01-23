import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Package, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import ReturnActions from './ReturnActions';
import { ReturnStatus } from '@prisma/client';

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

async function getReturns(searchParams: { [key: string]: string | undefined }) {
    const page = parseInt(searchParams.page || '1');
    const limit = 10;
    const status = searchParams.status as ReturnStatus | undefined;

    const where = status ? { status } : {};

    const [returns, total, counts] = await Promise.all([
        prisma.returnRequest.findMany({
            where,
            include: {
                order: {
                    select: { orderNumber: true, user: { select: { name: true, email: true, phone: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.returnRequest.count({ where }),
        prisma.returnRequest.groupBy({
            by: ['status'],
            _count: true,
        }),
    ]);

    const statusCounts = counts.reduce((acc, c) => {
        acc[c.status] = c._count;
        return acc;
    }, {} as Record<string, number>);

    return {
        returns,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        statusCounts,
    };
}

export default async function ReturnsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const { returns, total, totalPages, page, statusCounts } = await getReturns(params);
    const currentStatus = params.status || '';

    const statuses = [
        { key: '', label: 'Tất cả', icon: Package },
        { key: 'PENDING', label: 'Chờ xử lý', icon: Clock, count: statusCounts['PENDING'] || 0 },
        { key: 'APPROVED', label: 'Đã duyệt', icon: CheckCircle },
        { key: 'REJECTED', label: 'Từ chối', icon: XCircle },
        { key: 'COMPLETED', label: 'Hoàn thành', icon: RefreshCw },
    ];

    const statusConfig: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-900/50 text-yellow-400' },
        APPROVED: { label: 'Đã duyệt', color: 'bg-blue-900/50 text-blue-400' },
        REJECTED: { label: 'Từ chối', color: 'bg-red-900/50 text-red-400' },
        COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-900/50 text-emerald-400' },
    };

    const reasonLabels: Record<string, string> = {
        DEFECTIVE: 'Sản phẩm lỗi',
        WRONG_SIZE: 'Sai size',
        WRONG_COLOR: 'Sai màu',
        NOT_AS_DESCRIBED: 'Không đúng mô tả',
        CHANGED_MIND: 'Đổi ý',
        OTHER: 'Lý do khác',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">Yêu cầu đổi/trả</h1>
                <p className="text-neutral-400 text-sm mt-1">
                    {total} yêu cầu • {statusCounts['PENDING'] || 0} chờ xử lý
                </p>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 flex-wrap">
                {statuses.map((s) => (
                    <Link
                        key={s.key}
                        href={`/admin/returns${s.key === '' ? '' : `?status=${s.key}`}`}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${currentStatus === s.key
                            ? 'bg-neutral-700 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                    >
                        <s.icon className="w-4 h-4" />
                        {s.label}
                        {s.count !== undefined && s.count > 0 && (
                            <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-xs rounded-full">
                                {s.count}
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            {/* Returns List */}
            <div className="space-y-4">
                {returns.length === 0 ? (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
                        Không có yêu cầu nào
                    </div>
                ) : (
                    returns.map((returnReq) => (
                        <div
                            key={returnReq.id}
                            className={`bg-neutral-900 border rounded-xl p-4 ${returnReq.status === 'PENDING'
                                ? 'border-yellow-800/50'
                                : 'border-neutral-800'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <Link
                                            href={`/admin/orders/${returnReq.orderId}`}
                                            className="text-white font-medium hover:text-emerald-400 transition-colors"
                                        >
                                            #{returnReq.order.orderNumber}
                                        </Link>
                                        <span
                                            className={`px-2 py-0.5 text-xs rounded ${statusConfig[returnReq.status]?.color || 'bg-neutral-800 text-neutral-400'
                                                }`}
                                        >
                                            {statusConfig[returnReq.status]?.label || returnReq.status}
                                        </span>
                                        <span className="text-neutral-500 text-sm">
                                            {formatDate(returnReq.createdAt)}
                                        </span>
                                    </div>

                                    {/* Customer */}
                                    <p className="text-sm text-neutral-400 mb-2">
                                        {returnReq.order.user?.name || returnReq.order.user?.email || 'Khách hàng'}
                                        {returnReq.order.user?.phone && ` • ${returnReq.order.user.phone}`}
                                    </p>

                                    {/* Reason */}
                                    <div className="mb-2">
                                        <span className="text-xs text-neutral-500">Lý do: </span>
                                        <span className="text-sm text-neutral-300">
                                            {reasonLabels[returnReq.reason] || returnReq.reason}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    {returnReq.description && (
                                        <p className="text-sm text-neutral-400 mb-2">
                                            {returnReq.description}
                                        </p>
                                    )}

                                    {/* Images */}
                                    {returnReq.images && (
                                        <div className="flex gap-2 mt-3">
                                            {JSON.parse(returnReq.images).map((img: string, i: number) => (
                                                <img
                                                    key={i}
                                                    src={img}
                                                    alt={`Evidence ${i + 1}`}
                                                    className="w-16 h-16 object-cover rounded-lg border border-neutral-700"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Refund Amount */}
                                    {returnReq.refundAmount && (
                                        <div className="mt-3 text-emerald-400">
                                            Hoàn tiền: {formatCurrency(returnReq.refundAmount)}
                                        </div>
                                    )}

                                    {/* Resolution Note */}
                                    {returnReq.resolution && (
                                        <div className="mt-3 p-2 bg-neutral-800 rounded text-sm text-neutral-400">
                                            <span className="text-neutral-500">Ghi chú xử lý: </span>
                                            {returnReq.resolution}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {returnReq.status === 'PENDING' && (
                                    <ReturnActions returnId={returnReq.id} />
                                )}
                            </div>
                        </div>
                    ))
                )}
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
                                href={`/admin/returns?page=${page - 1}${currentStatus ? `&status=${currentStatus}` : ''}`}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                            >
                                ← Trước
                            </Link>
                        )}
                        {page < totalPages && (
                            <Link
                                href={`/admin/returns?page=${page + 1}${currentStatus ? `&status=${currentStatus}` : ''}`}
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

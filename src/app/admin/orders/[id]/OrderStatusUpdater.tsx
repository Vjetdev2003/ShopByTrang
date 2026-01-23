'use client';

import { useState } from 'react';
import { OrderStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

const statusOrder: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
];

const statusLabels: Record<OrderStatus, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Hoàn thành',
    CANCELLED: 'Hủy đơn',
};

interface Props {
    orderId: string;
    currentStatus: OrderStatus;
}

export default function OrderStatusUpdater({ orderId, currentStatus }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState('');
    const [showCancel, setShowCancel] = useState(false);

    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = currentIndex >= 0 && currentIndex < statusOrder.length - 1
        ? statusOrder[currentIndex + 1]
        : null;

    const updateStatus = async (newStatus: OrderStatus) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, note }),
            });

            if (response.ok) {
                setNote('');
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED') {
        return (
            <p className="text-neutral-500 text-sm">
                Đơn hàng đã {currentStatus === 'DELIVERED' ? 'hoàn thành' : 'bị hủy'}
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {/* Note input */}
            <div>
                <label className="block text-sm text-neutral-400 mb-2">Ghi chú (tùy chọn)</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Thêm ghi chú về thay đổi trạng thái..."
                    rows={2}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-neutral-500"
                />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
                {nextStatus && (
                    <button
                        onClick={() => updateStatus(nextStatus)}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Đang xử lý...' : `→ ${statusLabels[nextStatus]}`}
                    </button>
                )}

                {!showCancel ? (
                    <button
                        onClick={() => setShowCancel(true)}
                        className="w-full px-4 py-2 border border-neutral-700 text-neutral-400 hover:text-red-400 hover:border-red-800 rounded-lg transition-colors"
                    >
                        Hủy đơn hàng
                    </button>
                ) : (
                    <div className="space-y-2">
                        <p className="text-red-400 text-sm">Bạn có chắc muốn hủy đơn hàng này?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateStatus('CANCELLED')}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                Xác nhận hủy
                            </button>
                            <button
                                onClick={() => setShowCancel(false)}
                                className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                            >
                                Không
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

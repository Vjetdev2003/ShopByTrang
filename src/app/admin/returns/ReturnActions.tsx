'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';

interface Props {
    returnId: string;
}

export default function ReturnActions({ returnId }: Props) {
    const router = useRouter();
    const [showModal, setShowModal] = useState<'approve' | 'reject' | null>(null);
    const [note, setNote] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/returns/${returnId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: showModal === 'approve' ? 'APPROVED' : 'REJECTED',
                    adminNote: note,
                    refundAmount: refundAmount ? parseFloat(refundAmount) : null,
                }),
            });

            if (res.ok) {
                setShowModal(null);
                router.refresh();
            }
        } catch (error) {
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => setShowModal('approve')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"
                >
                    <Check className="w-4 h-4" />
                    Duyệt
                </button>
                <button
                    onClick={() => setShowModal('reject')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
                >
                    <X className="w-4 h-4" />
                    Từ chối
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md">
                        <div className="p-4 border-b border-neutral-800">
                            <h3 className="text-lg font-medium text-white">
                                {showModal === 'approve' ? 'Duyệt yêu cầu đổi/trả' : 'Từ chối yêu cầu'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {showModal === 'approve' && (
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Số tiền hoàn (VND)
                                    </label>
                                    <input
                                        type="number"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">
                                    Ghi chú xử lý
                                </label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder={
                                        showModal === 'approve'
                                            ? 'VD: Đã xác nhận sản phẩm lỗi, sẽ hoàn tiền trong 3-5 ngày'
                                            : 'VD: Sản phẩm đã qua sử dụng, không đủ điều kiện đổi trả'
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white resize-none focus:outline-none focus:border-neutral-500"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(null)}
                                    className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${showModal === 'approve'
                                            ? 'bg-emerald-600 hover:bg-emerald-500'
                                            : 'bg-red-600 hover:bg-red-500'
                                        }`}
                                >
                                    {loading ? 'Đang xử lý...' : showModal === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

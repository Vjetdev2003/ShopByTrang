'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, MessageSquare, Trash2 } from 'lucide-react';

interface Props {
    reviewId: string;
    isApproved: boolean;
    hasReply: boolean;
}

export default function ReviewActions({ reviewId, isApproved, hasReply }: Props) {
    const router = useRouter();
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: 'approve' | 'reject' | 'delete') => {
        if (action === 'delete' && !confirm('Xác nhận xóa đánh giá này?')) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: action === 'delete' ? 'DELETE' : 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            alert('Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reply', reply }),
            });

            if (res.ok) {
                setShowReplyModal(false);
                setReply('');
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
            <div className="flex items-center gap-1 flex-shrink-0">
                {!isApproved && (
                    <>
                        <button
                            onClick={() => handleAction('approve')}
                            disabled={loading}
                            title="Duyệt"
                            className="p-2 hover:bg-emerald-900/50 rounded text-emerald-400 transition-colors disabled:opacity-50"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleAction('reject')}
                            disabled={loading}
                            title="Từ chối"
                            className="p-2 hover:bg-red-900/50 rounded text-red-400 transition-colors disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                )}
                {!hasReply && (
                    <button
                        onClick={() => setShowReplyModal(true)}
                        title="Phản hồi"
                        className="p-2 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={() => handleAction('delete')}
                    disabled={loading}
                    title="Xóa"
                    className="p-2 hover:bg-neutral-800 rounded text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Reply Modal */}
            {showReplyModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-md">
                        <div className="p-4 border-b border-neutral-800">
                            <h3 className="text-lg font-medium text-white">Phản hồi đánh giá</h3>
                        </div>
                        <form onSubmit={handleReply} className="p-4 space-y-4">
                            <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Nhập phản hồi của bạn..."
                                rows={4}
                                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white resize-none focus:outline-none focus:border-neutral-500"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReplyModal(false)}
                                    className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !reply.trim()}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

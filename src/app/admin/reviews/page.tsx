import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Star, User, MessageSquare, Check, X, Eye } from 'lucide-react';
import ReviewActions from './ReviewActions';

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

async function getReviews(searchParams: { [key: string]: string | undefined }) {
    const page = parseInt(searchParams.page || '1');
    const limit = 10;
    const status = searchParams.status || 'all';

    const where = status === 'pending'
        ? { isApproved: false }
        : status === 'approved'
            ? { isApproved: true }
            : {};

    const [reviews, total, pendingCount] = await Promise.all([
        prisma.review.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, avatar: true } },
                product: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.review.count({ where }),
        prisma.review.count({ where: { isApproved: false } }),
    ]);

    return {
        reviews,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        pendingCount,
    };
}

export default async function ReviewsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const { reviews, total, totalPages, page, pendingCount } = await getReviews(params);
    const currentStatus = params.status || 'all';

    const statuses = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ duyệt', count: pendingCount },
        { key: 'approved', label: 'Đã duyệt' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">Đánh giá</h1>
                <p className="text-neutral-400 text-sm mt-1">
                    {total} đánh giá • {pendingCount} chờ duyệt
                </p>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2">
                {statuses.map((s) => (
                    <Link
                        key={s.key}
                        href={`/admin/reviews${s.key === 'all' ? '' : `?status=${s.key}`}`}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${currentStatus === s.key
                            ? 'bg-neutral-700 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                    >
                        {s.label}
                        {s.count !== undefined && s.count > 0 && (
                            <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-xs rounded-full">
                                {s.count}
                            </span>
                        )}
                    </Link>
                ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
                        Không có đánh giá nào
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className={`bg-neutral-900 border rounded-xl p-4 ${review.isApproved ? 'border-neutral-800' : 'border-yellow-800/50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* User Avatar */}
                                <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                                    {review.user.avatar ? (
                                        <img
                                            src={review.user.avatar}
                                            alt={review.user.name}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-neutral-500" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-white font-medium">
                                            {review.user.name || review.user.email}
                                        </span>
                                        <span className="text-neutral-500 text-sm">
                                            {formatDate(review.createdAt)}
                                        </span>
                                        {!review.isApproved && (
                                            <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-xs rounded">
                                                Chờ duyệt
                                            </span>
                                        )}
                                    </div>

                                    {/* Product Link */}
                                    <Link
                                        href={`/products/${review.product.slug}`}
                                        className="text-sm text-emerald-400 hover:underline mb-2 inline-block"
                                    >
                                        {review.product.name}
                                    </Link>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= review.rating
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-neutral-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <p className="text-neutral-300 text-sm">{review.comment}</p>
                                    )}

                                    {/* Admin Reply */}
                                    {review.adminResponse && (
                                        <div className="mt-3 pl-4 border-l-2 border-emerald-600">
                                            <p className="text-xs text-emerald-400 mb-1">Phản hồi từ shop:</p>
                                            <p className="text-sm text-neutral-400">{review.adminResponse}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <ReviewActions
                                    reviewId={review.id}
                                    isApproved={review.isApproved}
                                    hasReply={!!review.adminResponse}
                                />
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
                                href={`/admin/reviews?page=${page - 1}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}`}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                            >
                                ← Trước
                            </Link>
                        )}
                        {page < totalPages && (
                            <Link
                                href={`/admin/reviews?page=${page + 1}${currentStatus !== 'all' ? `&status=${currentStatus}` : ''}`}
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

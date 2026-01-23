'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { ProductStatus } from '@prisma/client';

interface ProductActionsProps {
    productId: string;
    initialStatus: ProductStatus;
}

export default function ProductActions({ productId, initialStatus }: ProductActionsProps) {
    const router = useRouter();
    const [status, setStatus] = useState<ProductStatus>(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) {
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Có lỗi xảy ra');
            }

            router.refresh();
            alert('Đã xóa sản phẩm thành công');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        setIsLoading(true);
        const newStatus = status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';

        try {
            // We need to fetch the full product data first to update it, 
            // or we need a PATCH endpoint. 
            // The current PUT endpoint expects a full body. 
            // For now, let's assume we can PATCH or update just status.
            // Wait, the API route provided earlier ONLY has PUT and DELETE.
            // PUT requires checking duplicate SKUs etc. and expects full variants content.
            // This is complex. 
            // Ideally we should add a PATCH endpoint for status only.
            // But to avoid huge refactor, let's just focus on DELETE first as requested.
            // For status toggle, I'll temporarily disable it or check if I can quickly add PATCH.
            // The user specifically asked for DELETE.

            // Actually, I should probably implement PATCH in the API route for status updates.
            // But let's stick to fixing DELETE first. 

            alert('Tính năng ẩn/hiện đang cập nhật');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/admin/products/${productId}`}
                className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                title="Chỉnh sửa"
            >
                <Edit className="w-4 h-4" />
            </Link>

            {/* Status toggle - temporarily disabled logic but kept UI */}
            <button
                onClick={handleToggleStatus}
                disabled={isLoading}
                className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
                title={status === 'ACTIVE' ? 'Ẩn' : 'Hiện'}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === 'ACTIVE' ? (
                    <EyeOff className="w-4 h-4" />
                ) : (
                    <Eye className="w-4 h-4" />
                )}
            </button>

            <button
                onClick={handleDelete}
                disabled={isLoading}
                className="p-2 hover:bg-red-900/50 rounded-lg text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                title="Xóa"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Eye, EyeOff, Loader2, Minus, CheckSquare, Square } from 'lucide-react';
import { ProductStatus } from '@prisma/client';
import ConfirmModal from './ConfirmModal';

interface Product {
    id: string;
    name: string;
    status: ProductStatus;
    category: { name: string };
    variants: any[];
    images: string;
    _count: { variants: number };
}

interface ProductTableProps {
    products: Product[];
    totalPages: number;
    currentPage: number;
}

// Helper to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper for status badge
const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
        case 'ACTIVE':
            return <span className="px-2 py-1 text-xs rounded-full bg-emerald-900/50 text-emerald-400">Hiển thị</span>;
        case 'DRAFT':
            return <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/50 text-yellow-400">Nháp</span>;
        case 'ARCHIVED':
            return <span className="px-2 py-1 text-xs rounded-full bg-neutral-800 text-neutral-400">Đã ẩn</span>;
    }
};

export default function ProductTable({ products, totalPages, currentPage }: ProductTableProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState<string[]>([]); // Can be one ID or multiple

    // --- Selection Logic ---

    const handleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    // --- Delete Logic ---

    // Triggered by "Delete Selected" button
    const openBulkDeleteModal = () => {
        if (selectedIds.length === 0) return;
        setItemsToDelete(selectedIds);
        setIsModalOpen(true);
    };

    // Triggered by single row trash icon
    const openSingleDeleteModal = (id: string) => {
        setItemsToDelete([id]);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsLoading(true);
        try {
            // Use the batch API for both single and bulk to keep logic consistent
            const res = await fetch('/api/admin/products/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: itemsToDelete }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Có lỗi xảy ra khi xóa');
            }

            // Success
            router.refresh();
            setSelectedIds([]); // Clear selection
            setItemsToDelete([]);
            setIsModalOpen(false);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Bulk Actions Toolbar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white text-neutral-900 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-300 border border-neutral-200">
                    <span className="font-medium">{selectedIds.length} sản phẩm đã chọn</span>
                    <div className="h-4 w-px bg-neutral-300" />
                    <button
                        onClick={openBulkDeleteModal}
                        className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa tất cả
                    </button>
                    <button
                        onClick={() => setSelectedIds([])}
                        className="text-neutral-500 hover:text-neutral-700 text-sm ml-2"
                    >
                        Hủy
                    </button>
                </div>
            )}

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden relative">
                <table className="w-full">
                    <thead className="bg-neutral-800/50">
                        <tr>
                            <th className="px-4 py-3 w-[50px]">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-neutral-400 hover:text-white transition-colors"
                                >
                                    {selectedIds.length === products.length && products.length > 0 ? (
                                        <CheckSquare className="w-5 h-5 text-emerald-500" />
                                    ) : selectedIds.length > 0 ? (
                                        <Minus className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Sản phẩm</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Danh mục</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Giá</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Tồn kho</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-neutral-500">
                                    Chưa có sản phẩm nào
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => {
                                // Image processing logic (same as before)
                                let images: string[] = [];
                                try { images = JSON.parse(product.images); } catch (e) { }
                                if (!Array.isArray(images)) images = [];
                                if (images.length === 0 && product.variants?.[0]?.images) {
                                    try {
                                        const vImages = JSON.parse(product.variants[0].images);
                                        if (Array.isArray(vImages)) images = vImages;
                                    } catch (e) { }
                                }
                                const firstImage = images[0] || '/placeholder.png';

                                // Helpers for stock/price
                                const stock = product.variants.reduce((sum, v) => sum + (v.inventory?.quantity || 0), 0);
                                const pricing = product.variants[0]?.pricing;
                                const price = pricing ? (pricing.salePrice || pricing.basePrice) : null;
                                const isSelected = selectedIds.includes(product.id);

                                return (
                                    <tr
                                        key={product.id}
                                        className={`hover:bg-neutral-800/30 transition-colors ${isSelected ? 'bg-neutral-800/50' : ''}`}
                                    >
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => handleSelectOne(product.id)}
                                                className="text-neutral-500 hover:text-white transition-colors"
                                            >
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                                                ) : (
                                                    <Square className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                                                    {firstImage !== '/placeholder.png' ? (
                                                        <img
                                                            src={firstImage}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                                            📦
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{product.name}</p>
                                                    <p className="text-sm text-neutral-500">
                                                        {product._count.variants} variants
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-neutral-300">
                                            {product.category.name}
                                        </td>
                                        <td className="px-4 py-4 text-white">
                                            {price ? formatCurrency(price) : '-'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`${stock <= 5 ? 'text-orange-400' : stock === 0 ? 'text-red-400' : 'text-neutral-300'}`}>
                                                {stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {getStatusBadge(product.status)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}`}
                                                    className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>

                                                {/* Single Delete Trigger */}
                                                <button
                                                    onClick={() => openSingleDeleteModal(product.id)}
                                                    className="p-2 hover:bg-red-900/50 rounded-lg text-neutral-400 hover:text-red-400 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-neutral-500">
                        Trang {currentPage} / {totalPages}
                    </p>
                    <div className="flex gap-2">
                        {currentPage > 1 && (
                            <Link
                                href={`/admin/products?page=${currentPage - 1}`}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                            >
                                ← Trước
                            </Link>
                        )}
                        {currentPage < totalPages && (
                            <Link
                                href={`/admin/products?page=${currentPage + 1}`}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                            >
                                Sau →
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title={itemsToDelete.length > 1 ? "Xóa nhiều sản phẩm" : "Xóa sản phẩm"}
                description={
                    itemsToDelete.length === 1
                        ? `Bạn có chắc chắn muốn xóa sản phẩm "${products.find(p => p.id === itemsToDelete[0])?.name}"? Hành động này không thể hoàn tác.`
                        : `Bạn có chắc chắn muốn xóa ${itemsToDelete.length} sản phẩm đã chọn? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan.`
                }
                confirmText={itemsToDelete.length > 1 ? `Xóa ${itemsToDelete.length} mục` : "Xóa"}
                isLoading={isLoading}
            />
        </>
    );
}

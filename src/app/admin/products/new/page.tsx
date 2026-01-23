'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

interface Variant {
    id: string;
    sku: string;
    color: string;
    colorHex: string;
    sizes: string[];
    material: string;
    basePrice: number;
    salePrice: number | null;
    quantity: number;
    images: string[];
}

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'CUSTOM'];

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Product info
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState<'DRAFT' | 'ACTIVE'>('DRAFT');
    const [images, setImages] = useState<string[]>([]);

    // Variants
    const [variants, setVariants] = useState<Variant[]>([
        {
            id: crypto.randomUUID(),
            sku: '',
            color: '',
            colorHex: '#000000',
            sizes: [],
            material: 'Lụa',
            basePrice: 0,
            salePrice: null,
            quantity: 0,
            images: [],
        },
    ]);

    // Categories (will be fetched)
    const [categories, setCategories] = useState<{ id: string; name: string; nameVi?: string }[]>([]);

    // Load categories on mount
    useState(() => {
        fetch('/api/admin/categories')
            .then((res) => res.json())
            .then((data) => setCategories(data.categories || []))
            .catch(() => { });
    });

    const addVariant = () => {
        setVariants([
            ...variants,
            {
                id: crypto.randomUUID(),
                sku: '',
                color: '',
                colorHex: '#000000',
                sizes: [],
                material: 'Lụa',
                basePrice: 0,
                salePrice: null,
                quantity: 0,
                images: [],
            },
        ]);
    };

    const toggleSize = (variantId: string, size: string) => {
        setVariants(
            variants.map((v) => {
                if (v.id !== variantId) return v;
                const newSizes = v.sizes.includes(size)
                    ? v.sizes.filter((s) => s !== size)
                    : [...v.sizes, size];
                return { ...v, sizes: newSizes };
            })
        );
    };

    const removeVariant = (id: string) => {
        if (variants.length > 1) {
            setVariants(variants.filter((v) => v.id !== id));
        }
    };

    const updateVariant = (id: string, field: keyof Variant, value: unknown) => {
        setVariants(
            variants.map((v) => (v.id === id ? { ...v, [field]: value } : v))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    categoryId,
                    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
                    status,
                    images,
                    variants: variants.map((v) => ({
                        sku: v.sku,
                        color: v.color,
                        colorHex: v.colorHex,
                        sizes: v.sizes,
                        material: v.material,
                        basePrice: v.basePrice,
                        salePrice: v.salePrice,
                        quantity: v.quantity,
                        images: v.images,
                    })),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Có lỗi xảy ra');
            }

            router.push('/admin/products');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/products"
                    className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-semibold text-white">Thêm sản phẩm mới</h1>
                    <p className="text-neutral-400 text-sm mt-1">Điền thông tin sản phẩm bên dưới</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-medium text-white">Thông tin cơ bản</h2>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">Tên sản phẩm *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                            placeholder="VD: Áo dài cưới trắng thêu hoa sen"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">Mô tả</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500 resize-none"
                            placeholder="Mô tả chi tiết về sản phẩm..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Danh mục *</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                required
                                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nameVi || cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-neutral-400 mb-2">Trạng thái</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'ACTIVE')}
                                className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                            >
                                <option value="DRAFT">Nháp</option>
                                <option value="ACTIVE">Hiển thị</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-2">Tags (phân cách bằng dấu phẩy)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                            placeholder="VD: áo dài cưới, thêu tay, cao cấp"
                        />
                    </div>
                </div>

                {/* Product Images */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <h2 className="text-lg font-medium text-white">Hình ảnh sản phẩm</h2>
                    <ImageUpload
                        value={images}
                        onChange={(urls) => setImages(urls)}
                        maxFiles={10}
                    />
                </div>

                {/* Variants */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-white">Biến thể sản phẩm</h2>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm biến thể
                        </button>
                    </div>

                    {variants.map((variant, index) => (
                        <div
                            key={variant.id}
                            className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-white font-medium">Biến thể #{index + 1}</span>
                                {variants.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(variant.id)}
                                        className="p-1 hover:bg-red-900/50 rounded text-neutral-400 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">SKU *</label>
                                    <input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                        required
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                        placeholder="BT-ADC-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Màu sắc *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={variant.color}
                                            onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                                            required
                                            className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                            placeholder="Trắng"
                                        />
                                        <input
                                            type="color"
                                            value={variant.colorHex}
                                            onChange={(e) => updateVariant(variant.id, 'colorHex', e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Chất liệu</label>
                                    <select
                                        value={variant.material}
                                        onChange={(e) => updateVariant(variant.id, 'material', e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                    >
                                        <option value="Lụa">Lụa</option>
                                        <option value="Gấm">Gấm</option>
                                        <option value="Nhung">Nhung</option>
                                        <option value="Đũi">Đũi</option>
                                        <option value="Tơ tằm">Tơ tằm</option>
                                        <option value="Voan">Voan</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-neutral-500 mb-2">Size * (chọn nhiều)</label>
                                <div className="flex flex-wrap gap-2">
                                    {SIZE_OPTIONS.map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => toggleSize(variant.id, size)}
                                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                                variant.sizes.includes(size)
                                                    ? 'bg-white text-neutral-900 border-white'
                                                    : 'bg-neutral-800 text-neutral-300 border-neutral-600 hover:border-neutral-500'
                                            }`}
                                        >
                                            {size === 'CUSTOM' ? 'Đo theo yêu cầu' : size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Giá gốc (VNĐ) *</label>
                                    <input
                                        type="number"
                                        value={variant.basePrice || ''}
                                        onChange={(e) => updateVariant(variant.id, 'basePrice', parseInt(e.target.value) || 0)}
                                        required
                                        min={0}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                        placeholder="5000000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Giá khuyến mãi (VNĐ)</label>
                                    <input
                                        type="number"
                                        value={variant.salePrice || ''}
                                        onChange={(e) => updateVariant(variant.id, 'salePrice', parseInt(e.target.value) || null)}
                                        min={0}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                        placeholder="4500000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">Tồn kho *</label>
                                    <input
                                        type="number"
                                        value={variant.quantity}
                                        onChange={(e) => updateVariant(variant.id, 'quantity', parseInt(e.target.value) || 0)}
                                        required
                                        min={0}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-500"
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            {/* Image upload placeholder */}
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">Hình ảnh</label>
                                <ImageUpload
                                    value={variant.images}
                                    onChange={(urls) => updateVariant(variant.id, 'images', urls)}
                                    maxFiles={5}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-4">
                    <Link
                        href="/admin/products"
                        className="px-6 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        Hủy
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
}

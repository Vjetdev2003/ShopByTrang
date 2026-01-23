'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface Category {
    id: string;
    name: string;
    nameVi?: string;
}

interface Variant {
    id?: string;
    sku: string;
    color: string;
    size: string;
    material: string;
    basePrice: number;
    salePrice: number;
    promoPrice: number | null;
    quantity: number;
    images: string[];
}

interface Product {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    tags: string;
    status: string;
    images: string;
    variants: {
        id: string;
        sku: string;
        color: string;
        size: string;
        material: string;
        pricing: { basePrice: number; salePrice: number; promoPrice: number | null } | null;
        inventory: { quantity: number } | null;
        images: string;
    }[];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [productId, setProductId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [images, setImages] = useState<string[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);

    useEffect(() => {
        async function init() {
            const { id } = await params;
            setProductId(id);
            fetchProduct(id);
            fetchCategories();
        }
        init();
    }, [params]);

    const fetchProduct = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                const product: Product = data.product;

                setName(product.name);
                setDescription(product.description || '');
                setCategoryId(product.categoryId);
                setTags(product.tags ? JSON.parse(product.tags).join(', ') : '');
                setStatus(product.status);
                setImages(product.images ? JSON.parse(product.images) : []);
                setVariants(
                    product.variants.map((v) => ({
                        id: v.id,
                        sku: v.sku,
                        color: v.color || '',
                        size: v.size || '',
                        material: v.material || '',
                        basePrice: v.pricing?.basePrice || 0,
                        salePrice: v.pricing?.salePrice || 0,
                        promoPrice: v.pricing?.promoPrice || null,
                        quantity: v.inventory?.quantity || 0,
                        images: v.images ? JSON.parse(v.images) : [],
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    categoryId,
                    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
                    status,
                    images,
                    variants,
                }),
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                const error = await res.json();
                alert(error.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            alert('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const addVariant = () => {
        setVariants([
            ...variants,
            {
                sku: '',
                color: '',
                size: '',
                material: '',
                basePrice: 0,
                salePrice: 0,
                promoPrice: null,
                quantity: 0,
                images: [],
            },
        ]);
    };

    const updateVariant = (index: number, field: keyof Variant, value: string | number | null | string[]) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-neutral-500">Đang tải...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/products"
                    className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold text-white">Chỉnh sửa sản phẩm</h1>
                    <p className="text-neutral-400 text-sm mt-1">{name}</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                        <h2 className="text-lg font-medium text-white mb-4">Thông tin cơ bản</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">
                                    Tên sản phẩm *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">
                                    Mô tả
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white resize-none focus:outline-none focus:border-neutral-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Danh mục *
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                        required
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
                                    <label className="block text-sm text-neutral-400 mb-1">
                                        Trạng thái
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                    >
                                        <option value="ACTIVE">Đang bán</option>
                                        <option value="DRAFT">Bản nháp</option>
                                        <option value="ARCHIVED">Ẩn</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">
                                    Tags (phân cách bằng dấu phẩy)
                                </label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="áo dài, cưới, truyền thống"
                                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
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

                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-neutral-800 border border-neutral-700 rounded-xl"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-white font-medium">
                                            Biến thể #{index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3 mb-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">SKU</label>
                                            <input
                                                type="text"
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">Màu</label>
                                            <input
                                                type="text"
                                                value={variant.color}
                                                onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">Size</label>
                                            <input
                                                type="text"
                                                value={variant.size}
                                                onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">Chất liệu</label>
                                            <input
                                                type="text"
                                                value={variant.material}
                                                onChange={(e) => updateVariant(index, 'material', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">Giá gốc</label>
                                            <input
                                                type="number"
                                                value={variant.basePrice}
                                                onChange={(e) => updateVariant(index, 'basePrice', parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">Giá bán</label>
                                            <input
                                                type="number"
                                                value={variant.salePrice}
                                                onChange={(e) => updateVariant(index, 'salePrice', parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">Giá KM</label>
                                            <input
                                                type="number"
                                                value={variant.promoPrice || ''}
                                                onChange={(e) => updateVariant(index, 'promoPrice', e.target.value ? parseInt(e.target.value) : null)}
                                                className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1">Tồn kho</label>
                                            <input
                                                type="number"
                                                value={variant.quantity}
                                                onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1.5 bg-neutral-900 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Variant Images */}
                                    <div className="mt-4">
                                        <label className="block text-xs text-neutral-500 mb-1">Hình ảnh biến thể</label>
                                        <ImageUpload
                                            value={variant.images}
                                            onChange={(urls) => updateVariant(index, 'images', urls)}
                                            maxFiles={5}
                                        />
                                    </div>
                                </div>
                            ))}

                            {variants.length === 0 && (
                                <div className="p-8 text-center text-neutral-500 border border-dashed border-neutral-700 rounded-xl">
                                    Chưa có biến thể nào
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Images */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                        <h2 className="text-lg font-medium text-white mb-4">Hình ảnh</h2>

                        <ImageUpload
                            value={images}
                            onChange={(urls) => setImages(urls)}
                            maxFiles={10}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Check, Minus, Plus } from 'lucide-react';

interface Variant {
    id: string;
    sku: string;
    color: string;
    colorHex: string;
    size: string;
    material: string | null;
    images: string;
    pricing: {
        basePrice: number;
        salePrice: number | null;
    } | null;
    inventory: {
        quantity: number;
    } | null;
}

interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    images: string;
    category: {
        name: string;
        slug: string;
    };
    variants: Variant[];
}

interface ProductDetailClientProps {
    product: Product;
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(price);
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(product.variants[0] || null);
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    // Get all images
    let allImages: string[] = [];

    // Try variant images first
    if (selectedVariant) {
        try {
            const variantImages = JSON.parse(selectedVariant.images) as string[];
            allImages = variantImages;
        } catch {
            allImages = [];
        }
    }

    // Fallback to product images
    if (allImages.length === 0) {
        try {
            allImages = JSON.parse(product.images) as string[];
        } catch {
            allImages = [];
        }
    }

    // Get unique colors and sizes
    const colors = [...new Map(product.variants.map(v => [v.color, { color: v.color, colorHex: v.colorHex }])).values()];
    const sizes = [...new Set(product.variants.map(v => v.size))];

    const handleColorChange = (color: string) => {
        const variant = product.variants.find(v => v.color === color && v.size === selectedVariant?.size)
            || product.variants.find(v => v.color === color);
        if (variant) {
            setSelectedVariant(variant);
            setCurrentImageIndex(0);
        }
    };

    const handleSizeChange = (size: string) => {
        const variant = product.variants.find(v => v.size === size && v.color === selectedVariant?.color)
            || product.variants.find(v => v.size === size);
        if (variant) {
            setSelectedVariant(variant);
        }
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) return;

        setIsAdding(true);
        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variantId: selectedVariant.id,
                    quantity,
                }),
            });

            if (response.ok) {
                setAddedToCart(true);
                window.dispatchEvent(new Event('cart-updated'));
                setTimeout(() => setAddedToCart(false), 3000);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const price = selectedVariant?.pricing?.salePrice || selectedVariant?.pricing?.basePrice || 0;
    const originalPrice = selectedVariant?.pricing?.basePrice || 0;
    const hasDiscount = selectedVariant?.pricing?.salePrice && selectedVariant.pricing.salePrice < originalPrice;
    const inStock = (selectedVariant?.inventory?.quantity || 0) > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <nav className="text-sm text-neutral-500 mb-8">
                <Link href="/" className="hover:text-neutral-800">Trang chủ</Link>
                <span className="mx-2">/</span>
                <Link href={`/${product.category.slug}`} className="hover:text-neutral-800">{product.category.name}</Link>
                <span className="mx-2">/</span>
                <span className="text-neutral-800">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-[3/4] relative bg-neutral-100 overflow-hidden">
                        {allImages.length > 0 ? (
                            <Image
                                src={allImages[currentImageIndex]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`flex-shrink-0 w-20 h-24 relative border-2 transition-colors ${idx === currentImageIndex
                                        ? 'border-neutral-800'
                                        : 'border-transparent hover:border-neutral-300'
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} - ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="80px"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">
                            {product.category.name}
                        </p>
                        <h1 className="text-3xl font-light text-neutral-900 mb-4">
                            {product.name}
                        </h1>

                        {/* Price */}
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-medium text-neutral-900">
                                {formatPrice(price)}
                            </span>
                            {hasDiscount && (
                                <span className="text-lg text-neutral-400 line-through">
                                    {formatPrice(originalPrice)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-neutral-600 leading-relaxed">
                        {product.description}
                    </p>

                    {/* Color Selector */}
                    {colors.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-3">
                                Màu sắc: <span className="font-normal">{selectedVariant?.color}</span>
                            </label>
                            <div className="flex gap-2">
                                {colors.map(({ color, colorHex }) => (
                                    <button
                                        key={color}
                                        onClick={() => handleColorChange(color)}
                                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedVariant?.color === color
                                            ? 'border-neutral-800 ring-2 ring-offset-2 ring-neutral-800'
                                            : 'border-neutral-300 hover:border-neutral-500'
                                            }`}
                                        style={{ backgroundColor: colorHex }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selector */}
                    {sizes.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-3">
                                Kích cỡ: <span className="font-normal">{selectedVariant?.size}</span>
                            </label>
                            <div className="flex gap-2">
                                {sizes.map((size) => {
                                    const variant = product.variants.find(v => v.size === size && v.color === selectedVariant?.color);
                                    const available = variant && (variant.inventory?.quantity || 0) > 0;

                                    return (
                                        <button
                                            key={size}
                                            onClick={() => handleSizeChange(size)}
                                            disabled={!available}
                                            className={`min-w-[48px] px-4 py-2 border-2 text-sm font-medium transition-all ${selectedVariant?.size === size
                                                ? 'border-neutral-800 bg-neutral-800 text-white'
                                                : available
                                                    ? 'border-neutral-300 hover:border-neutral-500 text-neutral-700'
                                                    : 'border-neutral-200 text-neutral-300 cursor-not-allowed line-through'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Material */}
                    {selectedVariant?.material && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Chất liệu
                            </label>
                            <p className="text-neutral-600">{selectedVariant.material}</p>
                        </div>
                    )}

                    {/* Quantity & Add to Cart */}
                    <div className="flex items-center gap-4 pt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-neutral-300">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-3 hover:bg-neutral-100 transition-colors"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-3 hover:bg-neutral-100 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || !inStock || isAdding}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 px-8 text-white font-medium transition-all ${addedToCart
                                ? 'bg-green-600'
                                : inStock
                                    ? 'bg-neutral-900 hover:bg-neutral-800'
                                    : 'bg-neutral-400 cursor-not-allowed'
                                }`}
                        >
                            {addedToCart ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Đã thêm vào giỏ
                                </>
                            ) : isAdding ? (
                                'Đang thêm...'
                            ) : inStock ? (
                                <>
                                    <ShoppingBag className="w-5 h-5" />
                                    Thêm vào giỏ hàng
                                </>
                            ) : (
                                'Hết hàng'
                            )}
                        </button>
                    </div>

                    {/* Stock Info */}
                    {selectedVariant && (
                        <p className="text-sm text-neutral-500">
                            {inStock
                                ? `Còn ${selectedVariant.inventory?.quantity} sản phẩm`
                                : 'Sản phẩm tạm hết hàng'}
                        </p>
                    )}

                    {/* SKU */}
                    {selectedVariant && (
                        <p className="text-xs text-neutral-400">
                            SKU: {selectedVariant.sku}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

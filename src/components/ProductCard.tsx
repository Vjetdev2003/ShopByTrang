'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
    product: {
        id: string;
        name: string;
        slug: string;
        images: string; // Product level images (JSON)
        variants: {
            id: string;
            pricing: {
                basePrice: number;
                salePrice?: number | null;
            } | null;
            images: string; // JSON string
        }[];
    };
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(price);
}

export default function ProductCard({ product }: ProductCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    // Get images from all variants
    let allImages = product.variants.flatMap(v => {
        try {
            return JSON.parse(v.images) as string[];
        } catch {
            return [];
        }
    });

    // If no variant images, try product images
    if (allImages.length === 0) {
        try {
            allImages = JSON.parse(product.images) as string[];
        } catch {
            allImages = [];
        }
    }

    // If still no images, show placeholder
    const displayImages = allImages.length > 0 ? allImages : ['/placeholder.jpg'];
    const currentImage = displayImages[currentIndex] || displayImages[0];

    // Get price range or first pricing
    const firstVariant = product.variants[0];
    const price = firstVariant?.pricing?.salePrice || firstVariant?.pricing?.basePrice || 0;

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === displayImages.length - 1;

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!isFirst) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!isLast) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const openZoom = () => setIsZoomed(true);
    const closeZoom = () => setIsZoomed(false);

    // Helper to get image URL (handle external vs local)
    const getImageUrl = (url: string) => {
        if (!url) return '/placeholder.jpg';
        return url.startsWith('http') ? url : url;
    };

    return (
        <>
            <div className="group">
                {/* Main Image with Navigation */}
                <Link href={`/product/${product.slug}`} className="aspect-[3/4] w-full bg-neutral-100 mb-4 overflow-hidden relative block">
                    <Image
                        src={getImageUrl(currentImage)}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Hover overlay with button */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end justify-center pb-6">
                        <span className="bg-white text-neutral-900 px-6 py-2.5 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-neutral-100">
                            Mua ngay
                        </span>
                    </div>

                    {/* Navigation Buttons */}
                    {!isFirst && displayImages.length > 1 && (
                        <button
                            onClick={(e) => { e.preventDefault(); handlePrev(e); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Ảnh trước"
                        >
                            <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {!isLast && displayImages.length > 1 && (
                        <button
                            onClick={(e) => { e.preventDefault(); handleNext(e); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Ảnh tiếp"
                        >
                            <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {/* Image Counter */}
                    {displayImages.length > 1 && (
                        <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full z-10">
                            {currentIndex + 1} / {displayImages.length}
                        </div>
                    )}
                </Link>

                {/* Product Info */}
                <Link href={`/product/${product.slug}`}>
                    <h3 className="text-lg font-medium text-neutral-800 mb-1 hover:text-neutral-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-sm text-neutral-500 mb-3">
                    {formatPrice(price)}
                </p>

                {/* Variations Thumbnails */}
                {displayImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {displayImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`flex-shrink-0 w-12 h-16 relative overflow-hidden border-2 transition-colors cursor-pointer ${idx === currentIndex
                                    ? 'border-neutral-800'
                                    : 'border-neutral-200 hover:border-neutral-400'
                                    }`}
                            >
                                <Image
                                    src={getImageUrl(img)}
                                    alt={`${product.name} - ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            </button>
                        ))}
                    </div>
                )}
                {displayImages.length > 1 && (
                    <p className="text-xs text-neutral-400 mt-1">{displayImages.length} màu sắc</p>
                )}
            </div>

            {/* Lightbox/Zoom Modal */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeZoom}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeZoom}
                        className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Đóng"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Image Container */}
                    <div
                        className="relative w-full h-full max-w-4xl max-h-[90vh] m-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={getImageUrl(currentImage)}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            priority
                        />
                    </div>

                    {/* Navigation in Lightbox */}
                    {!isFirst && (
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Ảnh trước"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {!isLast && (
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Ảnh tiếp"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {/* Counter in Lightbox */}
                    {displayImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-4 py-2 rounded-full">
                            {currentIndex + 1} / {displayImages.length}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        price: number;
        mainImage: string;
        variations: string[];
    };
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
}

export default function ProductCard({ product }: ProductCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const currentImage = product.variations[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === product.variations.length - 1;

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

    return (
        <>
            <div className="group">
                {/* Main Image with Navigation */}
                <div className="aspect-[3/4] w-full bg-neutral-100 mb-4 overflow-hidden relative">
                    <div className="cursor-zoom-in w-full h-full" onClick={openZoom}>
                        <Image
                            src={currentImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>

                    {/* Navigation Buttons */}
                    {!isFirst && (
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Ảnh trước"
                        >
                            <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}

                    {!isLast && (
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Ảnh tiếp"
                        >
                            <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                        {currentIndex + 1} / {product.variations.length}
                    </div>
                </div>

                {/* Product Info */}
                <Link href={`/product/${product.id}`}>
                    <h3 className="text-lg font-medium text-neutral-800 mb-1 hover:text-neutral-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-sm text-neutral-500 mb-3">
                    {formatPrice(product.price)}
                </p>

                {/* Variations Thumbnails */}
                <div className="flex gap-2">
                    {product.variations.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-16 h-20 relative overflow-hidden border-2 transition-colors cursor-pointer ${idx === currentIndex
                                    ? 'border-neutral-800'
                                    : 'border-neutral-200 hover:border-neutral-400'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${product.name} - Màu ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        </button>
                    ))}
                </div>
                <p className="text-xs text-neutral-400 mt-2">{product.variations.length} màu sắc</p>
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
                            src={currentImage}
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
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm px-4 py-2 rounded-full">
                        {currentIndex + 1} / {product.variations.length}
                    </div>
                </div>
            )}
        </>
    );
}

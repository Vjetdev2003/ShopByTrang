'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    slug: string;
    name: string;
    category: {
        name: string;
        slug: string;
    };
    variant: {
        pricing: {
            basePrice: number;
            salePrice?: number;
        } | null;
        images: string[];
    } | null;
}

export default function NewArrivals() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const demoProducts: Product[] = [
        {
            id: "1",
            slug: "ao-dai-hoa-sen",
            name: "Áo Dài Hoa Sen",
            category: { name: "Truyền Thống", slug: "ao-dai" },
            variant: {
                pricing: { basePrice: 1890000, salePrice: undefined },
                images: ["613682871_728387587012405_854151880740947198_n.jpg"]
            }
        },
        {
            id: "2",
            slug: "ao-dai-gam-theu",
            name: "Áo Dài Gấm Thêu",
            category: { name: "Cách Tân", slug: "du-xuan" },
            variant: {
                pricing: { basePrice: 2690000, salePrice: undefined },
                images: ["616815351_732105949973902_2490500710436884280_n.jpg"]
            }
        },
        {
            id: "3",
            slug: "ao-dai-lua-to-tam",
            name: " Áo Dài Lụa Tơ Tằm",
            category: { name: "Nàng Thơ", slug: "nang-tho" },
            variant: {
                pricing: { basePrice: 3200000, salePrice: 2890000 },
                images: ["616818219_732105936640570_8032280431854964645_n.jpg"]
            }
        },
        {
            id: "4",
            slug: "ao-dai-lien-hoa",
            name: "Áo Dài Liên Hoa",
            category: { name: "Truyền Thống", slug: "ao-dai" },
            variant: {
                pricing: { basePrice: 1950000, salePrice: undefined },
                images: ["615176128_728387603679070_7062763395476394412_n.jpg"]
            }
        }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setProducts(demoProducts);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="text-3xl md:text-4xl text-neutral-900 mb-4 uppercase tracking-wider">
                        New Arrivals
                    </h2>
                    <p className="text-neutral-500 italic">
                        Những thiết kế mới nhất cho mùa này
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[3/4] bg-neutral-100 mb-6"></div>
                                <div className="h-4 bg-neutral-100 w-2/3 mx-auto mb-2"></div>
                                <div className="h-4 bg-neutral-100 w-1/3 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {products.map((product) => (
                            <div key={product.id} className="group flex flex-col items-center text-center">
                                <Link href={`/product/${product.slug}`} className="block w-full overflow-hidden mb-6 relative aspect-[3/4]">
                                    {product.variant?.images && product.variant.images.length > 0 ? (
                                        <Image
                                            src={product.variant.images[0].startsWith('http') ? product.variant.images[0] : `/images/${product.variant.images[0]}`}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, 25vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                                            No Image
                                        </div>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center pb-8 bg-gradient-to-t from-black/20 to-transparent">
                                        <span className="bg-white text-black px-6 py-2 text-xs uppercase tracking-widest hover:bg-neutral-100 transition-colors cursor-pointer shadow-sm">
                                            Xem Chi Tiết
                                        </span>
                                    </div>
                                </Link>

                                <h3 className="text-lg text-neutral-900 mb-2">
                                    <Link href={`/product/${product.slug}`} className="hover:text-neutral-600 transition-colors">
                                        {product.name}
                                    </Link>
                                </h3>

                                <div className="text-sm font-medium text-neutral-600 mb-4 tracking-wide">
                                    {product.variant?.pricing && formatPrice(product.variant.pricing.salePrice || product.variant.pricing.basePrice)}
                                </div>

                                <Link
                                    href={`/product/${product.slug}`}
                                    className="text-xs uppercase tracking-widest border-b border-black/20 pb-1 hover:border-black transition-colors"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

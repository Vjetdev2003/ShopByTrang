'use client';

import Link from 'next/link';
import ProductCard from './ProductCard';

interface Product {
    id: string;
    name: string;
    slug: string;
    images: string;
    variants: {
        id: string;
        pricing: {
            basePrice: number;
            salePrice?: number | null;
        } | null;
        images: string;
    }[];
}

interface NewArrivalsProps {
    products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center mb-16">
                    <h2 className="font-serif text-3xl md:text-4xl text-neutral-900 mb-4 uppercase tracking-wider">
                        New Arrivals
                    </h2>
                    <p className="font-medium text-neutral-500 italic">
                        Những thiết kế mới nhất cho mùa này
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link href="/new-arrivals" className="inline-block px-8 py-3 border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors uppercase tracking-widest text-sm">
                        Xem tất cả
                    </Link>
                </div>
            </div>
        </section>
    );
}

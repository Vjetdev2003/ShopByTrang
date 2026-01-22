'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: {
    name: string;
    slug: string;
  };
  variant: {
    id: string;
    sku: string;
    color: string;
    colorHex: string;
    size: string;
    images: string[];
    pricing: {
      basePrice: number;
      salePrice?: number;
    } | null;
    inventory: {
      quantity: number;
    } | null;
  } | null;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=4');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-light text-center mb-12 tracking-wider">Sản Phẩm Nổi Bật</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-200 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded"></div>
                  <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-light text-center mb-12 tracking-wider">Sản Phẩm Nổi Bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <article key={product.id} className="group">
              <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-[3/4] bg-neutral-200 overflow-hidden mb-4">
                  {product.variant?.images && product.variant.images.length > 0 ? (
                    <Image
                      src={`/products/${product.variant.images[0]}`}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${
                      product.category.slug === 'ao-dai' ? 'bg-gradient-to-br from-pink-100 to-pink-200' :
                      product.category.slug === 'du-xuan' ? 'bg-gradient-to-br from-red-100 to-red-200' :
                      product.category.slug === 'nang-tho' ? 'bg-gradient-to-br from-green-100 to-green-200' :
                      'bg-gradient-to-br from-blue-100 to-blue-200'
                    }`}>
                      <div className="text-center text-neutral-600">
                        <div className="w-16 h-16 mx-auto mb-2 bg-white/50 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-xs font-medium">{product.name}</p>
                        <p className="text-xs opacity-70">{product.category.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Sale Badge */}
                  {product.variant?.pricing?.salePrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      SALE
                    </div>
                  )}

                  {/* Quick View Button */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-full bg-black text-white py-3 text-xs uppercase tracking-wider hover:bg-neutral-800">
                      Xem Nhanh
                    </button>
                  </div>
                </div>
              </Link>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
                
                {/* Color Options */}
                {product.variant && (
                  <div className="flex gap-1">
                    <span
                      className="w-3 h-3 rounded-full border border-neutral-200"
                      style={{ backgroundColor: product.variant.colorHex }}
                      title={product.variant.color}
                    />
                  </div>
                )}

                {/* Price */}
                {product.variant?.pricing && (
                  <div className="flex items-center gap-2">
                    {product.variant.pricing.salePrice ? (
                      <>
                        <span className="text-sm font-medium text-red-600">
                          {formatPrice(product.variant.pricing.salePrice)}
                        </span>
                        <span className="text-xs text-neutral-500 line-through">
                          {formatPrice(product.variant.pricing.basePrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-medium">
                        {formatPrice(product.variant.pricing.basePrice)}
                      </span>
                    )}
                  </div>
                )}

                {/* Stock Status */}
                {product.variant?.inventory && (
                  <div className="text-xs text-neutral-500">
                    {product.variant.inventory.quantity > 0 ? (
                      product.variant.inventory.quantity < 5 ? (
                        <span className="text-orange-600">Chỉ còn {product.variant.inventory.quantity} sản phẩm</span>
                      ) : (
                        <span className="text-green-600">Còn hàng</span>
                      )
                    ) : (
                      <span className="text-red-600">Hết hàng</span>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block border border-neutral-300 text-neutral-700 px-8 py-3 text-sm uppercase tracking-wider hover:bg-neutral-100 transition-colors"
          >
            Xem Tất Cả Sản Phẩm
          </Link>
        </div>
      </div>
    </section>
  );
}

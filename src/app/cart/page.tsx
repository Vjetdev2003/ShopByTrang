'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface CartItem {
    id: string;
    quantity: number;
    variant: {
        id: string;
        sku: string;
        color: string;
        colorHex: string;
        size: string;
        images: string;
        product: {
            id: string;
            slug: string;
            name: string;
            images: string;
        };
        pricing: {
            basePrice: number;
            salePrice: number | null;
        } | null;
    };
}

interface Cart {
    id: string;
    items: CartItem[];
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(price);
}

export default function CartPage() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart');
            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        setUpdating(itemId);
        try {
            const res = await fetch('/api/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, quantity: newQuantity }),
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
                window.dispatchEvent(new Event('cart-updated'));
            }
        } catch (error) {
            console.error('Error updating cart:', error);
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (itemId: string) => {
        setUpdating(itemId);
        try {
            const res = await fetch(`/api/cart?itemId=${itemId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
                window.dispatchEvent(new Event('cart-updated'));
            }
        } catch (error) {
            console.error('Error removing item:', error);
        } finally {
            setUpdating(null);
        }
    };

    const getItemImage = (item: CartItem) => {
        try {
            const variantImages = JSON.parse(item.variant.images) as string[];
            if (variantImages.length > 0) return variantImages[0];
        } catch { /* ignore */ }
        try {
            const productImages = JSON.parse(item.variant.product.images) as string[];
            if (productImages.length > 0) return productImages[0];
        } catch { /* ignore */ }
        return '/placeholder.jpg';
    };

    const getItemPrice = (item: CartItem) => {
        return item.variant.pricing?.salePrice || item.variant.pricing?.basePrice || 0;
    };

    const subtotal = cart?.items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0) || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center py-20 text-neutral-500">Đang tải giỏ hàng...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-light text-neutral-900 mb-8">Giỏ hàng</h1>

                {!cart || cart.items.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-500 mb-6">Giỏ hàng của bạn đang trống</p>
                        <Link
                            href="/products"
                            className="inline-block px-8 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                        >
                            Tiếp tục mua sắm
                        </Link>
                        <div className="mt-6">
                            <Link
                                href="/profile/orders"
                                className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
                            >
                                📦 Xem lịch sử đơn hàng
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex gap-4 p-4 border border-neutral-200 ${updating === item.id ? 'opacity-50' : ''
                                        }`}
                                >
                                    {/* Image */}
                                    <Link href={`/product/${item.variant.product.slug}`} className="flex-shrink-0">
                                        <div className="w-24 h-32 relative bg-neutral-100">
                                            <Image
                                                src={getItemImage(item)}
                                                alt={item.variant.product.name}
                                                fill
                                                className="object-cover"
                                                sizes="96px"
                                            />
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <Link
                                            href={`/product/${item.variant.product.slug}`}
                                            className="text-lg font-medium text-neutral-900 hover:text-neutral-600"
                                        >
                                            {item.variant.product.name}
                                        </Link>
                                        <p className="text-sm text-neutral-500 mt-1">
                                            {item.variant.color} / {item.variant.size}
                                        </p>
                                        <p className="text-sm text-neutral-400 mt-1">
                                            SKU: {item.variant.sku}
                                        </p>

                                        {/* Quantity & Price */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center border border-neutral-300">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={updating === item.id}
                                                    className="p-2 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={updating === item.id}
                                                    className="p-2 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-medium">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    disabled={updating === item.id}
                                                    className="text-sm text-red-500 hover:text-red-700 mt-1 flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-neutral-50 p-6 sticky top-24">
                                <h2 className="text-lg font-medium text-neutral-900 mb-4">Tóm tắt đơn hàng</h2>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Tạm tính</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-600">Phí vận chuyển</span>
                                        <span className="text-neutral-500">Tính khi thanh toán</span>
                                    </div>
                                </div>

                                <hr className="my-4" />

                                <div className="flex justify-between font-medium text-lg">
                                    <span>Tổng cộng</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="block w-full mt-6 py-4 bg-neutral-900 text-white text-center font-medium hover:bg-neutral-800 transition-colors"
                                >
                                    Tiến hành thanh toán
                                </Link>

                                <Link
                                    href="/products"
                                    className="block w-full mt-3 py-3 border border-neutral-300 text-center text-neutral-700 hover:bg-neutral-100 transition-colors"
                                >
                                    Tiếp tục mua sắm
                                </Link>

                                <hr className="my-4" />

                                <Link
                                    href="/profile/orders"
                                    className="block w-full py-3 text-center text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
                                >
                                    📦 Xem lịch sử đơn hàng
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-neutral-900 text-white py-16 px-4 mt-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-light tracking-wider mb-2">BY TRANG</h3>
                        <p className="text-xs text-neutral-400 tracking-widest mb-4">SINCE 2002</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-4 tracking-wider">CỬA HÀNG</h4>
                        <ul className="space-y-2 text-sm text-neutral-400">
                            <li>47 Ông Ích Khiêm, Huế</li>
                            <li>31 Chu Văn An, Huế</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-4 tracking-wider">LIÊN HỆ</h4>
                        <ul className="space-y-2 text-sm text-neutral-400">
                            <li>0935 136 369</li>
                            <li>088 681 12 87</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-4 tracking-wider">THEO DÕI</h4>
                        <a href="https://www.facebook.com/profile.php?id=100095235105173" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                            Facebook
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

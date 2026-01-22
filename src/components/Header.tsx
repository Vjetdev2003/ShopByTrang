'use client';

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
    const { data: session, status } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex flex-col items-center">
                        <span className="text-xl font-light tracking-wider">BY TRANG</span>
                        <span className="text-[10px] text-neutral-500 tracking-widest">SINCE 2002</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/ao-dai" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                            Áo Dài
                        </Link>
                        <Link href="/du-xuan" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                            Du Xuân
                        </Link>
                        <Link href="/nang-tho" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                            Nàng Thơ
                        </Link>
                        <Link href="/moi-ve" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                            Mới Về
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {status === 'loading' ? (
                            <div className="text-sm text-neutral-400">Đang tải...</div>
                        ) : session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                                >
                                    <span>Xin chào, {session.user?.name}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-md shadow-lg py-1 z-50">
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Thông tin cá nhân
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Đơn hàng
                                        </Link>
                                        <hr className="my-1" />
                                        <button
                                            onClick={handleSignOut}
                                            className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                                        >
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm text-neutral-600 hover:text-neutral-900">
                                Đăng nhập
                            </Link>
                        )}

                        <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </button>
                    </div>
                </div >
            </div >
        </header >
    );
}
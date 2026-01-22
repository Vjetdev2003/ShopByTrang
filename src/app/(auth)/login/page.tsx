'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Email hoặc mật khẩu không đúng');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch {
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        try {
            setError('');
            const result = await signIn(provider, { 
                callbackUrl: '/',
                redirect: false 
            });
            
            if (result?.error) {
                setError(`Lỗi đăng nhập ${provider}: ${result.error}`);
            } else if (result?.url) {
                window.location.href = result.url;
            }
        } catch (err) {
            console.error('Social login error:', err);
            setError(`Không thể đăng nhập bằng ${provider}. Vui lòng thử lại.`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light tracking-wider text-neutral-800">BY TRANG</h1>
                    <p className="text-xs text-neutral-500 tracking-widest mt-1">SINCE 2002</p>
                </div>

                {/* Login Form */}
                <div className="bg-white p-8 shadow-sm">
                    <h2 className="text-lg font-medium text-center mb-6">Đăng nhập</h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm text-neutral-600 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-400 focus:outline-none transition-colors"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm text-neutral-600 mb-1">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-400 focus:outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 accent-neutral-800" />
                                Ghi nhớ đăng nhập
                            </label>
                            <Link href="/forgot-password" className="text-neutral-500 hover:text-neutral-800">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neutral-900 text-white py-3 text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Social Login Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-neutral-200"></div>
                        <span className="px-4 text-sm text-neutral-400">hoặc đăng nhập với</span>
                        <div className="flex-1 border-t border-neutral-200"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSocialLogin('facebook')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                            aria-label="Đăng nhập bằng Facebook"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                            aria-label="Đăng nhập bằng Google"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
                        <p className="text-sm text-neutral-500">
                            Chưa có tài khoản?{' '}
                            <Link href="/register" className="text-neutral-800 hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

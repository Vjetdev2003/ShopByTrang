'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu không khớp');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            router.push('/login?registered=true');
        } catch {
            setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-light tracking-wider text-neutral-800">BY TRANG</h1>
                    <p className="text-xs text-neutral-500 tracking-widest mt-1">SINCE 2002</p>
                </div>

                {/* Register Form */}
                <div className="bg-white p-8 shadow-sm">
                    <h2 className="text-lg font-medium text-center mb-6">Tạo tài khoản</h2>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm text-neutral-600 mb-1">
                                Họ và tên *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-400 focus:outline-none transition-colors"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm text-neutral-600 mb-1">
                                Email *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-400 focus:outline-none transition-colors"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm text-neutral-600 mb-1">
                                Số điện thoại
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-400 focus:outline-none transition-colors"
                                placeholder="0935 xxx xxx"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm text-neutral-600 mb-1">
                                Mật khẩu *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-400 focus:outline-none transition-colors"
                                placeholder="Tối thiểu 8 ký tự"
                                minLength={8}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm text-neutral-600 mb-1">
                                Xác nhận mật khẩu *
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-200 focus:border-neutral-400 focus:outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neutral-900 text-white py-3 text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
                        <p className="text-sm text-neutral-500">
                            Đã có tài khoản?{' '}
                            <Link href="/login" className="text-neutral-800 hover:underline">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

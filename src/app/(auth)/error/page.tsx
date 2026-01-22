'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                return 'Có lỗi cấu hình server. Vui lòng liên hệ quản trị viên.';
            case 'AccessDenied':
                return 'Truy cập bị từ chối. Bạn không có quyền đăng nhập.';
            case 'Verification':
                return 'Token xác thực không hợp lệ hoặc đã hết hạn.';
            case 'Default':
                return 'Đã có lỗi xảy ra trong quá trình đăng nhập.';
            default:
                return 'Đã có lỗi không xác định xảy ra.';
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

                {/* Error Message */}
                <div className="bg-white p-8 shadow-sm">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        
                        <h2 className="text-lg font-medium text-neutral-800 mb-2">Lỗi đăng nhập</h2>
                        
                        <p className="text-neutral-600 mb-6">
                            {getErrorMessage(error)}
                        </p>

                        {error && (
                            <div className="bg-neutral-50 p-3 mb-6 text-sm text-neutral-500 font-mono">
                                Error: {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <Link 
                                href="/login"
                                className="block w-full bg-neutral-900 text-white py-3 text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors text-center"
                            >
                                Thử lại
                            </Link>
                            
                            <Link 
                                href="/"
                                className="block w-full border border-neutral-300 text-neutral-700 py-3 text-sm uppercase tracking-wider hover:bg-neutral-50 transition-colors text-center"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
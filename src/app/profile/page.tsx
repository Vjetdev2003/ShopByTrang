
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import CustomerMeasurementForm from '@/components/profile/CustomerMeasurementForm';
import Link from 'next/link';
import { ArrowLeft, User, LogOut } from 'lucide-react';

async function getProfile(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            measurement: true,
        },
    });
    return user;
}

export default async function ProfilePage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/auth/login?callbackUrl=/profile');
    }

    const user = await getProfile(session.user.id as string);

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header / Navigation */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Về trang chủ
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-sm text-neutral-500">{user.email}</p>
                        </div>
                        <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-700">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                <User className="w-5 h-5 text-neutral-400" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold mb-4">Thông tin</h2>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-neutral-400 mb-1">Họ và tên</label>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                                <div>
                                    <label className="block text-neutral-400 mb-1">Email</label>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <label className="block text-neutral-400 mb-1">Số điện thoại</label>
                                    <p className="font-medium">{user.phone || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-1">
                            <Link href="/profile/addresses" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
                                Sổ địa chỉ
                            </Link>
                        </div>
                    </div>

                    {/* Measurement Form */}
                    <div className="md:col-span-2">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                            {/* Decorative background accent */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <CustomerMeasurementForm initialData={user.measurement} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

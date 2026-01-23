import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Search, User, ShoppingBag, DollarSign } from 'lucide-react';

// Format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

async function getCustomers(searchParams: { [key: string]: string | undefined }) {
    const page = parseInt(searchParams.page || '1');
    const limit = 10;
    const search = searchParams.search || '';

    const where = {
        role: 'CUSTOMER' as const,
        ...(search && {
            OR: [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ],
        }),
    };

    const [customers, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                orders: {
                    select: { total: true },
                },
                measurement: true,
                _count: { select: { orders: true } },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
    ]);

    // Calculate total spent for each customer
    const customersWithStats = customers.map((customer) => ({
        ...customer,
        totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
        orderCount: customer._count.orders,
    }));

    return {
        customers: customersWithStats,
        total,
        totalPages: Math.ceil(total / limit),
        page,
    };
}

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const { customers, total, totalPages, page } = await getCustomers(params);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-white">Khách hàng</h1>
                <p className="text-neutral-400 text-sm mt-1">{total} khách hàng</p>
            </div>

            {/* Search */}
            <form className="max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Tìm theo tên, email, SĐT..."
                        defaultValue={params.search}
                        className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                    />
                </div>
            </form>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.length === 0 ? (
                    <div className="col-span-full bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-neutral-500">
                        Chưa có khách hàng nào
                    </div>
                ) : (
                    customers.map((customer) => (
                        <Link
                            key={customer.id}
                            href={`/admin/customers/${customer.id}`}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                                    {customer.avatar ? (
                                        <img
                                            src={customer.avatar}
                                            alt={customer.name}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <User className="w-6 h-6 text-neutral-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">
                                        {customer.name || 'Chưa có tên'}
                                    </p>
                                    <p className="text-sm text-neutral-400 truncate">
                                        {customer.email}
                                    </p>
                                    {customer.phone && (
                                        <p className="text-sm text-neutral-500">
                                            {customer.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-neutral-800 grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-neutral-500" />
                                    <span className="text-sm text-neutral-300">
                                        {customer.orderCount} đơn
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-neutral-500" />
                                    <span className="text-sm text-neutral-300">
                                        {formatCurrency(customer.totalSpent)}
                                    </span>
                                </div>
                            </div>

                            {customer.measurement && (
                                <div className="mt-3 px-2 py-1 bg-emerald-900/30 border border-emerald-800/50 rounded text-xs text-emerald-400 inline-block">
                                    Đã có số đo
                                </div>
                            )}
                        </Link>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-500">
                        Trang {page} / {totalPages}
                    </p>
                    <div className="flex gap-2">
                        {page > 1 && (
                            <Link
                                href={`/admin/customers?page=${page - 1}`}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                            >
                                ← Trước
                            </Link>
                        )}
                        {page < totalPages && (
                            <Link
                                href={`/admin/customers?page=${page + 1}`}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                            >
                                Sau →
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

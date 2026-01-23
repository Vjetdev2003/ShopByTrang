import { prisma } from '@/lib/db/prisma';
import { ProductStatus } from '@prisma/client';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import ProductTable from '@/components/admin/ProductTable';

// Format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

async function getProducts(searchParams: { [key: string]: string | undefined }) {
    const page = parseInt(searchParams.page || '1');
    const limit = 10;
    const skip = (page - 1) * limit;
    const search = searchParams.search || '';
    const status = searchParams.status as ProductStatus | undefined;
    const category = searchParams.category || '';

    const where = {
        ...(search && {
            OR: [
                { name: { contains: search } },
                { variants: { some: { sku: { contains: search } } } },
            ],
        }),
        ...(status && { status }),
        ...(category && { categoryId: category }),
    };

    const [products, total, categories] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: true,
                variants: {
                    include: {
                        pricing: true,
                        inventory: true,
                    },
                    take: 1,
                },
                _count: { select: { variants: true } },
            },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
        prisma.category.findMany({
            where: { parentId: null },
            include: { children: true },
        }),
    ]);

    return { products, total, totalPages: Math.ceil(total / limit), page, categories };
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const { products, total, totalPages, page, categories } = await getProducts(params);



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white">Sản phẩm</h1>
                    <p className="text-neutral-400 text-sm mt-1">{total} sản phẩm</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 px-4 py-2 bg-white text-neutral-900 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Thêm sản phẩm
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                {/* Search */}
                <form className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Tìm theo tên, SKU..."
                            defaultValue={params.search}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                        />
                    </div>
                </form>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2">
                <Link
                    href="/admin/products"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!params.status ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                >
                    Tất cả
                </Link>
                <Link
                    href="/admin/products?status=ACTIVE"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.status === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                >
                    Hiển thị
                </Link>
                <Link
                    href="/admin/products?status=DRAFT"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.status === 'DRAFT' ? 'bg-yellow-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                >
                    Nháp
                </Link>
                <Link
                    href="/admin/products?status=ARCHIVED"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${params.status === 'ARCHIVED' ? 'bg-neutral-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                        }`}
                >
                    Đã ẩn
                </Link>
            </div>

            {/* Product Table (Client Component) */}
            <ProductTable
                products={products}
                totalPages={totalPages}
                currentPage={page}
            />
        </div>
    );
}

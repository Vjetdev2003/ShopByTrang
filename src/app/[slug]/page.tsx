
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";

// Helper to get category and products
async function getData(slug: string) {
    // 1. Handle special static slugs
    if (['products', 'san-pham', 'all'].includes(slug)) {
        const products = await prisma.product.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            include: { variants: { include: { pricing: true } } },
        });
        return {
            category: {
                name: 'Tất cả sản phẩm',
                nameVi: 'Tất Cả Sản Phẩm',
                description: 'Khám phá toàn bộ các thiết kế độc đáo từ BY TRANG. Tinh tế, sang trọng và đậm chất thơ.',
                gradient: 'from-gray-200 via-neutral-200 to-stone-200',
                banner: 'bg-gradient-to-br from-gray-100 via-neutral-100 to-stone-100',
            },
            products
        };
    }

    if (['new-arrivals', 'moi-ve'].includes(slug)) {
        const products = await prisma.product.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { variants: { include: { pricing: true } } },
        });
        return {
            category: {
                name: 'Mới Về',
                nameVi: 'Hàng Mới Về',
                description: 'Cập nhật những mẫu thiết kế mới nhất từ BY TRANG. Luôn dẫn đầu xu hướng thời trang.',
                gradient: 'from-purple-200 via-violet-200 to-indigo-200',
                banner: 'bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100',
            },
            products
        };
    }

    // 2. Handle DB Categories
    const category = await prisma.category.findUnique({
        where: { slug },
        include: {
            products: {
                where: { status: 'ACTIVE' },
                include: { variants: { include: { pricing: true } } },
            }
        }
    });

    if (!category) return null;

    return {
        category: {
            name: category.name,
            nameVi: category.nameVi || category.name,
            description: category.description || `Bộ sưu tập ${category.name}`,
            gradient: 'from-pink-200 via-rose-200 to-pink-300', // Default or could be stored in DB
            banner: 'bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200',
        },
        products: category.products
    };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getData(slug);

    if (!data) {
        notFound();
    }

    const { category, products } = data;

    return (
        <div className="min-h-screen">
            <Header />

            {/* Collection Banner */}
            <section className={`relative h-[50vh] flex items-center justify-center ${category.banner}`}>
                <div className="absolute inset-0 bg-black/5" />
                <div className="relative z-10 text-center px-4 max-w-3xl">
                    <p className="text-sm uppercase tracking-widest text-neutral-600 mb-2">
                        BY TRANG / {category.name}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-light tracking-wider text-neutral-800 mb-4">
                        {category.nameVi}
                    </h1>
                    <p className="text-lg text-neutral-600">
                        {category.description}
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200">
                        <p className="text-sm text-neutral-500">
                            Hiển thị {products.length} mẫu thiết kế
                        </p>
                        {/* 
                        <div className="flex gap-4">
                            <select className="text-sm px-4 py-2 border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400">
                                <option>Sắp xếp theo</option>
                                <option>Giá: Thấp đến cao</option>
                                <option>Giá: Cao đến thấp</option>
                                <option>Mới nhất</option>
                            </select>
                        </div>
                         */}
                    </div>

                    {/* Products */}
                    {products.length === 0 ? (
                        <div className="text-center py-20 text-neutral-500">
                            Chưa có sản phẩm nào trong danh mục này.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-neutral-900 text-white py-16 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-light tracking-wider mb-2">BY TRANG</h3>
                        <p className="text-xs text-neutral-400 tracking-widest mb-4">SINCE 2002</p>
                        <p className="text-sm text-neutral-400">
                            Thương hiệu thời trang Việt Nam, mang đến vẻ đẹp tinh tế và thanh lịch.
                        </p>
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
                            <li>bytrang.since2002@gmail.com</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-4 tracking-wider">THEO DÕI</h4>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/profile.php?id=100095235105173" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                                Facebook
                            </a>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
                    © 2026 BY TRANG. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

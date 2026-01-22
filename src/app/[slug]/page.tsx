'use client';

import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { useParams } from "next/navigation";

// Collection data
const collections: Record<string, {
    name: string;
    nameVi: string;
    description: string;
    gradient: string;
    banner: string;
}> = {
    'ao-dai': {
        name: 'Áo Dài',
        nameVi: 'Bộ Sưu Tập Áo Dài',
        description: 'Vẻ đẹp truyền thống Việt Nam trong từng đường kim mũi chỉ. Áo dài BY TRANG mang đến sự thanh lịch, tinh tế cho người phụ nữ hiện đại.',
        gradient: 'from-pink-200 via-rose-200 to-pink-300',
        banner: 'bg-gradient-to-br from-pink-100 via-rose-100 to-pink-200',
    },
    'du-xuan': {
        name: 'Du Xuân',
        nameVi: 'Bộ Sưu Tập Du Xuân 2026',
        description: 'Rực rỡ sắc xuân với những thiết kế đậm chất lễ hội. Đồng hành cùng bạn trong mỗi chuyến du xuân đầu năm.',
        gradient: 'from-red-200 via-orange-200 to-yellow-200',
        banner: 'bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100',
    },
    'nang-tho': {
        name: 'Nàng Thơ',
        nameVi: 'Bộ Sưu Tập Nàng Thơ',
        description: 'Dịu dàng, nữ tính và đầy chất thơ. Dành cho những tâm hồn yêu cái đẹp nhẹ nhàng, thanh thoát.',
        gradient: 'from-green-200 via-teal-200 to-cyan-200',
        banner: 'bg-gradient-to-br from-green-100 via-teal-100 to-cyan-100',
    },
    'moi-ve': {
        name: 'Mới Về',
        nameVi: 'Hàng Mới Về',
        description: 'Cập nhật những mẫu thiết kế mới nhất từ BY TRANG. Luôn dẫn đầu xu hướng thời trang.',
        gradient: 'from-purple-200 via-violet-200 to-indigo-200',
        banner: 'bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100',
    },
    'new-arrivals': {
        name: 'Mới Về',
        nameVi: 'Hàng Mới Về',
        description: 'Cập nhật những mẫu thiết kế mới nhất từ BY TRANG. Luôn dẫn đầu xu hướng thời trang.',
        gradient: 'from-purple-200 via-violet-200 to-indigo-200',
        banner: 'bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100',
    },
    'summer': {
        name: 'Hè 2026',
        nameVi: 'Bộ Sưu Tập Hè 2026',
        description: 'Tươi mát, năng động với gam màu rực rỡ của mùa hè. Thoải mái trong từng bước chân.',
        gradient: 'from-blue-200 via-cyan-200 to-teal-200',
        banner: 'bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100',
    },
    'products': {
        name: 'Tất cả sản phẩm',
        nameVi: 'Tất Cả Sản Phẩm',
        description: 'Khám phá toàn bộ các thiết kế độc đáo từ BY TRANG. Tinh tế, sang trọng và đậm chất thơ.',
        gradient: 'from-gray-200 via-neutral-200 to-stone-200',
        banner: 'bg-gradient-to-br from-gray-100 via-neutral-100 to-stone-100',
    },
    'san-pham': {
        name: 'Tất cả sản phẩm',
        nameVi: 'Tất Cả Sản Phẩm',
        description: 'Khám phá toàn bộ các thiết kế độc đáo từ BY TRANG. Tinh tế, sang trọng và đậm chất thơ.',
        gradient: 'from-gray-200 via-neutral-200 to-stone-200',
        banner: 'bg-gradient-to-br from-gray-100 via-neutral-100 to-stone-100',
    },
    'all': {
        name: 'Tất cả sản phẩm',
        nameVi: 'Tất Cả Sản Phẩm',
        description: 'Khám phá toàn bộ các thiết kế độc đáo từ BY TRANG. Tinh tế, sang trọng và đậm chất thơ.',
        gradient: 'from-gray-200 via-neutral-200 to-stone-200',
        banner: 'bg-gradient-to-br from-gray-100 via-neutral-100 to-stone-100',
    },
};

// Real products - 2 main designs with color variations
const products = [
    {
        id: 1,
        name: 'Áo dài hoa sen',
        price: 1890000,
        mainImage: '/images/613682871_728387587012405_854151880740947198_n.jpg',
        variations: [
            '/images/613682871_728387587012405_854151880740947198_n.jpg',
            '/images/614517017_728387570345740_8735693880269548847_n.jpg',
            '/images/614587663_728387610345736_7039176811692822144_n.jpg',
            '/images/615176128_728387603679070_7062763395476394412_n.jpg',
        ]
    },
    {
        id: 2,
        name: 'Áo dài gấm thêu',
        price: 2690000,
        mainImage: '/images/616815351_732105949973902_2490500710436884280_n.jpg',
        variations: [
            '/images/616815351_732105949973902_2490500710436884280_n.jpg',
            '/images/616818219_732105936640570_8032280431854964645_n.jpg',
            '/images/616818281_732105983307232_1927641953464653700_n.jpg',
            '/images/616956020_732105973307233_6602745463863564202_n.jpg',
        ]
    },
];

function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
}

export default function CollectionPage() {
    const params = useParams();
    const slug = params.slug as string;

    const collection = collections[slug];

    if (!collection) {
        return (
            <div className="min-h-screen">
                <Header />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <h1 className="text-2xl font-light text-neutral-800 mb-4">
                            Không tìm thấy bộ sưu tập
                        </h1>
                        <Link
                            href="/"
                            className="text-neutral-600 hover:text-neutral-900 underline"
                        >
                            Quay về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header />

            {/* Collection Banner */}
            <section className={`relative h-[50vh] flex items-center justify-center ${collection.banner}`}>
                <div className="absolute inset-0 bg-black/5" />
                <div className="relative z-10 text-center px-4 max-w-3xl">
                    <p className="text-sm uppercase tracking-widest text-neutral-600 mb-2">
                        BY TRANG / {collection.name}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-light tracking-wider text-neutral-800 mb-4">
                        {collection.nameVi}
                    </h1>
                    <p className="text-lg text-neutral-600">
                        {collection.description}
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
                        <div className="flex gap-4">
                            <select className="text-sm px-4 py-2 border border-neutral-200 bg-white focus:outline-none focus:border-neutral-400">
                                <option>Sắp xếp theo</option>
                                <option>Giá: Thấp đến cao</option>
                                <option>Giá: Cao đến thấp</option>
                                <option>Mới nhất</option>
                            </select>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Coming Soon Message */}
                    <div className="mt-16 text-center py-12 bg-neutral-50 rounded-lg">
                        <h3 className="text-lg font-light text-neutral-700 mb-2">
                            Đang cập nhật thêm sản phẩm
                        </h3>
                        <p className="text-sm text-neutral-500">
                            Bộ sưu tập sẽ sớm có thêm nhiều mẫu mới. Hãy quay lại sau!
                        </p>
                    </div>
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

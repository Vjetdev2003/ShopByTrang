'use client';

import Image from 'next/image';
import Link from 'next/link';

const collections = [
    {
        id: 'traditional',
        name: 'Traditional Ao Dai',
        title: 'Áo Dài Truyền Thống',
        description: 'Vẻ đẹp vượt thời gian',
        image: '/images/613682871_728387587012405_854151880740947198_n.jpg',
        link: '/ao-dai'
    },
    {
        id: 'modern',
        name: 'Modern Ao Dai',
        title: 'Áo Dài Cách Tân',
        description: 'Hơi thở đương đại',
        image: '/images/614517017_728387570345740_8735693880269548847_n.jpg',
        link: '/du-xuan'
    },
    {
        id: 'bridal',
        name: 'Bridal Ao Dai',
        title: 'Áo Dài Cưới',
        description: 'Ngày hạnh phúc nhất',
        image: '/images/616815351_732105949973902_2490500710436884280_n.jpg',
        link: '/nang-tho'
    },
    {
        id: 'accessories',
        name: 'Accessories',
        title: 'Phụ Kiện',
        description: 'Điểm nhấn hoàn hảo',
        image: '/images/616956020_732105973307233_6602745463863564202_n.jpg',
        link: '/products'
    }
];

export default function CollectionGrid() {
    return (
        <section className="py-24 bg-[#F9F8F6]"> {/* Warm beige/ivory background */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-neutral-800 mb-4 tracking-wide">
                        Our Collections
                    </h2>
                    <div className="w-24 h-0.5 bg-neutral-300 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {collections.map((collection) => (
                        <Link
                            key={collection.id}
                            href={collection.link}
                            className="group block"
                        >
                            <div className="relative aspect-[3/5] overflow-hidden mb-6 bg-white shadow-sm">
                                <Image
                                    src={collection.image}
                                    alt={collection.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>

                            <div className="text-center group-hover:-translate-y-1 transition-transform duration-500">
                                <h3 className="text-xl text-neutral-900 mb-2">
                                    {collection.title}
                                </h3>
                                <p className="font-sans text-xs text-neutral-500 uppercase tracking-widest">
                                    {collection.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

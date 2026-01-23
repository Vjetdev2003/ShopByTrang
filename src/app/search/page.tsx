'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    images: string;
    variants: {
        id: string;
        pricing: {
            basePrice: number;
            salePrice: number | null;
        } | null;
        images: string;
    }[];
}

interface Filters {
    materials: string[];
    colors: string[];
    categories: { slug: string; name: string; nameVi?: string }[];
}

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [products, setProducts] = useState<Product[]>([]);
    const [filters, setFilters] = useState<Filters>({ materials: [], colors: [], categories: [] });
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedMaterial, setSelectedMaterial] = useState(searchParams.get('material') || '');
    const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.set('q', query);
            if (selectedCategory) params.set('category', selectedCategory);
            if (selectedMaterial) params.set('material', selectedMaterial);
            if (selectedColor) params.set('color', selectedColor);
            if (minPrice) params.set('minPrice', minPrice);
            if (maxPrice) params.set('maxPrice', maxPrice);
            if (sortBy) params.set('sortBy', sortBy);

            const res = await fetch(`/api/search?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.products);
                setFilters(data.filters);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }, [query, selectedCategory, selectedMaterial, selectedColor, minPrice, maxPrice, sortBy]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedMaterial) params.set('material', selectedMaterial);
        if (selectedColor) params.set('color', selectedColor);
        router.push(`/search?${params.toString()}`);
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedMaterial('');
        setSelectedColor('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('newest');
    };

    const hasActiveFilters = selectedCategory || selectedMaterial || selectedColor || minPrice || maxPrice;

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Header */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm, mã SKU, chất liệu..."
                            className="w-full px-6 py-4 pr-12 border border-neutral-300 rounded-full text-lg focus:outline-none focus:border-neutral-500"
                        />
                        <button
                            type="submit"
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-neutral-100 rounded-full"
                        >
                            <Search className="w-6 h-6 text-neutral-600" />
                        </button>
                    </div>
                </form>

                <div className="flex gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">Bộ lọc</h2>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-neutral-500 hover:text-neutral-900"
                                    >
                                        Xóa tất cả
                                    </button>
                                )}
                            </div>

                            {/* Category Filter */}
                            <div>
                                <h3 className="font-medium mb-3">Danh mục</h3>
                                <div className="space-y-2">
                                    {filters.categories.map((cat) => (
                                        <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={selectedCategory === cat.slug}
                                                onChange={() => setSelectedCategory(cat.slug)}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">{cat.nameVi || cat.name}</span>
                                        </label>
                                    ))}
                                    {selectedCategory && (
                                        <button
                                            onClick={() => setSelectedCategory('')}
                                            className="text-xs text-neutral-500 hover:text-neutral-900"
                                        >
                                            Bỏ chọn
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Material Filter */}
                            <div>
                                <h3 className="font-medium mb-3">Chất liệu</h3>
                                <div className="space-y-2">
                                    {filters.materials.map((mat) => (
                                        <label key={mat} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="material"
                                                checked={selectedMaterial === mat}
                                                onChange={() => setSelectedMaterial(mat || '')}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">{mat}</span>
                                        </label>
                                    ))}
                                    {selectedMaterial && (
                                        <button
                                            onClick={() => setSelectedMaterial('')}
                                            className="text-xs text-neutral-500 hover:text-neutral-900"
                                        >
                                            Bỏ chọn
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Color Filter */}
                            <div>
                                <h3 className="font-medium mb-3">Màu sắc</h3>
                                <div className="flex flex-wrap gap-2">
                                    {filters.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                                            className={`px-3 py-1 text-sm border rounded-full transition-colors ${selectedColor === color
                                                ? 'border-neutral-900 bg-neutral-900 text-white'
                                                : 'border-neutral-300 hover:border-neutral-500'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h3 className="font-medium mb-3">Khoảng giá</h3>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        placeholder="Từ"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm"
                                    />
                                    <span>-</span>
                                    <input
                                        type="number"
                                        placeholder="Đến"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-neutral-300 rounded text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Bộ lọc
                                </button>
                                <p className="text-neutral-600">
                                    {loading ? 'Đang tìm kiếm...' : `${products.length} sản phẩm`}
                                </p>
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-neutral-300 rounded-lg text-sm"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price-asc">Giá: Thấp → Cao</option>
                                <option value="price-desc">Giá: Cao → Thấp</option>
                                <option value="name-asc">Tên: A → Z</option>
                                <option value="name-desc">Tên: Z → A</option>
                            </select>
                        </div>

                        {/* Active Filters Tags */}
                        {hasActiveFilters && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {selectedCategory && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-neutral-100 rounded-full text-sm">
                                        {filters.categories.find(c => c.slug === selectedCategory)?.nameVi || filters.categories.find(c => c.slug === selectedCategory)?.name}
                                        <button onClick={() => setSelectedCategory('')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                )}
                                {selectedMaterial && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-neutral-100 rounded-full text-sm">
                                        {selectedMaterial}
                                        <button onClick={() => setSelectedMaterial('')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                )}
                                {selectedColor && (
                                    <span className="flex items-center gap-1 px-3 py-1 bg-neutral-100 rounded-full text-sm">
                                        {selectedColor}
                                        <button onClick={() => setSelectedColor('')}>
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Products Grid */}
                        {products.length === 0 && !loading ? (
                            <div className="text-center py-20 text-neutral-500">
                                <Search className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                                <p>Không tìm thấy sản phẩm nào</p>
                                {query && <p className="text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                    <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-medium">Bộ lọc</h2>
                            <button onClick={() => setShowFilters(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {/* Same filter content as sidebar */}
                        <div className="space-y-6">
                            {/* Category */}
                            <div>
                                <h3 className="font-medium mb-3">Danh mục</h3>
                                {filters.categories.map((cat) => (
                                    <label key={cat.slug} className="flex items-center gap-2 cursor-pointer py-1">
                                        <input
                                            type="radio"
                                            name="category-mobile"
                                            checked={selectedCategory === cat.slug}
                                            onChange={() => setSelectedCategory(cat.slug)}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">{cat.nameVi || cat.name}</span>
                                    </label>
                                ))}
                            </div>
                            {/* Material */}
                            <div>
                                <h3 className="font-medium mb-3">Chất liệu</h3>
                                {filters.materials.map((mat) => (
                                    <label key={mat} className="flex items-center gap-2 cursor-pointer py-1">
                                        <input
                                            type="radio"
                                            name="material-mobile"
                                            checked={selectedMaterial === mat}
                                            onChange={() => setSelectedMaterial(mat || '')}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm">{mat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="w-full mt-6 py-3 bg-neutral-900 text-white rounded-lg"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const category = searchParams.get('category') || '';
        const material = searchParams.get('material') || '';
        const color = searchParams.get('color') || '';
        const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
        const sortBy = searchParams.get('sortBy') || 'newest';

        // Build where clause for products
        const productWhere: Record<string, unknown> = {
            status: 'ACTIVE',
        };

        // Search query - search in name, description, tags
        if (query) {
            productWhere.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { tags: { contains: query, mode: 'insensitive' } },
            ];
        }

        // Category filter
        if (category) {
            productWhere.category = { slug: category };
        }

        // Build variant filter
        const variantWhere: Record<string, unknown> = {};

        // Material filter
        if (material) {
            variantWhere.material = { contains: material, mode: 'insensitive' };
        }

        // Color filter
        if (color) {
            variantWhere.color = { contains: color, mode: 'insensitive' };
        }

        // SKU search (if query looks like SKU)
        if (query && query.includes('-')) {
            variantWhere.OR = [
                { sku: { contains: query, mode: 'insensitive' } },
            ];
        }

        // Determine sort order
        let orderBy: Record<string, string> = { createdAt: 'desc' };
        if (sortBy === 'oldest') {
            orderBy = { createdAt: 'asc' };
        } else if (sortBy === 'name-asc') {
            orderBy = { name: 'asc' };
        } else if (sortBy === 'name-desc') {
            orderBy = { name: 'desc' };
        }

        // Fetch products with variants
        const products = await prisma.product.findMany({
            where: productWhere,
            orderBy,
            include: {
                category: true,
                variants: {
                    where: Object.keys(variantWhere).length > 0 ? variantWhere : undefined,
                    include: {
                        pricing: true,
                        inventory: true,
                    },
                },
            },
        });

        // Filter by price (need to check variant pricing)
        let filteredProducts = products;

        if (minPrice !== undefined || maxPrice !== undefined) {
            filteredProducts = products.filter(product => {
                const prices = product.variants
                    .filter(v => v.pricing)
                    .map(v => v.pricing!.salePrice || v.pricing!.basePrice);

                if (prices.length === 0) return false;

                const minProductPrice = Math.min(...prices);
                const maxProductPrice = Math.max(...prices);

                if (minPrice !== undefined && maxProductPrice < minPrice) return false;
                if (maxPrice !== undefined && minProductPrice > maxPrice) return false;

                return true;
            });
        }

        // Filter out products with no matching variants (if variant filters applied)
        if (Object.keys(variantWhere).length > 0) {
            filteredProducts = filteredProducts.filter(p => p.variants.length > 0);
        }

        // Sort by price if needed
        if (sortBy === 'price-asc' || sortBy === 'price-desc') {
            filteredProducts.sort((a, b) => {
                const priceA = a.variants[0]?.pricing?.salePrice || a.variants[0]?.pricing?.basePrice || 0;
                const priceB = b.variants[0]?.pricing?.salePrice || b.variants[0]?.pricing?.basePrice || 0;
                return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
            });
        }

        // Get unique materials and colors for filters
        const allVariants = await prisma.variant.findMany({
            where: {
                product: { status: 'ACTIVE' },
            },
            select: {
                material: true,
                color: true,
            },
            distinct: ['material', 'color'],
        });

        const materials = [...new Set(allVariants.map(v => v.material).filter(Boolean))];
        const colors = [...new Set(allVariants.map(v => v.color).filter(Boolean))];

        // Get categories
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            select: { slug: true, name: true, nameVi: true },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({
            products: filteredProducts,
            filters: {
                materials,
                colors,
                categories,
            },
            total: filteredProducts.length,
        });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '12');
        const page = parseInt(searchParams.get('page') || '1');
        const skip = (page - 1) * limit;

        const where = category ? {
            category: {
                slug: category
            },
            status: 'ACTIVE'
        } : {
            status: 'ACTIVE'
        };

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                variants: {
                    include: {
                        pricing: true,
                        inventory: true,
                    },
                    take: 1, // Get first variant for display
                },
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        const total = await prisma.product.count({ where });

        const formattedProducts = products.map(product => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description,
            category: product.category,
            variant: product.variants[0] ? {
                id: product.variants[0].id,
                sku: product.variants[0].sku,
                color: product.variants[0].color,
                colorHex: product.variants[0].colorHex,
                size: product.variants[0].size,
                images: product.variants[0].images,
                pricing: product.variants[0].pricing,
                inventory: product.variants[0].inventory,
            } : null,
        }));

        return NextResponse.json({
            products: formattedProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Products API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}
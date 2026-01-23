import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { ProductStatus } from '@prisma/client';

// GET - List products with pagination and filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') as ProductStatus | null;
        const categoryId = searchParams.get('category') || '';

        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { variants: { some: { sku: { contains: search } } } },
                ],
            }),
            ...(status && { status }),
            ...(categoryId && { categoryId }),
        };

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    variants: {
                        include: {
                            pricing: true,
                            inventory: true,
                        },
                    },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('GET /api/admin/products error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, categoryId, tags, status, variants } = body;

        if (!name || !categoryId || !variants?.length) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        // Expand variants based on sizes (each size becomes a separate variant)
        const expandedVariants: Array<{
            sku: string;
            color: string;
            colorHex: string;
            size: string;
            material?: string;
            basePrice: number;
            salePrice?: number;
            quantity: number;
            images?: string[];
        }> = [];

        for (const v of variants) {
            const sizes = v.sizes || [v.size || 'M'];
            for (const size of sizes) {
                expandedVariants.push({
                    sku: sizes.length > 1 ? `${v.sku}-${size}` : v.sku,
                    color: v.color,
                    colorHex: v.colorHex,
                    size: size,
                    material: v.material,
                    basePrice: v.basePrice,
                    salePrice: v.salePrice,
                    quantity: v.quantity,
                    images: v.images,
                });
            }
        }

        // Check for duplicate SKUs
        const skus = expandedVariants.map((v) => v.sku);
        const existingVariant = await prisma.variant.findFirst({
            where: { sku: { in: skus } },
            select: { sku: true },
        });

        if (existingVariant) {
            return NextResponse.json(
                { error: `SKU '${existingVariant.sku}' đã tồn tại` },
                { status: 400 }
            );
        }

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
            + '-' + Date.now().toString(36);

        // Create product with variants
        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description: description || '',
                categoryId,
                tags: JSON.stringify(tags || []),
                status: status || ProductStatus.DRAFT,
                images: JSON.stringify(body.images || []),
                variants: {
                    create: expandedVariants.map((v) => ({
                        sku: v.sku,
                        color: v.color,
                        colorHex: v.colorHex,
                        size: v.size,
                        material: v.material || null,
                        images: JSON.stringify(v.images || []),
                        pricing: {
                            create: {
                                basePrice: v.basePrice,
                                salePrice: v.salePrice || null,
                            },
                        },
                        inventory: {
                            create: {
                                quantity: v.quantity || 0,
                            },
                        },
                    })),
                },
            },
            include: {
                category: true,
                variants: {
                    include: {
                        pricing: true,
                        inventory: true,
                    },
                },
            },
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/admin/products error:', error);

        // Handle Unique Constraint Violation
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Dữ liệu đã tồn tại (SKU hoặc tên sản phẩm)' },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

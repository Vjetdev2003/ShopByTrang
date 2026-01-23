import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// GET - Get single product
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const product = await prisma.product.findUnique({
            where: { id },
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

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('GET /api/admin/products/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, description, categoryId, tags, status, images, variants } = body;

        // Check for duplicate SKUs in other products
        const skus = variants.map((v: { sku: string }) => v.sku);
        const existingVariant = await prisma.variant.findFirst({
            where: {
                sku: { in: skus },
                productId: { not: id }
            },
            select: { sku: true },
        });

        if (existingVariant) {
            return NextResponse.json(
                { error: `SKU '${existingVariant.sku}' đã tồn tại ở sản phẩm khác` },
                { status: 400 }
            );
        }

        // Update product
        const product = await prisma.product.update({
            where: { id },
            data: {
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                description,
                categoryId,
                tags: JSON.stringify(tags),
                status,
                images: JSON.stringify(images),
            },
        });

        // Get existing variants
        const existingVariants = await prisma.variant.findMany({
            where: { productId: id },
            select: { id: true },
        });

        const existingIds = existingVariants.map((v) => v.id);
        const updatedIds: string[] = [];

        // Update or create variants
        for (const variantData of variants) {
            if (variantData.id && existingIds.includes(variantData.id)) {
                // Update existing variant
                await prisma.variant.update({
                    where: { id: variantData.id },
                    data: {
                        sku: variantData.sku,
                        color: variantData.color,
                        size: variantData.size,
                        material: variantData.material,
                        images: JSON.stringify(variantData.images || []),
                    },
                });

                // Update pricing
                await prisma.pricing.upsert({
                    where: { variantId: variantData.id },
                    update: {
                        basePrice: variantData.basePrice,
                        salePrice: variantData.salePrice,
                    },
                    create: {
                        variantId: variantData.id,
                        basePrice: variantData.basePrice,
                        salePrice: variantData.salePrice,
                    },
                });

                // Update inventory
                await prisma.inventory.upsert({
                    where: { variantId: variantData.id },
                    update: { quantity: variantData.quantity },
                    create: { variantId: variantData.id, quantity: variantData.quantity },
                });

                updatedIds.push(variantData.id);
            } else {
                // Create new variant
                const newVariant = await prisma.variant.create({
                    data: {
                        productId: id,
                        sku: variantData.sku || `${id}-${Date.now()}`,
                        color: variantData.color,
                        colorHex: '#000000', // Default
                        size: variantData.size,
                        material: variantData.material,
                        images: JSON.stringify(variantData.images || []),
                    },
                });

                await prisma.pricing.create({
                    data: {
                        variantId: newVariant.id,
                        basePrice: variantData.basePrice,
                        salePrice: variantData.salePrice,
                    },
                });

                await prisma.inventory.create({
                    data: {
                        variantId: newVariant.id,
                        quantity: variantData.quantity,
                    },
                });

                updatedIds.push(newVariant.id);
            }
        }

        // Delete variants that were removed
        const idsToDelete = existingIds.filter((id) => !updatedIds.includes(id));
        if (idsToDelete.length > 0) {
            await prisma.pricing.deleteMany({ where: { variantId: { in: idsToDelete } } });
            await prisma.inventory.deleteMany({ where: { variantId: { in: idsToDelete } } });
            await prisma.variant.deleteMany({ where: { id: { in: idsToDelete } } });
        }

        return NextResponse.json({ product });
    } catch (error: any) {
        console.error('PUT /api/admin/products/[id] error:', error);

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

// DELETE - Delete product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Delete related data first
        const variants = await prisma.variant.findMany({
            where: { productId: id },
            select: { id: true },
        });

        const variantIds = variants.map((v) => v.id);

        await prisma.pricing.deleteMany({ where: { variantId: { in: variantIds } } });
        await prisma.inventory.deleteMany({ where: { variantId: { in: variantIds } } });
        await prisma.variant.deleteMany({ where: { productId: id } });
        await prisma.review.deleteMany({ where: { productId: id } });
        await prisma.product.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/admin/products/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

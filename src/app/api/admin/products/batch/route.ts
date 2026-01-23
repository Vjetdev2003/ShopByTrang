
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'Danh sách ID không hợp lệ' },
                { status: 400 }
            );
        }

        // Delete related data first for all products
        // 1. Get all variant IDs linked to these products
        const variants = await prisma.variant.findMany({
            where: { productId: { in: ids } },
            select: { id: true },
        });

        const variantIds = variants.map((v) => v.id);

        await prisma.$transaction(async (tx) => {
            // Delete Pricing for these variants
            if (variantIds.length > 0) {
                await tx.pricing.deleteMany({ where: { variantId: { in: variantIds } } });
                await tx.inventory.deleteMany({ where: { variantId: { in: variantIds } } });
            }

            // Delete Reviews linked to these products
            await tx.review.deleteMany({ where: { productId: { in: ids } } });

            // Delete Variants linked to these products
            await tx.variant.deleteMany({ where: { productId: { in: ids } } });

            // Finally delete the products
            await tx.product.deleteMany({ where: { id: { in: ids } } });
        });

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error: any) {
        console.error('POST /api/admin/products/batch error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

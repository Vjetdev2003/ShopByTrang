import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// GET - List all categories
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            where: { parentId: null },
            include: {
                children: {
                    orderBy: { sortOrder: 'asc' },
                },
                _count: { select: { products: true } },
            },
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('GET /api/admin/categories error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new category
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, nameVi, description, parentId, image } = body;

        if (!name) {
            return NextResponse.json({ error: 'Tên danh mục là bắt buộc' }, { status: 400 });
        }

        // Generate slug
        const slug = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Get max sortOrder
        const maxSort = await prisma.category.aggregate({
            where: { parentId: parentId || null },
            _max: { sortOrder: true },
        });

        const category = await prisma.category.create({
            data: {
                name,
                nameVi,
                slug,
                description,
                parentId: parentId || null,
                image,
                sortOrder: (maxSort._max.sortOrder || 0) + 1,
            },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        console.error('POST /api/admin/categories error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, nameVi, description, parentId, image, sortOrder, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(nameVi !== undefined && { nameVi }),
                ...(description !== undefined && { description }),
                ...(parentId !== undefined && { parentId: parentId || null }),
                ...(image !== undefined && { image }),
                ...(sortOrder !== undefined && { sortOrder }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json({ category });
    } catch (error) {
        console.error('PUT /api/admin/categories error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        // Check if category has products
        const productCount = await prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            return NextResponse.json(
                { error: `Không thể xóa danh mục có ${productCount} sản phẩm` },
                { status: 400 }
            );
        }

        await prisma.category.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/admin/categories error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

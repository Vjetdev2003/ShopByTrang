import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// GET - List all coupons
export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ coupons });
    } catch (error) {
        console.error('GET /api/admin/coupons error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            code,
            type,
            value,
            minOrderAmount,
            maxDiscount,
            usageLimit,
            startDate,
            endDate,
            isActive,
        } = body;

        // Check if code already exists
        const existing = await prisma.coupon.findUnique({ where: { code } });
        if (existing) {
            return NextResponse.json({ error: 'Mã giảm giá đã tồn tại' }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                discountType: type,
                discountValue: value,
                minOrderAmount,
                maxDiscount,
                usageLimit,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: isActive ?? true,
            },
        });

        return NextResponse.json({ coupon });
    } catch (error) {
        console.error('POST /api/admin/coupons error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update coupon
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            id,
            code,
            type,
            value,
            minOrderAmount,
            maxDiscount,
            usageLimit,
            startDate,
            endDate,
            isActive,
        } = body;

        // Check if code already exists for another coupon
        const existing = await prisma.coupon.findFirst({
            where: { code, NOT: { id } },
        });
        if (existing) {
            return NextResponse.json({ error: 'Mã giảm giá đã tồn tại' }, { status: 400 });
        }

        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                code: code.toUpperCase(),
                discountType: type,
                discountValue: value,
                minOrderAmount,
                maxDiscount,
                usageLimit,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive,
            },
        });

        return NextResponse.json({ coupon });
    } catch (error) {
        console.error('PUT /api/admin/coupons error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete coupon
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id } = body;

        await prisma.coupon.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/admin/coupons error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

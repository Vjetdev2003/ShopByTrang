import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { OrderStatus } from '@prisma/client';

// GET - Get order detail
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

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                address: true,
                items: {
                    include: {
                        variant: {
                            include: { product: true, pricing: true },
                        },
                    },
                },
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                },
                coupon: true,
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error('GET /api/admin/orders/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update order status
export async function PATCH(
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
        const { status, note, internalNote } = body;

        // Get current order
        const currentOrder = await prisma.order.findUnique({
            where: { id },
        });

        if (!currentOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update order and create status history entry
        const order = await prisma.order.update({
            where: { id },
            data: {
                ...(status && { status: status as OrderStatus }),
                ...(internalNote !== undefined && { internalNote }),
                statusHistory: status ? {
                    create: {
                        status: status as OrderStatus,
                        note: note || null,
                        changedBy: (session.user as any).id,
                    },
                } : undefined,
            },
            include: {
                statusHistory: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });

        return NextResponse.json({ order });
    } catch (error) {
        console.error('PATCH /api/admin/orders/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

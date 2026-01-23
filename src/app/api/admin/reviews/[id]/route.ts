import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// PATCH - Update review (approve, reject, reply)
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
        const { action, reply } = body;

        if (action === 'approve') {
            await prisma.review.update({
                where: { id },
                data: { isApproved: true },
            });
        } else if (action === 'reject') {
            await prisma.review.update({
                where: { id },
                data: { isApproved: false },
            });
        } else if (action === 'reply' && reply) {
            await prisma.review.update({
                where: { id },
                data: { adminResponse: reply },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH /api/admin/reviews/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete review
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

        await prisma.review.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/admin/reviews/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

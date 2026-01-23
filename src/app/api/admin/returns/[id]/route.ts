import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// PATCH - Update return request status
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
        const { status, adminNote, refundAmount } = body;

        const returnRequest = await prisma.returnRequest.update({
            where: { id },
            data: {
                status,
                resolution: adminNote,
                refundAmount,
                processedAt: new Date(),
            },
        });

        return NextResponse.json({ returnRequest });
    } catch (error) {
        console.error('PATCH /api/admin/returns/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

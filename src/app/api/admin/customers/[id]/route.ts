import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// PATCH - Update customer (note only for now)
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
        const { note } = body;

        const customer = await prisma.user.update({
            where: { id },
            data: {
                ...(note !== undefined && { note }),
            },
        });

        return NextResponse.json({ customer });
    } catch (error) {
        console.error('PATCH /api/admin/customers/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

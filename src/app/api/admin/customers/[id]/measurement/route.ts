import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// POST - Create or update customer measurement
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: userId } = await params;
        const body = await request.json();

        const {
            height,
            weight,
            bust,
            waist,
            hips,
            shoulder,
            armLength,
            dressLength,
            note,
        } = body;

        // Upsert measurement
        const measurement = await prisma.customerMeasurement.upsert({
            where: { userId },
            update: {
                height,
                weight,
                bust,
                waist,
                hips,
                shoulder,
                armLength,
                dressLength,
                note,
            },
            create: {
                userId,
                height,
                weight,
                bust,
                waist,
                hips,
                shoulder,
                armLength,
                dressLength,
                note,
            },
        });

        return NextResponse.json({ measurement });
    } catch (error) {
        console.error('POST /api/admin/customers/[id]/measurement error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

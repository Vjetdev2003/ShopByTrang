
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// POST: Create or Update measurements for the logged-in user
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();

        // Validate body if needed, but types handle most simple checks
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

        return NextResponse.json(measurement);
    } catch (error: any) {
        console.error('POST /api/profile/measurement error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

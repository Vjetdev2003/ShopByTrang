import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// GET - Get user's addresses
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const addresses = await prisma.address.findMany({
            where: { userId: session.user.id },
            orderBy: [
                { isDefault: 'desc' },
                { id: 'asc' }
            ]
        });

        return NextResponse.json({ addresses });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new address
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { label, fullName, phone, street, ward, district, city, isDefault } = body;

        // Validate required fields
        if (!label || !fullName || !phone || !street || !ward || !district || !city) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // If this is set as default, unset other defaults
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false }
            });
        }

        // Check if user has any addresses - if not, make this one default
        const existingCount = await prisma.address.count({
            where: { userId: session.user.id }
        });

        const address = await prisma.address.create({
            data: {
                userId: session.user.id,
                label,
                fullName,
                phone,
                street,
                ward,
                district,
                city,
                isDefault: existingCount === 0 ? true : (isDefault || false)
            }
        });

        return NextResponse.json({ address });
    } catch (error) {
        console.error('Error creating address:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update address
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, label, fullName, phone, street, ward, district, city, isDefault } = body;

        if (!id) {
            return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
        }

        // Verify address belongs to user
        const existing = await prisma.address.findFirst({
            where: { id, userId: session.user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // If setting as default, unset others
        if (isDefault && !existing.isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id, isDefault: true },
                data: { isDefault: false }
            });
        }

        const address = await prisma.address.update({
            where: { id },
            data: {
                label: label ?? existing.label,
                fullName: fullName ?? existing.fullName,
                phone: phone ?? existing.phone,
                street: street ?? existing.street,
                ward: ward ?? existing.ward,
                district: district ?? existing.district,
                city: city ?? existing.city,
                isDefault: isDefault ?? existing.isDefault
            }
        });

        return NextResponse.json({ address });
    } catch (error) {
        console.error('Error updating address:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete address
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
        }

        // Verify address belongs to user
        const existing = await prisma.address.findFirst({
            where: { id, userId: session.user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        await prisma.address.delete({ where: { id } });

        // If deleted address was default, set another as default
        if (existing.isDefault) {
            const nextAddress = await prisma.address.findFirst({
                where: { userId: session.user.id }
            });
            if (nextAddress) {
                await prisma.address.update({
                    where: { id: nextAddress.id },
                    data: { isDefault: true }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting address:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

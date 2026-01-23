import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// GET - Get all settings
export async function GET() {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get store settings
        const storeSettings = await prisma.storeSetting.findFirst();

        // Get shipping zones
        const shippingZones = await prisma.shippingZone.findMany({
            orderBy: { fee: 'asc' },
        });

        return NextResponse.json({
            storeSettings: storeSettings ? JSON.parse(storeSettings.value) : null,
            shippingZones: shippingZones.map(zone => ({
                id: zone.id,
                name: zone.name,
                fee: zone.fee,
                freeShipThreshold: zone.freeOver,
                cities: zone.cities ? JSON.parse(zone.cities) : [],
            })),
            paymentMethods: storeSettings?.value
                ? JSON.parse(storeSettings.value).paymentMethods
                : { cod: true, bankTransfer: true, momo: false, vnpay: false },
        });
    } catch (error) {
        console.error('GET /api/admin/settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Save settings
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { storeSettings, shippingZones, paymentMethods } = body;

        // Upsert store settings
        const existingSetting = await prisma.storeSetting.findFirst();
        if (existingSetting) {
            await prisma.storeSetting.update({
                where: { id: existingSetting.id },
                data: {
                    value: JSON.stringify({ ...storeSettings, paymentMethods }),
                },
            });
        } else {
            await prisma.storeSetting.create({
                data: {
                    key: 'store_settings',
                    value: JSON.stringify({ ...storeSettings, paymentMethods }),
                },
            });
        }

        // Update shipping zones
        // Delete existing zones
        await prisma.shippingZone.deleteMany();

        // Create new zones
        if (shippingZones && shippingZones.length > 0) {
            await prisma.shippingZone.createMany({
                data: shippingZones.map((zone: { name: string; fee: number; freeShipThreshold: number; cities: string[] }) => ({
                    name: zone.name,
                    fee: zone.fee,
                    freeOver: zone.freeShipThreshold || 0,
                    cities: JSON.stringify(zone.cities || []),
                })),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('POST /api/admin/settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

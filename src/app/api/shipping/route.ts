import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// GET - Calculate shipping fee based on city and subtotal
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        const subtotal = parseInt(searchParams.get('subtotal') || '0');

        if (!city) {
            return NextResponse.json({ error: 'City required' }, { status: 400 });
        }

        // Find matching shipping zone
        const zones = await prisma.shippingZone.findMany({
            where: { isActive: true }
        });

        let matchedZone = null;
        for (const zone of zones) {
            try {
                const cities = JSON.parse(zone.cities) as string[];
                if (cities.some(c => c.toLowerCase() === city.toLowerCase())) {
                    matchedZone = zone;
                    break;
                }
            } catch {
                // If cities is not valid JSON, try direct match
                if (zone.cities.toLowerCase().includes(city.toLowerCase())) {
                    matchedZone = zone;
                    break;
                }
            }
        }

        // Default shipping fee if no zone matched
        const defaultFee = 50000; // 50,000 VND

        if (!matchedZone) {
            return NextResponse.json({
                fee: defaultFee,
                zoneName: 'Toàn quốc',
                freeShipping: false
            });
        }

        // Check if free shipping applies
        const freeShipping = matchedZone.freeOver && subtotal >= matchedZone.freeOver;
        const fee = freeShipping ? 0 : matchedZone.fee;

        return NextResponse.json({
            fee,
            zoneName: matchedZone.name,
            freeShipping,
            freeOver: matchedZone.freeOver
        });
    } catch (error) {
        console.error('Error calculating shipping:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

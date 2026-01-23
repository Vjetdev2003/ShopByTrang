import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// POST - Validate coupon code
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { code, subtotal } = body;

        if (!code) {
            return NextResponse.json({ error: 'Mã giảm giá không được để trống' }, { status: 400 });
        }

        // Find coupon
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return NextResponse.json({
                valid: false,
                error: 'Mã giảm giá không tồn tại'
            });
        }

        // Check if active
        if (!coupon.isActive) {
            return NextResponse.json({
                valid: false,
                error: 'Mã giảm giá đã bị vô hiệu hóa'
            });
        }

        // Check dates
        const now = new Date();
        if (now < coupon.startDate) {
            return NextResponse.json({
                valid: false,
                error: 'Mã giảm giá chưa có hiệu lực'
            });
        }

        if (now > coupon.endDate) {
            return NextResponse.json({
                valid: false,
                error: 'Mã giảm giá đã hết hạn'
            });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({
                valid: false,
                error: 'Mã giảm giá đã hết lượt sử dụng'
            });
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            return NextResponse.json({
                valid: false,
                error: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(coupon.minOrderAmount)}đ`
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.round(subtotal * coupon.discountValue / 100);
            // Apply max discount cap
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            // FIXED_AMOUNT
            discount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed subtotal
        if (discount > subtotal) {
            discount = subtotal;
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscount: coupon.maxDiscount
            },
            discount
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

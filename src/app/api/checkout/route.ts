import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';

// Generate order number
function generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BT${year}${month}${day}${random}`;
}

// POST - Create order from cart
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập để đặt hàng' }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await request.json();
        const { addressId, couponCode, paymentMethod, note } = body;

        // Validate address
        if (!addressId) {
            return NextResponse.json({ error: 'Vui lòng chọn địa chỉ giao hàng' }, { status: 400 });
        }

        const address = await prisma.address.findFirst({
            where: { id: addressId, userId: session.user.id }
        });

        if (!address) {
            return NextResponse.json({ error: 'Địa chỉ không hợp lệ' }, { status: 400 });
        }

        // Get user's cart
        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                pricing: true,
                                inventory: true,
                                product: true
                            }
                        }
                    }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 });
        }

        // Validate stock availability
        for (const item of cart.items) {
            const available = (item.variant.inventory?.quantity || 0) - (item.variant.inventory?.reserved || 0);
            if (item.quantity > available) {
                return NextResponse.json({
                    error: `Sản phẩm "${item.variant.product.name}" (${item.variant.color}/${item.variant.size}) chỉ còn ${available} sản phẩm`
                }, { status: 400 });
            }
        }

        // Calculate subtotal
        const subtotal = cart.items.reduce((sum, item) => {
            const price = item.variant.pricing?.salePrice || item.variant.pricing?.basePrice || 0;
            return sum + price * item.quantity;
        }, 0);

        // Calculate shipping fee
        let shippingFee = 50000; // Default
        const zones = await prisma.shippingZone.findMany({ where: { isActive: true } });
        for (const zone of zones) {
            try {
                const cities = JSON.parse(zone.cities) as string[];
                if (cities.some(c => c.toLowerCase() === address.city.toLowerCase())) {
                    shippingFee = zone.freeOver && subtotal >= zone.freeOver ? 0 : zone.fee;
                    break;
                }
            } catch {
                if (zone.cities.toLowerCase().includes(address.city.toLowerCase())) {
                    shippingFee = zone.freeOver && subtotal >= zone.freeOver ? 0 : zone.fee;
                    break;
                }
            }
        }

        // Validate and apply coupon
        let discount = 0;
        let couponId: string | null = null;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() }
            });

            if (coupon && coupon.isActive) {
                const now = new Date();
                const isValid = now >= coupon.startDate &&
                    now <= coupon.endDate &&
                    (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
                    (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount);

                if (isValid) {
                    if (coupon.discountType === 'PERCENTAGE') {
                        discount = Math.round(subtotal * coupon.discountValue / 100);
                        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                            discount = coupon.maxDiscount;
                        }
                    } else {
                        discount = coupon.discountValue;
                    }
                    if (discount > subtotal) discount = subtotal;
                    couponId = coupon.id;
                }
            }
        }

        const total = subtotal + shippingFee - discount;

        // Create order in transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    orderNumber: generateOrderNumber(),
                    userId: userId,
                    addressId: addressId,
                    status: 'PENDING',
                    subtotal,
                    shippingFee,
                    discount,
                    total,
                    paymentMethod: paymentMethod || 'COD',
                    note: note || null,
                    couponId,
                    items: {
                        create: cart.items.map(item => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: item.variant.pricing?.salePrice || item.variant.pricing?.basePrice || 0
                        }))
                    }
                }
            });

            // Update inventory - decrement quantity
            for (const item of cart.items) {
                await tx.inventory.update({
                    where: { variantId: item.variantId },
                    data: {
                        quantity: { decrement: item.quantity }
                    }
                });
            }

            // Update coupon usage count
            if (couponId) {
                await tx.coupon.update({
                    where: { id: couponId },
                    data: { usedCount: { increment: 1 } }
                });
            }

            // Clear cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            // Create status history
            await tx.orderStatusHistory.create({
                data: {
                    orderId: newOrder.id,
                    status: 'PENDING',
                    note: 'Đơn hàng được tạo',
                    changedBy: userId
                }
            });

            return newOrder;
        });

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                total: order.total
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Có lỗi xảy ra khi tạo đơn hàng' }, { status: 500 });
    }
}

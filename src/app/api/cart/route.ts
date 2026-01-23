import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to get or create cart
async function getOrCreateCart(userId: string | null) {
    if (userId) {
        // For logged-in users
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                                pricing: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            try {
                cart = await prisma.cart.create({
                    data: { userId },
                    include: {
                        items: {
                            include: {
                                variant: {
                                    include: {
                                        product: true,
                                        pricing: true,
                                    },
                                },
                            },
                        },
                    },
                });
            } catch (error: any) {
                // Handle foreign key constraint violation (User not found)
                if (error.code === 'P2003') {
                    throw new Error('UserNotFound');
                }
                throw error;
            }
        }

        return cart;
    }

    // For guest users - use cookie-based cart ID
    const cookieStore = await cookies();
    const guestCartId = cookieStore.get('guest_cart_id')?.value;

    if (guestCartId) {
        const cart = await prisma.cart.findUnique({
            where: { id: guestCartId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                                pricing: true,
                            },
                        },
                    },
                },
            },
        });
        if (cart) return cart;
    }

    // Create new guest cart
    const newCart = await prisma.cart.create({
        data: {},
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                            pricing: true,
                        },
                    },
                },
            },
        },
    });

    return newCart;
}

// GET - Get current cart
export async function GET() {
    try {
        const session = await auth();
        const userId = session?.user?.id as string | null;

        const cart = await getOrCreateCart(userId);

        // Set guest cart cookie if needed
        if (!userId && cart) {
            const cookieStore = await cookies();
            cookieStore.set('guest_cart_id', cart.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });
        }

        return NextResponse.json({ cart });
    } catch (error: any) {
        if (error.message === 'UserNotFound') {
            return NextResponse.json({ error: 'User does not exist' }, { status: 401 });
        }
        console.error('GET /api/cart error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.id as string | null;

        const body = await request.json();
        const { variantId, quantity = 1 } = body;

        if (!variantId) {
            return NextResponse.json({ error: 'Variant ID is required' }, { status: 400 });
        }

        const cart = await getOrCreateCart(userId);

        // Check if item already exists
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId,
                },
            },
        });

        if (existingItem) {
            // Update quantity
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            // Add new item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId,
                    quantity,
                },
            });
        }

        // Return updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                                pricing: true,
                            },
                        },
                    },
                },
            },
        });

        // Set guest cart cookie if needed
        if (!userId && cart) {
            const cookieStore = await cookies();
            cookieStore.set('guest_cart_id', cart.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            });
        }

        return NextResponse.json({ cart: updatedCart, message: 'Đã thêm vào giỏ hàng' });
    } catch (error: any) {
        if (error.message === 'UserNotFound') {
            return NextResponse.json({ error: 'User does not exist' }, { status: 401 });
        }
        console.error('POST /api/cart error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update item quantity
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.id as string | null;

        const body = await request.json();
        const { itemId, quantity } = body;

        if (!itemId || quantity === undefined) {
            return NextResponse.json({ error: 'Item ID and quantity are required' }, { status: 400 });
        }

        const cart = await getOrCreateCart(userId);

        // Verify item belongs to this cart
        const item = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id,
            },
        });

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        if (quantity <= 0) {
            // Remove item
            await prisma.cartItem.delete({
                where: { id: itemId },
            });
        } else {
            // Update quantity
            await prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity },
            });
        }

        // Return updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                                pricing: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({ cart: updatedCart });
    } catch (error: any) {
        if (error.message === 'UserNotFound') {
            return NextResponse.json({ error: 'User does not exist' }, { status: 401 });
        }
        console.error('PUT /api/cart error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.id as string | null;

        const { searchParams } = new URL(request.url);
        const itemId = searchParams.get('itemId');

        if (!itemId) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        const cart = await getOrCreateCart(userId);

        // Verify item belongs to this cart
        const item = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id,
            },
        });

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        // Return updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                                pricing: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json({ cart: updatedCart });
    } catch (error: any) {
        if (error.message === 'UserNotFound') {
            return NextResponse.json({ error: 'User does not exist' }, { status: 401 });
        }
        console.error('DELETE /api/cart error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

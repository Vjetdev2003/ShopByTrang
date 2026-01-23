import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// This API is for development only - promotes a user to ADMIN
// DELETE THIS IN PRODUCTION!
export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });

        return NextResponse.json({
            success: true,
            message: `User ${email} is now an ADMIN`,
            user: { id: user.id, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('Make admin error:', error);
        return NextResponse.json({ error: 'User not found or error occurred' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
    try {
        const session = await auth();
        
        return NextResponse.json({
            session,
            hasSession: !!session,
            user: session?.user || null,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Session debug error:', error);
        return NextResponse.json({
            error: 'Failed to get session',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
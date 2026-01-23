
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        },
    },
});

async function main() {
    console.log('--- DIAGNOSTIC START ---');

    // Parse and log connection details (masking password)
    const url = process.env.DATABASE_URL || '';
    const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
    console.log(`Connection String: ${maskedUrl}`);

    // Extract DB Name manually for verification
    try {
        const urlObj = new URL(url);
        console.log(`Target Host: ${urlObj.hostname}`);
        console.log(`Target Port: ${urlObj.port}`);
        console.log(`Target Database: ${urlObj.pathname.replace('/', '')}`);
    } catch (e) {
        console.log('Could not parse URL standardly');
    }

    try {
        const productCount = await prisma.product.count();
        console.log(`Total Products in DB: ${productCount}`);

        if (productCount > 0) {
            const products = await prisma.product.findMany({
                take: 3,
                select: { id: true, name: true, slug: true }
            });
            console.log('Sample Products:', products);
        } else {
            console.log('Database is empty.');
        }
    } catch (e) {
        console.error('Connection Error:', e.message);
    }

    console.log('--- DIAGNOSTIC END ---');
}

main().finally(() => prisma.$disconnect());

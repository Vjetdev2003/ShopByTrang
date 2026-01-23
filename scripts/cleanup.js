
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanData() {
    try {
        console.log('Starting cleanup...');

        // 1. Delete OrderItems (depend on Variants and Orders)
        console.log('Deleting OrderItems...');
        await prisma.orderItem.deleteMany({});

        // 2. Delete Orders (now empty of items)
        console.log('Deleting Orders...');
        await prisma.order.deleteMany({});

        // 3. Delete Reviews (depend on Products and Users)
        console.log('Deleting Reviews...');
        await prisma.review.deleteMany({});

        // 4. Delete Inventory (depend on Variants)
        console.log('Deleting Inventory...');
        await prisma.inventory.deleteMany({});

        // 5. Delete Pricing (depend on Variants)
        console.log('Deleting Pricing...');
        await prisma.pricing.deleteMany({});

        // 6. Delete Variants (depend on Products)
        console.log('Deleting Variants...');
        await prisma.variant.deleteMany({});

        // 7. Delete Products (depend on Categories)
        console.log('Deleting Products...');
        await prisma.product.deleteMany({});

        // Optional: Delete Categories if needed, but user didn't explicitly ask. 
        // Keeping categories might be useful.

        console.log('Cleanup completed successfully.');
    } catch (error) {
        console.error('Error cleaning data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanData();


const { PrismaClient } = require('@prisma/client');

// Local DB Client
const localPrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:2003@localhost:5432/ShopByTrang?schema=public",
        },
    },
});

// Cloud DB Client (Neon)
const cloudPrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://neondb_owner:npg_DBlkz93SKMNf@ep-lingering-flower-a1y0rezw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
        },
    },
});

async function migrate() {
    console.log('🔄 Starting migration from Local to Cloud...');

    try {
        // 1. Migrate Users
        console.log('Migrating Users...');
        const users = await localPrisma.user.findMany();
        for (const user of users) {
            // Check if exists to avoid duplicates
            const exists = await cloudPrisma.user.findUnique({ where: { id: user.id } });
            if (!exists) {
                await cloudPrisma.user.create({ data: user });
            }
        }
        console.log(`✅ Migrated ${users.length} users.`);

        // 2. Migrate Categories
        console.log('Migrating Categories...');
        const categories = await localPrisma.category.findMany();
        for (const cat of categories) {
            const exists = await cloudPrisma.category.findUnique({ where: { slug: cat.slug } });
            if (!exists) {
                await cloudPrisma.category.create({ data: cat });
            } else {
                // Update if exists (to match local)
                await cloudPrisma.category.update({
                    where: { slug: cat.slug },
                    data: cat
                });
            }
        }
        console.log(`✅ Migrated ${categories.length} categories.`);

        // 3. Migrate Products
        console.log('Migrating Products...');
        const products = await localPrisma.product.findMany();
        for (const product of products) {
            const exists = await cloudPrisma.product.findUnique({ where: { id: product.id } });
            if (!exists) {
                await cloudPrisma.product.create({ data: product });
            }
        }
        console.log(`✅ Migrated ${products.length} products.`);

        // 4. Migrate Variants (Need to handle relations carefully)
        console.log('Migrating Variants...');
        const variants = await localPrisma.variant.findMany();
        for (const variant of variants) {
            const exists = await cloudPrisma.variant.findUnique({ where: { id: variant.id } });
            if (!exists) {
                // Ensure product exists
                const productExists = await cloudPrisma.product.findUnique({ where: { id: variant.productId } });
                if (productExists) {
                    await cloudPrisma.variant.create({ data: variant });
                }
            }
        }
        console.log(`✅ Migrated ${variants.length} variants.`);

        // 5. Migrate Pricing
        console.log('Migrating Pricing...');
        const pricings = await localPrisma.pricing.findMany();
        for (const pricing of pricings) {
            const exists = await cloudPrisma.pricing.findUnique({ where: { id: pricing.id } });
            if (!exists) {
                const variantExists = await cloudPrisma.variant.findUnique({ where: { id: pricing.variantId } });
                if (variantExists) {
                    await cloudPrisma.pricing.create({ data: pricing });
                }
            }
        }
        console.log(`✅ Migrated ${pricings.length} pricings.`);

        // 6. Migrate Inventory
        console.log('Migrating Inventory...');
        const inventories = await localPrisma.inventory.findMany();
        for (const inv of inventories) {
            const exists = await cloudPrisma.inventory.findUnique({ where: { id: inv.id } });
            if (!exists) {
                const variantExists = await cloudPrisma.variant.findUnique({ where: { id: inv.variantId } });
                if (variantExists) {
                    await cloudPrisma.inventory.create({ data: inv });
                }
            }
        }
        console.log(`✅ Migrated ${inventories.length} inventory records.`);

        // 7. Migrate Addresses
        console.log('Migrating Addresses...');
        const addresses = await localPrisma.address.findMany();
        for (const addr of addresses) {
            const exists = await cloudPrisma.address.findUnique({ where: { id: addr.id } });
            if (!exists) {
                const userExists = await cloudPrisma.user.findUnique({ where: { id: addr.userId } });
                if (userExists) {
                    await cloudPrisma.address.create({ data: addr });
                }
            }
        }
        console.log(`✅ Migrated ${addresses.length} addresses.`);

        // 8. Migrate Shipping Zones
        console.log('Migrating Shipping Zones...');
        const zones = await localPrisma.shippingZone.findMany();
        for (const zone of zones) {
            const exists = await cloudPrisma.shippingZone.findUnique({ where: { id: zone.id } });
            if (!exists) {
                await cloudPrisma.shippingZone.create({ data: zone });
            }
        }
        console.log(`✅ Migrated ${zones.length} shipping zones.`);

        // 9. Migrate Coupons
        console.log('Migrating Coupons...');
        const coupons = await localPrisma.coupon.findMany();
        for (const coupon of coupons) {
            const exists = await cloudPrisma.coupon.findUnique({ where: { code: coupon.code } });
            if (!exists) {
                await cloudPrisma.coupon.create({ data: coupon });
            }
        }
        console.log(`✅ Migrated ${coupons.length} coupons.`);

        // orders migration if needed... skipping for safety unless requested heavily

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await localPrisma.$disconnect();
        await cloudPrisma.$disconnect();
    }
}

migrate();


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            name: { contains: 'Áo dài lụa vẽ tay' }
        },
        include: {
            variants: true
        }
    });

    console.log('Found products:', products.length);
    for (const p of products) {
        console.log(`Product: ${p.name}`);
        for (const v of p.variants) {
            console.log(`  Variant SKU: ${v.sku}`);
            console.log(`  Images Raw:`, v.images);
            try {
                const parsed = JSON.parse(v.images as any);
                console.log(`  Images Parsed:`, parsed);
            } catch (e) {
                console.log(`  Parse Error:`, e);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

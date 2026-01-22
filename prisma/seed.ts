import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        slug: 'ao-dai',
        name: 'Áo Dài',
        nameVi: 'Áo Dài',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'du-xuan',
        name: 'Du Xuân',
        nameVi: 'Du Xuân',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'nang-tho',
        name: 'Nàng Thơ',
        nameVi: 'Nàng Thơ',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        slug: 'summer',
        name: 'Summer Collection',
        nameVi: 'Bộ Sưu Tập Hè',
        sortOrder: 4,
      },
    }),
  ]);

  // Create products with variants - Based on BY TRANG style
  const products = [
    // ÁO DÀI COLLECTION
    {
      slug: 'ao-dai-lua-hong-pastel',
      name: 'Áo Dài Lụa Hồng Pastel',
      description: 'Áo dài lụa cao cấp màu hồng pastel nhẹ nhàng, thiết kế cổ điển với đường may tinh tế. Phù hợp cho các dịp lễ tết, cưới hỏi.',
      categoryId: categories[0].id,
      tags: ['áo dài', 'lụa', 'hồng pastel', 'cổ điển'],
      variants: [
        {
          sku: 'AD-LHP-S',
          color: 'Hồng Pastel',
          colorHex: '#FFB6C1',
          size: 'S',
          images: ['/products/ao-dai-hong-pastel-1.jpg', '/products/ao-dai-hong-pastel-2.jpg'],
          basePrice: 2800000,
          salePrice: 2500000,
          quantity: 12,
        },
        {
          sku: 'AD-LHP-M',
          color: 'Hồng Pastel',
          colorHex: '#FFB6C1',
          size: 'M',
          images: ['/products/ao-dai-hong-pastel-1.jpg', '/products/ao-dai-hong-pastel-2.jpg'],
          basePrice: 2800000,
          salePrice: 2500000,
          quantity: 15,
        },
        {
          sku: 'AD-LHP-L',
          color: 'Hồng Pastel',
          colorHex: '#FFB6C1',
          size: 'L',
          images: ['/products/ao-dai-hong-pastel-1.jpg', '/products/ao-dai-hong-pastel-2.jpg'],
          basePrice: 2800000,
          salePrice: 2500000,
          quantity: 10,
        },
      ],
    },
    {
      slug: 'ao-dai-trang-hoa-sen',
      name: 'Áo Dài Trắng Hoa Sen',
      description: 'Áo dài trắng tinh khôi với họa tiết hoa sen thêu tay tinh xảo. Biểu tượng của sự thanh khiết và nét đẹp truyền thống Việt Nam.',
      categoryId: categories[0].id,
      tags: ['áo dài', 'trắng', 'hoa sen', 'thêu tay'],
      variants: [
        {
          sku: 'AD-THS-S',
          color: 'Trắng',
          colorHex: '#FFFFFF',
          size: 'S',
          images: ['/products/ao-dai-trang-hoa-sen-1.jpg', '/products/ao-dai-trang-hoa-sen-2.jpg'],
          basePrice: 3200000,
          quantity: 8,
        },
        {
          sku: 'AD-THS-M',
          color: 'Trắng',
          colorHex: '#FFFFFF',
          size: 'M',
          images: ['/products/ao-dai-trang-hoa-sen-1.jpg', '/products/ao-dai-trang-hoa-sen-2.jpg'],
          basePrice: 3200000,
          quantity: 12,
        },
      ],
    },
    {
      slug: 'ao-dai-do-cam-tham',
      name: 'Áo Dài Đỏ Cẩm Thạm',
      description: 'Áo dài màu đỏ cẩm thạm sang trọng, chất liệu lụa cao cấp. Thiết kế hiện đại nhưng vẫn giữ được nét truyền thống.',
      categoryId: categories[0].id,
      tags: ['áo dài', 'đỏ cẩm thạm', 'sang trọng', 'hiện đại'],
      variants: [
        {
          sku: 'AD-DCT-S',
          color: 'Đỏ Cẩm Thạm',
          colorHex: '#8B0000',
          size: 'S',
          images: ['/products/ao-dai-do-cam-tham-1.jpg', '/products/ao-dai-do-cam-tham-2.jpg'],
          basePrice: 2900000,
          quantity: 10,
        },
        {
          sku: 'AD-DCT-M',
          color: 'Đỏ Cẩm Thạm',
          colorHex: '#8B0000',
          size: 'M',
          images: ['/products/ao-dai-do-cam-tham-1.jpg', '/products/ao-dai-do-cam-tham-2.jpg'],
          basePrice: 2900000,
          quantity: 14,
        },
      ],
    },

    // DU XUÂN COLLECTION
    {
      slug: 'dam-du-xuan-do-ruc',
      name: 'Đầm Du Xuân Đỏ Rực',
      description: 'Đầm du xuân màu đỏ rực rỡ, thiết kế A-line thanh lịch. Mang lại may mắn và thịnh vượng cho năm mới.',
      categoryId: categories[1].id,
      tags: ['đầm', 'du xuân', 'đỏ rực', 'may mắn'],
      variants: [
        {
          sku: 'DDX-DR-S',
          color: 'Đỏ Rực',
          colorHex: '#DC143C',
          size: 'S',
          images: ['/products/dam-du-xuan-do-ruc-1.jpg', '/products/dam-du-xuan-do-ruc-2.jpg'],
          basePrice: 1800000,
          salePrice: 1500000,
          quantity: 20,
        },
        {
          sku: 'DDX-DR-M',
          color: 'Đỏ Rực',
          colorHex: '#DC143C',
          size: 'M',
          images: ['/products/dam-du-xuan-do-ruc-1.jpg', '/products/dam-du-xuan-do-ruc-2.jpg'],
          basePrice: 1800000,
          salePrice: 1500000,
          quantity: 25,
        },
      ],
    },
    {
      slug: 'set-ao-quan-xuan-vang',
      name: 'Set Áo Quần Xuân Vàng',
      description: 'Bộ set áo quần màu vàng tươi, phong cách hiện đại cho mùa xuân. Chất liệu cotton cao cấp, thoải mái cả ngày.',
      categoryId: categories[1].id,
      tags: ['set', 'xuân', 'vàng tươi', 'hiện đại'],
      variants: [
        {
          sku: 'SAQ-XV-S',
          color: 'Vàng Tươi',
          colorHex: '#FFD700',
          size: 'S',
          images: ['/products/set-ao-quan-xuan-vang-1.jpg', '/products/set-ao-quan-xuan-vang-2.jpg'],
          basePrice: 1600000,
          quantity: 18,
        },
        {
          sku: 'SAQ-XV-M',
          color: 'Vàng Tươi',
          colorHex: '#FFD700',
          size: 'M',
          images: ['/products/set-ao-quan-xuan-vang-1.jpg', '/products/set-ao-quan-xuan-vang-2.jpg'],
          basePrice: 1600000,
          quantity: 22,
        },
      ],
    },

    // NÀNG THƠ COLLECTION
    {
      slug: 'dam-nang-tho-xanh-mint',
      name: 'Đầm Nàng Thơ Xanh Mint',
      description: 'Đầm nàng thơ màu xanh mint nhẹ nhàng, thiết kế xòe nhẹ tôn dáng. Phong cách nữ tính và thanh lịch.',
      categoryId: categories[2].id,
      tags: ['đầm', 'nàng thơ', 'xanh mint', 'nữ tính'],
      variants: [
        {
          sku: 'DNT-XM-S',
          color: 'Xanh Mint',
          colorHex: '#98FB98',
          size: 'S',
          images: ['/products/dam-nang-tho-xanh-mint-1.jpg', '/products/dam-nang-tho-xanh-mint-2.jpg'],
          basePrice: 2200000,
          quantity: 15,
        },
        {
          sku: 'DNT-XM-M',
          color: 'Xanh Mint',
          colorHex: '#98FB98',
          size: 'M',
          images: ['/products/dam-nang-tho-xanh-mint-1.jpg', '/products/dam-nang-tho-xanh-mint-2.jpg'],
          basePrice: 2200000,
          quantity: 18,
        },
      ],
    },
    {
      slug: 'ao-so-mi-nang-tho-trang',
      name: 'Áo Sơ Mi Nàng Thơ Trắng',
      description: 'Áo sơ mi trắng basic với thiết kế cổ peter pan dễ thương. Chất liệu cotton mềm mại, phù hợp đi làm và dạo phố.',
      categoryId: categories[2].id,
      tags: ['áo sơ mi', 'trắng', 'peter pan', 'basic'],
      variants: [
        {
          sku: 'ASM-NT-S',
          color: 'Trắng',
          colorHex: '#FFFFFF',
          size: 'S',
          images: ['/products/ao-so-mi-nang-tho-trang-1.jpg', '/products/ao-so-mi-nang-tho-trang-2.jpg'],
          basePrice: 980000,
          quantity: 25,
        },
        {
          sku: 'ASM-NT-M',
          color: 'Trắng',
          colorHex: '#FFFFFF',
          size: 'M',
          images: ['/products/ao-so-mi-nang-tho-trang-1.jpg', '/products/ao-so-mi-nang-tho-trang-2.jpg'],
          basePrice: 980000,
          quantity: 30,
        },
      ],
    },

    // SUMMER COLLECTION
    {
      slug: 'dam-maxi-he-hoa-tiet',
      name: 'Đầm Maxi Hè Họa Tiết',
      description: 'Đầm maxi dài tay với họa tiết hoa nhí xinh xắn. Chất liệu voan mát mẻ, thích hợp cho mùa hè.',
      categoryId: categories[3].id,
      tags: ['đầm maxi', 'hè', 'họa tiết hoa', 'voan'],
      variants: [
        {
          sku: 'DMH-HT-S',
          color: 'Họa Tiết Hoa',
          colorHex: '#FFE4E1',
          size: 'S',
          images: ['/products/dam-maxi-he-hoa-tiet-1.jpg', '/products/dam-maxi-he-hoa-tiet-2.jpg'],
          basePrice: 1400000,
          quantity: 20,
        },
        {
          sku: 'DMH-HT-M',
          color: 'Họa Tiết Hoa',
          colorHex: '#FFE4E1',
          size: 'M',
          images: ['/products/dam-maxi-he-hoa-tiet-1.jpg', '/products/dam-maxi-he-hoa-tiet-2.jpg'],
          basePrice: 1400000,
          quantity: 24,
        },
      ],
    },
    {
      slug: 'set-crop-top-chan-vay-he',
      name: 'Set Crop Top Chân Váy Hè',
      description: 'Bộ set crop top và chân váy xòe, phong cách trẻ trung năng động. Màu sắc tươi mát cho mùa hè.',
      categoryId: categories[3].id,
      tags: ['set', 'crop top', 'chân váy', 'trẻ trung'],
      variants: [
        {
          sku: 'SCT-CV-S',
          color: 'Xanh Dương',
          colorHex: '#87CEEB',
          size: 'S',
          images: ['/products/set-crop-top-chan-vay-he-1.jpg', '/products/set-crop-top-chan-vay-he-2.jpg'],
          basePrice: 1200000,
          quantity: 22,
        },
        {
          sku: 'SCT-CV-M',
          color: 'Xanh Dương',
          colorHex: '#87CEEB',
          size: 'M',
          images: ['/products/set-crop-top-chan-vay-he-1.jpg', '/products/set-crop-top-chan-vay-he-2.jpg'],
          basePrice: 1200000,
          quantity: 28,
        },
      ],
    },
  ];

  for (const productData of products) {
    const { variants, tags, ...productInfo } = productData;

    const product = await prisma.product.create({
      data: {
        ...productInfo,
        tags: JSON.stringify(tags) as any,
        status: 'ACTIVE',
      },
    });

    for (const variantData of variants) {
      const { basePrice, quantity, images, ...rest } = variantData;
      const salePrice = 'salePrice' in variantData ? variantData.salePrice : undefined;

      const variantDetails = { ...rest };
      if ('salePrice' in variantDetails) {
        delete (variantDetails as any).salePrice;
      }

      const variant = await prisma.variant.create({
        data: {
          ...variantDetails,
          images: JSON.stringify(images) as any,
          productId: product.id,
        },
      });

      // Create pricing
      await prisma.pricing.create({
        data: {
          variantId: variant.id,
          basePrice,
          salePrice: salePrice || null,
          saleStart: salePrice ? new Date() : null,
          saleEnd: salePrice ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days
        },
      });

      // Create inventory
      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          quantity,
        },
      });
    }
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { prisma } from "@/lib/db/prisma";
import Header from "@/components/Header";
import VideoHero from "@/components/VideoHero";
import CollectionGrid from "@/components/CollectionGrid";
import NewArrivals from "@/components/NewArrivals";
import NeonFooterBlock from "@/components/NeonFooterBlock";

// Fetch new arrivals
export const dynamic = 'force-dynamic';

async function getNewArrivals() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: {
      variants: {
        include: { pricing: true },
      },
    },
  });
  return products;
}

export default async function Home() {
  const products = await getNewArrivals();

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Video Hero Section */}
      <VideoHero />

      {/* Luxury Collections Grid */}
      <CollectionGrid />

      {/* Editorial New Arrivals */}
      <NewArrivals products={products} />

      {/* Neon Footer Block */}
      <NeonFooterBlock />

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <h3 className="text-xl font-light tracking-wider mb-2">BY TRANG</h3>
            <p className="text-xs text-neutral-400 tracking-widest mb-4">SINCE 2002</p>
            <p className="text-sm text-neutral-400">
              Thương hiệu thời trang Việt Nam, mang đến vẻ đẹp tinh tế và thanh lịch.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-4 tracking-wider">CỬA HÀNG</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>47 Ông Ích Khiêm, Huế</li>
              <li>31 Chu Văn An, Huế</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-4 tracking-wider">LIÊN HỆ</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>0935 136 369</li>
              <li>088 681 12 87</li>
              <li>bytrang.since2002@gmail.com</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-4 tracking-wider">THEO DÕI</h4>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/profile.php?id=100095235105173" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                Facebook
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-4 tracking-wider">ĐỐI TÁC</h4>
            <div className="grid grid-cols-3 gap-3">
              <a href="https://baga.com.vn/" target="_blank" rel="noopener noreferrer" className="h-10 w-16 flex items-center justify-center">
                <img src="/partners/baga.png" alt="BAGA" className="max-h-full max-w-full opacity-70 hover:opacity-100 transition-opacity object-contain" />
              </a>
              <a href="https://www.facebook.com/tiembanhganh2" target="_blank" rel="noopener noreferrer" className="h-10 w-16 flex items-center justify-center">
                <img src="/partners/banh-ganh-white.png" alt="Bánh Gánh" className="max-h-full max-w-full opacity-70 hover:opacity-100 transition-opacity object-contain" />
              </a>
              <a href="https://www.facebook.com/banhganhrestaurant" target="_blank" rel="noopener noreferrer" className="h-10 w-16 flex items-center justify-center">
                <img src="/partners/banh-ganh-green.png" alt="Bánh Gánh Restaurant" className="max-h-full max-w-full opacity-70 hover:opacity-100 transition-opacity object-contain" />
              </a>
              <a href="https://www.facebook.com/hottuna37" target="_blank" rel="noopener noreferrer" className="h-10 w-16 flex items-center justify-center">
                <img src="/partners/hottuna.png" alt="Hottuna" className="max-h-full max-w-full opacity-70 hover:opacity-100 transition-opacity object-contain" />
              </a>
              <a href="https://www.facebook.com/ech.op.1426" target="_blank" rel="noopener noreferrer" className="h-10 w-16 flex items-center justify-center">
                <img src="/partners/ech-op.png" alt="Ếch Ộp" className="max-h-full max-w-full opacity-70 hover:opacity-100 transition-opacity object-contain" />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
          © 2026 BY TRANG. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

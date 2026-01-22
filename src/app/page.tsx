'use client';

import Header from "@/components/Header";
import VideoHero from "@/components/VideoHero";
import CollectionGrid from "@/components/CollectionGrid";
import NewArrivals from "@/components/NewArrivals";
import NeonFooterBlock from "@/components/NeonFooterBlock";
// import VideoShowcase from "@/components/VideoShowcase";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Video Hero Section */}
      <VideoHero />

      {/* Luxury Collections Grid */}
      <CollectionGrid />

      {/* Editorial New Arrivals */}
      <NewArrivals />

      {/* Video Showcase - Hidden until videos are available
      <VideoShowcase />
      */}

      {/* Neon Footer Block */}
      <NeonFooterBlock />

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
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
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
          © 2026 BY TRANG. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

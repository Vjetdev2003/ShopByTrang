'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface VideoSection {
  id: string;
  videoUrl: string;
  posterUrl: string;
  title: string;
  subtitle: string;
  description: string;
  productSlug: string;
  price: string;
  originalPrice?: string;
  ctaText: string;
  features: string[];
}

const videoSections: VideoSection[] = [
  {
    id: '1',
    videoUrl: '/videos/ao-dai-showcase.mp4',
    posterUrl: '/images/613682871_728387587012405_854151880740947198_n.jpg',
    title: 'Áo Dài Truyền Thống',
    subtitle: 'Vẻ đẹp tinh tế của phụ nữ Việt',
    description: 'Khám phá bộ sưu tập áo dài lụa cao cấp với họa tiết thêu tay tinh xảo, thể hiện nét đẹp truyền thống và hiện đại của phụ nữ Việt Nam.',
    productSlug: 'ao-dai',
    price: '2.200.000₫',
    originalPrice: '2.500.000₫',
    ctaText: 'Khám Phá Bộ Sưu Tập',
    features: ['Lụa cao cấp', 'Thêu tay tinh xảo', 'Thiết kế truyền thống', 'Made in Vietnam'],
  },
  {
    id: '2',
    videoUrl: '/videos/du-xuan-showcase.mp4',
    posterUrl: '/images/614517017_728387570345740_8735693880269548847_n.jpg',
    title: 'Bộ Sưu Tập Du Xuân',
    subtitle: 'Chào đón năm mới với phong cách',
    description: 'Những thiết kế đầm du xuân rực rỡ, mang đến may mắn và thịnh vượng cho năm mới. Phong cách hiện đại kết hợp nét truyền thống.',
    productSlug: 'du-xuan',
    price: '1.500.000₫',
    originalPrice: '1.800.000₫',
    ctaText: 'Mua Ngay',
    features: ['Màu sắc rực rỡ', 'Thiết kế hiện đại', 'Chất liệu cao cấp', 'Limited Edition'],
  },
  {
    id: '3',
    videoUrl: '/videos/nang-tho-showcase.mp4',
    posterUrl: '/images/614587663_728387610345736_7039176811692822144_n.jpg',
    title: 'Nàng Thơ Collection',
    subtitle: 'Thanh lịch & Nữ tính',
    description: 'Bộ sưu tập nàng thơ với những gam màu nhẹ nhàng, thiết kế tinh tế cho phụ nữ hiện đại. Thể hiện sự thanh lịch và nữ tính.',
    productSlug: 'nang-tho',
    price: '2.200.000₫',
    ctaText: 'Xem Thêm',
    features: ['Gam màu nhẹ nhàng', 'Thiết kế tinh tế', 'Phong cách thanh lịch', 'Versatile'],
  },
];

// Gradient backgrounds for each section
const gradientBackgrounds = [
  'bg-gradient-to-br from-pink-200 via-pink-300 to-rose-400', // Áo Dài - Pink theme
  'bg-gradient-to-br from-red-300 via-red-400 to-red-500',   // Du Xuân - Red theme  
  'bg-gradient-to-br from-green-200 via-emerald-300 to-teal-400', // Nàng Thơ - Green theme
];

export default function VideoShowcase() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Intersection Observer để tự động phát video khi scroll đến
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = sectionRefs.current.findIndex(ref => ref === entry.target);
          if (index !== -1) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              setCurrentSection(index);
              playVideo(index);
            } else {
              pauseVideo(index);
            }
          }
        });
      },
      {
        threshold: [0.5],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const playVideo = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.play().catch(() => {
        console.log('Autoplay prevented');
      });
      setIsPlaying(true);
    }
  };

  const pauseVideo = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        playVideo(index);
      } else {
        pauseVideo(index);
      }
    }
  };

  const toggleMute = () => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = !isMuted;
      }
    });
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative">
      {videoSections.map((section, index) => (
        <div
          key={section.id}
          ref={(el) => {
            sectionRefs.current[index] = el;
          }}
          className="relative h-screen w-full overflow-hidden"
        >
          {/* Split Layout Container */}
          <div className="flex h-full">
            {/* Left Side - Content */}
            <div className="w-1/2 bg-white flex items-center justify-center p-8 lg:p-16">
              <div className="max-w-lg">
                <div className="mb-6">
                  <h2 className="text-4xl lg:text-6xl font-light tracking-wider mb-4 text-neutral-900 leading-tight">
                    {section.title}
                  </h2>
                  <p className="text-xl lg:text-2xl font-light mb-6 text-neutral-600">
                    {section.subtitle}
                  </p>
                </div>

                <p className="text-lg mb-8 text-neutral-700 leading-relaxed">
                  {section.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <ul className="grid grid-cols-2 gap-2">
                    {section.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-neutral-600">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl font-light text-neutral-900">
                    {section.price}
                  </span>
                  {section.originalPrice && (
                    <>
                      <span className="text-xl text-neutral-400 line-through">
                        {section.originalPrice}
                      </span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        SALE
                      </span>
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={`/${section.productSlug}`}
                  className="inline-block bg-neutral-900 text-white px-8 py-4 text-lg font-medium tracking-wider hover:bg-neutral-800 transition-all duration-300 transform hover:scale-105"
                >
                  {section.ctaText}
                </Link>

                {/* Section Indicator */}
                <div className="flex gap-2 mt-12">
                  {videoSections.map((_, i) => (
                    <div
                      key={i}
                      className={`w-12 h-1 rounded-full transition-all duration-300 ${
                        i === index ? 'bg-neutral-900' : 'bg-neutral-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Video */}
            <div className="w-1/2 relative">
              {/* Video Element */}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                className="absolute inset-0 w-full h-full object-cover"
                poster={section.posterUrl}
                muted={isMuted}
                loop
                playsInline
                preload="metadata"
                style={{ display: 'none' }} // Hide video for now, show gradient
              >
                <source src={section.videoUrl} type="video/mp4" />
              </video>

              {/* Gradient Background (fallback and main display) */}
              <div className={`absolute inset-0 ${gradientBackgrounds[index]}`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-light mb-2">{section.title}</h3>
                    <p className="text-lg opacity-80">{section.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-8 right-8 flex gap-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => togglePlay(index)}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>

                  {/* Mute/Unmute Button */}
                  <button
                    onClick={toggleMute}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Scroll Indicator (only on first section) */}
              {index === 0 && (
                <div className="absolute bottom-8 left-8 text-white animate-bounce">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm opacity-80">Cuộn xuống</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
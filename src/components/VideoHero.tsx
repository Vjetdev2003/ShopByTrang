'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface VideoHeroProps {
    videoSrc?: string;
    posterSrc?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
}

export default function VideoHero({
    videoSrc = '/videos/introduction.mp4',
    posterSrc,
    title = 'Bộ Sưu Tập Xuân 2026',
    subtitle = 'Khám phá vẻ đẹp tinh tế của thời trang Việt',
    ctaText = 'Khám Phá Ngay',
    ctaLink = '/du-xuan',
}: VideoHeroProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            // Check if video is already ready (e.g. from cache)
            if (video.readyState >= 3) {
                setIsLoaded(true);
            }

            video.play().catch(() => {
                // Autoplay failed, user interaction required
                setIsPlaying(false);
            });
        }

        // Fallback: Show video after 1s anyway to prevent permanent black screen
        const timeout = setTimeout(() => setIsLoaded(true), 1000);
        return () => clearTimeout(timeout);
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (video) {
            if (isPlaying) {
                video.pause();
            } else {
                video.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (video) {
            video.muted = !video.muted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <section className="relative h-[80vh] flex items-center justify-center bg-white overflow-hidden">
            <div className="relative w-full h-full overflow-hidden bg-black">
                {/* Video */}
                <video
                    ref={videoRef}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    src={videoSrc}
                    poster={posterSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    onLoadedData={() => setIsLoaded(true)}
                />

                {/* Gradient Overlay - lighter since no text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Video Controls - Bottom Left */}
                <div className="absolute bottom-6 left-6 flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                        aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mute Button - Bottom Right */}
                <div className="absolute bottom-6 right-6">
                    <button
                        onClick={toggleMute}
                        className="w-12 h-12 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                        aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                    >
                        {isMuted ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </section>
    );
}

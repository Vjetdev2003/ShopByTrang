'use client';

export default function NeonFooterBlock() {
    return (
        <div className="w-full overflow-hidden">
            <style jsx>{`
                .neon-container {
                    width: 100%;
                    min-height: 280px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: radial-gradient(ellipse at center, rgba(60, 50, 40, 0.4) 0%, rgba(0, 0, 0, 1) 70%);
                }
                .neon-text {
                    font-family: 'Playfair Display', serif;
                    font-size: 5rem;
                    font-weight: 400;
                    font-style: italic;
                    letter-spacing: 0.3rem;
                    color: #F5F0E6;
                    text-shadow: 
                        0 0 20px rgba(255, 248, 230, 0.6),
                        0 0 40px rgba(255, 235, 200, 0.4),
                        0 0 60px rgba(255, 220, 180, 0.2);
                }
                @media (max-width: 768px) {
                    .neon-text {
                        font-size: 2.5rem;
                        letter-spacing: 0.15rem;
                    }
                    .neon-container {
                        min-height: 180px;
                    }
                }
            `}</style>
            <div className="neon-container">
                <h2 className="neon-text">BY TRANG</h2>
            </div>
        </div>
    );
}

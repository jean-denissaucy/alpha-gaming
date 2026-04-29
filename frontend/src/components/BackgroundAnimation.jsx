import { useMemo } from 'react';
import backgroundVideo from '../assets/branding/espace game.mp4';

function pseudoRandom(seed) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function BackgroundAnimation() {
    const particles = useMemo(() => (
        Array.from({ length: 80 }, (_, index) => ({
            id: index,
            left: `${pseudoRandom(index + 1) * 100}vw`,
            duration: `${5 + pseudoRandom(index + 11) * 10}s`,
            delay: `${pseudoRandom(index + 21) * 10}s`,
            opacity: 0.2 + pseudoRandom(index + 31) * 0.8,
            size: 2 + pseudoRandom(index + 41) * 3
        }))
    ), []);

    return (
        <div className="site-bg-animation" aria-hidden="true">
            <video
                className="site-bg-video"
                src={backgroundVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
            />
            <div className="site-bg-overlay" />
            {particles.map((particle) => (
                <span
                    key={particle.id}
                    className="site-particle"
                    style={{
                        left: particle.left,
                        animationDuration: particle.duration,
                        animationDelay: particle.delay,
                        opacity: particle.opacity,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`
                    }}
                />
            ))}
        </div>
    );
}

export default BackgroundAnimation;

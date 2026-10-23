import React, { useEffect, useRef } from 'react';

/**
 * BackgroundAnimation (Cinematic Game Engine Canvas):
 * Features:
 * - Fixed particle memory pool (zero GC overhead).
 * - Automatic visibility pause via document.hidden (conserves mobile CPU & battery).
 * - Resolution-aware particle capping (prevents mobile crashes).
 * - Hardware-accelerated amber & metallic gold celestial drift glow.
 */
const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let isRunning = true;
    let w = 0;
    let h = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const particles = [];
    const MAX_PARTICLES = window.innerWidth < 768 ? 32 : 55;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initPool();
    };

    const initPool = () => {
      particles.length = 0;
      for (let i = 0; i < MAX_PARTICLES; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.3 + 0.35,
          vy: -(Math.random() * 0.2 + 0.04),
          vx: (Math.random() - 0.5) * 0.06,
          alpha: Math.random() * 0.4 + 0.15,
          color: Math.random() > 0.45 ? 'rgba(212, 175, 55,' : 'rgba(255, 255, 255,'
        });
      }
    };

    const render = () => {
      if (!isRunning) return;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.vy;
        p.x += p.vx;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        else if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resize();
    render();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* 60fps Canvas Particle Stardust Field */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-60 z-0"
      />

      {/* GPU Accelerated Amber & Gold Atmospheric Glow */}
      <div className="fixed -inset-[20%] pointer-events-none z-0 filter blur-[90px] opacity-35">
        <span
          className="absolute w-[45vw] h-[45vw] top-[5%] left-[8%] rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.16), transparent 70%)',
            animationDuration: '16s'
          }}
        />
        <span
          className="absolute w-[40vw] h-[40vw] bottom-[5%] right-[6%] rounded-full"
          style={{
            background: 'radial-gradient(circle at 60% 60%, rgba(245, 158, 11, 0.13), transparent 70%)',
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(BackgroundAnimation);

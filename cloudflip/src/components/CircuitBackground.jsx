import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CircuitBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Circuit paths
    const paths = [
      { x: 100, y: 100, dx: 2, dy: 0, length: 300, direction: 'horizontal' },
      { x: 400, y: 100, dx: 0, dy: 2, length: 200, direction: 'vertical' },
      { x: 200, y: 300, dx: 2, dy: 0, length: 400, direction: 'horizontal' },
      { x: 600, y: 300, dx: 0, dy: 2, length: 250, direction: 'vertical' },
      { x: 150, y: 550, dx: 2, dy: 0, length: 500, direction: 'horizontal' },
      { x: 800, y: 200, dx: -2, dy: 0, length: 350, direction: 'horizontal' },
      { x: 300, y: 50, dx: 0, dy: 2, length: 180, direction: 'vertical' },
      { x: 700, y: 500, dx: 0, dy: -2, length: 200, direction: 'vertical' },
    ];

    // Animated packets
    const packets = paths.map(path => ({
      ...path,
      progress: Math.random() * path.length,
      speed: 1 + Math.random() * 2
    }));

    function drawCircuitBoard() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw circuit paths
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)'; // Gold with transparency
      ctx.lineWidth = 2;

      paths.forEach(path => {
        ctx.beginPath();
        if (path.direction === 'horizontal') {
          ctx.moveTo(path.x, path.y);
          ctx.lineTo(path.x + path.length, path.y);
          // Add nodes
          ctx.arc(path.x, path.y, 3, 0, Math.PI * 2);
          ctx.arc(path.x + path.length, path.y, 3, 0, Math.PI * 2);
        } else {
          ctx.moveTo(path.x, path.y);
          ctx.lineTo(path.x, path.y + path.length);
          // Add nodes
          ctx.arc(path.x, path.y, 3, 0, Math.PI * 2);
          ctx.arc(path.x, path.y + path.length, 3, 0, Math.PI * 2);
        }
        ctx.stroke();
      });

      // Draw animated packets
      ctx.fillStyle = 'rgba(251, 191, 36, 0.8)'; // Bright gold
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.6)';

      packets.forEach(packet => {
        let x, y;
        if (packet.direction === 'horizontal') {
          x = packet.x + packet.progress;
          y = packet.y;
        } else {
          x = packet.x;
          y = packet.y + packet.progress;
        }

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Update progress
        packet.progress += packet.speed;
        if (packet.progress > packet.length) {
          packet.progress = 0;
        }
      });

      ctx.shadowBlur = 0;
    }

    function animate() {
      drawCircuitBoard();
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Navy blue gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a1929] via-[#0f2744] to-[#1a1f3a] -z-10" />
      
      {/* Gold grid overlay */}
      <div 
        className="fixed inset-0 opacity-10 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Animated circuit canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 opacity-40"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Subtle vignette effect */}
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-transparent to-[#0a1929]/50 -z-10" />
    </>
  );
}
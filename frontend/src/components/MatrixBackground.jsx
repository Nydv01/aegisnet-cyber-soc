import React, { useEffect, useRef } from 'react';

/**
 * MatrixBackground renders an interactive, performant falling digits/numbers
 * stream (Matrix rain effect) on a canvas, replacing the laser line grid.
 * The speed, color, and density scale dynamically with simulated network attacks.
 */
export default function MatrixBackground({ attackActive = false, intensity = 0.5 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId;

    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops = Array(columns).fill(1);

    // Characters representing digital stream data packets (binary + hexadecimal)
    const alphabet = '01010101ABCDEF';

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1);
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      // Semi-transparent overlay to create trailing fade effect
      ctx.fillStyle = 'rgba(3, 7, 18, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Randomly pick a character
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        
        // Define color based on active attack state
        if (attackActive) {
          // Under attack: threat red/orange highlight
          if (Math.random() < intensity * 0.4) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.35)'; // Vibrant Threat Red
          } else {
            ctx.fillStyle = 'rgba(34, 211, 238, 0.15)'; // Faded Cyan
          }
        } else {
          // Normal state: glowing cyber cyan/blue shades (cyber feel)
          ctx.fillStyle = Math.random() < 0.15 
            ? 'rgba(34, 211, 238, 0.22)' // Glowing Cyan
            : 'rgba(99, 102, 241, 0.12)'; // Deep Indigo Blue
        }

        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // Reset drops back to top after reaching bottom with random delay offset
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        // Falling speed parameters (faster under attack)
        const fallSpeed = attackActive ? (1 + intensity * 1.5) : 0.8;
        if (Math.random() < fallSpeed) {
          drops[i]++;
        }
      }
    };

    const interval = setInterval(draw, 33); // target ~30fps for smooth visual flow

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [attackActive, intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

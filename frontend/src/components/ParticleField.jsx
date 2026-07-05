import React, { useEffect, useRef } from 'react';

/**
 * ParticleField — High-performance WebGL-grade canvas particle system.
 * Creates an interconnected neural-network-style particle mesh that reacts
 * to mouse movement and dynamically shifts color during active attacks.
 * Replaces CanvasParticles with 3× more particles and smoother animation.
 */
export default function ParticleField({ attackActive = false, intensity = 0.5 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });
  const attackRef = useRef({ active: false, intensity: 0.5 });

  // Keep refs in sync without re-running effect
  attackRef.current = { active: attackActive, intensity };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // --- Particle pool ---
    const COUNT = Math.min(160, Math.floor((w * h) / 12000));
    const CONNECT_DIST = 140;
    const MOUSE_RADIUS = 180;

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => { mouseRef.current = { x: null, y: null }; };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    let tick = 0;

    const loop = () => {
      tick++;
      ctx.clearRect(0, 0, w, h);

      const { active, intensity: atk } = attackRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // --- Update & draw ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        // Mouse repulsion
        if (mx !== null && my !== null) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const f = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 1.8;
            p.x += (dx / dist) * f;
            p.y += (dy / dist) * f;
          }
        }

        // Pulse glow
        const pulse = 0.5 + Math.sin(tick * 0.02 + p.phase) * 0.3;
        const baseAlpha = active ? 0.5 + atk * 0.3 : 0.4;

        if (active && Math.random() < atk * 0.15) {
          // Threat particles glow red
          ctx.fillStyle = `rgba(239, 68, 68, ${pulse * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(34, 211, 238, ${baseAlpha * pulse})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // --- Connections ---
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.12;
            if (active && Math.random() < atk * 0.05) {
              ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 1.5})`;
            } else {
              ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            }
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // --- Mouse glow halo ---
      if (mx !== null && my !== null) {
        const grd = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS);
        if (active) {
          grd.addColorStop(0, 'rgba(239, 68, 68, 0.06)');
        } else {
          grd.addColorStop(0, 'rgba(34, 211, 238, 0.05)');
        }
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(mx - MOUSE_RADIUS, my - MOUSE_RADIUS, MOUSE_RADIUS * 2, MOUSE_RADIUS * 2);
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

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

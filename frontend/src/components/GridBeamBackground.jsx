import React, { useEffect, useRef } from 'react';

/**
 * GridBeamBackground draws a subtle background grid and animates
 * laser-like data packets ("beams") flowing along the grid lines.
 * Replaces the simple particles with a highly structured network grid.
 */
export default function GridBeamBackground({ attackActive = false, intensity = 0.5 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId;

    const gridSpacing = 80;
    const beams = [];
    
    // Configurable speeds and counts based on simulator state
    const maxBeams = attackActive ? 25 : 12;
    const beamBaseSpeed = attackActive ? 3 + intensity * 4 : 1.5;

    class Beam {
      constructor() {
        this.reset();
        // Stagger spawn times initially
        this.progress = Math.random();
      }

      reset() {
        this.progress = 0;
        this.speed = (Math.random() * 0.5 + 0.5) * beamBaseSpeed / 400; // progress steps (0 to 1)
        this.length = Math.random() * 80 + 40;
        
        // Pick horizontal or vertical path
        this.isHorizontal = Math.random() > 0.5;

        if (this.isHorizontal) {
          // Align path on a horizontal grid line
          const lineIndex = Math.floor(Math.random() * (height / gridSpacing));
          this.y = lineIndex * gridSpacing + (height % gridSpacing) / 2;
          this.start = 0;
          this.end = width;
        } else {
          // Align path on a vertical grid line
          const lineIndex = Math.floor(Math.random() * (width / gridSpacing));
          this.x = lineIndex * gridSpacing + (width % gridSpacing) / 2;
          this.start = 0;
          this.end = height;
        }

        this.isForward = Math.random() > 0.5;
        this.color = attackActive 
          ? `rgba(239, 68, 68, ${Math.random() * 0.15 + 0.1})`  // Muted Threat Red
          : `rgba(228, 228, 231, ${Math.random() * 0.15 + 0.08})`; // Polished Silver
      }

      update() {
        this.progress += this.speed;
        if (this.progress >= 1.2) { // Allow trailing fade to complete
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        const currentCoord = this.start + (this.end - this.start) * Math.min(this.progress, 1);
        
        let grad;
        if (this.isHorizontal) {
          const startX = this.isForward 
            ? currentCoord - this.length 
            : currentCoord + this.length;
          const endX = currentCoord;

          grad = ctx.createLinearGradient(startX, this.y, endX, this.y);
          grad.addColorStop(this.isForward ? 0 : 1, 'transparent');
          grad.addColorStop(this.isForward ? 1 : 0, this.color);
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.moveTo(startX, this.y);
          ctx.lineTo(endX, this.y);
        } else {
          const startY = this.isForward 
            ? currentCoord - this.length 
            : currentCoord + this.length;
          const endY = currentCoord;

          grad = ctx.createLinearGradient(this.x, startY, this.x, endY);
          grad.addColorStop(this.isForward ? 0 : 1, 'transparent');
          grad.addColorStop(this.isForward ? 1 : 0, this.color);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.moveTo(this.x, startY);
          ctx.lineTo(this.x, endY);
        }
        ctx.stroke();
      }
    }

    // Initialize beams
    for (let i = 0; i < maxBeams; i++) {
      beams.push(new Beam());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // ── Draw Background Grid Lines ──
      ctx.strokeStyle = attackActive 
        ? 'rgba(239, 68, 68, 0.012)' 
        : 'rgba(228, 228, 231, 0.012)';
      ctx.lineWidth = 0.5;

      // Vertical lines
      const xOffset = (width % gridSpacing) / 2;
      for (let x = xOffset; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      const yOffset = (height % gridSpacing) / 2;
      for (let y = yOffset; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ── Update and Draw Beams ──
      beams.forEach((beam) => {
        beam.update();
        beam.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
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

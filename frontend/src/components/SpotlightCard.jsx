import React, { useRef, useState } from 'react';

/**
 * SpotlightCard with 3D Tilt Effect.
 * Implements mouse coordinate tracking to drive dynamic radial spotlights,
 * and calculates card tilting along the X/Y axes in 3D perspective.
 */
export default function SpotlightCard({ children, className = '', style = {}, ...props }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    // Calculate 3D tilt angles (max 8 degrees tilt to prevent text clipping)
    const tiltX = ((y / rect.height) - 0.5) * -8;
    const tiltY = ((x / rect.width) - 0.5) * 8;

    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    cardRef.current.style.setProperty('--tilt-x', `${tiltX}deg`);
    cardRef.current.style.setProperty('--tilt-y', `${tiltY}deg`);
  };

  const handleMouseLeave = () => {
    setIsFocused(false);
    if (!cardRef.current) return;
    // Reset card tilt
    cardRef.current.style.setProperty('--tilt-x', '0deg');
    cardRef.current.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div
      ref={cardRef}
      className={`glass-card spotlight-card ${isFocused ? 'focused' : ''} ${className}`}
      style={{
        ...style,
        position: 'relative',
        transform: isFocused 
          ? 'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale3d(1.01, 1.01, 1.01)'
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isFocused ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Inner radial light glow spotlight tracking */}
      <div
        className="spotlight-glow"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isFocused ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.06), transparent 80%)`,
          zIndex: 0,
        }}
      />
      {/* Corner hacker ticks */}
      <div className="card-corner top-left" />
      <div className="card-corner top-right" />
      <div className="card-corner bottom-left" />
      <div className="card-corner bottom-right" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

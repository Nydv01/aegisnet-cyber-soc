import React from 'react';

/**
 * Meteors component generates falling data packets / light streaks
 * styled using custom CSS animations to create a premium cinematic vibe.
 */
export default function Meteors({ number = 20 }) {
  const meteorArray = Array.from({ length: number });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {meteorArray.map((_, idx) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = Math.random() * 4 + 2;

        return (
          <span
            key={idx}
            className="meteor-streak"
            style={{
              top: 0,
              left: `${left}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

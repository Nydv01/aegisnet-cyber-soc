import React, { useEffect, useState } from 'react';

/**
 * RadarScan component creates an interactive, SVG-driven circular radar sweep.
 * It visualizes current network conditions by spawning safe (green) and threat (red)
 * blips that pop up dynamically depending on the telemetry's threat level.
 */
export default function RadarScan({ threatLevel = 'safe' }) {
  const [blips, setBlips] = useState([]);

  useEffect(() => {
    const isThreat = threatLevel !== 'safe';
    
    // Periodically spawn blips
    const spawnInterval = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40 + 10; // radius percent (10% to 50%)
      const id = Math.random().toString(36).substr(2, 9);
      
      const newBlip = {
        id,
        x: 50 + Math.cos(angle) * distance,
        y: 50 + Math.sin(angle) * distance,
        type: isThreat && Math.random() < 0.7 ? 'threat' : 'safe',
        opacity: 1,
      };

      setBlips((prev) => [...prev.slice(-15), newBlip]);
    }, isThreat ? 600 : 1500);

    return () => clearInterval(spawnInterval);
  }, [threatLevel]);

  return (
    <div className="radar-container" style={{ position: 'relative', width: '100%', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg viewBox="0 0 100 100" style={{ width: '200px', height: '200px' }}>
        {/* Radar grids */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(34, 211, 238, 0.05)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(34, 211, 238, 0.08)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="24" fill="none" stroke="rgba(34, 211, 238, 0.1)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="0.5" />
        
        {/* Crosshair lines */}
        <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(34, 211, 238, 0.06)" strokeWidth="0.5" />
        <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(34, 211, 238, 0.06)" strokeWidth="0.5" />
        
        {/* Sonar sweep line */}
        <line
          x1="50" y1="50"
          x2="50" y2="2"
          stroke="var(--neon-cyan)"
          strokeWidth="1.5"
          className="radar-sweep"
          style={{
            transformOrigin: '50px 50px',
            filter: 'drop-shadow(0 0 4px var(--neon-cyan))',
          }}
        />

        {/* Sonar sweep overlay */}
        <circle
          cx="50" cy="50" r="48"
          fill="url(#radarGradient)"
          className="radar-sweep-gradient"
          style={{ transformOrigin: '50px 50px' }}
        />

        {/* Custom gradient definition */}
        <defs>
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.02)" />
            <stop offset="90%" stopColor="rgba(34, 211, 238, 0.05)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0)" />
          </radialGradient>
        </defs>

        {/* Connection Blips */}
        {blips.map((blip) => (
          <circle
            key={blip.id}
            cx={blip.x}
            cy={blip.y}
            r={blip.type === 'threat' ? 2.5 : 1.8}
            className={`radar-blip ${blip.type}`}
            style={{
              fill: blip.type === 'threat' ? 'var(--neon-red)' : 'var(--neon-green)',
              filter: blip.type === 'threat' 
                ? 'drop-shadow(0 0 5px var(--neon-red))' 
                : 'drop-shadow(0 0 3px var(--neon-green))',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

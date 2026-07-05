import React, { useEffect, useState } from 'react';

// Hotspot coordinates on the 100x60 projection map
const NODES = {
  usa: { x: 22, y: 24, name: 'USA (East)' },
  europe: { x: 48, y: 20, name: 'EU (Central)' },
  asia: { x: 74, y: 22, name: 'Asia (Tokyo)' },
  india: { x: 65, y: 32, name: 'Asia (Mumbai)' },
  australia: { x: 84, y: 46, name: 'AU (Sydney)' },
};

export default function WorldMap({ attackActive = false, attackType = 'none' }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulse((p) => !p);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine attack path coords
  let attackStart = NODES.europe;
  let attackEnd = NODES.usa;

  if (attackType === 'ddos') {
    attackStart = NODES.asia;
    attackEnd = NODES.usa;
  } else if (attackType === 'port_scan') {
    attackStart = NODES.india;
    attackEnd = NODES.europe;
  } else if (attackType === 'brute_force') {
    attackStart = NODES.australia;
    attackEnd = NODES.india;
  }

  // Draw smooth arc path between two points
  const getArcPath = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dr = Math.sqrt(dx * dx + dy * dy) * 1.2; // arc radius
    return `M ${start.x} ${start.y} A ${dr} ${dr} 0 0 1 ${end.x} ${end.y}`;
  };

  return (
    <div className="worldmap-container" style={{ position: 'relative', width: '100%', padding: '10px' }}>
      <svg
        viewBox="0 0 100 60"
        className="worldmap-svg"
        style={{
          width: '100%',
          height: 'auto',
          background: 'rgba(6, 11, 24, 0.4)',
          borderRadius: 'var(--border-radius-md)',
        }}
      >
        {/* Stylized Dotted World Map Outline */}
        <g fill="rgba(56, 189, 248, 0.04)" className="map-dots">
          {/* North America */}
          <rect x="10" y="14" width="22" height="15" rx="2" />
          {/* South America */}
          <rect x="25" y="32" width="12" height="20" rx="2" />
          {/* Eurasia */}
          <rect x="42" y="10" width="46" height="18" rx="2" />
          {/* Africa */}
          <rect x="44" y="28" width="14" height="20" rx="2" />
          {/* India */}
          <rect x="62" y="28" width="8" height="10" rx="2" />
          {/* Australia */}
          <rect x="78" y="42" width="14" height="12" rx="2" />
        </g>

        {/* Static connection mesh grid lines */}
        <g stroke="rgba(34, 211, 238, 0.03)" strokeWidth="0.3" fill="none">
          <path d={getArcPath(NODES.usa, NODES.europe)} />
          <path d={getArcPath(NODES.europe, NODES.india)} />
          <path d={getArcPath(NODES.india, NODES.asia)} />
          <path d={getArcPath(NODES.asia, NODES.australia)} />
          <path d={getArcPath(NODES.usa, NODES.australia)} />
        </g>

        {/* Dynamic Threat Laser Arc */}
        {attackActive && (
          <g>
            {/* Background warning red track */}
            <path
              d={getArcPath(attackStart, attackEnd)}
              stroke="var(--neon-red)"
              strokeWidth="0.8"
              fill="none"
              opacity="0.35"
              style={{ filter: 'drop-shadow(0 0 3px var(--neon-red))' }}
            />
            {/* Active laser pulse streak */}
            <path
              d={getArcPath(attackStart, attackEnd)}
              stroke="var(--neon-red)"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="8 12"
              className="map-laser-pulse"
              style={{ filter: 'drop-shadow(0 0 5px var(--neon-red))' }}
            />
          </g>
        )}

        {/* Node Hotspots */}
        {Object.entries(NODES).map(([key, node]) => {
          const isTarget = attackActive && attackEnd.name === node.name;
          const isSource = attackActive && attackStart.name === node.name;
          
          return (
            <g key={key}>
              {/* Outer pulsing indicator ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isTarget ? 3.5 : isSource ? 2.5 : 1.8}
                fill="none"
                stroke={isTarget ? 'var(--neon-red)' : isSource ? 'var(--neon-orange)' : 'var(--neon-cyan)'}
                strokeWidth="0.4"
                className="map-node-pulse"
                style={{
                  transformOrigin: `${node.x}px ${node.y}px`,
                  opacity: pulse ? 0.8 : 0.2,
                }}
              />
              {/* Central node core */}
              <circle
                cx={node.x}
                cy={node.y}
                r="0.8"
                fill={isTarget ? 'var(--neon-red)' : isSource ? 'var(--neon-orange)' : 'var(--neon-cyan)'}
                style={{
                  filter: `drop-shadow(0 0 4px ${isTarget ? 'var(--neon-red)' : 'var(--neon-cyan)'})`,
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

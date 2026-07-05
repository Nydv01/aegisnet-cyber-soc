import React, { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

const dockItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/dashboard', icon: '📊', label: 'Console' },
  { path: '/simulator', icon: '⚔️', label: 'Simulator' },
  { path: '/phishing', icon: '🔍', label: 'Scanner' },
  { path: '/logs', icon: '📋', label: 'Ledger' },
];

/**
 * InteractiveDock component implements a floating macOS-style dock magnifier.
 * Includes Landing, Dashboard, Simulator, URL Scanner, and Logs.
 */
export default function InteractiveDock() {
  const dockRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const getScale = (index) => {
    if (hoveredIndex === null) return 1;
    const dist = Math.abs(index - hoveredIndex);
    if (dist === 0) return 1.45; // Hovered
    if (dist === 1) return 1.2;  // Adjacent
    if (dist === 2) return 1.05; // 2 steps away
    return 1;
  };

  return (
    <div className="dock-wrapper">
      <nav
        ref={dockRef}
        className="dock-container"
        onMouseLeave={() => setHoveredIndex(null)}
        role="navigation"
        aria-label="Dock navigation"
      >
        {dockItems.map((item, idx) => {
          const scale = getScale(idx);
          const yOffset = (scale - 1) * -15; // float items upward slightly

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `dock-item ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setHoveredIndex(idx)}
              style={{
                transform: `scale(${scale}) translateY(${yOffset}px)`,
                transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              title={item.label}
              id={`dock-${item.label.toLowerCase()}`}
            >
              <span className="dock-icon">{item.icon}</span>
              <span className="dock-tooltip">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

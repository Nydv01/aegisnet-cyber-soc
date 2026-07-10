import React, { useRef, useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';

const dockItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/dashboard', icon: '📊', label: 'Console' },
  { path: '/simulator', icon: '⚔️', label: 'Simulator' },
  { path: '/phishing', icon: '🔍', label: 'Scanner' },
  { path: '/models', icon: '🧠', label: 'AI Models' },
  { path: '/logs', icon: '📋', label: 'Ledger' },
];

/**
 * InteractiveDock — Premium macOS-style dock with:
 * - True distance-based magnification (like macOS)
 * - Spring-animated tooltips
 * - Animated active page underline that slides between items
 * - Subtle glow effects
 */
export default function InteractiveDock() {
  const dockRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const location = useLocation();
  const mouseX = useMotionValue(Infinity);

  const handleMouseMove = useCallback((e) => {
    if (dockRef.current) {
      const rect = dockRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
    }
  }, [mouseX]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(Infinity);
    setHoveredIndex(null);
  }, [mouseX]);

  return (
    <div className="dock-wrapper">
      <motion.nav
        ref={dockRef}
        className="dock-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="navigation"
        aria-label="Dock navigation"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          delay: 0.5,
        }}
      >
        {dockItems.map((item, idx) => (
          <DockIcon
            key={item.path}
            item={item}
            index={idx}
            mouseX={mouseX}
            isHovered={hoveredIndex === idx}
            onHover={() => setHoveredIndex(idx)}
            currentPath={location.pathname}
          />
        ))}
      </motion.nav>
    </div>
  );
}

function DockIcon({ item, index, mouseX, isHovered, onHover, currentPath }) {
  const ref = useRef(null);
  const isActive = item.path === '/'
    ? currentPath === '/'
    : currentPath.startsWith(item.path);

  // Distance-based magnification calculation
  const distance = useTransform(mouseX, (val) => {
    if (!ref.current) return 150;
    const rect = ref.current.getBoundingClientRect();
    const itemCenter = rect.left + rect.width / 2;
    // mouseX is relative to dock, need to convert
    const dockRect = ref.current.parentElement?.getBoundingClientRect();
    const absoluteMouseX = dockRect ? val + dockRect.left : val;
    return Math.abs(absoluteMouseX - itemCenter);
  });

  // Map distance to scale — closer = bigger, with smooth falloff
  const scaleValue = useTransform(distance, [0, 80, 160], [1.5, 1.2, 1]);
  const yValue = useTransform(distance, [0, 80, 160], [-18, -8, 0]);

  // Smooth spring physics
  const scale = useSpring(scaleValue, {
    stiffness: 300,
    damping: 20,
    mass: 0.5,
  });
  const y = useSpring(yValue, {
    stiffness: 300,
    damping: 20,
    mass: 0.5,
  });

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className="dock-item-link"
      style={{ textDecoration: 'none' }}
      id={`dock-${item.label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <motion.div
        ref={ref}
        className={`dock-item ${isActive ? 'active' : ''}`}
        style={{ scale, y }}
        onMouseEnter={onHover}
        whileTap={{ scale: 0.85 }}
      >
        {/* Icon with glow on active */}
        <span
          className="dock-icon"
          style={{
            filter: isActive
              ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
              : 'none',
            transition: 'filter 0.3s ease',
          }}
        >
          {item.icon}
        </span>

        {/* Spring tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.span
              className="dock-tooltip"
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: 8,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(10, 10, 10, 0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                color: '#e4e4e7',
                fontSize: '0.62rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {item.label}
              {/* Tooltip arrow */}
              <span
                style={{
                  position: 'absolute',
                  bottom: -4,
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: 8,
                  height: 8,
                  background: 'rgba(10, 10, 10, 0.9)',
                  borderRight: '1px solid rgba(255,255,255,0.08)',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Active indicator dot with slide animation */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              layoutId="dock-active-indicator"
              className="absolute -bottom-1.5 left-1/2"
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 0 6px rgba(255,255,255,0.5), 0 0 12px rgba(255,255,255,0.2)',
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </NavLink>
  );
}

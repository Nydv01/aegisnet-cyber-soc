import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransition wraps route content with a smooth cinematic
 * enter/exit animation triggered by location changes.
 * Uses a clip-path wipe + fade + scale for a premium feel.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitioning, setTransitioning] = useState(false);
  const [stage, setStage] = useState('entered'); // 'exiting' | 'entering' | 'entered'
  const containerRef = useRef(null);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;

    // Phase 1: Exit current
    setTransitioning(true);
    setStage('exiting');

    const exitTimer = setTimeout(() => {
      // Phase 2: Swap content, enter new
      setDisplayChildren(children);
      setStage('entering');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      const enterTimer = setTimeout(() => {
        setStage('entered');
        setTransitioning(false);
      }, 500);

      return () => clearTimeout(enterTimer);
    }, 300);

    return () => clearTimeout(exitTimer);
  }, [location.pathname, children]);

  // If path didn't change but children did, update silently
  useEffect(() => {
    if (!transitioning) {
      setDisplayChildren(children);
    }
  }, [children, transitioning]);

  const getStyle = () => {
    switch (stage) {
      case 'exiting':
        return {
          opacity: 0,
          transform: 'translateY(-12px) scale(0.995)',
          filter: 'blur(4px)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        };
      case 'entering':
        return {
          opacity: 0,
          transform: 'translateY(20px) scale(0.995)',
          filter: 'blur(4px)',
          transition: 'none',
        };
      case 'entered':
      default:
        return {
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          filter: 'blur(0px)',
          transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        };
    }
  };

  return (
    <div
      ref={containerRef}
      className="page-transition-container"
      style={{
        ...getStyle(),
        willChange: 'opacity, transform, filter',
        minHeight: '60vh',
      }}
    >
      {displayChildren}
    </div>
  );
}

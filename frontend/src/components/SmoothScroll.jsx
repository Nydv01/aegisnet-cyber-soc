import { useEffect, useRef, useCallback } from 'react';

/**
 * SmoothScroll — Locomotive-style smooth inertia scrolling provider.
 * Wraps the entire app for buttery-smooth scroll with lerp interpolation.
 * Uses requestAnimationFrame for 60fps scroll smoothing.
 */
export default function SmoothScroll({ children, lerp = 0.08, enabled = true }) {
  const scrollRef = useRef(null);
  const currentY = useRef(0);
  const targetY = useRef(0);
  const rafId = useRef(null);
  const isEnabled = useRef(enabled);

  useEffect(() => {
    isEnabled.current = enabled;
  }, [enabled]);

  const smoothScroll = useCallback(() => {
    if (!isEnabled.current) {
      rafId.current = requestAnimationFrame(smoothScroll);
      return;
    }

    currentY.current += (targetY.current - currentY.current) * lerp;

    // Snap when close enough
    if (Math.abs(targetY.current - currentY.current) < 0.5) {
      currentY.current = targetY.current;
    }

    if (scrollRef.current) {
      scrollRef.current.style.transform = `translateY(${-currentY.current}px)`;
    }

    rafId.current = requestAnimationFrame(smoothScroll);
  }, [lerp]);

  useEffect(() => {
    if (!enabled) return;

    // Set body to fixed to prevent native scroll
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;

    const updateHeight = () => {
      if (scrollRef.current) {
        document.body.style.height = `${scrollRef.current.scrollHeight}px`;
      }
    };

    document.body.style.overflow = 'visible';
    updateHeight();

    const handleScroll = () => {
      targetY.current = window.scrollY;
    };

    // Observe content changes to update body height
    const resizeObserver = new ResizeObserver(updateHeight);
    if (scrollRef.current) {
      resizeObserver.observe(scrollRef.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId.current = requestAnimationFrame(smoothScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      resizeObserver.disconnect();
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
    };
  }, [enabled, smoothScroll]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      ref={scrollRef}
      className="smooth-scroll-wrapper"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

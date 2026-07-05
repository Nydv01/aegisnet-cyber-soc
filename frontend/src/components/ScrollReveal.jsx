import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal wrapper component triggers modern animations (slide-up, fade-in)
 * when elements enter the viewport.
 */
export default function ScrollReveal({ children, delay = 0, duration = 0.8, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(domRef.current);
        }
      },
      { threshold: 0.1 }
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`scroll-reveal ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

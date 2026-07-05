import React from 'react';

/**
 * ShinyText renders premium titles with a continuous linear-gradient 
 * sheen sweep, matching elite SaaS branding metrics.
 */
export default function ShinyText({ children, className = '', speed = '5s' }) {
  return (
    <span
      className={`shiny-text ${className}`}
      style={{
        animationDuration: speed,
      }}
    >
      {children}
    </span>
  );
}

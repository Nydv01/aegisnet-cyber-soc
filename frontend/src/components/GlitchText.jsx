import React from 'react';

/**
 * GlitchText implements a high-end visual noise glitch effect.
 * Perfect for alerting security breaches and visual feedback of network threats.
 */
export default function GlitchText({ children, className = '', active = false }) {
  const text = typeof children === 'string' ? children : String(children || '');

  return (
    <span
      className={`glitch-text ${active ? 'glitching' : ''} ${className}`}
      data-text={text}
    >
      {text}
    </span>
  );
}

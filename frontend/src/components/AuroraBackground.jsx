import React from 'react';

/**
 * AuroraBackground renders animated, blurred backdrop spheres
 * that slowly drift and merge, creating a premium ambient lighting system.
 */
export default function AuroraBackground() {
  return (
    <div className="aurora-container">
      <div className="aurora-blob aurora-1" />
      <div className="aurora-blob aurora-2" />
      <div className="aurora-blob aurora-3" />
      {/* Structural pixel grid overlay */}
      <div className="grid-overlay" />
    </div>
  );
}

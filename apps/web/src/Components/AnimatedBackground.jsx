import React from 'react';
import '../Styles/AnimatedBackground.css';

export default function AnimatedBackground() {
  return (
    <div className="af-background" aria-hidden="true">
      {/* Light Mode: Frosted atmospheric veil over Moroccan mountain landscape */}
      <div className="af-light-overlay" />

      {/* Dark Mode: Ambient glowing mesh orbs & starfield */}
      <div className="af-dark-orbs">
        <div className="af-orb af-orb-1" />
        <div className="af-orb af-orb-2" />
        <div className="af-orb af-orb-3" />
      </div>

      {/* Dark Mode: Twinkling night sky */}
      <div className="af-stars">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={`af-star af-star-${i + 1}`} />
        ))}
      </div>

      {/* Dark Mode: Subtle shooting stars */}
      <div className="af-shooting-star af-ss1" />
      <div className="af-shooting-star af-ss2" />
      <div className="af-shooting-star af-ss3" />
    </div>
  );
}

'use client';

import React from 'react';
import { useTour } from './TourContext';

export const TourOverlay: React.FC = () => {
  const { isOpen, activeElementRect } = useTour();

  if (!isOpen) return null;

  const hasHighlight = activeElementRect !== null;
  const x = hasHighlight ? activeElementRect.left - 6 : 0;
  const y = hasHighlight ? activeElementRect.top - 6 : 0;
  const width = hasHighlight ? activeElementRect.width + 12 : 0;
  const height = hasHighlight ? activeElementRect.height + 12 : 0;
  const rx = 10; // Rounded corners for high-quality aesthetics

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] transition-opacity duration-300">
      <svg className="w-full h-full pointer-events-auto">
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White fill means keep overlay opaque */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout creates the transparent hole */}
            {hasHighlight && (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={rx}
                ry={rx}
                fill="black"
                style={{
                  transition: 'x 0.3s ease-out, y 0.3s ease-out, width 0.3s ease-out, height 0.3s ease-out',
                }}
              />
            )}
          </mask>
        </defs>

        {/* Translucent overlay mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.65)" // Sleek slate dark mode tint for overlay
          className="backdrop-blur-[1px]" // Subtle backdrop blur to stand out
          mask="url(#tour-spotlight-mask)"
        />
      </svg>
    </div>
  );
};
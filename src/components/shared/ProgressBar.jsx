import React from 'react';

export default function ProgressBar({ value, max, colour = '#3b82f6', className = '' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`h-2 bg-navy-700 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: colour }}
      />
    </div>
  );
}

import React, { useEffect, useState } from 'react';

const STRAND_COLOURS = { Creativity: '#8b5cf6', Activity: '#22c55e', Service: '#3b82f6' };

export default function StrandRing({ strand, hours, target = 50 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const r = 36;
  const cx = 44;
  const cy = 44;
  const circumference = 2 * Math.PI * r;
  const fraction = Math.min(hours / target, 1);
  const dashOffset = circumference * (1 - (animated ? fraction : 0));
  const colour = STRAND_COLOURS[strand] || '#3b82f6';

  return (
    <div className="flex flex-col items-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3058" strokeWidth="8" />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={colour}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
        <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontFamily="DM Mono, monospace" fontWeight="bold">{hours}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" fill="#8b9dc3" fontSize="9" fontFamily="DM Mono, monospace">/{target}h</text>
      </svg>
      <p className="text-xs font-syne font-semibold mt-1" style={{ color: colour }}>{strand}</p>
    </div>
  );
}

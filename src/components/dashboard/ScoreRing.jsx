import React, { useEffect, useState } from 'react';

export default function ScoreRing({ score, max = 45 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const r = 70;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * r;
  const fraction = max > 0 ? Math.min(score / max, 1) : 0;
  const dashOffset = circumference * (1 - (animated ? fraction : 0));

  let colour = '#3b82f6';
  if (score >= 36) colour = '#22c55e';
  else if (score < 24) colour = '#f59e0b';

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e3058" strokeWidth="12" />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={colour}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s' }}
        />
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="36" fontFamily="DM Mono, monospace" fontWeight="bold">{score}</text>
        <text x={cx} y={cy + 22} textAnchor="middle" dominantBaseline="middle" fill="#8b9dc3" fontSize="14" fontFamily="DM Mono, monospace">/ {max}</text>
      </svg>
      <p className="text-[#8b9dc3] text-sm font-mono mt-1">Predicted Total</p>
    </div>
  );
}

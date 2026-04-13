import React, { useState, useEffect, useRef, useCallback } from 'react';

const MODES = [
  { id: 'work',       label: '🎯 Focus',    minutes: 25, colour: '#3b82f6' },
  { id: 'short',      label: '☕ Short Break', minutes: 5,  colour: '#22c55e' },
  { id: 'long',       label: '🛋️ Long Break',  minutes: 15, colour: '#a855f7' },
];

function pad(n) { return String(n).padStart(2, '0'); }

export default function PomodoroTimer({ subjectName, onClose }) {
  const [modeIdx, setModeIdx] = useState(0);
  const [seconds, setSeconds] = useState(MODES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(0); // completed pomodoros
  const intervalRef = useRef(null);
  const mode = MODES[modeIdx];

  const reset = useCallback((idx = modeIdx) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(MODES[idx].minutes * 60);
  }, [modeIdx]);

  const switchMode = (idx) => {
    setModeIdx(idx);
    reset(idx);
    setSeconds(MODES[idx].minutes * 60);
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (modeIdx === 0) setSession(n => n + 1);
            // Auto-advance to break suggestion
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, modeIdx]);

  const total = mode.minutes * 60;
  const progress = ((total - seconds) / total) * 100;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - (total - seconds) / total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-navy-900 border border-navy-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-syne font-bold text-white text-lg">Study Timer</h2>
            {subjectName && <p className="text-[#8b9dc3] text-xs font-mono">{subjectName}</p>}
          </div>
          <button onClick={onClose} className="text-[#8b9dc3] hover:text-white text-xl leading-none">✕</button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-1.5 mb-6">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              onClick={() => switchMode(i)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-syne font-semibold border transition-all
                ${modeIdx === i
                  ? 'text-white border-transparent'
                  : 'bg-navy-800 border-navy-700 text-[#8b9dc3] hover:border-blue-500/50'}`}
              style={modeIdx === i ? { backgroundColor: m.colour + '33', borderColor: m.colour + '88', color: m.colour } : {}}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Ring timer */}
        <div className="flex justify-center mb-6">
          <div className="relative w-36 h-36">
            <svg className="absolute inset-0 rotate-[-90deg]" width="144" height="144" viewBox="0 0 144 144">
              <circle cx="72" cy="72" r={r} fill="none" stroke="#1e3058" strokeWidth="8" />
              <circle
                cx="72" cy="72" r={r} fill="none"
                stroke={mode.colour}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dash}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-bold text-white">
                {pad(Math.floor(seconds / 60))}:{pad(seconds % 60)}
              </span>
              <span className="text-[10px] font-mono text-[#8b9dc3] mt-0.5">{mode.label}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setRunning(r => !r)}
            className="flex-1 py-3 rounded-xl font-syne font-semibold text-white transition-all text-sm"
            style={{ backgroundColor: mode.colour }}
          >
            {running ? '⏸ Pause' : seconds === total ? '▶ Start' : '▶ Resume'}
          </button>
          <button
            onClick={() => reset()}
            className="px-4 py-3 rounded-xl bg-navy-800 border border-navy-700 text-[#8b9dc3] hover:text-white text-sm transition-all"
          >
            ↺
          </button>
        </div>

        {/* Session count */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-[#8b9dc3] text-xs font-mono">Sessions completed:</span>
          <div className="flex gap-1">
            {Array.from({ length: Math.max(session, 4) }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: i < session ? mode.colour : '#1e3058' }}
              />
            ))}
          </div>
          {session > 0 && (
            <span className="text-xs font-mono" style={{ color: mode.colour }}>{session}</span>
          )}
        </div>
      </div>
    </div>
  );
}

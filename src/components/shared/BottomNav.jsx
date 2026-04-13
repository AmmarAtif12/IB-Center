import React from 'react';
import { useApp } from '../../context/AppContext';

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'grades', label: 'Grades', icon: '📊' },
  { id: 'subjects', label: 'Subjects', icon: '📚' },
  { id: 'planner', label: 'Planner', icon: '📅' },
  { id: 'cas', label: 'CAS', icon: '🏃' },
];

const NAV_SIZES = {
  compact: { nav: 'h-12',  icon: 'text-lg',  label: 'text-[9px]'  },
  normal:  { nav: 'h-16',  icon: 'text-xl',  label: 'text-[10px]' },
  large:   { nav: 'h-20',  icon: 'text-3xl', label: 'text-xs'     },
};

export default function BottomNav({ active, onChange }) {
  const { state } = useApp();
  const navSize = state.settings?.navSize || 'normal';
  const sz = NAV_SIZES[navSize] || NAV_SIZES.normal;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 bg-navy-900 border-t border-navy-700 pb-safe glass-nav`}>
      <div className={`flex items-center justify-around ${sz.nav} max-w-2xl mx-auto px-2`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              active === tab.id
                ? 'text-blue-400 bg-blue-500/10'
                : 'text-[#8b9dc3]'
            }`}
          >
            <span className={`${sz.icon} leading-none`}>{tab.icon}</span>
            <span className={`${sz.label} font-syne font-semibold leading-none ${active === tab.id ? 'text-blue-400' : 'text-[#8b9dc3]'}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

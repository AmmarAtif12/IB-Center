import React from 'react';

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'grades', label: 'Grades', icon: '📊' },
  { id: 'subjects', label: 'Subjects', icon: '📚' },
  { id: 'planner', label: 'Planner', icon: '📅' },
  { id: 'cas', label: 'CAS', icon: '🏃' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-navy-900 border-t border-navy-700 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
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
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className={`text-[10px] font-syne font-semibold leading-none ${active === tab.id ? 'text-blue-400' : 'text-[#8b9dc3]'}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

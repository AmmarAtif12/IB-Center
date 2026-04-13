import React, { useState } from 'react';
import NotesTab from './NotesTab';
import ResourcesTab from './ResourcesTab';
import ChecklistTab from './ChecklistTab';
import PomodoroTimer from '../shared/PomodoroTimer';

const TABS = ['Notes', 'Resources', 'Checklist', 'Timer'];

export default function SubjectDetail({ subject, onBack }) {
  const [tab, setTab] = useState('Notes');
  const [timerOpen, setTimerOpen] = useState(false);

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-20 bg-navy-950/95 backdrop-blur border-b border-navy-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[#8b9dc3] hover:text-white text-lg">←</button>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.colour }} />
          <h1 className="font-syne font-bold text-lg text-white flex-1">{subject.name}</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-navy-800 text-[#8b9dc3] border border-navy-700">{subject.level}</span>
        </div>
        <div className="flex gap-1 mt-3 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); if (t === 'Timer') setTimerOpen(true); }}
              className={`px-4 py-1.5 rounded-full text-sm font-syne font-semibold transition-all whitespace-nowrap ${tab === t && t !== 'Timer' ? 'bg-blue-500 text-white' : t === 'Timer' ? 'text-amber-400 hover:text-white border border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10' : 'text-[#8b9dc3] hover:text-white'}`}
            >
              {t === 'Timer' ? '⏱ Timer' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {tab === 'Notes' && <NotesTab subjectId={subject.id} />}
        {tab === 'Resources' && <ResourcesTab subjectId={subject.id} />}
        {tab === 'Checklist' && <ChecklistTab subjectId={subject.id} />}
      </div>

      {timerOpen && (
        <PomodoroTimer subjectName={subject.name} onClose={() => { setTimerOpen(false); setTab('Notes'); }} />
      )}
    </div>
  );
}

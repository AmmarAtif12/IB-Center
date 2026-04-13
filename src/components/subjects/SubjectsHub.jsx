import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SubjectDetail from './SubjectDetail';

export default function SubjectsHub() {
  const { state } = useApp();
  const [selected, setSelected] = useState(null);

  if (selected) {
    const subject = state.subjects.find(s => s.id === selected);
    if (!subject) { setSelected(null); return null; }
    return <SubjectDetail subject={subject} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="pb-20 px-4 pt-6">
      <h1 className="font-syne font-extrabold text-2xl text-white mb-6">Subjects</h1>
      {state.subjects.length === 0 ? (
        <div className="text-center py-12 text-[#8b9dc3]">No subjects yet. Add subjects in Settings.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {state.subjects.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className="bg-navy-900 border border-navy-700 rounded-2xl p-4 text-left hover:border-navy-600 hover:bg-navy-800 transition-all"
              style={{ borderTopColor: s.colour, borderTopWidth: 3 }}
            >
              <div className="font-syne font-semibold text-white text-sm leading-tight mb-2">{s.name}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 text-[#8b9dc3] border border-navy-700">{s.level}</span>
                <span className="text-[10px] text-[#8b9dc3] font-mono">Gr. {s.group}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

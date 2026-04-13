import React from 'react';
import { SUBJECT_COLOURS, GROUPS } from '../../utils/grades';

export default function Step2Subjects({ subjects, setSubjects, onBack, onNext }) {
  const update = (id, key, val) => setSubjects(ss => ss.map(s => s.id === id ? { ...s, [key]: val } : s));
  const add = () => {
    if (subjects.length >= 8) return;
    setSubjects(ss => [...ss, { id: crypto.randomUUID(), name: '', level: 'SL', group: '1', colour: SUBJECT_COLOURS[ss.length % 8] }]);
  };
  const remove = (id) => {
    if (subjects.length <= 1) return;
    setSubjects(ss => ss.filter(s => s.id !== id));
  };
  const valid = subjects.every(s => s.name.trim().length > 0);

  return (
    <div className="bg-navy-900 rounded-2xl border border-navy-700 p-6 space-y-4">
      <div>
        <h2 className="font-syne font-bold text-xl text-white">Add your subjects</h2>
        <p className="text-[#8b9dc3] text-sm mt-1">You can always edit these later in Settings</p>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {subjects.map((s, i) => (
          <div key={s.id} className="bg-navy-800 rounded-xl p-4 border border-navy-700 space-y-3">
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 text-sm"
                placeholder={`Subject ${i+1}`}
                value={s.name}
                onChange={e => update(s.id, 'name', e.target.value)}
              />
              <button onClick={() => remove(s.id)} disabled={subjects.length <= 1} className="text-[#8b9dc3] hover:text-red-400 disabled:opacity-30 text-lg leading-none px-1">×</button>
            </div>
            <div className="flex items-center gap-2">
              {['SL','HL'].map(lvl => (
                <button key={lvl} onClick={() => update(s.id, 'level', lvl)} className={`px-4 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${s.level === lvl ? 'bg-blue-500 border-blue-500 text-white' : 'bg-navy-900 border-navy-700 text-[#8b9dc3]'}`}>{lvl}</button>
              ))}
              <select
                className="flex-1 bg-navy-900 border border-navy-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                value={s.group}
                onChange={e => update(s.id, 'group', e.target.value)}
              >
                {GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8b9dc3] font-mono">Colour:</span>
              {SUBJECT_COLOURS.map(c => (
                <button
                  key={c}
                  onClick={() => update(s.id, 'colour', c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${s.colour === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} disabled={subjects.length >= 8} className="w-full py-2.5 rounded-xl text-sm font-syne font-semibold text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        + Add another subject
      </button>
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl font-syne font-semibold text-[#8b9dc3] bg-navy-800 hover:bg-navy-700 transition-all">← Back</button>
        <button disabled={!valid} onClick={onNext} className="flex-1 py-3 rounded-xl font-syne font-semibold text-white bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next →</button>
      </div>
    </div>
  );
}

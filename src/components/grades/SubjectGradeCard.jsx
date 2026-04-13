import React, { useState } from 'react';
import { calcSubjectPct, gradeFromPct, gradeColour } from '../../utils/grades';
import ProgressBar from '../shared/ProgressBar';
import { useApp } from '../../context/AppContext';

export default function SubjectGradeCard({ subject }) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newComp, setNewComp] = useState({ name: '', weight: '', max: '' });

  const components = state.gradeComponents[subject.id] || [];
  const pct = calcSubjectPct(components);
  const grade = pct !== null ? gradeFromPct(pct) : null;
  const colour = grade ? gradeColour(grade) : '#8b9dc3';

  const updateComponents = (comps) => dispatch({ type: 'SET_GRADE_COMPONENTS', subjectId: subject.id, components: comps });

  const updateScore = (id, val) => {
    const comp = components.find(c => c.id === id);
    const clamped = val === '' ? '' : String(Math.min(Math.max(0, parseFloat(val) || 0), comp.max));
    updateComponents(components.map(c => c.id === id ? { ...c, score: clamped } : c));
  };

  const addComponent = () => {
    if (!newComp.name.trim()) return;
    updateComponents([...components, {
      id: crypto.randomUUID(),
      name: newComp.name.trim(),
      weight: parseFloat(newComp.weight) || 0,
      max: parseFloat(newComp.max) || 100,
      score: '',
    }]);
    setNewComp({ name: '', weight: '', max: '' });
    setAdding(false);
  };

  const deleteComponent = (id) => updateComponents(components.filter(c => c.id !== id));

  const nextGrade = grade ? (grade < 7 ? grade + 1 : null) : 1;
  const nextThreshold = nextGrade === 7 ? 80 : nextGrade === 6 ? 70 : nextGrade === 5 ? 60 : nextGrade === 4 ? 50 : nextGrade === 3 ? 40 : nextGrade === 2 ? 30 : 0;
  const needed = pct !== null && nextGrade ? Math.max(0, nextThreshold - pct).toFixed(1) : null;

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-navy-800 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: subject.colour }} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-syne font-semibold">{subject.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-700 text-[#8b9dc3]">{subject.level}</span>
          </div>
        </div>
        <div className="font-mono font-bold text-xl" style={{ color: colour }}>{grade ?? '–'}</div>
        <span className={`text-[#8b9dc3] text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-navy-700 space-y-3 pt-3">
          {components.length === 0 && !adding && (
            <p className="text-[#8b9dc3] text-sm text-center py-2">No components yet. Add one below.</p>
          )}
          {components.map(c => (
            <div key={c.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm truncate">{c.name}</div>
                <div className="text-[#8b9dc3] text-xs font-mono">{c.weight}% weight</div>
              </div>
              <input
                type="number"
                min="0"
                max={c.max}
                value={c.score}
                onChange={e => updateScore(c.id, e.target.value)}
                className="w-16 bg-navy-800 border border-navy-700 rounded-lg px-2 py-1.5 text-white text-sm text-center font-mono focus:outline-none focus:border-blue-500"
                placeholder="–"
              />
              <span className="text-[#8b9dc3] text-xs font-mono">/{c.max}</span>
              <button onClick={() => deleteComponent(c.id)} className="text-[#8b9dc3] hover:text-red-400 text-base px-1">×</button>
            </div>
          ))}

          {adding && (
            <div className="bg-navy-800 rounded-xl p-3 space-y-2 border border-navy-700">
              <input className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white text-sm placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="Component name (e.g. Paper 1)" value={newComp.name} onChange={e => setNewComp(n => ({...n, name: e.target.value}))} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white text-sm placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="Weight (%)" value={newComp.weight} onChange={e => setNewComp(n => ({...n, weight: e.target.value}))} />
                <input type="number" className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-white text-sm placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500" placeholder="Max score" value={newComp.max} onChange={e => setNewComp(n => ({...n, max: e.target.value}))} />
              </div>
              <div className="flex gap-2">
                <button onClick={addComponent} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-400 text-white transition-all">Save</button>
                <button onClick={() => { setAdding(false); setNewComp({ name: '', weight: '', max: '' }); }} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-navy-700 hover:bg-navy-600 text-[#8b9dc3] transition-all">Cancel</button>
              </div>
            </div>
          )}

          {!adding && (
            <button onClick={() => setAdding(true)} className="w-full py-2 rounded-xl text-sm text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 transition-all font-syne">
              + Add component
            </button>
          )}

          {pct !== null && (
            <div className="border-t border-navy-700 pt-3 space-y-2">
              <ProgressBar value={pct} max={100} colour={colour} />
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg" style={{ color: colour }}>Grade {grade}</span>
                <span className="text-[#8b9dc3] text-xs font-mono">{pct.toFixed(1)}%</span>
              </div>
              {grade === 7 ? (
                <p className="text-green-400 text-sm">🏆 Grade 7! Outstanding!</p>
              ) : needed !== null && (
                <p className="text-[#8b9dc3] text-sm">Need <span className="text-white font-mono">{needed}%</span> more for Grade {nextGrade}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

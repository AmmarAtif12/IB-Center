import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import MypSubjectCard from './MypSubjectCard';
import {
  calcCriterionAvg,
  calcMypSubjectTotal,
  mypGradeFromTotal,
  gradeColour,
  SUBJECT_COLOURS,
  DEFAULT_CRITERION_NAMES,
} from '../../utils/grades';

function AddSubjectModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [colour, setColour] = useState(SUBJECT_COLOURS[0]);
  const [criterionNames, setCriterionNames] = useState(['', '', '', '']);

  const update = (idx, val) => setCriterionNames(prev => prev.map((v, i) => i === idx ? val : v));
  const valid = name.trim().length > 0;

  const handleAdd = () => {
    if (!valid) return;
    const resolved = criterionNames.map((n, i) => n.trim() || DEFAULT_CRITERION_NAMES[i]);
    onAdd({ name: name.trim(), colour, criterionNames: resolved });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-navy-900 border border-navy-700 rounded-t-2xl p-5 space-y-4 pb-8">
        <div className="flex items-center justify-between">
          <h3 className="font-syne font-bold text-lg text-white">Add MYP Subject</h3>
          <button onClick={onClose} className="text-[#8b9dc3] hover:text-white text-xl">×</button>
        </div>

        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Subject Name *</label>
          <input
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-2.5 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 text-sm"
            placeholder="e.g. Sciences, Language & Literature"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1.5">
            Criterion Names <span className="text-navy-600">(optional — leave blank for A / B / C / D)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map(i => (
              <input
                key={i}
                className="bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500 text-sm"
                placeholder={DEFAULT_CRITERION_NAMES[i]}
                value={criterionNames[i]}
                onChange={e => update(i, e.target.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1.5">Colour</label>
          <div className="flex gap-2 flex-wrap">
            {SUBJECT_COLOURS.map(c => (
              <button
                key={c}
                onClick={() => setColour(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${colour === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-syne font-semibold text-[#8b9dc3] bg-navy-800 hover:bg-navy-700 transition-all">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!valid}
            className="flex-1 py-3 rounded-xl font-syne font-semibold text-white bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Add Subject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MypGradeTracker() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const cardRefs = useRef({});

  const subjects = state.subjects;

  const subjectSummaries = subjects.map(s => {
    const subjectAssessments = state.mypAssessments[s.id] || {};
    const allCriteria = [0, 1, 2, 3].map(i => subjectAssessments[i] || []);
    const total = calcMypSubjectTotal(allCriteria);
    const grade = total !== null ? mypGradeFromTotal(total) : null;
    return { ...s, total, grade };
  });

  const handleAddSubject = ({ name, colour, criterionNames }) => {
    dispatch({
      type: 'ADD_SUBJECT',
      subject: {
        id: crypto.randomUUID(),
        name,
        level: 'SL',       // default; not used by MYP tracker
        group: '1',         // default; used by Subjects Hub
        colour,
        criterionNames,
      },
    });
  };

  const scrollToCard = (subjectId) => {
    const el = document.getElementById(`myp-card-${subjectId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pb-20">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-navy-950/95 backdrop-blur border-b border-navy-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-extrabold text-xl text-white">MYP Grade Tracker</h1>
            <p className="text-[#8b9dc3] text-xs font-mono mt-0.5">Grades 1–7 · Criteria scored out of 8</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-xl text-sm text-white font-syne font-semibold transition-all"
          >
            + Add Subject
          </button>
        </div>
      </div>

      {/* Summary scroll row */}
      {subjectSummaries.length > 0 && (
        <div className="px-4 pt-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {subjectSummaries.map(s => {
              const colour = s.grade ? gradeColour(s.grade) : '#8b9dc3';
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToCard(s.id)}
                  className="flex-shrink-0 bg-navy-900 border border-navy-700 rounded-2xl p-3 w-32 text-left hover:border-navy-600 transition-all"
                  style={{ borderLeftColor: s.colour, borderLeftWidth: 3 }}
                >
                  <div className="text-white font-syne font-semibold text-xs leading-tight mb-1.5 truncate">{s.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono font-bold text-xl" style={{ color }}>
                      {s.grade !== null ? s.grade : '–'}
                    </span>
                    <span className="text-[#8b9dc3] text-xs font-mono">
                      {s.total !== null ? `· ${s.total}/32` : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject cards */}
      <div className="px-4 pt-4 space-y-3">
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-[#8b9dc3] text-sm mb-4">No subjects yet.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-syne font-semibold text-sm transition-all"
            >
              + Add your first subject
            </button>
          </div>
        ) : (
          subjects.map(s => (
            <MypSubjectCard key={s.id} subject={s} scrollId={`myp-card-${s.id}`} />
          ))
        )}
      </div>

      {/* MYP grade boundary reference */}
      {subjects.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <details className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
            <summary className="px-4 py-3 text-xs font-mono text-[#8b9dc3] cursor-pointer hover:text-white transition-colors select-none">
              MYP Grade Boundaries (Total out of 32)
            </summary>
            <div className="px-4 pb-4 grid grid-cols-4 gap-2">
              {[
                { g: 7, range: '28–32', colour: '#22c55e' },
                { g: 6, range: '24–27', colour: '#4ade80' },
                { g: 5, range: '19–23', colour: '#a3e635' },
                { g: 4, range: '15–18', colour: '#f59e0b' },
                { g: 3, range: '10–14', colour: '#fb923c' },
                { g: 2, range: '6–9',   colour: '#ef4444' },
                { g: 1, range: '1–5',   colour: '#dc2626' },
              ].map(({ g, range, colour }) => (
                <div key={g} className="bg-navy-800 rounded-xl p-2 text-center">
                  <div className="font-mono font-bold text-lg" style={{ color: colour }}>{g}</div>
                  <div className="text-[#8b9dc3] text-xs font-mono">{range}</div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {showAdd && (
        <AddSubjectModal onClose={() => setShowAdd(false)} onAdd={handleAddSubject} />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calcCriterionAvg,
  calcMypSubjectTotal,
  mypGradeFromTotal,
  MYP_NEXT_BOUNDARIES,
  DEFAULT_CRITERION_NAMES,
  gradeColour,
} from '../../utils/grades';
import ProgressBar from '../shared/ProgressBar';

function CriterionBlock({ criterionIdx, name, assessments, onUpdate }) {
  const [newName, setNewName] = useState('');
  const avg = calcCriterionAvg(assessments);

  const addAssessment = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onUpdate([
      ...assessments,
      { id: crypto.randomUUID(), name: trimmed, score: '' },
    ]);
    setNewName('');
  };

  const updateScore = (id, val) => {
    const clamped = val === '' ? '' : String(Math.min(8, Math.max(0, parseFloat(val) || 0)));
    onUpdate(assessments.map(a => a.id === id ? { ...a, score: clamped } : a));
  };

  const deleteAssessment = (id) => onUpdate(assessments.filter(a => a.id !== id));

  return (
    <div className="bg-navy-800 border border-navy-700 rounded-xl p-3 space-y-2">
      {/* Criterion header */}
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-mono text-[#8b9dc3] uppercase tracking-wider">{name}</span>
        <span className="font-mono font-bold text-2xl text-white leading-none">
          {avg !== null ? avg : '–'}
          <span className="text-sm font-normal text-[#8b9dc3]">/8</span>
        </span>
      </div>

      {/* Assessment list */}
      {assessments.length > 0 && (
        <div className="space-y-1.5">
          {assessments.map(a => (
            <div key={a.id} className="flex items-center gap-2">
              <span className="flex-1 text-xs text-white truncate">{a.name}</span>
              <input
                type="number"
                min="0"
                max="8"
                step="1"
                value={a.score}
                onChange={e => updateScore(a.id, e.target.value)}
                className="w-12 bg-navy-900 border border-navy-700 rounded-lg px-1.5 py-1 text-white text-xs text-center font-mono focus:outline-none focus:border-blue-500"
                placeholder="–"
              />
              <span className="text-[#8b9dc3] text-xs font-mono">/8</span>
              <button
                onClick={() => deleteAssessment(a.id)}
                className="text-[#8b9dc3] hover:text-red-400 text-sm leading-none"
                aria-label="Delete assessment"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Add assessment row */}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addAssessment()}
          placeholder="Assessment name…"
          className="flex-1 bg-navy-900 border border-navy-700 rounded-lg px-2 py-1 text-xs text-white placeholder-[#8b9dc3] focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={addAssessment}
          disabled={!newName.trim()}
          className="px-2 py-1 rounded-lg text-xs text-blue-400 border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono"
        >+ add</button>
      </div>
    </div>
  );
}

export default function MypSubjectCard({ subject, scrollId }) {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const criterionNames = subject.criterionNames || DEFAULT_CRITERION_NAMES;
  // mypAssessments[subjectId][0..3] = array of assessments
  const subjectAssessments = (state.mypAssessments || {})[subject.id] || {};

  const getCriterionAssessments = (idx) => subjectAssessments[idx] || [];

  const updateCriterion = (idx, assessments) => {
    dispatch({
      type: 'SET_MYP_ASSESSMENTS',
      subjectId: subject.id,
      assessments: { ...subjectAssessments, [idx]: assessments },
    });
  };

  const allCriteria = [0, 1, 2, 3].map(i => getCriterionAssessments(i));
  const total = calcMypSubjectTotal(allCriteria);
  const grade = total !== null ? mypGradeFromTotal(total) : null;
  const colour = grade ? gradeColour(grade) : '#8b9dc3';

  const nextGrade = grade !== null && grade < 7 ? grade + 1 : null;
  const needed = total !== null && nextGrade ? MYP_NEXT_BOUNDARIES[grade - 1] - total : null;

  const handleDelete = () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    dispatch({ type: 'DELETE_SUBJECT', id: subject.id });
  };

  return (
    <div id={scrollId} className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
      {/* Card header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-navy-800 transition-colors text-left"
        onClick={() => { setOpen(o => !o); setDeleteConfirm(false); }}
      >
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: subject.colour }} />
        <div className="flex-1 min-w-0">
          <span className="text-white font-syne font-semibold">{subject.name}</span>
        </div>
        {/* Total / grade summary */}
        <div className="flex items-baseline gap-1.5 flex-shrink-0">
          <span className="font-mono text-sm text-[#8b9dc3]">
            {total !== null ? `${total}/32` : '–/32'}
          </span>
          <span className="font-mono font-bold text-xl" style={{ color: colour }}>
            {grade !== null ? `G${grade}` : '–'}
          </span>
        </div>
        <span className={`text-[#8b9dc3] text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t border-navy-700 px-4 pt-4 pb-4 space-y-4">
          {/* 2×2 criterion grid */}
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map(idx => (
              <CriterionBlock
                key={idx}
                criterionIdx={idx}
                name={criterionNames[idx] || DEFAULT_CRITERION_NAMES[idx]}
                assessments={getCriterionAssessments(idx)}
                onUpdate={(updated) => updateCriterion(idx, updated)}
              />
            ))}
          </div>

          {/* Grade insight */}
          {total !== null ? (
            <div className="border-t border-navy-700 pt-3 space-y-2">
              <ProgressBar value={total} max={32} colour={colour} />
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg" style={{ color: colour }}>
                  Grade {grade}
                </span>
                <span className="font-mono text-sm text-[#8b9dc3]">{total} / 32</span>
              </div>
              {grade === 7 ? (
                <p className="text-green-400 text-sm">Maximum MYP grade! 🏆</p>
              ) : (
                <p className="text-[#8b9dc3] text-sm">
                  Predicted: <span className="text-white font-mono">Grade {grade}</span>
                  {' '}· Total: <span className="text-white font-mono">{total}/32</span>
                  {needed !== null && (
                    <> · You need <span className="text-white font-mono">{needed}</span> more point{needed !== 1 ? 's' : ''} to reach Grade {nextGrade}.</>
                  )}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[#8b9dc3] text-xs text-center py-1">Add assessments above to see your predicted grade.</p>
          )}

          {/* Delete subject */}
          <div className="border-t border-navy-700 pt-3 flex justify-end">
            {deleteConfirm ? (
              <div className="flex items-center gap-2 w-full">
                <span className="text-red-400 text-xs flex-1">All data for this subject will be lost. Confirm?</span>
                <button onClick={handleDelete} className="px-3 py-1.5 rounded-lg text-xs bg-red-500 hover:bg-red-400 text-white font-semibold transition-all">Delete</button>
                <button onClick={() => setDeleteConfirm(false)} className="px-3 py-1.5 rounded-lg text-xs bg-navy-700 hover:bg-navy-600 text-[#8b9dc3] transition-all">Cancel</button>
              </div>
            ) : (
              <button onClick={handleDelete} className="text-xs text-[#8b9dc3] hover:text-red-400 transition-colors font-mono">
                🗑 Delete subject
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ScoreRing from './ScoreRing';
import {
  calcSubjectGrade, tokEeBonus, gradeColour,
  calcMypSubjectTotal, mypGradeFromTotal,
} from '../../utils/grades';
import AddAssignmentModal from '../planner/AddAssignmentModal';

export default function Dashboard({ onNavigate }) {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);

  const isMYP = state.profile.programme === 'MYP';

  // Build per-subject grades depending on programme
  const subjectGrades = state.subjects.map(s => {
    let grade = null;
    if (isMYP) {
      const subjectAssessments = (state.mypAssessments || {})[s.id] || {};
      const allCriteria = [0, 1, 2, 3].map(i => subjectAssessments[i] || []);
      const total = calcMypSubjectTotal(allCriteria);
      grade = total !== null ? mypGradeFromTotal(total) : null;
    } else {
      grade = calcSubjectGrade(state.gradeComponents[s.id] || []);
    }
    return { ...s, grade };
  });

  // Score ring: DP shows /45, MYP shows average grade /7
  let ringScore, ringMax, ringLabel;
  if (isMYP) {
    const scored = subjectGrades.filter(s => s.grade !== null);
    ringScore = scored.length > 0
      ? Math.round(scored.reduce((sum, s) => sum + s.grade, 0) / scored.length)
      : 0;
    ringMax = 7;
    ringLabel = 'Avg Grade';
  } else {
    const bonus = tokEeBonus(state.tokGrade, state.eeGrade);
    const subTotal = subjectGrades.reduce((sum, s) => sum + (s.grade || 0), 0);
    ringScore = subTotal + (bonus || 0);
    ringMax = 45;
    ringLabel = 'Predicted DP Score';
  }

  const today = new Date();
  const upcoming = state.assignments
    .filter(a => !a.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const daysLeft = (dateStr) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - today) / 86400000);
  };

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-syne font-extrabold text-2xl text-white">
          {state.settings?.heading || `Hi, ${state.profile.name || 'Student'} 👋`}
        </h1>
        <p className="text-[#8b9dc3] text-sm mt-0.5">
          {state.profile.programme} · {state.profile.examSession ? `Exam: ${state.profile.examSession}` : 'IB Central'}
        </p>
      </div>

      <div className="flex justify-center py-4">
        <ScoreRing score={ringScore} max={ringMax} label={ringLabel} />
      </div>

      {subjectGrades.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="font-syne font-semibold text-white mb-3">Subjects</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {subjectGrades.map(s => (
              <div
                key={s.id}
                className="flex-shrink-0 bg-navy-900 border border-navy-700 rounded-2xl p-4 w-36"
                style={{ borderLeftColor: s.colour, borderLeftWidth: 3 }}
              >
                {!isMYP && <div className="text-xs text-[#8b9dc3] font-mono mb-1">{s.level}</div>}
                <div className="text-white font-syne font-semibold text-sm leading-tight mb-2 truncate">{s.name}</div>
                <div className="font-mono font-bold text-2xl" style={{ color: s.grade ? gradeColour(s.grade) : '#8b9dc3' }}>
                  {s.grade ?? '–'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-syne font-semibold text-white">Upcoming</h2>
          <button onClick={() => onNavigate('planner')} className="text-blue-400 text-sm hover:underline">See all →</button>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-[#8b9dc3] text-sm">No upcoming assignments 🎉</div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(a => {
              const subject = state.subjects.find(s => s.id === a.subjectId);
              const days = daysLeft(a.dueDate);
              return (
                <div key={a.id} className="bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject?.colour || '#8b9dc3' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{a.title}</div>
                    <div className="text-[#8b9dc3] text-xs">{subject?.name}</div>
                  </div>
                  <div className={`text-xs font-mono font-semibold ${days !== null && days <= 3 ? 'text-red-400' : 'text-[#8b9dc3]'}`}>
                    {days === null ? '' : days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-400 rounded-full text-white text-2xl font-bold shadow-lg flex items-center justify-center z-30 transition-all"
      >
        +
      </button>

      <AddAssignmentModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

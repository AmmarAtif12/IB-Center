import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SubjectGradeCard from './SubjectGradeCard';
import TokEeCalculator from './TokEeCalculator';
import ExtendedEssay from './ExtendedEssay';
import { calcSubjectGrade, tokEeBonus } from '../../utils/grades';
import { exportGradePDF } from '../../utils/pdf';

export default function GradeTracker() {
  const { state } = useApp();
  const [showEE, setShowEE] = useState(false);

  if (showEE) return <ExtendedEssay onBack={() => setShowEE(false)} />;

  const subjectGrades = state.subjects.map(s => ({
    ...s,
    grade: calcSubjectGrade(state.gradeComponents[s.id] || []),
  }));
  const subTotal = subjectGrades.reduce((sum, s) => sum + (s.grade || 0), 0);
  const bonus = tokEeBonus(state.tokGrade, state.eeGrade) || 0;
  const total = subTotal + bonus;

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-20 bg-navy-950/95 backdrop-blur border-b border-navy-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-extrabold text-xl text-white">Grade Tracker</h1>
            <p className="text-[#8b9dc3] text-xs font-mono mt-0.5">Predicted Total: <span className="text-white font-bold">{total} / 45</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEE(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-xl text-sm text-[#8b9dc3] hover:text-white transition-all font-syne"
            >
              📝 EE
            </button>
            <button
              onClick={() => exportGradePDF('grade-tracker-content')}
              className="flex items-center gap-1.5 px-3 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 rounded-xl text-sm text-[#8b9dc3] hover:text-white transition-all font-syne"
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>

      <div id="grade-tracker-content" className="px-4 pt-4 space-y-3">
        {state.subjects.length === 0 ? (
          <div className="text-center py-12 text-[#8b9dc3]">No subjects yet. Add subjects in Settings.</div>
        ) : (
          state.subjects.map(s => <SubjectGradeCard key={s.id} subject={s} />)
        )}
        <TokEeCalculator />
      </div>
    </div>
  );
}

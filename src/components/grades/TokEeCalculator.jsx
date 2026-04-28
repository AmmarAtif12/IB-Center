import React from 'react';
import { useApp } from '../../context/AppContext';
import { tokEeBonus } from '../../utils/grades';

const GRADES = ['A','B','C','D','E'];

const MATRIX = [
  ['',  'A', 'B', 'C', 'D', 'E'],
  ['A', '3', '3', '2', '0', '★'],
  ['B', '3', '2', '1', '0', '★'],
  ['C', '2', '1', '1', '0', '★'],
  ['D', '0', '0', '0', '0', '★'],
  ['E', '★', '★', '★', '★', '★'],
];

export default function TokEeCalculator() {
  const { state, dispatch } = useApp();
  const { tokGrade, eeGrade } = state;
  const bonus = tokEeBonus(tokGrade, eeGrade);
  const failingCondition = tokGrade === 'E' || eeGrade === 'E';

  return (
    <div className="bg-navy-900 rounded-2xl border border-navy-700 p-5 mt-4">
      <h3 className="font-syne font-semibold text-white mb-4">ToK / EE Bonus Points</h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Theory of Knowledge</label>
          <select
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
            value={tokGrade}
            onChange={e => dispatch({ type: 'SET_TOK_GRADE', value: e.target.value })}
          >
            <option value="">— Select —</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#8b9dc3] font-mono mb-1">Extended Essay</label>
          <select
            className="w-full bg-navy-800 border border-navy-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
            value={eeGrade}
            onChange={e => dispatch({ type: 'SET_EE_GRADE', value: e.target.value })}
          >
            <option value="">— Select —</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {bonus !== null && (
        <div className={`rounded-xl p-3 mb-4 text-center ${failingCondition ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
          {failingCondition ? (
            <p className="text-red-400 font-semibold text-sm">⚠️ Failing condition – Grade E in ToK or EE may result in no IB diploma</p>
          ) : (
            <p className="text-white font-mono font-bold text-2xl">+{bonus} <span className="text-sm font-syne text-[#8b9dc3] font-normal">bonus points</span></p>
          )}
        </div>
      )}

      <details className="mt-2">
        <summary className="text-xs text-[#8b9dc3] cursor-pointer hover:text-white font-mono">Show bonus matrix ▾</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="text-xs font-mono border-collapse">
            <thead>
              <tr>
                <th className="p-1.5 text-[#8b9dc3]">ToK\EE</th>
                {GRADES.map(g => <th key={g} className="p-1.5 text-[#8b9dc3]">{g}</th>)}
              </tr>
            </thead>
            <tbody>
              {GRADES.map(tok => (
                <tr key={tok}>
                  <td className="p-1.5 text-[#8b9dc3] font-bold">{tok}</td>
                  {GRADES.map(ee => {
                    const pts = tokEeBonus(tok, ee);
                    const isSelected = tok === tokGrade && ee === eeGrade;
                    return (
                      <td key={ee} className={`p-1.5 text-center rounded ${isSelected ? 'bg-blue-500 text-white' : pts === null ? 'text-red-400' : pts >= 3 ? 'text-green-400' : pts >= 1 ? 'text-amber-400' : pts === 0 && (tok === 'E' || ee === 'E') ? 'text-red-400' : 'text-[#8b9dc3]'}`}>
                        {pts === null ? '★' : pts === 0 && (tok === 'E' || ee === 'E') ? '★' : pts}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
